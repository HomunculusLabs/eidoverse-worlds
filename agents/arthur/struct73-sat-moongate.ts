// struct73-sat-moongate.ts — SAT preflight for the moongate first
// placement at (-47.0, -47.0) yaw 0 (SW district threshold, az -135 r66.5).
// CONSERVATIVE rotation-grown world AABBs on BOTH sides (struct-70 law:
// census bbox min/max are LOCAL; world AABB = pos +/- (hx|cos|+hz|sin|,
// hz|cos|+hx|sin|)) — conservative understates true gaps, so a PASS is
// sound. TRUE decoded envelope (local, struct73 probe): x -2.90..2.90,
// z -0.710..0.710 (half 0.710, no center offset), y -0.55..5.25.
// Target is a RING: the bbox includes the buried seat + the 5.8m-wide
// facade, so AABB-vs-AABB is the conservative honest frame (struct-70).
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
const TX = -47.0, TZ = -47.0, T_YAW = 0, LAW = 1.4;
// target world AABB (yaw 0, trivial)
const tHX = 2.90, tHZ = 0.710, tCZ = 0.0;
const tmin = [TX - tHX, TZ + tCZ - tHZ], tmax = [TX + tHX, TZ + tCZ + tHZ];
const NET = /nx-town-(roads|paths)|approach-.*lane|nx-dress-.*hedgerow/;
type Gap = { id: string; gap: number; film: boolean };
const gaps: Gap[] = [];
for (const e of ents) {
  if (e.id === "nx-struct-moongate") { console.log(`TARGET ALREADY LIVE: ${JSON.stringify(e.pos)}`); continue; }
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
