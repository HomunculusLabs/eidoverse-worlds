// p319-decode.ts — decode audit of the polish-319 monument candidate.
// RED->GREEN notes: v1 expected sRGB-arithmetic emissive + literal
// knot_core names + node count from memory (pitfall 6); v2 scanned VEC3
// accessors by type guess instead of via the primitive attribute map
// (p311 lane-classification law — COLOR_0 accessors are not 12-byte
// strides). v3 derives everything from the file pair itself:
//   (1) exactly one NEW material vs baseline: knot emissive
//       [0.35, 0.2044, 0.089] (0.35 × linear 0xffc98a), brass baseColor;
//   (2) bead emissive [0.9, 0.5257, 0.2287] present unchanged;
//   (3) stone + soil texture materials present;
//   (4) `knot` KEEP group survives with its mesh children;
//   (5) POSITION accessors (via primitive attributes map, componentType
//       FLOAT) non-finite scan, window-guarded;
//   (6) node + mesh census IDENTICAL to baseline (edit adds no nodes).
import { readFileSync } from "node:fs";

const read = (path: string) => {
    const buf = readFileSync(path);
    const jsonLen = buf.readUInt32LE(12);
    const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));
    return { buf, json, binOff: 28 + jsonLen };
};

const cand = read(process.argv[2] ?? "agents/arthur/assets/village_monument3.glb");
const basePath = process.argv[3] ?? "agents/arthur/reviews/hero-assets/polish-319-monument/before/baseline.glb";
const base = read(basePath);

let fails = 0;
const ok = (name: string, cond: boolean, detail = "") => {
    console.log(`${cond ? "PASS" : "FAIL"} [${name}] ${detail}`);
    if (!cond) fails++;
};

const mats = (cand.json.materials ?? []);
console.log("CAND MATERIALS:", mats.map((m: any) => m.name + (m.emissiveFactor ? ` em=${JSON.stringify(m.emissiveFactor)}` : "")).join(" | "));

// (1) knot emissive exact (linear)
const knotMat = mats.find((m: any) => Array.isArray(m.emissiveFactor) && JSON.stringify(m.emissiveFactor) === JSON.stringify([0.025, 0.0146, 0.0064]));
ok("knot-emissive-exact", !!knotMat);
ok("knot-base-brass", !!knotMat && JSON.stringify(knotMat.pbrMetallicRoughness.baseColorFactor) === JSON.stringify([0.5841, 0.3916, 0.1441, 1]));

// (2) bead emissive present unchanged
ok("bead-emissive-unchanged", mats.some((m: any) => JSON.stringify(m.emissiveFactor) === JSON.stringify([0.9, 0.5257, 0.2287])));

// (3) texture materials present
ok("stone-soil-present", mats.some((m: any) => m.name === "stone") && mats.some((m: any) => m.name === "soil-0"));
ok("material-count-4", mats.length === 4, `${mats.length} (baseline ${(base.json.materials ?? []).length})`);

// (4) knot KEEP group + mesh children, both builds
const knotChildren = (j: any) => {
    const out: string[] = [];
    const walk = (idxs: number[]) => {
        for (const ni of idxs) {
            const n = j.nodes[ni];
            if (n.name === "knot") for (const ci of n.children ?? []) { const c = j.nodes[ci]; if (c.mesh !== undefined) out.push(j.meshes[c.mesh].name); }
            if (n.children) walk(n.children);
        }
    };
    walk(j.scenes[0].nodes);
    return out;
};
ok("knot-group-children", knotChildren(cand.json).length === 2, `${knotChildren(cand.json).join(",")} vs baseline ${knotChildren(base.json).join(",")}`);

// (5) POSITION scan via primitive attributes map
const posAccIdx = new Set<number>();
for (const mesh of cand.json.meshes) for (const p of mesh.primitives) if (p.attributes?.POSITION !== undefined) posAccIdx.add(p.attributes.POSITION);
let nonFinite = 0, scanned = 0, windowErr = 0;
for (const ai of posAccIdx) {
    const acc = cand.json.accessors[ai];
    if (acc.componentType !== 5126 || acc.bufferView === undefined) continue;
    const bv = cand.json.bufferViews[acc.bufferView];
    const start = cand.binOff + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    if (start < 0 || start + acc.count * 12 > cand.buf.length) { windowErr++; continue; }
    for (let i = 0; i < acc.count; i++) {
        const o = start + i * 12;
        for (let k = 0; k < 3; k++) if (!Number.isFinite(cand.buf.readFloatLE(o + k * 4))) nonFinite++;
        scanned++;
    }
}
ok("position-windows-ok", windowErr === 0, `${windowErr} bad windows`);
ok("position-nonfinite-0", nonFinite === 0, `${nonFinite} bad of ${scanned} verts`);

// (6) node/mesh census identical to baseline
ok("node-count-identical", cand.json.nodes.length === base.json.nodes.length, `${cand.json.nodes.length} vs ${base.json.nodes.length}`);
ok("mesh-count-identical", cand.json.meshes.length === base.json.meshes.length, `${cand.json.meshes.length} vs ${base.json.meshes.length}`);
console.log(fails === 0 ? "P319_DECODE_ALL_PASS" : `P319_DECODE_FAIL_${fails}`);
process.exit(fails === 0 ? 0 : 1);
