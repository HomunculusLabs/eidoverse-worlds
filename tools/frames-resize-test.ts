// frames — the resize drag's finish path, run headless.
//
//   bun tools/frames-resize-test.ts
//
// The regression this exists for: the document-level resize drag tore down
// only on `pointerup`. Release the button outside the browser and `up` never
// arrives — `_resizing` stays true, the move/up listeners stay installed, and
// every future hover and resize is dead until the page reloads. There is no
// error and nothing looks broken; the frame just quietly stops resizing.
//
// So the assertion is not "does resizing work" (it visibly does) but "does it
// still work AFTER a drag that ended the wrong way", which is exactly the
// case a happy-path test cannot see.

import { plugin } from "bun";
const here = (f: string) => new URL(f, import.meta.url).pathname;
plugin({
  name: "frames-stubs",
  setup(b) {
    b.onResolve({ filter: /^\.\/core\.js$/ }, () => ({ path: here("./chat-core-stub.mjs") }));
  },
});

import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();

// happy-dom has no pointer capture. Model it on ELEMENTS only — deliberately
// NOT on `document`, because stubbing document.releasePointerCapture is what
// masked the original bug: capture was taken on documentElement and released
// on document, which owns nothing, so the release was a silent no-op and the
// test still passed. The stub now tracks who holds what, so the assertions
// below can check that the acquirer is the releaser.
const _captured = new Set<number>();
(Element.prototype as any).setPointerCapture = function (id: number) { _captured.add(id); (this as any).__cap = id; };
(Element.prototype as any).releasePointerCapture = function (id: number) { _captured.delete(id); (this as any).__cap = undefined; };
(Element.prototype as any).hasPointerCapture = function (id: number) { return (this as any).__cap === id; };

const { makeFrame } = await import("../client/lib/frames.js");

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

const f = makeFrame("t", { title: "t", x: 100, y: 100, w: 300, h: 200, minW: 100, minH: 80 });
f.show();

// happy-dom returns an all-zero DOMRect, and the module's zone math is entirely
// getBoundingClientRect-based — so without this the pointer never lands in any
// zone and even the happy path silently fails. Report the frame's real state
// instead. (First run of this test failed its own baseline for exactly that
// reason, which is the honest way to find out your harness cannot see.)
(f.el as any).getBoundingClientRect = () => ({
  left: f.state.x, top: f.state.y, width: f.state.w, height: f.state.h,
  right: f.state.x + f.state.w, bottom: f.state.y + f.state.h, x: f.state.x, y: f.state.y,
  toJSON() { return this; },
});
// nothing interactive is under the pointer in these synthetic drags
(document as any).elementFromPoint = () => null;

const pd = (x: number, y: number) => new PointerEvent("pointerdown",
  { clientX: x, clientY: y, button: 0, bubbles: true, pointerId: 1 });
const pm = (x: number, y: number) => new PointerEvent("pointermove",
  { clientX: x, clientY: y, bubbles: true, pointerId: 1 });

// the east edge of the frame as painted
const edgeX = () => f.state.x + f.state.w - 1;    // just inside the east band
const edgeY = () => f.state.y + 40;

function dragEast(by: number, endWith: "up" | "nothing" | "cancel" | "blur") {
  const w0 = f.state.w;
  document.dispatchEvent(pd(edgeX(), edgeY()));
  document.dispatchEvent(pm(edgeX() + by, edgeY()));
  if (endWith === "up") document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
  if (endWith === "cancel") document.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerId: 1 }));
  if (endWith === "blur") window.dispatchEvent(new Event("blur"));
  return f.state.w - w0;
}

// --- baseline: a normal drag resizes
check("a normal drag resizes the frame", dragEast(60, "up") !== 0,
  `w now ${f.state.w}`);

// --- the regression: a drag that ends without pointerup must not wedge state
const abandoned = dragEast(40, "nothing");     // pointer left the window, no up
check("an abandoned drag still moved the edge", abandoned !== 0, String(abandoned));
// nothing cleaned it up yet — now the recovery paths
window.dispatchEvent(new Event("blur"));
const after = dragEast(50, "up");
check("a NEW drag works after one ended without pointerup", after !== 0,
  `delta ${after} — if 0, _resizing is wedged`);

// --- pointercancel is a full citizen
dragEast(30, "cancel");
const afterCancel = dragEast(30, "up");
check("a new drag works after pointercancel", afterCancel !== 0, String(afterCancel));

// --- blur alone finishes
dragEast(30, "blur");
const afterBlur = dragEast(30, "up");
check("a new drag works after window blur", afterBlur !== 0, String(afterBlur));

// --- the finish is idempotent: several endings at once must not throw
let threw = false;
try {
  document.dispatchEvent(pd(edgeX(), edgeY()));
  document.dispatchEvent(pm(edgeX() + 20, edgeY()));
  document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
  document.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerId: 1 }));
  window.dispatchEvent(new Event("blur"));
} catch { threw = true; }
check("overlapping finish paths do not throw", !threw);
check("...and the frame still resizes afterward", dragEast(25, "up") !== 0);

// --- capture is released by the element that took it (review catch: releasing
// on `document` was a no-op, so a blur could leave the capture live forever)
_captured.clear();
document.dispatchEvent(pd(edgeX(), edgeY()));
document.dispatchEvent(pm(edgeX() + 20, edgeY()));
check("a drag acquires pointer capture", _captured.size === 1, `${_captured.size} held`);
window.dispatchEvent(new Event("blur"));
check("...and blur releases it on the acquiring element", _captured.size === 0,
  `${_captured.size} still held — capture leaked`);
check("...leaving documentElement holding nothing",
  !(document.documentElement as any).hasPointerCapture(1));

_captured.clear();
dragEast(20, "cancel");
check("pointercancel also releases the capture", _captured.size === 0, `${_captured.size} held`);

// --- minimums still hold (the clamp survived the refactor)
const tiny = dragEast(-9999, "up");
check("width clamps at minW", f.state.w >= 100, `w=${f.state.w} (delta ${tiny})`);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
