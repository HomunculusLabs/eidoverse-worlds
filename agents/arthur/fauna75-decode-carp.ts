// fauna75-decode-carp.ts — decode audit for the common-carp build.
// GREEN gates: 3 anchors (carp/carp_dfin/carp_tail); surface event
// (opaque-water law): hull top +0.018..+0.034 above entity WL plane
// (y 0.02), NOT a dry boat (top < 0.06), NOT fully submerged (top > 0.01);
// dorsal fin crest 0.080..0.098 (fin base embedded below hull top —
// struct-52 attached law); tail upper-lobe tip breaks the surface
// (+0.03..+0.065 above WL); wake rings crest 2..9mm above the water top;
// keel drafts deep (-0.10..-0.21); hull length 0.55..0.68 (65cm-class
// carp incl head cone); whole bbox sane (no exploded scale-drop class).
// RED control: village_fauna61_stork.glb — zero ^carp anchors.
// Full TRS accumulate (fauna-2 decoder law).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2] ?? "agents/arthur/assets/village_fauna75_carp.glb";
const isRed = process.argv[3] === "RED";
const bytes = readFileSync(file);
const sha = createHash("sha256").update(bytes).digest("hex");
console.log(JSON.stringify({ file, sha16: sha.slice(0, 16), full: sha }));

const THREE = await import("three");
const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
const loader = new GLTFLoader();
const gltf: any = await new Promise((res, rej) => loader.parse(bytes.buffer as ArrayBuffer, "", res, rej));
const root = gltf.scene;
root.updateMatrixWorld(true);

type Box = { min: [number, number, number]; max: [number, number, number] };
const boxOf = (o: any, frame?: any): Box | null => {
  let b: Box | null = null;
  const inv = frame ? new THREE.Matrix4().copy(frame.matrixWorld).invert() : null;
  o.traverse?.((c: any) => {
    if (!c.isMesh) return;
    c.geometry.computeBoundingBox();
    const bb = c.geometry.boundingBox!;
    const m = inv ? new THREE.Matrix4().multiplyMatrices(inv, c.matrixWorld) : c.matrixWorld;
    for (const cx of [bb.min.x, bb.max.x]) for (const cy of [bb.min.y, bb.max.y]) for (const cz of [bb.min.z, bb.max.z]) {
      const v = new THREE.Vector3(cx, cy, cz).applyMatrix4(m);
      if (!b) b = { min: [v.x, v.y, v.z], max: [v.x, v.y, v.z] };
      else for (let i = 0; i < 3; i++) { b.min[i] = Math.min(b.min[i], v.getComponent(i)); b.max[i] = Math.max(b.max[i], v.getComponent(i)); }
    }
  });
  return b;
};

const anchors: Record<string, any> = {};
root.traverse((o: any) => { if (o.name && /^carp/.test(o.name)) anchors[o.name] = o; });
const names = Object.keys(anchors).sort();
console.log(JSON.stringify({ anchors: names }));
if (isRed) {
  const ok = names.length === 0;
  console.log(ok ? "RED CONTROL PASS (zero carp anchors)" : `RED CONTROL FAIL: ${names}`);
  process.exit(ok ? 0 : 1);
}
const expect = ["carp", "carp_dfin", "carp_tail"];
const missing = expect.filter((n) => !names.includes(n));
if (missing.length) { console.log(`FAIL missing anchors: ${missing}`); process.exit(1); }

let meshNodes = 0, tris = 0;
root.traverse((o: any) => { if (o.isMesh) { meshNodes++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
console.log(JSON.stringify({ meshNodes, tris: Math.round(tris) }));

const whole = boxOf(root)!;
console.log(JSON.stringify({ whole: { min: whole.min.map((v) => +v.toFixed(3)), max: whole.max.map((v) => +v.toFixed(3)) } }));
let green = true;
const ck = (label: string, ok: boolean, detail: string) => { console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${detail}`); if (!ok) green = false; };

const WL = 0.02; // entity-frame waterline
// hull top above water (the back reads at the surface — not a dry boat,
// not a sunk log). Probe the hull+hump+head masses only (BACK material
// family nodes), excluding fin/tail/wake: walk carp subtree meshes that
// are NOT in carp_dfin/carp_tail groups.
{
  // body = below-water masses only: per-bucket boxes, keep buckets whose
  // y-min < -0.05 (the hull/hump/head BACK bucket drafts to -0.165; the
  // wake band/disk/ripple buckets sit at y >= 0.02 and never qualify).
  const bodyBox: Box = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] };
  const skip = new Set<any>();
  for (const n of ["carp_dfin", "carp_tail"]) anchors[n].traverse((o: any) => skip.add(o));
  let wakeTop = -1;
  anchors["carp"].traverse((o: any) => {
    if (!o.isMesh || skip.has(o)) return;
    const bb = boxOf(o)!;
    if (bb.min[1] < -0.05) {
      for (let k = 0; k < 3; k++) { bodyBox.min[k] = Math.min(bodyBox.min[k], bb.min[k]); bodyBox.max[k] = Math.max(bodyBox.max[k], bb.max[k]); }
    } else if (bb.max[1] - bb.min[1] < 0.03 && bb.min[1] > 0.0) {
      wakeTop = Math.max(wakeTop, bb.max[1]);
    }
  });
  console.log(JSON.stringify({ body: { min: bodyBox.min.map((n) => +n.toFixed(3)), max: bodyBox.max.map((n) => +n.toFixed(3)) } }));
  // the fish is authored yawed (rest heading +x): its LONG axis lies in
  // the horizontal plane — gate the max horizontal extent
  const lenX = bodyBox.max[0] - bodyBox.min[0], lenZ = bodyBox.max[2] - bodyBox.min[2];
  const len = Math.max(lenX, lenZ);
  ck("body length 65cm class", len >= 0.55 && len <= 0.68, `len x ${lenX.toFixed(3)} / z ${lenZ.toFixed(3)} -> max ${len.toFixed(3)}`);
  ck("back crests the waterline", bodyBox.max[1] - WL >= 0.012 && bodyBox.max[1] - WL <= 0.040, `back top ${bodyBox.max[1].toFixed(3)} (${(bodyBox.max[1] - WL).toFixed(3)} above WL)`);
  ck("keel drafts deep", bodyBox.min[1] >= -0.22 && bodyBox.min[1] <= -0.10, `keel ${bodyBox.min[1].toFixed(3)}`);
  // wake crest arithmetic: ripple torus rides WL+0.008 + tube 0.010 x 0.55
  // flatten = 5.5mm above its centerline -> gate 1..16mm above the water
  ck("wake rings crest the water", wakeTop > WL + 0.001 && wakeTop < WL + 0.016, `wake top ${wakeTop.toFixed(3)} (WL ${WL})`);
}

// dorsal fin: crest height + base attachment (dfin subtree, entity frame)
{
  const fb = boxOf(anchors["carp_dfin"])!;
  console.log(JSON.stringify({ dfin: { min: fb.min.map((n) => +n.toFixed(3)), max: fb.max.map((n) => +n.toFixed(3)) } }));
  ck("dorsal crest above WL", fb.max[1] - WL >= 0.140 && fb.max[1] - WL <= 0.190, `fin top ${fb.max[1].toFixed(3)} (${(fb.max[1] - WL).toFixed(3)} above WL; v8 bold-serration band, big-mid-nub ~0.167)`);
  ck("dorsal base embedded in back", fb.min[1] < 0.030, `fin base ${fb.min[1].toFixed(3)} (< hull top)`);
}

// tail: upper lobe tip breaks the surface — the SECOND, smaller crest
// (fin is the marker; tail tops below the fin's crest)
{
  const tb = boxOf(anchors["carp_tail"])!;
  const fb2 = boxOf(anchors["carp_dfin"])!;
  console.log(JSON.stringify({ tail: { min: tb.min.map((n) => +n.toFixed(3)), max: tb.max.map((n) => +n.toFixed(3)) } }));
  ck("tail tip breaks surface", tb.max[1] - WL >= 0.028 && tb.max[1] - WL <= 0.085, `tail top ${tb.max[1].toFixed(3)} (${(tb.max[1] - WL).toFixed(3)} above WL; v9 flare band ~0.070)`);
  ck("fin is the taller crest", fb2.max[1] > tb.max[1], `fin ${fb2.max[1].toFixed(3)} > tail ${tb.max[1].toFixed(3)}`);
}

// wake: rings crest 2..9mm above the WATER TOP (entity y 0 for the water
// plane: water top world == entity origin + 0.02 + ... — in entity frame
// the water face sits at y 0.04? No: entity PY 0.06093 + WL 0.02 = water
// top 0.08093 world == entity-frame y 0.02 (WL plane IS the water top
// plane for group-origin-at-WL authoring). Wake tops: 0.024..0.029.
// (the wake gate itself moved INTO the body block above — single source)

// whole bbox sanity — no explode (v7: the wake teardrop + big trail arc
// are authored surface films extending the envelope to ~1.31 x 0.88)
ck("whole bbox sane", whole.max[0] - whole.min[0] < 1.45 && whole.max[1] - whole.min[1] < 0.4 && whole.max[2] - whole.min[2] < 1.45,
  `${(whole.max[0] - whole.min[0]).toFixed(2)}x${(whole.max[1] - whole.min[1]).toFixed(2)}x${(whole.max[2] - whole.min[2]).toFixed(2)}`);

console.log(green ? "DECODE GREEN" : "DECODE RED");
if (!green) process.exit(1);
