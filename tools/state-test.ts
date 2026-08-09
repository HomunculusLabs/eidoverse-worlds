// client/lib/state.js — the world-as-data half of the skeleton (TEL0S_NOTES
// §11.2), tested headless: no server, no DOM, no THREE.
//
//   bun tools/state-test.ts
//
// The load-bearing claims: state.st is a pure function of (snapshot, tail,
// live entries); hydration skips the documented state/tail overlap; live
// folding is seq-guarded; a throwing subscriber cannot break the fold path.
// Conformance of the fold ITSELF is foldfix-test.ts's job — here we test
// the feeding, using the same fixtures so the answers are known-good.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { foldEntry, emptyState } from "../shared/fold.js";
import { state, hydrate, foldLive, reset, onWorldChange } from "../client/lib/state.js";

const FIX = join(import.meta.dir, "..", "spec", "fixtures");
const FIELDS = ["entities", "mounts", "roles", "behaviors"] as const;

let passed = 0, failed = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
};
const jeq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const pick = (st: any) => JSON.parse(JSON.stringify(Object.fromEntries(FIELDS.map((f) => [f, st[f] ?? null]))));

console.log(`\nstate.js — folded world as data\n`);

const fixtures = readdirSync(FIX).sort().filter((d) => statSync(join(FIX, d)).isDirectory());

for (const dir of fixtures) {
  const entries = readFileSync(join(FIX, dir, "log.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const want = JSON.parse(readFileSync(join(FIX, dir, "folded.json"), "utf8"));
  const wantPicked = pick(want);

  // 1. pure live path: every entry through foldLive
  reset();
  let entryEvents = 0;
  const off = onWorldChange((ev) => { if (ev.type === "entry") entryEvents++; });
  state.hydrated = true;                       // live path without a snapshot
  for (const e of entries) foldLive(e);
  off();
  check(`${dir}: live fold matches fixture`, jeq(pick(state.st), wantPicked));
  check(`${dir}: one event per entry`, entryEvents === entries.length, `${entryEvents}/${entries.length}`);
  check(`${dir}: lastSeq tracks`, state.lastSeq === entries[entries.length - 1].seq);

  // 2. hydrate path: snapshot of the first half + tail of the second,
  //    with the state/tail OVERLAP the server documents (tail resends the
  //    last two snapshot entries) — must equal the full fold
  const cut = Math.floor(entries.length / 2);
  const snap = emptyState();
  for (const e of entries.slice(0, cut)) foldEntry(snap, e);
  const overlapTail = entries.slice(Math.max(0, cut - 2));   // 2 duplicates
  reset();
  hydrate(JSON.parse(JSON.stringify(snap)), overlapTail, entries[cut - 1].seq);
  check(`${dir}: hydrate(snapshot + overlapping tail) matches`, jeq(pick(state.st), wantPicked));

  // 3. live entries after hydration land on top
  reset();
  hydrate(JSON.parse(JSON.stringify(snap)), [], entries[cut - 1].seq);
  for (const e of entries.slice(cut)) foldLive(e);
  check(`${dir}: hydrate + live tail matches`, jeq(pick(state.st), wantPicked));
}

// 4. seq guard: a duplicate is dropped silently, state unchanged
{
  reset();
  state.hydrated = true;
  const spawn = { seq: 0, ts: 1, actor: "t", verb: "spawn", args: { id: "a", lib: "x.glb", pos: [1, 2, 3] } };
  foldLive(spawn);
  foldLive({ ...spawn, args: { id: "a", lib: "x.glb", pos: [9, 9, 9] } });   // same seq: must not re-fold
  check("duplicate seq is dropped", (state.st.entities as any).a.pos[0] === 1);
}

// 5. a throwing subscriber breaks nothing
{
  reset();
  const off1 = onWorldChange(() => { throw new Error("subscriber bug"); });
  let heard = false;
  const off2 = onWorldChange(() => { heard = true; });
  foldLive({ seq: 0, ts: 1, actor: "t", verb: "spawn", args: { id: "b", lib: "y.glb" } });
  off1(); off2();
  check("throwing subscriber does not break the fold", Boolean((state.st.entities as any).b));
  check("later subscribers still hear the event", heard);
}

// 6. reset returns to nothing and says so
{
  let resets = 0;
  const off = onWorldChange((ev) => { if (ev.type === "reset") resets++; });
  reset();
  off();
  check("reset empties and emits", resets === 1 && state.lastSeq === -1 && !state.hydrated
    && Object.keys(state.st.entities).length === 0);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
