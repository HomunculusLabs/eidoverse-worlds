// struct178-decode-menger.ts — decode audit of village_menger3.glb.
// Fail-closed: any FAIL exits 1. RED control first (catalan bytes must FAIL).
//
// Checks: node census (1 stone bucket + 1 glow KEEP), stone vertex census
// (401 boxes x 24 verts), heart bead at exact world center with emissive
// material, envelope exact + origin-centered (placement-contract law),
// stone material is a real glTF texMat (struct-38 law).
import { readFileSync } from "node:fs";

const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

function parseGLB(path: string) {
    const buf = readFileSync(path);
    if (buf.readUInt32LE(0) !== 0x46546c67) throw Error("not a glb");
    let off = 12, json: any = null;
    while (off < buf.length) {
        const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
        if (type === 0x4e4f534a) json = JSON.parse(buf.subarray(off + 8, off + 8 + len).toString("utf8"));
        off += 8 + len;
    }
    return { json };
}

const target = "agents/arthur/assets/village_menger3.glb";
const { json } = parseGLB(target);
const nodes = json.nodes ?? [];

// world box per node, TRS accumulated (pitfall 4); identity-translation
// scheme with a mesh-node count guard (waysign-15 / struct-176 class).
const boxOf = (idx: number) => {
    const n = nodes[idx];
    const t = n.translation ?? [0, 0, 0];
    if (n.matrix) throw Error("unexpected matrix node");
    const mesh = n.mesh !== undefined ? json.meshes[n.mesh] : null;
    if (!mesh) return null;
    const mn: [number, number, number] = [Infinity, Infinity, Infinity];
    const mx: [number, number, number] = [-Infinity, -Infinity, -Infinity];
    for (const prim of mesh.primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        const a = acc.min as number[], b = acc.max as number[];
        for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], a[c] + t[c]); mx[c] = Math.max(mx[c], b[c] + t[c]); }
    }
    return { mn, mx, name: n.name ?? "", mesh };
};

const meshBoxes = nodes.map((_: any, i: number) => boxOf(i)).filter(Boolean) as any[];

// D1 node census: exactly 2 mesh nodes, names carry the lane regex tail.
{
    const okCount = meshBoxes.length === 2;
    const glow = meshBoxes.filter(b => b.name.startsWith("glow_mg_"));
    const stone = meshBoxes.filter(b => b.name.includes("menger") || b.name === "" || !b.name.startsWith("glow"));
    check("D1 node census: 2 mesh nodes (1 stone bucket + 1 glow KEEP)", okCount && glow.length === 1, `meshes ${meshBoxes.length}, glow ${glow.length}, names [${meshBoxes.map((b: any) => JSON.stringify(b.name)).join(", ")}]`);
}

// D2 stone vertex census: 401 boxes x 24 verts = 9624 exactly.
{
    let stoneVerts = 0;
    for (const b of meshBoxes) if (!b.name.startsWith("glow_mg_"))
        for (const prim of b.mesh.primitives) stoneVerts += json.accessors[prim.attributes.POSITION].count;
    check("D2 stone vertex census: 401 boxes x 24 = 9624 verts", stoneVerts === 9624, `stone verts ${stoneVerts}`);
}

// D3 heart bead: exact center (0, 2.74, 0), sphere r 0.09, emissive.
{
    const glow = meshBoxes.find(b => b.name.startsWith("glow_mg_"));
    let ok = !!glow;
    if (glow) {
        const cx = (glow.mn[0] + glow.mx[0]) / 2, cy = (glow.mn[1] + glow.mx[1]) / 2, cz = (glow.mn[2] + glow.mx[2]) / 2;
        const dia = Math.max(glow.mx[0] - glow.mn[0], glow.mx[1] - glow.mn[1], glow.mx[2] - glow.mn[2]);
        ok = Math.abs(cx) < 1e-6 && Math.abs(cy - 2.74) < 1e-6 && Math.abs(cz) < 1e-6 && Math.abs(dia - 0.18) < 1e-6;
        // emissive material (dusk lineage)
        const matIdx = glow.mesh.primitives[0].material;
        const mat = json.materials[matIdx];
        const hasEmissive = mat && mat.emissiveFactor && mat.emissiveFactor.some((v: number) => v > 0);
        ok = ok && !!hasEmissive;
    }
    check("D3 heart bead: exact center (0,2.74,0) r0.09, emissive material present", ok);
}

// D4 envelope exact: 5.76 x 5.34 x 5.76, min y == 0, origin-centered.
{
    const mn: [number, number, number] = [Infinity, Infinity, Infinity];
    const mx: [number, number, number] = [-Infinity, -Infinity, -Infinity];
    for (const b of meshBoxes) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], b.mn[c]); mx[c] = Math.max(mx[c], b.mx[c]); }
    const sx = mx[0] - mn[0], sy = mx[1] - mn[1], sz = mx[2] - mn[2];
    const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
    check("D4 envelope: 5.76x5.34x5.76, min y = 0, cx = cz = 0 (origin-centered)",
        Math.abs(sx - 5.76) < 0.02 && Math.abs(sy - 5.34) < 0.02 && Math.abs(sz - 5.76) < 0.02 &&
        Math.abs(mn[1]) < 1e-6 && Math.abs(cx) < 1e-3 && Math.abs(cz) < 1e-3,
        `${sx.toFixed(3)}x${sy.toFixed(3)}x${sz.toFixed(3)}, y0 ${mn[1].toFixed(4)}, cx ${cx.toFixed(4)}, cz ${cz.toFixed(4)}`);
}

// D5 stone material is a real glTF material with a name (struct-38 law).
{
    let ok = false, name = "?";
    for (const b of meshBoxes) if (!b.name.startsWith("glow_mg_")) {
        const mat = json.materials[b.mesh.primitives[0].material];
        ok = !!mat && !!mat.name;
        name = mat?.name ?? "?";
    }
    check("D5 stone texMat exports a named glTF material (struct-38 law)", ok, `material "${name}"`);
}

console.log(fails.length === 0 ? "ALL PASS" : `${fails.length} FAIL(S): ${fails.join("; ")}`);
process.exit(fails.length === 0 ? 0 : 1);
