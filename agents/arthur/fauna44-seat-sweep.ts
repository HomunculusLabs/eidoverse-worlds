// fauna44-seat-sweep.ts — live-census SAT sweep for the fauna-44 red
// squirrel ON the NE woodstack crown (host-rider concentric-above class:
// ducks-on-pool fauna-3 / swallows-over-yard fauna-34 precedent — the
// commission is literally life ON the stack, so the HOST itself is the
// designed exemption; every OTHER solid must clear ≥1.4m).
// Solid OBB from the DECODE (ebc1d32b): entity local x −0.292..+0.274
// (half 0.283, center −0.009), z −0.786..+0.276 (half 0.531, center
// −0.255) — the z axis is the PAIR SEPARATION (sentinel +0.16, runner
// −0.70 post-bake). δ = −π/2: the pair line rides the crown's WIDE axis
// (host-local x, logs ±1.125), entity +x → host +z = the cap/open side
// facing the SW plaza reader — the sitting-squirrel face-with-nut IS
// the contract view (heron/peahen face-probe class; the plume crests
// the silhouette from dead-front). Rotated footprint in host-local:
// x ∈ [−0.276,+0.786] at origin, z ∈ [−0.292,+0.274].
// PY = HOST-derived, not terrain: host y −0.032 + crown top 0.648 = 0.616
// (the stack IS the ground here).
// INHERITED-ADJACENCY LAW: the host stack leans on its hamlet's flank
// gable BY DESIGN (dress-9 concept) — the host's own OBB already touches
// that building. A rider on the crown cannot be farther from the hamlet
// than the stack it stands on: solids within 0.35m of the HOST are
// allowed sub-1.4 gaps with the measured value recorded (never below
// +0.15 — the rider must not sit ON the wall face itself).
// Constraints: worst non-host non-inherited solid gap ≥ 1.4m AND entity
// OBB center NOT inside any film OBB. Preference: crown-centered
// (|host-local footprint centroid|), tie-break worst-gap.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(25_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

const HOST = "nx-dress-ne-woodstack-001";
const host = ents.find((e: any) => e.id === HOST);
if (!host) throw Error("host woodstack absent");
// hard-gate the host tuple + lib (artwalk-39 law — drift = die)
if (!host.lib.endsWith("692bc54e02358cc1.glb")) throw Error(`host lib drift ${host.lib}`);
const HP = host.pos, HY = host.yaw;

// entity solid OBB halves + center offset (entity-local, from decode)
const CX = -0.074, CZ = -0.251, HW = 0.348, HD = 0.557;
const DELTA = -Math.PI / 2;       // entity yaw offset from host yaw
const YAW = HY + DELTA;

const solids = ents.filter((e: any) => {
    if (e.id === HOST) return false;             // concentric-above rider
    if (e.id === "nx-dress-sqrl-001") return false;
    if (!e.bbox) return false;                   // lights/riders
    if (e.bbox.size[1] <= 0.5) return false;     // films
    if (e.pos[1] >= 1.8) return false;           // suspended decor
    return true;
});
const films = ents.filter((e: any) => e.bbox && e.bbox.size[1] <= 0.5);

// world OBB of a census entity (yawed bbox-center transform, struct-80 law b)
const worldObb = (e: any) => {
    const b = e.bbox;
    const bcx = (b.min[0] + b.max[0]) / 2, bcz = (b.min[2] + b.max[2]) / 2;
    const wx = e.pos[0] + bcx * Math.cos(e.yaw) + bcz * Math.sin(e.yaw);
    const wz = e.pos[2] - bcx * Math.sin(e.yaw) + bcz * Math.cos(e.yaw);
    const cos = Math.cos(e.yaw), sin = Math.sin(e.yaw);
    return { x: wx, z: wz, yaw: e.yaw, hw: b.size[0] / 2, hd: b.size[2] / 2,
             ax: [cos, -sin] as [number, number], az: [sin, cos] as [number, number] };
};
const hostObb = (() => {
    const b = host.bbox;
    const bcx = (b.min[0] + b.max[0]) / 2, bcz = (b.min[2] + b.max[2]) / 2;
    const wx = HP[0] + bcx * Math.cos(HY) + bcz * Math.sin(HY);
    const wz = HP[2] - bcx * Math.sin(HY) + bcz * Math.cos(HY);
    const cos = Math.cos(HY), sin = Math.sin(HY);
    return { x: wx, z: wz, yaw: HY, hw: b.size[0] / 2, hd: b.size[2] / 2,
             ax: [cos, -sin] as [number, number], az: [sin, cos] as [number, number] };
})();
const gap = (a: any, b: any) => {
    const dx = a.x - b.x, dz = a.z - b.z;
    const axes: [number, number][] = [a.ax, a.az, b.ax, b.az];
    let best = -Infinity;
    for (const [ux, uz] of axes) {
        const pa = a.hw * Math.abs(a.ax[0] * ux + a.ax[1] * uz) + a.hd * Math.abs(a.az[0] * ux + a.az[1] * uz);
        const pb = b.hw * Math.abs(b.ax[0] * ux + b.ax[1] * uz) + b.hd * Math.abs(b.az[0] * ux + b.az[1] * uz);
        const g = Math.abs(dx * ux + dz * uz) - pa - pb;
        if (g > best) best = g;
    }
    return best;
};
// inherited-adjacency set: solids the host itself abuts (≤0.35m)
const inherited = new Map<string, number>();
for (const e of solids) {
    const g = gap(hostObb, worldObb(e));
    if (g <= 0.35) inherited.set(e.id, +g.toFixed(3));
}
console.log(`census ${ents.length}; host at (${HP[0]},${HP[2]}) yaw ${HY.toFixed(4)}; ${solids.length} solids, ${films.length} films; entity yaw ${YAW.toFixed(4)}`);
console.log(`inherited-adjacency (host abuts, ≤0.35m): ${[...inherited.entries()].map(([k, v]) => `${k} ${v}m`).join("; ") || "none"}`);

const obb = (wx: number, wz: number, yaw: number, hw: number, hd: number) => {
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    return { x: wx, z: wz, yaw, hw, hd, ax: [cos, -sin] as [number, number], az: [sin, cos] as [number, number] };
};
const insideFilm = (e: any, px: number, pz: number) => {
    const b = e.bbox;
    const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
    const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
    const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
    const dx = px - ewx, dz = pz - ewz;
    const cos = Math.cos(e.yaw), sin = Math.sin(e.yaw);
    const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
    return Math.abs(lx) <= b.size[0] / 2 + 0.3 && Math.abs(lz) <= b.size[2] / 2 + 0.3;
};
// entity OBB corners in HOST-local (crown containment test)
const cornersHost = (hx: number, hz: number) => {
    const cos = Math.cos(DELTA), sin = Math.sin(DELTA);
    const out: [number, number][] = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const ex = CX + sx * HW, ez = CZ + sz * HD;
        out.push([hx + ex * cos + ez * sin, hz - ex * sin + ez * cos]);
    }
    return out;
};

const results: any[] = [];
let nearMiss: any = null;
for (let hx = -0.70; hx <= 0.70; hx += 0.05) {
    for (let hz = -0.40; hz <= 0.15; hz += 0.05) {
        // crown containment: every OBB corner on the top-course surface
        const cs = cornersHost(hx, hz);
        if (cs.some(([cx, cz]) => cx < -1.125 || cx > 1.125 || cz < -0.72 || cz > 0.24)) continue;
        // world seat
        const wx = HP[0] + hx * Math.cos(HY) + hz * Math.sin(HY);
        const wz = HP[2] - hx * Math.sin(HY) + hz * Math.cos(HY);
        const ecx = wx + CX * Math.cos(YAW) + CZ * Math.sin(YAW);
        const ecz = wz - CX * Math.sin(YAW) + CZ * Math.cos(YAW);
        const me = obb(ecx, ecz, YAW, HW, HD);
        let worst = Infinity, worstId = "", inheritedWorst = Infinity;
        for (const e of solids) {
            if (Math.hypot(e.pos[0] - ecx, e.pos[2] - ecz) > 20) continue;
            const g = gap(me, worldObb(e));
            if (inherited.has(e.id)) {
                if (g < inheritedWorst) inheritedWorst = g;
                continue;
            }
            if (g < worst) { worst = g; worstId = e.id; }
        }
        // inherited adjacency floor: the rider stays off the wall face
        if (inheritedWorst < 0.15) continue;
        if (worst < 1.4) {
            if (!nearMiss || worst > nearMiss.worst) nearMiss = { hostLocal: [+hx.toFixed(2), +hz.toFixed(2)], worst: +worst.toFixed(3), worstId };
            continue;
        }
        let onFilm = "";
        for (const f of films) {
            if (Math.hypot(f.pos[0] - wx, f.pos[2] - wz) > 22) continue;
            if (insideFilm(f, wx, wz)) { onFilm = f.id; break; }
        }
        if (onFilm) continue;
        results.push({ hostLocal: [+hx.toFixed(2), +hz.toFixed(2)], world: [+wx.toFixed(3), +wz.toFixed(3)], worst: +worst.toFixed(3), worstId, inheritedWorst: +inheritedWorst.toFixed(3), dCenter: +Math.hypot(hx - 0.25, hz + 0.05).toFixed(2) });
    }
}
console.log(`qualifying seats (gap ≥ 1.4m, film-clear, crown-contained): ${results.length}`);
if (nearMiss) console.log("best near-miss (SAT-failed only):", JSON.stringify(nearMiss));
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: footprint centroid nearest the crown center, tie-break gap
results.sort((a: any, b: any) => (a.dCenter - b.dCenter) + (b.worst - a.worst) * 0.05);
for (const c of results.slice(0, 8)) console.log(JSON.stringify(c));
console.log(`PY (host-derived): ${(HP[1] + 0.648).toFixed(4)}; YAW: ${YAW.toFixed(4)}`);
