// fauna82-census-mole.ts — READ-ONLY proposal grounding for the European
// mole (FAUNA-PLAN row 52 candidate): (a) fresh entity census + mole/talpa
// zero-check across ids AND libs (magpie fauna-57 proposal law); (b) the
// garden-cottage co-resident set (the wildlife edge that already carries
// wrabbit fauna-38 + hedgehog fauna-42 — the mole completes the garden
// trio as the subterranean member); (c) neighbor table at the garden
// cottage's working-margin candidate zone. ZERO mutations.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];
console.log(`CENSUS ${ents.length} entities (commons-next)`);

// (a) mole/talpid zero-check (substring-aware: report hits for classification)
const pat = /mole|talpa|talpid/i;
const idHits = ents.filter((e: any) => pat.test(e.id || ""));
const libHits = ents.filter((e: any) => pat.test(e.lib || ""));
console.log(`MOLE-CHECK id hits: ${idHits.length}, lib hits: ${libHits.length} (both must be 0)`);
for (const e of idHits) console.log(`  id-hit: ${e.id} @ (${e.pos[0]},${e.pos[2]})`);

// (b) the garden cottage + its standing wildlife edge (the co-resident set)
const KEY = /garden|wrabbit|hog-001|fence|mosaic/i;
console.log(`\nGARDEN-COTTAGE CO-RESIDENT SET:`);
for (const e of ents.filter((e: any) => KEY.test(e.id || ""))) {
  console.log(`  ${e.id} @ (${e.pos[0].toFixed(2)},${e.pos[1].toFixed(3)},${e.pos[2].toFixed(2)}) yaw ${e.yaw.toFixed(3)} bbox ${e.bbox ? e.bbox.size.map((v: number) => v.toFixed(2)).join("x") : "none"}`);
}

// (c) neighbor table at the garden cottage (zone center = cottage census pos)
const GC = ents.find((e: any) => /garden-cottage/.test(e.id || ""));
if (!GC) throw Error("garden cottage not found in census");
const cx = GC.pos[0], cz = GC.pos[2];
console.log(`\nZONE garden-cottage working margin — center (${cx.toFixed(2)},${cz.toFixed(2)}):`);
const near = ents
  .filter((e: any) => e.id)
  .map((e: any) => ({ id: e.id, dx: e.pos[0] - cx, dz: e.pos[2] - cz }))
  .map((e: any) => ({ ...e, d: Math.hypot(e.dx, e.dz) }))
  .filter((e: any) => e.d <= 16)
  .sort((a: any, b: any) => a.d - b.d)
  .slice(0, 18);
for (const e of near) console.log(`  ${e.d.toFixed(1)}m  ${e.id}`);
if (!near.length) console.log("  (no entities within 16m — open ground)");
