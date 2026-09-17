// struct211-select-arbelos.ts — SELECT: pin the FINAL seat + yaw for
// nx-struct-arbelos v1 from struct211-scan-arbelos.ts's lawful candidates
// (fresh census 346, axis re-derived 91.0° this tick; the procession line
// itself reads az94.0 — standing members enneper250 -> ... -> mandelbrot360
// -> viviani370 -> morley380 all az94.0).
//
// SELECTION LAW: the arbelos takes the NEXT ON-LINE STEP past morley
// (r380): az94.0 r390.0, 10.0m step == ...->elliptic->mandelbrot->viviani->
// morley rhythm. NN floor will be 10.00 vs nx-struct-morley (law 8.0).
// YAW LAW (struct-104 oblique-read, struct-210 carry contract "the
// construction reads on the +Z face: oblique 30-40° off the approach walk
// per struct-104 convention (the procession's standing 214° convention)"):
// +Z face normal must sit 30-40° off the az274 anti-travel sightline,
// east lean (struct-187 convention). Pinned by exhaustive 0.5° band scan
// maximizing SAT; derivation below in code.
// Chassis: struct209-select-morley.ts (proven).
import { readFileSync } from "node:fs";
const CFG = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = CFG.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

async function geom(): Promise<Record<string, any>> {
    const r = await fetch(`${base}/geom?world=commons-next`);
    if (!r.ok) throw Error(`geom ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const E = await geom();
const ents = Object.values(E);
console.log(`fresh census (select): ${ents.length} entities`);

// ---- pinned seat: NEXT ON-LINE STEP az94.0 r390.0 (scan corridor read) ----
const R = 390.0, AZ = 94.0;
const PX = +(R * Math.cos(AZ * Math.PI / 180)).toFixed(6), PZ = +(R * Math.sin(AZ * Math.PI / 180)).toFixed(6);
console.log(`pinned seat az${AZ} r${R} -> pos (${PX}, ${PZ})`);
const ANTI_TRAVEL = 274; // az of the plaza-facing sightline (procession az94 + 180)
// exhaustive yaw scan in the struct-104 oblique band: |Δ(normalAz, ANTI_TRAVEL)| in [30,40]
const HX = 6.300 / 2, HZ = 0.900 / 2; // arbelos footprint (envelope 6.300x0.900 curb-long, D8 symmetric center)
const LAW = 1.4, NN_LAW = 8.0;
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
// verify NN at seat
{
    let nn = 1e9, nid = "";
    for (const e of ents) {
        if (!e.id.startsWith("nx-struct-") || e.id.endsWith("-l")) continue;
        const d = Math.hypot(e.pos[0] - PX, e.pos[2] - PZ);
        if (d < nn) { nn = d; nid = e.id; }
    }
    console.log(`NN at seat: ${nid} ${nn.toFixed(2)} (law ${NN_LAW})`);
    if (nn < NN_LAW) { console.log("NN FAIL"); process.exit(1); }
}
// yaw scan: normal = YAW + 90° (rad); find the yaw in [0,2π) whose normal
// sits 30-40° off anti-travel, preferring the east-lean convention
// (struct-187: east lean matches melencolia x>0 convention) and max SAT.
let best: any = null;
for (let deg = 0; deg < 360; deg += 0.5) {
    const yaw = deg * Math.PI / 180;
    const normalAz = (deg + 90 + 360) % 360;
    const dAnti = Math.abs(((normalAz - ANTI_TRAVEL + 540) % 360) - 180);
    if (dAnti < 30 || dAnti > 40) continue;
    const eastLean = ((normalAz - ANTI_TRAVEL + 360) % 360) < 180; // normal leaning east of anti-travel
    if (!eastLean) continue;
    const cs = Math.cos(yaw), sn = Math.sin(yaw);
    const WCX = PX, WCZ = PZ; // symmetric envelope CX=CZ=0
    const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
    let worst = 1e9, wid = "";
    for (const e of ents) {
        const bb = e.bbox;
        if (!bb) continue;
        if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue;
        if (GROUND.test(e.id)) continue;
        const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
        const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
        const ey = e.yaw ?? 0, cy = Math.cos(ey), sy = Math.sin(ey);
        const ecxW = e.pos[0] + ecx * cy + ecz * sy, eczW = e.pos[2] - ecx * sy + ecz * cy;
        const eww = hx * Math.abs(cy) + hz * Math.abs(sy), edd = hx * Math.abs(sy) + hz * Math.abs(cy);
        const g = Math.max(Math.abs(WCX - ecxW) - (EW + eww), Math.abs(WCZ - eczW) - (ED + edd));
        if (g < worst) { worst = g; wid = e.id; }
    }
    if (!best || worst > best.g) best = { deg, yaw, normalAz, dAnti, g: worst, id: wid };
}
if (!best) { console.log("NO yaw in oblique band passes SAT"); process.exit(2); }
console.log(`\nFINAL yaw pinned: ${best.deg}deg = ${best.yaw} rad`);
console.log(`  +Z normal az ${best.normalAz} — ${best.dAnti}deg off anti-travel ${ANTI_TRAVEL} (east lean, struct-104 band 30-40)`);
console.log(`  SAT worst at FINAL yaw: ${best.id} ${best.g.toFixed(2)} (law ${LAW})`);
console.log(`  POS (${PX.toFixed(6)}, ${PZ.toFixed(6)})`);
