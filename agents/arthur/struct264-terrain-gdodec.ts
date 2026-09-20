// struct264-terrain-gdodec.ts — TERRAIN PREFLIGHT for nx-struct-gdodec
// at seat az268.5 r98.5 (struct264-scan-gdodec margin+constellation pick:
// NN 9.46 angler, exact-SAT gap 2.43 temple-labyrinth-0051, walk 69.41;
// constellation srcubo@18.3 + tico@33.0 — the W-NW star shelf). Yaw
// 331.5deg (procession convention; the gdodec is a 5-FOLD vertex-down
// seat — SSD/csaszar/gsd family precedent, off the 72deg lattice,
// disclosed in-placer).
// Law: sample heightAt over the TRUE rotated 12-gon (center + 12 verts
// + 12 edge-mids = 25 points); PY = LOWEST so the dais sole meets grade
// (the dais-sole-at-grade build absorbs the spread).
// Chassis: struct262-terrain-gsd.ts (proven; WorldAgent OBJECT-form
// constructor — the string-arg form silently never joins).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const AZ = 268.5, R_SEAT = 98.5;
const EX = R_SEAT * Math.cos(AZ * Math.PI / 180), EZ = R_SEAT * Math.sin(AZ * Math.PI / 180);
const YAW = 331.5 * Math.PI / 180, APO = 3.30, R = APO / Math.cos(Math.PI / 12), N = 12; // apothem-first 12-gon
console.log(`seat: az${AZ} r${R_SEAT} -> EX ${EX.toFixed(6)} EZ ${EZ.toFixed(6)}; yaw ${YAW.toFixed(6)} rad; dais circumradius ${R.toFixed(6)}`);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct264-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(1700);
    const cy = Math.cos(YAW), sy = Math.sin(YAW);
    const pts: Array<[number, number, string]> = [[EX, EZ, "center"]];
    for (let i = 0; i < N; i++) {
        const a = ((i + 0.5) / N) * Math.PI * 2; // TRUE apothem-first corner phase (flats on the axes)
        const lx = R * Math.cos(a), lz = R * Math.sin(a);
        const wx = EX + lx * cy + lz * sy, wz = EZ - lx * sy + lz * cy;
        pts.push([wx, wz, `v${i}`]);
        const a2 = (i / N) * Math.PI * 2; // edge-mid phases sit at k*30° (the flats' normals)
        const mx = R * Math.cos(a2), mz = R * Math.sin(a2);
        pts.push([EX + mx * cy + mz * sy, EZ - mx * sy + mz * cy, `m${i}`]);
    }
    const hs: number[] = [];
    for (const [x, z, tag] of pts) {
        const h = agent.heightAt(x, z);
        if (!isFinite(h)) { console.error(`heightAt not finite at ${tag} (${x.toFixed(3)},${z.toFixed(3)}): ${h}`); process.exit(1); }
        hs.push(h);
    }
    const lo = Math.min(...hs), hi = Math.max(...hs);
    console.log(`terrain 25pt over TRUE rotated 12-gon: min ${lo.toFixed(6)} max ${hi.toFixed(6)} spread ${((hi - lo) * 1000).toFixed(1)}mm`);
    console.log(`PY = lowest = ${lo.toFixed(6)} (dais-sole-at-grade absorbs the spread)`);
} finally { agent.close(); }
