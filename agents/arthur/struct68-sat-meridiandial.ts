// struct68-sat-meridiandial.ts — read-only fresh-census SAT preflight for
// struct-68: nx-struct-meridiandial at (0,·,−27) yaw 0 (village meridian).
// The dial is a SOLID DISC r 3.7 (lower octagon step) — struct-19 law: exact
// disc-vs-OBB signed distance (du=|d·u|−hu, dv=|d·v|−hv,
// dist=hypot(max(du,0),max(dv,0)), clearance = dist − R), never a square-bbox
// proxy that inflates the disc by dead corners.
// Exemptions (nvp-109 + 0b laws, evidence-derived):
//   - thin ground layers: bbox height ≤ 0.5 (roads/paths films cannot pinch)
//   - ground-network ids: named regex below
// Solid-solid adjacency law: clearance ≥ 1.4m for standing solids.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const PX = 0, PZ = -27, YAW = 0, R = 3.7;
const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities ?? [];
console.log(JSON.stringify({ census: ents.length, targetAbsent: !ents.some(e => e.id === "nx-struct-meridiandial") }));
// neighbor OBB axes (align-1): local-x → (cos,−sin), local-z → (sin,+cos)
const axes = (yaw: number) => [[Math.cos(yaw), -Math.sin(yaw)], [Math.sin(yaw), Math.cos(yaw)]];
const discClear = (e: any): number => {
    const bb = e.bbox; if (!bb) return Infinity;
    const c = bb.center ?? [(bb.min[0] + bb.max[0]) / 2, 0, (bb.min[2] + bb.max[2]) / 2];
    const sx = (bb.size ?? [bb.max[0] - bb.min[0], 0, bb.max[2] - bb.min[0]])[0] / 2;
    const sz = (bb.size ?? [0, 0, bb.max[2] - bb.min[2]])[2] / 2;
    const dx = c[0] - PX, dz = c[2] - PZ;
    const [u, v] = axes(e.yaw ?? 0);
    const du = Math.abs(dx * u[0] + dz * u[1]) - sx;
    const dv = Math.abs(dx * v[0] + dz * v[1]) - sz;
    const dist = Math.hypot(Math.max(du, 0), Math.max(dv, 0));
    return dist - R; // >0 clear; <0 real geometric overlap (hard fail)
};
const thin = (e: any) => { const b = e.bbox; return b && (b.max[1] - b.min[1]) <= 0.5; };
const GROUND_NET = /^(nx-approach-|nx-road|nx-path|av-roads|nx-town-roads)/;
const rows = ents
    .filter(e => e.id !== "nx-struct-meridiandial" && e.bbox)
    .map(e => ({ id: e.id, lib: e.lib, h: +(e.bbox.max[1] - e.bbox.min[1]).toFixed(2), clear: +discClear(e).toFixed(3), thin: thin(e), net: GROUND_NET.test(e.id) }))
    .filter(x => x.clear < 8)
    .sort((a, b) => a.clear - b.clear);
for (const x of rows) console.log(JSON.stringify(x));
const solid = rows.filter(x => !x.thin && !x.net);
const overlap = solid.filter(x => x.clear <= 0);
const pinch = solid.filter(x => x.clear > 0 && x.clear < 1.4);
if (overlap.length) { console.error(`FAIL real overlap: ${overlap.map(x => x.id).join(",")}`); process.exit(1); }
if (pinch.length) { console.error(`REVIEW sub-1.4m solid adjacency: ${pinch.map(x => `${x.id} ${x.clear}`).join(",")}`); process.exit(2); }
console.log(JSON.stringify({ verdict: "CLEAR", nearestSolid: solid[0] ?? null, solidCount: solid.length }));
