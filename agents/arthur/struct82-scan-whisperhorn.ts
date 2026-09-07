// struct82-scan-whisperhorn.ts — struct-82: WHISPER HORN seat scan.
// Candidate: nx-struct-whisperhorn (NEW). TRUE footprint = base slab disc
// r 2.05 (full circles — dais steps + slab; bbox ±2.05 is the true
// footprint, not a square proxy; struct-19 law satisfied exactly).
// Azimuthally symmetric (bell-up; no yaw read dependence) — yaw 0.
// Anchor concept: the ACOUSTIC FAMILY — soundmirror (dish listens, SE
// wild edge az -49.5 r 66.5... verify from census) and the horn ANSWERS:
// seat within conversational sight of the soundmirror, not crowding it.
// Scan az[-70,-25] x r[60,85], law: solid-solid >= 1.4m disc-vs-AABB,
// ground films exempt by id, no-bbox entities exempt (lights).
// Rank by: (a) 12-20m from soundmirror (conversational pair), then (b)
// clearance margin.
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const R = 2.05;
const LAW = 1.4;
const AZ0 = -70, AZ1 = -25, R0 = 60, R1 = 85;

function discVsAABB(cx: number, cz: number, r: number, minx: number, minz: number, maxx: number, maxz: number): number {
    const qx = Math.max(minx, Math.min(cx, maxx)), qz = Math.max(minz, Math.min(cz, maxz));
    return Math.hypot(cx - qx, cz - qz) - r;
}

const base = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8")).url
    .replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const cens = await (await fetch(`${base}/geom?world=commons-next`)).json();
const ents: any[] = cens.entities ?? [];
console.log(`census: ${ents.length} entities (fresh, ${new Date().toISOString()})`);

const SM = ents.find((e: any) => e.id === "nx-struct-soundmirror");
if (!SM) throw Error("soundmirror absent from census");
console.log(`soundmirror anchor: (${SM.pos[0]}, ${SM.pos[2]}) r=${Math.hypot(SM.pos[0], SM.pos[2]).toFixed(1)} az=${(Math.atan2(SM.pos[2], SM.pos[0]) * 180 / Math.PI).toFixed(1)}`);

const SELF = "nx-struct-whisperhorn";
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-|nx-dress-sw-moss/;
type Nb = { id: string; minx: number; minz: number; maxx: number; maxz: number };
const solids: Nb[] = []; const exempted: string[] = [];
for (const e of ents) {
    if (e.id === SELF) continue;
    const bb = e.bbox;
    if (!bb) { exempted.push(`${e.id} (light/none)`); continue; }
    if (GROUND.test(e.id)) { exempted.push(`${e.id} (ground-film)`); continue; }
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const cyaw = Math.abs(Math.cos(e.yaw ?? 0)), syaw = Math.abs(Math.sin(e.yaw ?? 0));
    const ew = hx * cyaw + hz * syaw, ed = hx * syaw + hz * cyaw;
    solids.push({ id: e.id, minx: e.pos[0] - ew, minz: e.pos[2] - ed, maxx: e.pos[0] + ew, maxz: e.pos[2] + ed });
}
console.log(`solids: ${solids.length}, exempt: ${exempted.length}`);

const found: { x: number; z: number; az: number; r: number; gap: number; worst: string; dSM: number }[] = [];
for (let azd = AZ0; azd <= AZ1 + 1e-9; azd += 0.5) {
    const az = azd * Math.PI / 180;
    for (let r = R0; r <= R1 + 1e-9; r += 0.5) {
        const x = r * Math.cos(az), z = r * Math.sin(az);
        let gap = Infinity, worst = "";
        for (const s of solids) {
            if (x + R + LAW < s.minx || x - R - LAW > s.maxx || z + R + LAW < s.minz || z - R - LAW > s.maxz) continue;
            const g = discVsAABB(x, z, R, s.minx, s.minz, s.maxx, s.maxz);
            if (g < gap) { gap = g; worst = s.id; }
            if (gap < LAW) break;
        }
        if (gap >= LAW) {
            const dSM = Math.hypot(x - SM.pos[0], z - SM.pos[2]);
            found.push({ x: +x.toFixed(2), z: +z.toFixed(2), az: +azd.toFixed(1), r, gap: +gap.toFixed(2), worst, dSM: +dSM.toFixed(1) });
        }
    }
}
console.log(`lawful seats in az[${AZ0},${AZ1}] r[${R0},${R1}]: ${found.length}`);

// conversational pair: 12-20m from the soundmirror, best margin
const pair = found.filter(s => s.dSM >= 12 && s.dSM <= 20).sort((a, b) => b.gap - a.gap);
console.log("\npair-band seats (12-20m from soundmirror), top 10 by margin:");
for (const s of pair.slice(0, 10)) console.log(`  (${s.x}, ${s.z}) az ${s.az} r ${s.r} gap=${s.gap} dSM=${s.dSM} worst=${s.worst}`);
const byGap = [...found].sort((a, b) => b.gap - a.gap);
console.log("\nmax-clearance seat overall:");
const g0 = byGap[0];
if (g0) console.log(`  (${g0.x}, ${g0.z}) az ${g0.az} r ${g0.r} gap=${g0.gap} dSM=${g0.dSM} worst=${g0.worst}`);
