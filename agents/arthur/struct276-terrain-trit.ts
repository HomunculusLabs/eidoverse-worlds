// struct276-terrain-trit.ts — TERRAIN PREFLIGHT for nx-struct-trit
// at seat az305.0 r105.0 (struct276-scan-trit margin+constellation
// pick: NN 19.26 beacon, exact-SAT gap 2.34 cairn-0048, walk 76.41;
// constellation beacon@19.3 + gicosa@25.5 — the NW-N kin shelf, the
// FIRST family member outside its parent's quarter per struct-275).
// Yaw 295.0deg (procession convention; the trit is a 3-FOLD tri-rank
// point-down seat — 295 mod 120 = 55deg off the lattice, disclosed
// in-placer, family precedent).
// Law: sample heightAt over the TRUE rotated 12-gon (center + 12 verts
// + 12 edge-mids = 25 points); PY = LOWEST so the dais sole meets
// grade (the dais-sole-at-grade build absorbs the spread).
// Chassis: struct274-terrain-tetrakis.ts (proven; WorldAgent OBJECT-form
// constructor — the string-arg form silently never joins).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const AZ = 305.0, R_SEAT = 105.0;
const EX = R_SEAT * Math.cos(AZ * Math.PI / 180), EZ = R_SEAT * Math.sin(AZ * Math.PI / 180);
const YAW = 295.0 * Math.PI / 180, R = 4.45, N = 12; // corners-on-axes 12-gon (circumradius; decode D2 TRUE box +/-4.450)
console.log(`seat: az${AZ} r${R_SEAT} -> EX ${EX.toFixed(6)} EZ ${EZ.toFixed(6)}; yaw ${YAW.toFixed(6)} rad; dais circumradius ${R}`);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct276-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(1700);
    const cy = Math.cos(YAW), sy = Math.sin(YAW);
    const pts: Array<[number, number, string]> = [[EX, EZ, "center"]];
    for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2; // TRUE corners-on-axes phase (ROT=0 class)
        const lx = R * Math.cos(a), lz = R * Math.sin(a);
        const wx = EX + lx * cy + lz * sy, wz = EZ - lx * sy + lz * cy;
        pts.push([wx, wz, `v${i}`]);
        const a2 = ((i + 0.5) / N) * Math.PI * 2; // edge-mid phases sit between corners
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
    console.log(`terrain ${pts.length}pt over TRUE rotated 12-gon: min ${lo.toFixed(6)} max ${hi.toFixed(6)} spread ${((hi - lo) * 1000).toFixed(1)}mm`);
    console.log(`PY = lowest = ${lo.toFixed(6)} (dais-sole-at-grade absorbs the spread)`);
} finally { agent.close(); }
