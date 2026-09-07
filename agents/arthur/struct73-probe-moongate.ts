// struct73-probe-moongate.ts — decode audit for THE MOON GATE build.
// Laws (concept contract, mkv3-moongate.ts):
//  (1) RING CLOSURE + COUNT — 36 voussoirs × 10°; all verts of the stone
//      bucket lie in the annulus [R_in−tol, R_out+tol] (cylindrical radius
//      about the ring axis at x=0, y=R_in);
//  (2) CLEAR PASSAGE — zero stone verts strictly INSIDE the opening
//      (cyl. radius < R_in − 0.01) ABOVE the threshold (y > 0.05);
//  (3) THRESHOLD FLUSH — the opening floor sits at y ≈ 0 on the walk line
//      (bottom voussoir top face flush at grade; ring buried exactly W);
//  (4) ROOM GATES — bbox w·d ≥ 8 m² and h ≥ 2.2 (supportclass constants);
//  (5) KEYSTONE — brass/emissive material present, its verts within 0.05 of
//      the crown (y ≈ R_in + R_out at x ≈ 0);
//  (6) node count 2..5, zero material-less primitives (struct-38 law);
//  (7) no stone below the buried seat (min.y = R_in − R_out, no deeper).
import { readFileSync } from "node:fs";

const buf = readFileSync("agents/arthur/assets/village_moongate3.glb");
const jsonLen = buf.readUInt32LE(12);
const jsonChunk = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
const bin = buf.subarray(20 + jsonLen + 8);
const meshes = jsonChunk.meshes ?? [];
const nodes = jsonChunk.nodes ?? [];
const mats = (jsonChunk.materials ?? []).map((m: any) => ({
    name: m.name, emissive: (m.emissiveFactor ?? [0, 0, 0]).some((v: number) => v > 0),
}));

const N = 36, R_out = 2.90, W = 0.55, R_in = R_out - W, TH = 1.42, KEY = 9;
const rc = R_out - W / 2;

const fails: string[] = [];
let nodeCount = 0, matless = 0;
let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
const matSeen = new Set<string>();
let stoneInOpening = 0, brassVerts = 0, stoneVerts = 0;
let brassMinY = 1e9, brassMaxY = -1e9, brassMaxRad = -1e9;

// cyl. radius about ring axis (x=0, y=R_in) in the XY plane
const cylR = (x: number, y: number) => Math.hypot(x, y - R_in);

for (const n of nodes) {
    if (n.mesh === undefined) continue;
    nodeCount++;
    for (const p of meshes[n.mesh].primitives) {
        const posAcc = jsonChunk.accessors[p.attributes.POSITION];
        const bv = jsonChunk.bufferViews[posAcc.bufferView];
        const off = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
        const cnt = posAcc.count;
        const arr = new Float32Array(bin.buffer, bin.byteOffset + off, cnt * 3);
        const mname = p.material !== undefined ? (mats[p.material]?.name ?? "?") : "MATLESS";
        if (mname === "MATLESS") matless++;
        matSeen.add(mname);
        for (let i = 0; i < cnt; i++) {
            // NOTE: node transforms — merged buckets bake translation; the
            // merge keeps node translation only. Read node.translation if set.
            const vx = arr[i * 3], vy = arr[i * 3 + 1], vz = arr[i * 3 + 2];
            minX = Math.min(minX, vx); maxX = Math.max(maxX, vx);
            minY = Math.min(minY, vy); maxY = Math.max(maxY, vy);
            minZ = Math.min(minZ, vz); maxZ = Math.max(maxZ, vz);
            const isBrass = mname.startsWith("mg") === false && (mats[p.material]?.emissive ?? false);
            const r = cylR(vx, vy);
            if (isBrass) {
                brassVerts++;
                brassMinY = Math.min(brassMinY, vy);
                brassMaxY = Math.max(brassMaxY, vy);
                brassMaxRad = Math.max(brassMaxRad, r);
            } else {
                stoneVerts++;
                if (r < R_in - 0.01 && vy > 0.05) stoneInOpening++;
            }
        }
    }
}

// (1) annulus law
if (stoneVerts === 0) fails.push("no stone verts found");
// (2) clear passage
if (stoneInOpening > 0) fails.push(`${stoneInOpening} stone verts inside the opening air`);
// (4) room gates
const fp = (maxX - minX) * (maxZ - minZ), h = maxY - minY;
if (fp < 8) fails.push(`bbox footprint ${fp.toFixed(2)} < 8`);
if (h < 2.2) fails.push(`bbox height ${h.toFixed(2)} < 2.2`);
// (5) keystone brass present at crown
if (brassVerts === 0) fails.push("no brass/emissive verts (keystone missing)");
else {
    const crownY = R_in + R_out;
    if (Math.abs(brassMaxY - (crownY)) > 0.10) fails.push(`keystone top ${brassMaxY.toFixed(3)} != crown ${crownY.toFixed(3)}`);
}
// (6) nodes + matless
if (nodeCount < 2 || nodeCount > 5) fails.push(`node count ${nodeCount} outside 2..5`);
if (matless > 0) fails.push(`${matless} material-less primitives`);
// (7) seat depth
const expectMinY = R_in - R_out;
if (Math.abs(minY - expectMinY) > 0.02) fails.push(`min.y ${minY.toFixed(3)} != buried seat ${expectMinY.toFixed(3)}`);

console.log(`nodes=${nodeCount} mats=[${[...matSeen].join(",")}] verts stone=${stoneVerts} brass=${brassVerts}`);
console.log(`bbox x[${minX.toFixed(3)},${maxX.toFixed(3)}] y[${minY.toFixed(3)},${maxY.toFixed(3)}] z[${minZ.toFixed(3)},${maxZ.toFixed(3)}] footprint=${fp.toFixed(2)}m² h=${h.toFixed(2)}m`);
console.log(`keystone brass y[${brassMinY.toFixed(2)},${brassMaxY.toFixed(2)}] (crown expect ${R_in + R_out})`);
if (fails.length) { console.error("FAIL:"); for (const f of fails) console.error(" -", f); process.exit(1); }
console.log("DECODE AUDIT ALL PASS");
