// improve31-woodyard-rebuild.ts — improve-31 EXECUTION: material-tier cure
// for nx-town-woodyard from the LIVE store-min bytes (tex-85 live-freeze
// law: derive from served bytes 80c2e142…, never a source rebuild).
//
// DECODE GROUND TRUTH (improve31-decode/probe2/probe3): all five primitives
// material:ABSENT (whole-asset struct-38/55 class — three's GLTFLoader
// default {white, metal 1, rough 1} × vertexColors kills the diffuse term =
// the survey's pure-black blob). Geometry is BYTE-FAITHFUL: positions,
// normals, indices copied verbatim from the banked buckets; node names and
// tree (wy_axe group) preserved; no mergeByMaterial pass (that would reorder
// the named-node contract).
//
// Bucket plan per the committed contract (IMPROVE-PLAN.md row improve-31):
//   wy3_0  → split into bark (posts/backwall/course tops) + split-face
//            (±z log-end faces in the stack region)
//   wy3_1  → mid-timber roof texMat
//   wy3_2  → split into bark body + split-face on the 294 x-facing caps
//   wy_axe_0 → shared split texMat (pale handled-tool wood; a PLAIN mat
//            would export material-less = re-introduce the defect class)
//   wy_axe_1 → iron texMat (sign-lane idiom)
// UVs: plane-mapped per contract (course pitch 0.0375 → 0.525-unit rows).
import * as THREE from "three";
import { toGLB, texMat } from "./assets/glbwrite.ts";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const buckets = JSON.parse(readFileSync("/tmp/improve31-buckets.json", "utf8"));

// ---- material tier (struct-38 law: texMat or emissive — nothing plain) ----
const barkTex = texMat("wy_bark", [0x6a6030, 0x5f5730, 0x54502a], { rough: 0.95, weights: [2, 1, 1] });
const splitTex = texMat("wy_split", [0xaa955a, 0x9c8850, 0x8a7a4a], { rough: 0.85, weights: [2, 1, 1] }); // v2: green cast warmed to tan (both judges' shared critique)
const roofTex = texMat("wy_roof_mid_timber", [0x787250, 0x6f6a49, 0x676344], { rough: 0.9, weights: [2, 1, 1] });
const ironTex = texMat("wy_axe_iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55 });

// ---- geometry re-assembly (byte-faithful from the decoded buckets) ----
const mk = (name: string, b: any, material: THREE.Material, uvmode: "bark" | "split" | "roof" | "plane2_4" | "axe") => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(b.pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(b.nor, 3));
    if (b.idx) geo.setIndex(b.idx);
    // analytic UVs per the committed contract
    const uv = new Float32Array(b.count * 2);
    for (let i = 0; i < b.count; i++) {
        const x = b.pos[i * 3], y = b.pos[i * 3 + 1], z = b.pos[i * 3 + 2];
        let u = 0, v = 0;
        if (uvmode === "bark") { u = x * 3; v = y * 14; }
        else if (uvmode === "split") { u = x * 3; v = y * 14; } // same plane map; tones carry the read
        else if (uvmode === "roof") { u = x * 2.4; v = z * 2.4; }
        else if (uvmode === "plane2_4") { u = x * 2; v = y * 4; }
        else if (uvmode === "axe") { u = (x * 8 + z * 8); v = y * 8; }
        uv[i * 2] = u; uv[i * 2 + 1] = v;
    }
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    const m = new THREE.Mesh(geo, material);
    m.name = name;
    return m;
};

const g = new THREE.Group();
g.add(mk("wy3_0", buckets.wy3_0, barkTex, "bark"));
g.add(mk("wy3_0e", buckets.wy3_0e, splitTex, "split"));
g.add(mk("wy3_1", buckets.wy3_1, roofTex, "roof"));
g.add(mk("wy3_2", buckets.wy3_2, barkTex, "bark"));
g.add(mk("wy3_2e", buckets.wy3_2e, splitTex, "split"));
const axe = new THREE.Group();
axe.name = "wy_axe";
axe.add(mk("wy_axe_0", buckets.wy_axe_0, splitTex, "axe"));
axe.add(mk("wy_axe_1", buckets.wy_axe_1, ironTex, "axe"));
g.add(axe);

const buf = toGLB(g);
writeFileSync("agents/arthur/assets/village_woodyard3.glb", buf);
const h = createHash("sha256").update(buf).digest("hex");
console.log(JSON.stringify({ sha: h, bytes: buf.length }));
