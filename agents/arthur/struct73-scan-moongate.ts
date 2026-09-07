// struct73-scan-moongate.ts — candidate scan for the moongate seat along
// the SW district threshold arc (az -150..-125, r 62..70), conservative
// rotation-grown world AABBs both sides (struct-70 law), 1.4m solid law.
// Prints every lawful candidate with its worst gap; best = max worst-gap.
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse((await Bun.file(`${ROOT}/agents/arthur/config.json`).text()));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities ?? [];
console.log(`census ${ents.length}`);
const LAW = 1.4;
const tHX = 2.90, tHZ = 0.710; // gate yaw 0
const NET = /nx-town-(roads|paths)|approach-.*lane|nx-dress-.*hedgerow/;
type Gap = { id: string; gap: number; film: boolean };

// pre-extract neighbor world AABBs
const nb: Array<{ id: string; min: [number, number]; max: [number, number]; film: boolean }> = [];
for (const e of ents) {
    if (e.id === "nx-struct-moongate") continue;
    const bb = e.bbox; if (!bb) continue;
    const h = (bb.max?.[1] ?? 0) - (bb.min?.[1] ?? 0);
    const film = h <= 0.5 || NET.test(e.id);
    const hx = (bb.size?.[0] ?? 0) / 2, hz = (bb.size?.[2] ?? 0) / 2;
    const yaw = e.yaw ?? 0, c = Math.abs(Math.cos(yaw)), s = Math.abs(Math.sin(yaw));
    const ex = hx * c + hz * s, ez = hz * c + hx * s;
    const p = e.pos;
    nb.push({ id: e.id, min: [p[0] - ex, p[2] - ez], max: [p[0] + ex, p[2] + ez], film });
}

const cands: Array<{ x: number; z: number; worst: number; wid: string }> = [];
for (let az = -150; az <= -125; az += 1) {
    for (let rr = 62; rr <= 70; rr += 0.5) {
        // canonical: az = atan2(x, z) in degrees => x = r·sin(az·π/180), z = r·cos(az·π/180)
        const rad = (az * Math.PI) / 180;
        const px = rr * Math.sin(rad), pz = rr * Math.cos(rad);
        let worst = Infinity, wid = "";
        for (const n of nb) {
            if (n.film) continue;
            const dx = Math.max((px - tHX) - n.max[0], n.min[0] - (px + tHX), 0);
            const dz = Math.max((pz - tHZ) - n.max[1], n.min[1] - (pz + tHZ), 0);
            const gap = Math.hypot(dx, dz);
            if (gap < worst) { worst = gap; wid = n.id; }
        }
        if (worst >= LAW) cands.push({ x: +px.toFixed(2), z: +pz.toFixed(2), worst: +worst.toFixed(3), wid });
    }
}
cands.sort((a, b) => b.worst - a.worst);
console.log(`lawful candidates: ${cands.length}`);
for (const c of cands.slice(0, 10)) console.log(`  (${c.x},${c.z}) r=${Math.hypot(c.x, c.z).toFixed(1)} az=${(Math.atan2(c.x, c.z) * 180 / Math.PI).toFixed(1)} worst=${c.worst} vs ${c.wid}`);
if (!cands.length) console.log("NO LAWFUL SEAT in scan window");
