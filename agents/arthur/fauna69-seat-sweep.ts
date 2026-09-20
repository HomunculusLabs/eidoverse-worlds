// fauna69-seat-sweep.ts — 25cm-grid seat sweep for the pigeon flock.
// Zone: the market stall's plaza-side fore-court — world-grid x −6..−2,
// z 4..7 (the (0.7071,−0.7071) local+z' band toward the plaza, census-
// grounded: market (−6.5,6.5) yaw 2.3562, fore-court = market +z'·d).
// Flock yaw 0.4354 (π/4−0.35 — facing ~20° oblique to the plaza reader;
// guinea 20°-oblique law). Films exempt (ground-layer law, both
// directions): height ≤0.5 OR known film/network ids incl core-paths,
// approach lanes, roads. Solids: every live entity within 22m, rotated
// OBB with LOCAL bbox center offset (struct-80 law b).
import { readFileSync } from "node:fs";

const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const FLOCK = { hx: 0.5735, hz: 0.3645, cx: -0.1885, cz: -0.0045 }; // decode whole-envelope
const YAW = 0.4354;
const FILM_IDS = /^(nx-town-roads|nx-roads|nx-paths|nx-artwalk-|nx-dress-lavender|nx-orchard|nx-mosaic|nx-core-paths|nx-approach-)/;
// SUSPENDED decor (stringlights at y2.6 — nvp-134 exemption) and the
// streetlamp NETWORK (fat bbox; the 8 REAL posts decoded from the
// hash-verified local GLB, fauna69-lampposts.ts: world (±3.42,±9.397)/
// (±9.397,±3.42) via yaw-π negation) are replaced by point solids.
const SUSPENDED_IDS = /^(nx-dress-stringlights)$/;
const POSTS: [number, number][] = [
  [9.397, 3.42], [9.397, -3.42], [3.42, 9.397], [3.42, -9.397],
  [-3.42, 9.397], [-3.42, -9.397], [-9.397, 3.42], [-9.397, -3.42],
];
const POST_OBB = { hx: 0.23, hz: 0.23 }; // census lamp size 0.88×0.46 → the post base


const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities.filter((e: any) => e.pos && e.bbox);
console.log("census (bbox-bearing):", ents.length);

const solids: any[] = [];
for (const e of ents) {
  if (FILM_IDS.test(e.id) || SUSPENDED_IDS.test(e.id)) continue;
  if (e.id === "nx-town-streetlamps") continue; // replaced by the 8 decoded posts
  const h = e.bbox.max[1] - e.bbox.min[1];
  if (h <= 0.5) continue; // ground film by height proxy
  solids.push(e);
}
for (const [px, pz] of POSTS) solids.push({ id: "lamp-post", pos: [px, 0, pz], yaw: 0, bbox: { size: [POST_OBB.hx * 2, 2.95, POST_OBB.hz * 2], max: [0, 2.95, 0], min: [0, 0, 0], center: [0, 0, 0] } });

const obb = (e: any) => {
  const [px, , pz] = e.pos, yaw = e.yaw ?? 0;
  const s = e.bbox.size, c = e.bbox.center ?? { x: 0, y: 0, z: 0 };
  const cx = Array.isArray(c) ? c[0] : c.x, cz = Array.isArray(c) ? c[2] : c.z;
  const wx = px + cx * Math.cos(yaw) + cz * Math.sin(yaw);
  const wz = pz - cx * Math.sin(yaw) + cz * Math.cos(yaw);
  return { id: e.id, x: wx, z: wz, hx: s[0] / 2, hz: s[2] / 2, yaw };
};

const gap = (a: any, b: any) => {
  const dx = b.x - a.x, dz = b.z - a.z;
  let best = -Infinity;
  const proj = (o: any, ux: number, uz: number) => {
    const lx = Math.cos(o.yaw), lz = Math.sin(o.yaw);
    const zx = -Math.sin(o.yaw), zz = Math.cos(o.yaw);
    return o.hx * Math.abs(lx * ux + lz * uz) + o.hz * Math.abs(zx * ux + zz * uz);
  };
  for (const o of [a, b]) {
    for (const [ux, uz] of [[Math.cos(o.yaw), -Math.sin(o.yaw)], [Math.sin(o.yaw), Math.cos(o.yaw)]]) {
      const dist = Math.abs(dx * ux + dz * uz);
      const g = dist - proj(a, ux, uz) - proj(b, ux, uz);
      if (g > best) best = g;
    }
  }
  return best;
};

const results: any[] = [];
for (let x = -9.0; x <= -2.0; x += 0.25) {
  for (let z = 2.0; z <= 9.0; z += 0.25) {
    const cxw = x + FLOCK.cx * Math.cos(YAW) + FLOCK.cz * Math.sin(YAW);
    const czw = z - FLOCK.cx * Math.sin(YAW) + FLOCK.cz * Math.cos(YAW);
    const me = { id: "flock", x: cxw, z: czw, hx: FLOCK.hx, hz: FLOCK.hz, yaw: YAW };
    let worst = Infinity, worstId = "";
    for (const e of solids) {
      const ex = e.pos[0], ez = e.pos[2];
      if (Math.hypot(ex - x, ez - z) > 22) continue;
      const g = gap(me, obb(e));
      if (g < worst) { worst = g; worstId = e.id; }
    }
    if (worst >= 1.4) results.push({ x: +x.toFixed(2), z: +z.toFixed(2), worst: +worst.toFixed(3), worstId });
  }
}
results.sort((a, b) => b.worst - a.worst);
console.log(`qualifying (worst>=1.4): ${results.length}`);
for (const c of results.slice(0, 12)) console.log(JSON.stringify(c));
// prefer the seat CLOSEST to the market fore-court center-line (the
// market→plaza diagonal, local +z' axis) among the top-gap tier — the
// flock feeds in the stall's own fore-court, not the open plaza
const ax = 0.7071, az = -0.7071; // market→plaza unit
for (const c of results) {
  const rx = c.x - -6.5, rz = c.z - 6.5;         // vector market→seat
  const along = rx * ax + rz * az;                // fore-court depth d
  const lateral = rx * -az + rz * ax;             // off the center-line
  c.along = +along.toFixed(2); c.lateral = +lateral.toFixed(2);
  c.off = +Math.abs(lateral).toFixed(2);
}
const tier = results.filter((c) => c.worst >= results[0].worst - 0.15);
tier.sort((a, b) => (a.off - b.off) || (b.along - a.along));
console.log("BEST (top-gap tier, closest to fore-court center-line):");
for (const c of tier.slice(0, 10)) console.log(JSON.stringify(c));
