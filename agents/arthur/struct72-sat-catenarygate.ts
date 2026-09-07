// struct72-sat-catenarygate.ts — SAT preflight for the catenarygate first
// placement at (0,-60.5) yaw 0, N meridian threshold. CONSERVATIVE
// rotation-grown world AABBs on BOTH sides (struct-70 law: census bbox
// min/max are LOCAL; world AABB = pos +/- (hx|cos|+hz|sin|, hz|cos|+hx|sin|))
// — conservative understates true gaps, so a PASS is sound.
// TRUE decoded envelope (local, struct-69 probe): x -4.52..4.52,
// z -0.87..1.026 (half 0.948, center offset z +0.078), y 0..5.80.
// Exemptions (law): ground films (bbox height <= 0.5) and named fat
// network layers (roads/paths). 1.4m solid-solid law.
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse((await Bun.file(`${ROOT}/agents/arthur/config.json`).text()));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities ?? [];
console.log(`census ${ents.length}`);
const TX = 0, TZ = -60.5, T_YAW = 0, LAW = 1.4;
// target world AABB (yaw 0, trivial)
const tHX = 4.52, tHZ = 0.948, tCZ = 0.078;
const tmin = [TX - tHX, TZ + tCZ - tHZ], tmax = [TX + tHX, TZ + tCZ + tHZ];
const NET = /nx-town-(roads|paths)|approach-.*lane|nx-dress-.*hedgerow/;
type Gap = { id: string; gap: number; film: boolean };
const gaps: Gap[] = [];
for (const e of ents) {
  if (e.id === "nx-struct-catenarygate") { console.log(`TARGET ALREADY LIVE: ${JSON.stringify(e.pos)}`); continue; }
  const bb = e.bbox; if (!bb) continue;
  const h = (bb.max?.[1] ?? 0) - (bb.min?.[1] ?? 0);
  const film = h <= 0.5 || NET.test(e.id);
  const hx = (bb.size?.[0] ?? 0) / 2, hz = (bb.size?.[2] ?? 0) / 2;
  const yaw = e.yaw ?? 0, c = Math.abs(Math.cos(yaw)), s = Math.abs(Math.sin(yaw));
  const ex = hx * c + hz * s, ez = hz * c + hx * s; // rotation-grown (conservative)
  const p = e.pos;
  const dx = Math.max(tmin[0] - (p[0] + ex), (p[0] - ex) - tmax[0], 0);
  const dz = Math.max(tmin[1] - (p[2] + ez), (p[2] - ez) - tmax[1], 0);
  const gap = Math.hypot(dx, dz); // AABB-vs-AABB separation (>=0 overlap-free distance)
  gaps.push({ id: e.id, gap, film });
}
const solid = gaps.filter(g => !g.film).sort((a, b) => a.gap - b.gap);
console.log("worst solid neighbors:");
for (const g of solid.slice(0, 6)) console.log(`  ${g.id.padEnd(38)} gap=${g.gap.toFixed(3)} ${g.gap >= LAW ? "PASS" : "FAIL"}`);
const films = gaps.filter(g => g.film).sort((a, b) => a.gap - b.gap).slice(0, 3);
console.log("nearest exempt films (info):", films.map(g => `${g.id}=${g.gap.toFixed(2)}`).join(" "));
const worst = solid[0];
console.log(worst && worst.gap >= LAW ? `SAT CLEAR — worst ${worst.id} ${worst.gap.toFixed(3)}m >= ${LAW}` : `SAT FAIL — ${worst?.id} ${worst?.gap.toFixed(3)}m`);
