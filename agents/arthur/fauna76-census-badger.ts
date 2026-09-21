// fauna76-census-badger.ts — READ-ONLY proposal grounding for the European
// badger (FAUNA-PLAN row 49 candidate): (a) fresh entity census + badger/
// meles/mustelid zero-check across ids AND libs (magpie fauna-57 proposal
// law); (b) neighbor tables at candidate sett zones — the SE wild-edge
// woodland margin (the forest screen the deer step from, fauna-40) and the
// NW orchard W margin (the dovecote/rows hedge country). ZERO mutations.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];
console.log(`CENSUS ${ents.length} entities (commons-next)`);

// (a) badger/mustelid zero-check
const pat = /badger|meles|mustel|weasel|stoat|otter|marten/i;
const idHits = ents.filter((e: any) => pat.test(e.id || ""));
const libHits = ents.filter((e: any) => pat.test(e.lib || ""));
console.log(`BADGER-CHECK id hits: ${idHits.length}, lib hits: ${libHits.length} (both must be 0)`);

// (b) woodland-margin entities (find the SE forest screen + any W/NW wood margin)
const wood = ents.filter((e: any) => /forest|tree|wood|hedgerow|hedge|orchard|snag/i.test(e.id || ""));
console.log(`\nWOODLAND-HOSTS ${wood.length}:`);
for (const e of wood) {
  console.log(`  ${e.id} @ (${e.pos[0].toFixed(2)},${e.pos[1].toFixed(3)},${e.pos[2].toFixed(2)}) yaw ${e.yaw.toFixed(3)} lib ${(e.lib || "").slice(-20)} bbox ${e.bbox ? e.bbox.size.map((v: number) => v.toFixed(2)).join("x") : "none"}`);
}

// (c) neighbor tables at candidate sett zones
const ZONES = [
  { name: "se-wood-margin (forest screen W skirt, S of the deer band)", cx: 48, cz: -40 },
  { name: "se-wood-margin-north (between fox den and mosaic, E margin)", cx: 62, cz: -20 },
  { name: "nw-orchard-w-margin (W of the espalier rows)", cx: -56, cz: 62 },
];
for (const z of ZONES) {
  console.log(`\nZONE ${z.name} center (${z.cx},${z.cz}):`);
  const near = ents
    .filter((e: any) => e.id)
    .map((e: any) => ({ id: e.id, dx: e.pos[0] - z.cx, dz: e.pos[2] - z.cz }))
    .map((e: any) => ({ ...e, d: Math.hypot(e.dx, e.dz) }))
    .filter((e: any) => e.d <= 18)
    .sort((a: any, b: any) => a.d - b.d)
    .slice(0, 14);
  for (const e of near) console.log(`  ${e.d.toFixed(1)}m  ${e.id}`);
  if (!near.length) console.log("  (no entities within 18m — open ground)");
}
