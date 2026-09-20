// fauna67-seat-sweep.ts — 25cm-grid seat sweep for the guinea flock.
// Zone: the poultry yard's S margin band — open meadow S of the
// hutch/turkey line (x 39..46, z -15.5..-12.4; the N bound keeps ≥1.4m
// off the hutch S face -10.22 minus the flock z-half 0.795). Reader: the
// W plaza spoke (yard->plaza bearing -79.1°) — flock yaw -1.22 (≈20°
// oblique off the reader line, the company's local +x spread axis runs
// N-S so the reader sees all three birds broadside).
// Films exempt (ground-layer law, both directions): height ≤ 0.5 OR the
// known film/network ids. Solids: every live entity within 22m, rotated
// OBB with LOCAL bbox center offset (census bbox is local-frame —
// struct-80 law b).
import { readFileSync } from "node:fs";

const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const FLOCK = { hx: 0.962, hz: 0.795, cx: -0.0535, cz: 0.1095 }; // decode whole-envelope
const YAW = -1.22;
const FILM_IDS = /^(nx-town-roads|nx-roads|nx-paths|nx-artwalk-|nx-dress-lavender|nx-orchard|nx-mosaic)/;

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities.filter((e: any) => e.pos && e.bbox);
console.log("census (bbox-bearing):", ents.length);

const solids: any[] = [];
for (const e of ents) {
  if (FILM_IDS.test(e.id)) continue;
  const h = e.bbox.max[1] - e.bbox.min[1];
  if (h <= 0.5) continue; // ground film by height proxy
  solids.push(e);
}

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
  // project both boxes onto the 4 axis candidates (each box's local axes)
  const proj = (o: any, ux: number, uz: number) => {
    const lx = Math.cos(o.yaw), lz = Math.sin(o.yaw);      // local x axis (world)
    const zx = -Math.sin(o.yaw), zz = Math.cos(o.yaw);     // local z axis (world)
    return o.hx * Math.abs(lx * ux + lz * uz) + o.hz * Math.abs(zx * ux + zz * uz);
  };
  for (const o of [a, b]) {
    for (const [ux, uz] of [[Math.cos(o.yaw), -Math.sin(o.yaw)], [Math.sin(o.yaw), Math.cos(o.yaw)]]) {
      const dist = Math.abs(dx * ux + dz * uz);
      const g = dist - proj(a, ux, uz) - proj(b, ux, uz);
      if (g > best) best = g;
    }
  }
  return best; // SAT max separating gap
};

const results: any[] = [];
for (let x = 39.0; x <= 46.0; x += 0.25) {
  for (let z = -15.5; z <= -12.4; z += 0.25) {
    // flock OBB center (envelope center offset rotated by yaw)
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
// prefer the candidate closest to the yard margin (z near -13.2) among the
// top-gap tier, W-most for the reader line
const tier = results.filter((c) => c.worst >= results[0].worst - 0.05);
tier.sort((a, b) => (a.z - b.z) || (a.x - b.x));
console.log("BEST (top-gap tier, most-yard-anchored W-first):");
for (const c of tier.slice(0, 6)) console.log(JSON.stringify(c));
// mid-band candidates (the designed patrol lane between hutch and turkey)
console.log("MID-BAND (x 41.5..42.75):");
const mid = results.filter((c) => c.x >= 41.5 && c.x <= 42.75).sort((a, b) => b.worst - a.worst);
for (const c of mid.slice(0, 8)) console.log(JSON.stringify(c));
// distribution: best seat per x column
console.log("BEST PER X:");
for (let x = 39; x <= 46; x += 0.5) {
  const col = results.filter((c) => Math.abs(c.x - x) < 0.01).sort((a, b) => b.worst - a.worst);
  if (col.length) console.log(JSON.stringify(col[0]));
}
// print the four context tuples for the rig
for (const id of ["nx-dress-coop", "nx-dress-hutch", "nx-dress-turkey-001", "nx-dress-cat-001", "nx-dress-hens"]) {
  const e = d.entities.find((x: any) => x.id === id);
  if (e) console.log(`CTX ${id}: pos [${e.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${e.yaw.toFixed(4)} lib ${e.lib}`);
}
