// improve14-decode-shrine.ts — decode audit for the improve-14 candidate.
// Checks: (1) bbox unchanged vs live pin extents (SAT-neutral); (2) zero NEW
// verts in the b7 rider keep-out (host-local x∈[-1.55,-0.35], z∈[-1.20,-1.03]);
// (3) offering mounds present at x -0.3/0/+0.3, z 0.24, y~0.505 (new verts);
// (4) flame anchors present with enlarged radius (y-extent of flame_v groups);
// (5) node census + tri count.
import { readFileSync } from "node:fs";
const B = readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/village_shrine3.glb");
const Bbefore = readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/reviews/improve14-shrine/before/village_shrine3.glb");
function parse(b: Buffer) {
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    let off = 12, json: any = null, bin: Uint8Array | null = null;
    while (off < b.length) {
        const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
        const chunk = b.subarray(off + 8, off + 8 + len);
        if (type === 0x4e4f534a) json = JSON.parse(chunk.toString("utf8"));
        else if (type === 0x004e4942) bin = chunk;
        off += 8 + len;
    }
    return { json, bin: bin! };
}
const P = parse(B), Pb = parse(Bbefore);
const json = P.json, bin = P.bin, jsonb = Pb.json, binb = Pb.bin;
const fails: string[] = [];
const ok = (c: boolean, m: string) => { if (!c) fails.push(m); else console.log("PASS", m); };
// node census
console.log("nodes", json.nodes.length, "meshes", json.meshes.length);
let tris = 0;
for (const m of json.meshes) for (const p of m.primitives) {
    if (p.indices !== undefined) tris += json.accessors[p.indices].count / 3;
    else tris += Math.floor(json.accessors[p.attributes.POSITION].count / 3);
}
console.log("tris(derived)", tris, "live-pin 556");
// global bbox from accessor 0 of each primitive (positions are baked local per mesh; node translations applied)
const f32 = (a: any) => {
    const bv = json.bufferViews[a.bufferView];
    return new Float32Array(bin!.buffer, bin!.byteOffset + bv.byteOffset + (a.byteOffset ?? 0), a.count * 3);
};
let minX = 1e9, minY = 1e9, minZ = 1e9, maxX = -1e9, maxY = -1e9, maxZ = -1e9;
const nodeById: any[] = json.nodes;
const keepout: number[] = [0];
const offering: number[] = [0];
const flames: Record<string, [number, number]> = {};
const walk = (ni: number, tx: number, ty: number, tz: number) => {
    const n = nodeById[ni];
    const t = n.translation ?? [0, 0, 0];
    const nx = tx + t[0], ny = ty + t[1], nz = tz + t[2];
    if (n.mesh !== undefined) {
        const mesh = json.meshes[n.mesh];
        for (const p of mesh.primitives) {
            const pos = f32(json.accessors[p.attributes.POSITION]);
            // scale absent on these meshes (boxes/icosas unscaled except offering y-0.6 handled per-vertex below via min/max only)
            for (let i = 0; i < pos.length; i += 3) {
                // apply node scale if present
                const s = n.scale ?? [1, 1, 1];
                const vx = nx + pos[i] * s[0], vy = ny + pos[i + 1] * s[1], vz = nz + pos[i + 2] * s[2];
                if (vx < minX) minX = vx; if (vx > maxX) maxX = vx;
                if (vy < minY) minY = vy; if (vy > maxY) maxY = vy;
                if (vz < minZ) minZ = vz; if (vz > maxZ) maxZ = vz;
                if (vx >= -1.55 && vx <= -0.35 && vz >= -1.20 && vz <= -1.03) keepout[0]++;
                if (Math.abs(vy - 0.505) < 0.12 && Math.abs(vz - 0.24) < 0.10 && Math.abs(vx) <= 0.40) offering[0]++;
            }
        }
    }
    if (n.name?.startsWith("flame_v") && n.mesh !== undefined) {
        const mesh = json.meshes[n.mesh];
        let fy0 = 1e9, fy1 = -1e9;
        for (const p of mesh.primitives) {
            const pos = f32(json.accessors[p.attributes.POSITION]);
            for (let i = 1; i < pos.length; i += 3) { if (pos[i] < fy0) fy0 = pos[i]; if (pos[i] > fy1) fy1 = pos[i]; }
        }
        flames[n.name] = [fy0 + ny, fy1 + ny]; // child flame mesh has own node; group carries y
    }
    for (const c of n.children ?? []) walk(c, nx, ny, nz);
};
const roots = json.scenes[json.scene ?? 0].nodes;
for (const r of roots) walk(r, 0, 0, 0);
console.log("bbox", JSON.stringify({ min: [minX, minY, minZ], max: [maxX, maxY, maxZ] }));
ok(Math.abs(minX + 1.25) < 0.02 && Math.abs(maxX - 1.25) < 0.02, `bbox x ±1.25 (got ${minX}..${maxX})`);
ok(minY > -0.2 && minY < 0.0, `bbox y bottom ground band (got ${minY})`);
ok(Math.abs(maxZ - 2.5) < 0.02, `bbox z max 2.5 bench (got ${maxZ})`);
ok(Math.abs(minZ + 1.4) < 0.02, `bbox z min -1.4 paver (got ${minZ})`);
ok(maxY < 1.85 && maxY > 1.70, `bbox y max ember tops ~1.798 (got ${maxY})`);
// differential keep-out: vertex sets in the b7 zone must be IDENTICAL
// before vs after (zero new, zero gone) — the 9 baseline verts are
// pav_2's corner + stone_2's tilt, all predating this edit.
const zoneKey = (x: number, y: number, z: number) => `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
const collectZone = (js: any, bn: Uint8Array) => {
    const set = new Set<string>();
    const w = (ni: number, tx: number, ty: number, tz: number) => {
        const n = js.nodes[ni];
        const t = n.translation ?? [0, 0, 0]; const s = n.scale ?? [1, 1, 1];
        const nx = tx + t[0], ny = ty + t[1], nz = tz + t[2];
        if (n.mesh !== undefined) {
            for (const p of js.meshes[n.mesh].primitives) {
                const a = js.accessors[p.attributes.POSITION]; const bv = js.bufferViews[a.bufferView];
                const pos = new Float32Array(bn.buffer, bn.byteOffset + bv.byteOffset + (a.byteOffset ?? 0), a.count * 3);
                for (let i = 0; i < pos.length; i += 3) {
                    const vx = nx + pos[i] * s[0], vy = ny + pos[i + 1] * s[1], vz = nz + pos[i + 2] * s[2];
                    if (vx >= -1.55 && vx <= -0.35 && vz >= -1.20 && vz <= -1.03) set.add(zoneKey(vx, vy, vz));
                }
            }
        }
        for (const c of n.children ?? []) w(c, nx, ny, nz);
    };
    for (const r of js.scenes[js.scene ?? 0].nodes) w(r, 0, 0, 0);
    return set;
};
const zoneA = collectZone(json, bin), zoneB = collectZone(jsonb, binb);
let newInZone = 0; for (const k of zoneA) if (!zoneB.has(k)) newInZone++;
let goneFromZone = 0; for (const k of zoneB) if (!zoneA.has(k)) goneFromZone++;
ok(newInZone === 0 && goneFromZone === 0, `b7 keep-out DIFFERENTIAL clean: new ${newInZone}, gone ${goneFromZone} (baseline zone ${zoneB.size} verts, candidate ${zoneA.size})`);
console.log("zone sizes", zoneA.size, zoneB.size);
ok(offering[0] >= 12, `offering mound verts present ≥12 (got ${offering[0]})`);
console.log("flame y-bands", JSON.stringify(flames));
const fb = Object.values(flames)[0] ?? [0, 0];
ok(fb[1] - fb[0] > 0.09 && fb[1] - fb[0] < 0.13, `flame y-extent ~0.11 (r0.055 ico) got ${fb[1] - fb[0]}`);
if (fails.length) { console.log("FAIL", fails); process.exit(1); }
console.log("DECODE ALL PASS");
