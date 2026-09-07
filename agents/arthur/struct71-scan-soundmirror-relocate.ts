// struct71-scan-soundmirror-relocate.ts — CITY-PLAN wave-1 relocation #1:
// nx-struct-soundmirror (28.7,-0.026,-18) yaw 0 — off-spoke r33.9 — moves to
// the SE wild edge (CITY-PLAN relocation register row 1: "SE wild edge").
// PROOF TOOL: scan az[-65,-35] x r[66,80] (0.5deg x 0.5m) for lawful seats
// (solid-solid gap >= 1.4m), EXACT disc r2.30 vs census WORLD AABBs (the
// five rings are FULL CIRCLES — bbox +-2.3 is the true footprint, not a
// square proxy; struct-19 law satisfied exactly). Rank by distance to the
// dress-pocket anchor corridor (az -45, r 74) — joins mossbowls/cairn-001
// pocket without crowding — then by clearance margin.
// Exemptions (law): ground/network films by id, companion lights (no bbox).
// The piece is azimuthally symmetric (bowl opens UP; stand central) — yaw
// has NO read dependence; CITY-PLAN yaw law trivially satisfied at yaw 0.
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const R = 2.30;               // true disc radius (bbox half-extent, full-circle rings)
const LAW = 1.4;              // solid-solid clear-lane law
const OLD: [number, number] = [28.7, -18];
const AZ0 = -65, AZ1 = -35, R0 = 66, R1 = 80;

function discVsAABB(cx: number, cz: number, r: number, minx: number, minz: number, maxx: number, maxz: number): number {
  const qx = Math.max(minx, Math.min(cx, maxx)), qz = Math.max(minz, Math.min(cz, maxz));
  return Math.hypot(cx - qx, cz - qz) - r; // negative => overlap
}

// --- fresh census ---
const base = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8")).url
  .replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const cens = await (await fetch(`${base}/geom?world=commons-next`)).json();
const ents: any[] = cens.entities ?? [];
console.log(`census: ${ents.length} entities (fresh, ${new Date().toISOString()})`);

const SELF = "nx-struct-soundmirror";
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-|nx-dress-sw-moss/;
type Nb = { id: string; minx: number; minz: number; maxx: number; maxz: number };
const solids: Nb[] = []; const exempted: string[] = [];
for (const e of ents) {
  if (e.id === SELF) continue;
  const bb = e.bbox;
  if (!bb) { exempted.push(`${e.id} (light/none)`); continue; }
  if (GROUND.test(e.id)) { exempted.push(`${e.id} (ground-film)`); continue; }
  const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
  const cyaw = Math.abs(Math.cos(e.yaw ?? 0)), syaw = Math.abs(Math.sin(e.yaw ?? 0));
  const ew = hx * cyaw + hz * syaw, ed = hx * syaw + hz * cyaw;
  solids.push({ id: e.id, minx: e.pos[0] - ew, minz: e.pos[2] - ed, maxx: e.pos[0] + ew, maxz: e.pos[2] + ed });
}
console.log(`solids: ${solids.length}, exempt: ${exempted.length}`);

// --- scan ---
const found: { x: number; z: number; az: number; r: number; gap: number; worst: string }[] = [];
for (let azd = AZ0; azd <= AZ1 + 1e-9; azd += 0.5) {
  const az = azd * Math.PI / 180;
  for (let r = R0; r <= R1 + 1e-9; r += 0.5) {
    const x = r * Math.cos(az), z = r * Math.sin(az);
    let gap = Infinity, worst = "";
    for (const s of solids) {
      if (x + R + LAW < s.minx || x - R - LAW > s.maxx || z + R + LAW < s.minz || z - R - LAW > s.maxz) continue;
      const g = discVsAABB(x, z, R, s.minx, s.minz, s.maxx, s.maxz);
      if (g < gap) { gap = g; worst = s.id; }
      if (gap < LAW) break;
    }
    if (gap >= LAW) found.push({ x: +x.toFixed(2), z: +z.toFixed(2), az: +azd.toFixed(1), r, gap: +gap.toFixed(2), worst });
  }
}
console.log(`lawful seats in az[${AZ0},${AZ1}] r[${R0},${R1}]: ${found.length}`);

// anchor: dress pocket corridor (mossbowls az -42 r82.5, cairn-001 az -45 r83, stones az -42.3 r71.1)
const AX = Math.cos(-45 * Math.PI / 180) * 74, AZ = Math.sin(-45 * Math.PI / 180) * 74;
found.sort((a, b) =>
  (Math.hypot(a.x - AX, a.z - AZ) - Math.hypot(b.x - AX, b.z - AZ)));
console.log("\ntop 12 by proximity to dress-pocket anchor (az -45, r 74):");
for (const s of found.slice(0, 12)) console.log(`  (${s.x}, ${s.z}) az ${s.az} r ${s.r} gap=${s.gap} worst=${s.worst} disp=${Math.hypot(s.x - OLD[0], s.z - OLD[1]).toFixed(1)}`);
// also show the max-clearance seat for margin comparison
const byGap = [...found].sort((a, b) => b.gap - a.gap);
console.log("\nmax-clearance seat:");
const g0 = byGap[0];
if (g0) console.log(`  (${g0.x}, ${g0.z}) az ${g0.az} r ${g0.r} gap=${g0.gap} worst=${g0.worst}`);
