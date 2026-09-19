// fauna40-seat-sweep.ts — live-census SAT sweep for the fauna-40 roe
// deer at the SE wild-edge meadow (FAUNA-PLAN row 27 zone: inside the
// 5-entity nx-wild-forest-* screen at r≈76; band r 58..70, θ −70°..−35°).
// Pair OBB from the DECODE envelope (v12 4196ca3f: local x −1.182..1.197,
// z −1.273..1.088 → center (+0.0075, −0.0925), half (1.1895, 1.1805)).
// Yaw swept per candidate so local +x (the pair's facing) points at the
// plaza center (0,0) — the (cos,−sin) yaw law: yaw = atan2(z, −x); the
// deer read as stepping out of the treeline toward the village, rears to
// the forest (the buck's antlered front + the doe's quartered rump patch
// face the approaching reader). Exemptions: films (height ≤ 0.5),
// suspended decor (pos.y ≥ 1.8), lights (no bbox). Constraints: worst
// solid gap ≥ 1.4m AND pair center NOT inside any film OBB. Preference:
// closest to the band's r-midline facing the SE district spoke (the
// reader walks out the SE spoke and meets the deer at the meadow's
// far half), tie-break toward the plaza.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// my decoded OBB (half-extents), center offset in pair-local
const CX = 0.0075, CZ = -0.0925, HW = 1.1895, HD = 1.1805;

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-deer-001") return false;
    if (!e.bbox) return false;                     // lights/riders
    if (e.bbox.size[1] <= 0.5) return false;       // films/rider films
    if (e.pos[1] >= 1.8) return false;             // suspended decor
    return true;
});
const films = ents.filter((e: any) => e.bbox && e.bbox.size[1] <= 0.5);
console.log(`census ${ents.length} entities, ${solids.length} solids, ${films.length} films in SAT set`);

const obb = (wx: number, wz: number, yaw: number, hw: number, hd: number) => {
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    return { x: wx, z: wz, yaw, hw, hd, ax: [cos, -sin] as [number, number], az: [sin, cos] as [number, number] };
};
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
// film containment: is point p inside the yawed film OBB (grown 0.3m)?
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

const results: any[] = [];
let scanned = 0;
for (let x = 20.0; x <= 58.0; x += 0.25) {
    for (let z = -66.0; z <= -33.0; z += 0.25) {
        const R = Math.hypot(x, z);
        if (R < 58 || R > 70) continue;
        const theta = Math.atan2(z, x) * 180 / Math.PI;
        if (theta < -70 || theta > -35) continue;
        scanned++;
        // yaw: pair +x (facing) toward the plaza center — (cos,−sin) law
        const yaw = Math.atan2(z, -x);
        const cos = Math.cos(yaw), sin = Math.sin(yaw);
        const wx = x + CX * cos + CZ * sin, wz = z - CX * sin + CZ * cos;
        let worst = Infinity, worstId = "";
        for (const e of solids) {
            if (Math.hypot(e.pos[0] - wx, e.pos[2] - wz) > 25) continue;
            const b = e.bbox;
            const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
            const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
            const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
            const g = gap(obb(wx, wz, yaw, HW, HD), obb(ewx, ewz, e.yaw, b.size[0] / 2, b.size[2] / 2));
            if (g < worst) { worst = g; worstId = e.id; }
        }
        if (worst < 1.4) continue;
        let onFilm = "";
        for (const f of films) {
            if (Math.hypot(f.pos[0] - x, f.pos[2] - z) > 27) continue;
            if (insideFilm(f, x, z)) { onFilm = f.id; break; }
        }
        if (onFilm) continue;
        // forest adjacency (the treeline the deer step from) — informative
        const dForest = Math.min(...ents.filter((e: any) => e.id.startsWith("nx-wild-forest")).map((e: any) => Math.hypot(e.pos[0] - x, e.pos[2] - z)));
        results.push({ x: +x.toFixed(2), z: +z.toFixed(2), yaw: +yaw.toFixed(3), worst: +worst.toFixed(3), worstId, R: +R.toFixed(1), theta: +theta.toFixed(1), dForest: +dForest.toFixed(1) });
    }
}
console.log(`scanned ${scanned} band cells; qualifying seats (gap ≥ 1.4m, film-clear): ${results.length}`);
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: r closest to the band midline (64), tie-break plaza-ward
results.sort((a: any, b: any) => (Math.abs(a.R - 64) + Math.hypot(a.x, a.z) * 0.10) - (Math.abs(b.R - 64) + Math.hypot(b.x, b.z) * 0.10));
for (const c of results.slice(0, 8)) console.log(JSON.stringify(c));
