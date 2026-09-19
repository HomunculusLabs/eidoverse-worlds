// struct257-platecheck-rico.ts — closeface arbitration decode: per-face plate
// completeness. The ZAI closeface judge claimed a missing panel / sky-through
// gap at the top cap (390,0)-(560,160). Probe law #11: a vision QUANTITATIVE
// claim is a probe — decode before believing. Every one of the 62 faces must
// carry plate verts ON its plane within the face ring.
import { readFileSync } from "node:fs";
import {
    V, FACE_V, CENTERS, NORMALS, PLATE_T, PLATE_BACK, ROD_R,
} from "./struct257-probe-rico.ts";

function parseGLB(path: string) {
    const buf = readFileSync(path);
    let off = 12, json: any = null, bin: Uint8Array | null = null;
    while (off < buf.length) {
        const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
        if (type === 0x4e4f534a) json = JSON.parse(buf.subarray(off + 8, off + 8 + len).toString("utf8"));
        if (type === 0x004e4942) bin = buf.subarray(off + 8, off + 8 + len);
        off += 8 + len;
    }
    return { json, bin };
}
const { json, bin } = parseGLB("agents/arthur/assets/village_rico3.glb");
const nodes = json.nodes ?? [];
const meshNodes = nodes.map((n: any, i: number) => ({ n, i })).filter(({ n }: any) => n.mesh !== undefined);
const matNameOf = (n: any) => json.materials[json.meshes[n.mesh].primitives[0].material]?.name ?? "?";
const vertsOf = (n: any): number[][] => {
    const out: number[][] = [];
    const t = n.translation ?? [0, 0, 0];
    for (const prim of json.meshes[n.mesh].primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        const view = json.bufferViews[acc.bufferView];
        const off = (view.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        for (let i = 0; i < acc.count; i++)
            out.push([bin.readFloatLE(off + i * 12) + t[0], bin.readFloatLE(off + i * 12 + 4) + t[1], bin.readFloatLE(off + i * 12 + 8) + t[2]]);
    }
    return out;
};
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "rico_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "rico_iron");
const all = [...vertsOf(stoneNode.n), ...vertsOf(ironNode.n)];

const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
const shellTol = Math.abs(sSide) + PLATE_T / 2 + 0.004;
const missing: string[] = [];
const counts: number[] = [];
for (let u = 0; u < FACE_V.length; u++) {
    const c = CENTERS[u], n = NORMALS[u];
    const v0 = V[FACE_V[u][0]];
    const d0 = [v0[0] - c[0], v0[1] - c[1], v0[2] - c[2]];
    const l0 = Math.hypot(...d0);
    const e1 = d0.map((x) => x / l0);
    const e2 = [
        n[1] * e1[2] - n[2] * e1[1],
        n[2] * e1[0] - n[0] * e1[2],
        n[0] * e1[1] - n[1] * e1[0],
    ];
    let cnt = 0;
    for (const p of all) {
        const dx = p[0] - c[0], dy = p[1] - c[1], dz = p[2] - c[2];
        const perp = dx * n[0] + dy * n[1] + dz * n[2];
        if (Math.abs(perp) > shellTol) continue;
        const inR = Math.hypot(dx * e1[0] + dy * e1[1] + dz * e1[2], dx * e2[0] + dy * e2[1] + dz * e2[2]);
        if (inR < l0 + 0.05) cnt++;
    }
    counts.push(cnt);
    if (cnt < 8) missing.push(`face ${u} (${FACE_V[u].length}-gon, n_y ${n[1].toFixed(2)}) count ${cnt}`);
}
console.log("faces total", FACE_V.length, "| plate verts per face: min", Math.min(...counts), "max", Math.max(...counts));
console.log(missing.length ? "MISSING PANELS: " + missing.join("; ") : "ALL 62 FACES CARRY PLATE VERTS — no missing panels");
const topIdx = FACE_V.findIndex((_, u) => FACE_V[u].length === 5 && NORMALS[u][1] > 0.99);
console.log("crown pentagon idx", topIdx, "plate verts", counts[topIdx]);
