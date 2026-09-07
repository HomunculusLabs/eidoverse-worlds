// struct64-sat-ellipsecourt.ts — read-only fresh-census SAT preflight for
// struct-64: nx-struct-ellipsecourt at (0,·,−47) yaw π/2.
// TRUE decoded envelope of judged v2 bytes 2aa37e9d (local, origin-centered):
//   x ±6.97 (major) / z ±4.475 (minor) / y ≤ 3.09
// yaw π/2 → major axis along world Z (walk-through axis N–S), minor along X.
// Conservative full-ellipse OBB (over-gates, never under-gates the pier ring).
// Axis convention (align-1): local-x → (cosθ, −sinθ), local-z → (sinθ, +cosθ).
// Exemptions (0b law + nvp-109 law), evidence-derived, commented:
//   - thin ground layers: bbox height ≤ 0.5 (roads/paths films)
//   - id/lib ground-network set: named below from live census after inspection
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const PX = 0, PZ = -47, YAW = Math.PI / 2, HX = 6.97, HZ = 4.475;
const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities ?? [];
console.log(JSON.stringify({ census: ents.length, targetAbsent: !ents.some(e => e.id === "nx-struct-ellipsecourt") }));
const axes = (yaw: number) => [[Math.cos(yaw), -Math.sin(yaw)], [Math.sin(yaw), Math.cos(yaw)]];
const [au, av] = axes(YAW);
const gap = (e: any): number => {
    const bb = e.bbox; if (!bb) return Infinity;
    const c = bb.center ?? [(bb.min[0] + bb.max[0]) / 2, 0, (bb.min[2] + bb.max[2]) / 2];
    const sx = (bb.size ?? [bb.max[0] - bb.min[0], 0, bb.max[2] - bb.min[2]])[0] / 2;
    const sz = (bb.size ?? [0, 0, bb.max[2] - bb.min[2]])[2] / 2;
    const dx = c[0] - PX, dz = c[2] - PZ;
    const [bu, bv] = axes(e.yaw ?? 0);
    let best = -Infinity;
    for (const n of [au, av, bu, bv]) {
        const ra = HX * Math.abs(au[0] * n[0] + au[1] * n[1]) + HZ * Math.abs(av[0] * n[0] + av[1] * n[1]);
        const rb = sx * Math.abs(bu[0] * n[0] + bu[1] * n[1]) + sz * Math.abs(bv[0] * n[0] + bv[1] * n[1]);
        const dist = dx * n[0] + dz * n[1];
        best = Math.max(best, Math.abs(dist) - ra - rb);
    }
    return best;
};
const thin = (e: any) => { const b = e.bbox; return b && (b.max[1] - b.min[1]) <= 0.5; };
// Ground-network id set (N spoke + core paths/roads, from census inspection below)
const GROUND_NET = /^(nx-approach-|nx-road|nx-path|av-roads|nx-town-roads)/;
const rows = ents
    .filter(e => e.id !== "nx-struct-ellipsecourt" && e.bbox && !e.lib?.startsWith("store/") === false ? true : true)
    .map(e => ({ id: e.id, lib: e.lib, h: e.bbox ? e.bbox.max[1] - e.bbox.min[1] : -1, gap: gap(e), thin: thin(e), net: GROUND_NET.test(e.id) }))
    .filter(x => x.gap < 8)
    .sort((a, b) => a.gap - b.gap);
for (const x of rows) console.log(JSON.stringify(x));
const solid = rows.filter(x => !x.thin && !x.net);
console.log(JSON.stringify({ nearestSolid: solid[0] ?? null, solidCount: solid.length }));
