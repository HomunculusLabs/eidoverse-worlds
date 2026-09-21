// fauna78-census-bats.ts — READ-ONLY proposal grounding for the pipistrelle
// bat swarm (FAUNA-PLAN row 50 candidate): (a) fresh entity census + bat/
// chiroptera/pipistrelle zero-check across ids AND libs (magpie fauna-57
// proposal law); (b) the moonmoth proximity note (the live-flown moth is the
// nearest flying-fauna neighbor — different seat, different class); (c)
// neighbor tables at candidate air-seat zones — the reedpool open water
// (FIRST CHOICE: the village's richest habitat, its evening air empty) and
// the millrace channel (SECOND). ZERO mutations.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];
console.log(`CENSUS ${ents.length} entities (commons-next)`);

// (a) bat/chiroptera zero-check
const pat = /bat|chiropt|pipistrel|noctule|vesper/i;
const idHits = ents.filter((e: any) => pat.test(e.id || ""));
const libHits = ents.filter((e: any) => pat.test(e.lib || ""));
console.log(`BAT-CHECK id hits: ${idHits.length}, lib hits: ${libHits.length} (both must be 0)`);
for (const e of idHits) console.log(`  id-hit: ${e.id} @ (${e.pos[0]},${e.pos[2]})`);

// (b) the pool + moonmoth + existing air-tier fauna (the co-resident set)
const KEY = /reedpool|moonmoth|swallow|bees-|kestr|kfish|stork|duck|swan|heron|frog|carp|geese|robin/i;
console.log(`\nAIR-TIER + POOL RESIDENTS:`);
for (const e of ents.filter((e: any) => KEY.test(e.id || ""))) {
  console.log(`  ${e.id} @ (${e.pos[0].toFixed(2)},${e.pos[1].toFixed(3)},${e.pos[2].toFixed(2)}) yaw ${e.yaw.toFixed(3)} bbox ${e.bbox ? e.bbox.size.map((v: number) => v.toFixed(2)).join("x") : "none"}`);
}

// (c) neighbor tables at candidate air-seat zones
const ZONES = [
  { name: "reedpool open water (FIRST — evening air over the hatch)", cx: 9.723, cz: -90.982 },
  { name: "millrace channel (SECOND — the water-machinery corner)", cx: -76.7, cz: 6.7 },
];
for (const z of ZONES) {
  console.log(`\nZONE ${z.name} center (${z.cx},${z.cz}):`);
  const near = ents
    .filter((e: any) => e.id)
    .map((e: any) => ({ id: e.id, dx: e.pos[0] - z.cx, dz: e.pos[2] - z.cz }))
    .map((e: any) => ({ ...e, d: Math.hypot(e.dx, e.dz) }))
    .filter((e: any) => e.d <= 16)
    .sort((a: any, b: any) => a.d - b.d)
    .slice(0, 16);
  for (const e of near) console.log(`  ${e.d.toFixed(1)}m  ${e.id}`);
  if (!near.length) console.log("  (no entities within 16m — open ground)");
}
