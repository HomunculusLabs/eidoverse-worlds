// struct173-decode-catalan.ts — independent byte-side audit of
// village_catalan3.glb (struct-173, R11-8). Parses the GLB directly (no
// three.js): node census, KEEP glows, texMat lanes, doubleSided, envelope
// with node translations, film vertex-level cycloid-spine census (every
// film vertex in the z=0 band must satisfy the cycloid law), film symmetry
// census, hem/spine presence. RED control: any other GLB FAILs.
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? "agents/arthur/assets/village_catalan3.glb";
const b = readFileSync(path);
if (b.readUInt32LE(0) !== 0x46546c67) throw Error("not a glb");
const jlen = b.readUInt32LE(12);
const json = JSON.parse(b.slice(20, 20 + jlen).toString("utf8"));

let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails++;
};

// 1. node census + KEEP glows (6 nodes: 4 texMat buckets + 2 glow KEEPs)
const nodes = json.nodes ?? [];
const named = nodes.filter((n: any) => n.name).map((n: any) => n.name);
check("node budget 2-45 (merged statics)", nodes.length >= 2 && nodes.length <= 45, `${nodes.length} nodes: ${named.join(",")}`);
check("exactly 2 KEEP glow nodes glow_ca_1/2", named.filter((n: string) => /^glow_/.test(n)).length === 2 && named.includes("glow_ca_1") && named.includes("glow_ca_2"), named.filter((n: string) => n.startsWith("glow_")).join(","));

// 2. materials
const mats = json.materials ?? [];
const mnames = mats.map((m: any) => m.name);
check("texMat lanes present", ["ca_bone", "ca_iron", "ca_brass", "ca_stone"].every((m) => mnames.includes(m)), mnames.join(","));
const bone = mats.find((m: any) => m.name === "ca_bone");
check("ca_bone doubleSided (film law)", bone?.doubleSided === true, `doubleSided=${bone?.doubleSided}`);
const glowMats = mats.filter((m: any) => (m.name ?? "").startsWith("glow") || (m.emissiveFactor ?? []).some((v: number) => v > 0.05));
check("glow materials carry emissiveFactor", glowMats.length >= 1, glowMats.map((m: any) => m.name).join(",") || "none");

// 3. accessor envelope WITH node translations (identity-q/unit-scale asserted)
let gmin = [Infinity, Infinity, Infinity], gmax = [-Infinity, -Infinity, -Infinity];
let meshCount = 0;
for (const n of nodes) {
    const q = n.rotation;
    const isIdentityQ = !q || (q[0] === 0 && q[1] === 0 && q[2] === 0 && q[3] === 1);
    const isUnitScale = !n.scale || (n.scale[0] === 1 && n.scale[1] === 1 && n.scale[2] === 1);
    if (!isIdentityQ || !isUnitScale) throw Error(`node ${n.name} carries non-identity TRS — decode must apply full TRS`);
    if (n.mesh === undefined) continue;
    const mesh = json.meshes[n.mesh];
    for (const prim of mesh.primitives) {
        const posA = json.accessors[prim.attributes.POSITION];
        meshCount++;
        const t = n.translation ?? [0, 0, 0];
        for (let k = 0; k < 3; k++) {
            gmin[k] = Math.min(gmin[k], posA.min[k] + t[k]);
            gmax[k] = Math.max(gmax[k], posA.max[k] + t[k]);
        }
    }
}
const S = 0.75, LIFT = 0.30 + S * (Math.cosh(1) - 1);
const corner = [Math.PI * S, (1 + Math.cosh(1)) * S + LIFT, 4 * Math.sin(Math.PI / 2) * Math.sinh(0.5) * S];
const BEAD_R = 0.09, HEM_R = 0.028;
check("envelope x: symmetric, crown beads reach pi*S + BEAD_R", Math.abs(gmin[0] + (Math.PI * S + BEAD_R)) < 0.01 && Math.abs(gmax[0] - (Math.PI * S + BEAD_R)) < 0.01, `x[${gmin[0].toFixed(3)}..${gmax[0].toFixed(3)}] vs +/-${(Math.PI * S + BEAD_R).toFixed(3)}`);
check("envelope y: grade 0 to corner+hem", Math.abs(gmin[1]) < 0.01 && Math.abs(gmax[1] - (corner[1] + HEM_R)) < 0.02, `y[${gmin[1].toFixed(3)}..${gmax[1].toFixed(3)}] law ${(corner[1] + HEM_R).toFixed(3)}`);
check("envelope z: symmetric, hem reaches z(V) + HEM_R", Math.abs(gmin[2] + (corner[2] + HEM_R)) < 0.015 && Math.abs(gmax[2] - (corner[2] + HEM_R)) < 0.015, `z[${gmin[2].toFixed(3)}..${gmax[2].toFixed(3)}] vs +/-${(corner[2] + HEM_R).toFixed(3)}`);
check("mesh count 6 (4 texMat + 2 glow)", meshCount === 6, `${meshCount} meshes`);

// 4. film vertex census: find the ca_bone bucket, walk its bytes — every
// vertex in the |z| < 1e-3 band must satisfy the cycloid law
// y == (1-cos u)*S + LIFT with x == (u - sin u)*S, u = (x/S)+sin u implicit.
// Simpler source-true form: eliminate u numerically per vertex.
{
    // find film mesh: the largest mesh by accessor count
    let filmMesh: any = null, filmCount = -1, filmNode: any = null;
    for (const n of nodes) {
        if (n.mesh === undefined) continue;
        const mesh = json.meshes[n.mesh];
        for (const prim of mesh.primitives) {
            const c = json.accessors[prim.attributes.POSITION].count;
            if (c > filmCount) { filmCount = c; filmMesh = prim; filmNode = n; }
        }
    }
    const posA = json.accessors[filmMesh.attributes.POSITION];
    const bv = json.bufferViews[posA.bufferView];
    const off = (bv.byteOffset ?? 0) + (posA.byteOffset ?? 0) + 20 + jlen + 8;   // +8: BIN chunk header (kuen law)
    const t = filmNode.translation ?? [0, 0, 0];
    let spineBand = 0, spineLaw = 0, total = 0;
    for (let i = 0; i < posA.count; i++) {
        const x = b.readFloatLE(off + i * 12) + t[0], y = b.readFloatLE(off + i * 12 + 4) + t[1], z = b.readFloatLE(off + i * 12 + 8) + t[2];
        total++;
        // fold-band exclusion (caught RED, source-true): near u=0 the z-band
        // test cannot discriminate v=0 from small v (z ~ sin(u/2)sinh(v/2),
        // and sin(u/2)->0 at the fold) — first-strip verts at |x|~1e-5 are
        // legitimately ON the surface, just not ON the geodesic. For
        // |x| >= 0.05 (u >= 0.55), |z| < 1e-3 forces v < 2.5e-3, where the
        // cycloid deviation is < 1e-5 — the law is clean there.
        if (Math.abs(x) < 0.05) continue;
        if (Math.abs(z) < 1e-3) {
            spineBand++;
            // cycloid law: given x, u solves x/S = u - sin u on [0,pi]; solve by bisection
            const target = x / S;
            if (target >= -Math.PI - 1e-6 && target <= Math.PI + 1e-6) {
                let lo = 0, hi = Math.PI;
                const f = (u: number) => u - Math.sin(u);
                for (let it = 0; it < 60; it++) {
                    const mid = (lo + hi) / 2;
                    if (f(mid) < Math.abs(target)) lo = mid; else hi = mid;
                }
                const u = Math.sign(target) * (lo + hi) / 2;
                const yLaw = (1 - Math.cos(u)) * S + LIFT;
                if (Math.abs(y - yLaw) < 1e-3) spineLaw++;
            }
        }
    }
    check("film cycloid-spine census: every |z|<1e-3 vertex (|x|>=0.05) satisfies the cycloid law", spineBand > 100 && spineLaw === spineBand,
        `${spineLaw}/${spineBand} spine-band verts on the law (of ${total} film verts)`);
}

// 5. film symmetry census: bucket min/max mirror-symmetric in x and z
{
    // reuse: for the film bucket only (largest), check symmetric vertex distribution
    let filmMesh: any = null, filmCount = -1, filmNode: any = null;
    for (const n of nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of json.meshes[n.mesh].primitives) {
            const c = json.accessors[prim.attributes.POSITION].count;
            if (c > filmCount) { filmCount = c; filmMesh = prim; filmNode = n; }
        }
    }
    const posA = json.accessors[filmMesh.attributes.POSITION];
    const bv = json.bufferViews[posA.bufferView];
    const off = (bv.byteOffset ?? 0) + (posA.byteOffset ?? 0) + 20 + jlen + 8;   // +8: BIN chunk header
    const t = filmNode.translation ?? [0, 0, 0];
    let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity;
    for (let i = 0; i < posA.count; i++) {
        const x = b.readFloatLE(off + i * 12) + t[0], z = b.readFloatLE(off + i * 12 + 8) + t[2];
        minx = Math.min(minx, x); maxx = Math.max(maxx, x); minz = Math.min(minz, z); maxz = Math.max(maxz, z);
    }
    check("film vertex symmetry: x and z ranges mirror about 0", Math.abs(minx + maxx) < 0.01 && Math.abs(minz + maxz) < 0.01,
        `x[${minx.toFixed(3)}..${maxx.toFixed(3)}] z[${minz.toFixed(3)}..${maxz.toFixed(3)}]`);
}

// 6. brass spine presence: the ca_brass bucket must span crown-to-crown x range and z=0 only
{
    let brassPrim: any = null, brassNode: any = null;
    for (const n of nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of json.meshes[n.mesh].primitives) {
            const matIdx = prim.material;
            if (matIdx !== undefined && json.materials[matIdx]?.name === "ca_brass") { brassPrim = prim; brassNode = n; }
        }
    }
    if (!brassPrim) { check("brass spine bucket present", false, "no ca_brass primitive"); }
    else {
        const posA = json.accessors[brassPrim.attributes.POSITION];
        const bv = json.bufferViews[posA.bufferView];
        const off = (bv.byteOffset ?? 0) + (posA.byteOffset ?? 0) + 20 + jlen + 8;   // +8: BIN chunk header
        const t = brassNode.translation ?? [0, 0, 0];
        let minx = Infinity, maxx = -Infinity, maxabsz = 0, miny = Infinity, maxy = -Infinity;
        for (let i = 0; i < posA.count; i++) {
            const x = b.readFloatLE(off + i * 12) + t[0], y = b.readFloatLE(off + i * 12 + 4) + t[1], z = b.readFloatLE(off + i * 12 + 8) + t[2];
            minx = Math.min(minx, x); maxx = Math.max(maxx, x); maxabsz = Math.max(maxabsz, Math.abs(z));
            miny = Math.min(miny, y); maxy = Math.max(maxy, y);
        }
        check("brass spine spans crown-to-crown in x, stays in z=0 plane", Math.abs(minx + Math.PI * S) < 0.02 && Math.abs(maxx - Math.PI * S) < 0.02 && maxabsz < 0.035,
            `x[${minx.toFixed(3)}..${maxx.toFixed(3)}] max|z| ${maxabsz.toFixed(4)} y[${miny.toFixed(3)}..${maxy.toFixed(3)}]`);
    }
}

// 7. iron hem presence: closed loop — ca_iron bucket must span the full z range (the v-edges are its extremes)
{
    let ironPrim: any = null, ironNode: any = null;
    for (const n of nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of json.meshes[n.mesh].primitives) {
            const matIdx = prim.material;
            if (matIdx !== undefined && json.materials[matIdx]?.name === "ca_iron") { ironPrim = prim; ironNode = n; }
        }
    }
    if (!ironPrim) { check("iron hem bucket present", false, "no ca_iron primitive"); }
    else {
        const posA = json.accessors[ironPrim.attributes.POSITION];
        const bv = json.bufferViews[posA.bufferView];
        const off = (bv.byteOffset ?? 0) + (posA.byteOffset ?? 0) + 20 + jlen + 8;   // +8: BIN chunk header
        const t = ironNode.translation ?? [0, 0, 0];
        let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity, maxy = 0;
        for (let i = 0; i < posA.count; i++) {
            const x = b.readFloatLE(off + i * 12) + t[0], y = b.readFloatLE(off + i * 12 + 4) + t[1], z = b.readFloatLE(off + i * 12 + 8) + t[2];
            minx = Math.min(minx, x); maxx = Math.max(maxx, x); minz = Math.min(minz, z); maxz = Math.max(maxz, z); maxy = Math.max(maxy, y);
        }
        check("iron hem covers the full boundary (x and z extremes + corner height)", Math.abs(minx + Math.PI * S) < 0.05 && Math.abs(maxx - Math.PI * S) < 0.05 && Math.abs(maxz - corner[2]) < 0.05 && maxy > corner[1] - 0.05,
            `x[${minx.toFixed(3)}..${maxx.toFixed(3)}] z[${minz.toFixed(3)}..${maxz.toFixed(3)}] maxy ${maxy.toFixed(3)}`);
    }
}

console.log(fails === 0 ? "ALL PASS" : `${fails} FAILS`);
process.exit(fails === 0 ? 0 : 1);
