// fauna65-census-kestrel.ts — READ-ONLY live census sweep for the fauna-65
// kestrel AIR SEAT (FAUNA-PLAN row 41). SE wild-edge open meadow: candidate
// hover points between the treeline and the pheasant seat; reports every
// census entity within 25m of each candidate (id, pos, yaw, lib, bbox) so
// the wander-radius clearance + sightline checks run on LIVE data (never
// cached — interlane live-world law).
import { readFileSync } from "node:fs";

const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];
console.log(`census total: ${ents.length}`);

// zone of interest: SE wild edge — x 45..70, z -45..-18 (pheasant/snag/deer
// country). Candidate hover column over open vole grass.
const ZONE = { x0: 45, x1: 72, z0: -46, z1: -16 };
const inZone = ents.filter((e) => {
  const [x, , z] = e.pos ?? [0, 0, 0];
  return x >= ZONE.x0 && x <= ZONE.x1 && z >= ZONE.z0 && z <= ZONE.z1;
});
console.log(`\nzone entities (${inZone.length}):`);
for (const e of inZone) {
  const bb = e.bbox;
  const sz = bb ? `${bb.size[0].toFixed(2)}x${bb.size[1].toFixed(2)}x${bb.size[2].toFixed(2)} top ${(e.pos[1] + bb.max[1]).toFixed(2)}` : "no-bbox";
  console.log(`  ${e.id} pos (${e.pos.map((v: number) => +v.toFixed(3)).join(", ")}) yaw ${e.yaw.toFixed(3)} lib ${e.lib} [${sz}]`);
}

// candidate hover columns — open meadow W of the snag, on the plaza spoke:
// plaza bearing from ~(57,-26): atan2(-57, 26)... plaza at (0,0); from zone
// points the reader walks the spoke OUT from plaza heading ~+x/-z.
const CANDS: [number, number][] = [
  [55.5, -25.0], [56.5, -27.5], [57.5, -24.0], [54.5, -27.0],
  [58.0, -26.5], [56.0, -22.5], [53.0, -26.0], [58.5, -28.5],
];
console.log(`\ncandidate columns (hover y = heightAt + 6.0):`);
for (const [cx, cz] of CANDS) {
  const near = ents
    .filter((e) => {
      const [x, , z] = e.pos ?? [0, 0, 0];
      const dd = Math.hypot(x - cx, z - cz);
      return dd <= 20;
    })
    .map((e) => {
      const dd = Math.hypot(e.pos[0] - cx, e.pos[2] - cz);
      const top = e.bbox ? e.pos[1] + e.bbox.max[1] : e.pos[1];
      return { id: e.id, d: +dd.toFixed(2), top: +top.toFixed(2) };
    })
    .sort((a: any, b: any) => a.d - b.d)
    .slice(0, 8);
  const solidsTo6m = near.filter((n: any) => n.top > 3 && n.d < 12);
  console.log(`  (${cx}, ${cz}): nearest ${near.map((n: any) => `${n.id}@${n.d}m/top${n.top}`).join(" ")}${solidsTo6m.length ? "  *** TALL-NEAR: " + solidsTo6m.map((s: any) => s.id).join(",") : ""}`);
}
