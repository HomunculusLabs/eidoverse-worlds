// fauna84-census-bfly.ts — READ-ONLY proposal grounding for the butterfly
// pair (LEPIDOPTERA first member; small tortoiseshell/red-admiral class) over
// the lavender-0040 blossom field (FAUNA-PLAN row 53 candidate):
// (a) fresh entity census + butterfly/lepidoptera/vanessa/aglais/nymphalid
//     zero-check across ids AND libs (magpie fauna-57 proposal law,
//     substring-aware: report hits for classification);
// (b) the lavender host's live tuple + lib (the AIR-SEAT frame-copy anchor,
//     bees fauna-32 law — host hard-gate source for the build tick);
// (c) neighbor table at the lavender field (co-resident set: the NW hedge +
//     yellowhammers fauna-52 + any skeps/bees geometry in range) for the
//     ring-swept-worst clearance math owed to the build tick.
// ZERO mutations.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];
console.log(`CENSUS ${ents.length} entities (commons-next)`);

// (a) lepidoptera zero-check (substring-aware)
const pat = /bfly|butterfl|lepidopt|vanessa|aglais|nymphal|tortoiseshell|admiral/i;
const idHits = ents.filter((e: any) => pat.test(e.id || ""));
const libHits = ents.filter((e: any) => pat.test(e.lib || ""));
console.log(`BUTTERFLY-CHECK id hits: ${idHits.length}, lib hits: ${libHits.length} (both must be 0)`);
for (const e of idHits) console.log(`  id-hit: ${e.id} @ (${e.pos[0]},${e.pos[2]})`);
for (const e of libHits) console.log(`  lib-hit: ${e.lib}`);

// (b) the lavender host — live tuple + lib (frame-copy anchor source)
const LAV = ents.find((e: any) => /lavender-0040/.test(e.id || ""));
if (!LAV) throw Error("lavender-0040 host not found in census");
console.log(`\nLAVENDER HOST (frame-copy anchor):`);
console.log(`  ${LAV.id} @ (${LAV.pos[0].toFixed(3)}, ${LAV.pos[1].toFixed(5)}, ${LAV.pos[2].toFixed(3)}) yaw ${LAV.yaw} lib ${LAV.lib}`);
console.log(`  bbox ${LAV.bbox ? LAV.bbox.size.map((v: number) => v.toFixed(2)).join("x") : "none"}`);

// (c) neighbor table at the lavender field center
const cx = LAV.pos[0], cz = LAV.pos[2];
console.log(`\nLAVENDER-FIELD NEIGHBORS (<=16m of (${cx.toFixed(2)},${cz.toFixed(2)})):`);
const near = ents
  .filter((e: any) => e.id && e.id !== LAV.id)
  .map((e: any) => ({ id: e.id, d: Math.hypot(e.pos[0] - cx, e.pos[2] - cz), y: e.pos[1], bboxH: e.bbox ? e.bbox.size[1] : 0 }))
  .sort((a: any, b: any) => a.d - b.d)
  .slice(0, 16);
for (const e of near) console.log(`  ${e.d.toFixed(1)}m  y${e.y.toFixed(2)} h${e.bboxH.toFixed(2)}  ${e.id}`);
if (!near.length) console.log("  (no entities within 16m — open ground)");
