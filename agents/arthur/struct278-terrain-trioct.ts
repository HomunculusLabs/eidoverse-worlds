// struct278-terrain-trioct.ts — TERRAIN PREFLIGHT for nx-struct-trioct
// at seat az154.0 r106.5 (struct278-scan-trioct margin+constellation
// pick: NN 21.68 tcube, exact-SAT gap 2.23 orchard-0012, walk 77.41;
// constellation tcube@21.7 + ico@32.1 — the PARENT REUNION: the live
// octant audit shows oct3 at 5 forms, superseding struct-277's
// every-parent-band-capped assumption; the trioct rejoins its parent
// tcube per the family's canonical dual-beside-parent disposition,
// six precedents).
// Yaw 86.0deg (procession convention; the trioct is a 4-FOLD oct-rank
// point-down seat — 86deg is 4deg shy of the 90deg cardinals,
// near-lattice not exact-mod, disclosed in-placer, family precedent).
// Law: sample heightAt over the TRUE rotated 24-gon (center + 24 verts
// + 24 edge-mids = 49 points); PY = LOWEST so the dais sole meets
// grade (the dais-sole-at-grade build absorbs the spread).
// Chassis: struct276-terrain-trit.ts (proven; WorldAgent OBJECT-form
// constructor — the string-arg form silently never joins).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const AZ = 154.0, R_SEAT = 106.5;
const EX = R_SEAT * Math.cos(AZ * Math.PI / 180), EZ = R_SEAT * Math.sin(AZ * Math.PI / 180);
const YAW = 86.0 * Math.PI / 180, R = 3.70, N = 24; // corners-on-axes 24-gon (circumradius; decode D2 TRUE box +/-3.700)
console.log(`seat: az${AZ} r${R_SEAT} -> EX ${EX.toFixed(6)} EZ ${EZ.toFixed(6)}; yaw ${YAW.toFixed(6)} rad; dais circumradius ${R}`);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct278-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    console.log(`terrain ${pts.length}pt over TRUE rotated 24-gon: min ${lo.toFixed(6)} max ${hi.toFixed(6)} spread ${((hi - lo) * 1000).toFixed(1)}mm`);
    console.log(`PY = lowest = ${lo.toFixed(6)} (dais-sole-at-grade absorbs the spread)`);
} finally { agent.close(); }
