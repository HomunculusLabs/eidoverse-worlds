// artwalk49-band-decode.ts — generalized host/rider band reconciliation.
// For each stale-pin host: load the LIVE host GLB (local bytes == live lib, sha-gated),
// load the rider GLB, compute the rider's host-local volume (anchor + own bbox),
// and audit host vertices inside that volume (±0.02 tolerance).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const A = (p: string) => readFileSync(`agents/arthur/assets/${p}`);
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");

function loadGLB(b: Buffer) {
    const jsonLen = Number(new DataView(b.buffer, b.byteOffset + 12, 4).getUint32(0, true));
    const j = JSON.parse(new TextDecoder().decode(b.subarray(20, 20 + jsonLen)));
    const BIN = 20 + jsonLen + 8;
    const acc = (i: number) => {
        const a = j.accessors[i]; const bv = j.bufferViews[a.bufferView];
        const off = BIN + (bv.byteOffset || 0) + (a.byteOffset || 0);
        const dv = new DataView(b.buffer, b.byteOffset + off, a.count * 12);
        const out: number[][] = [];
        for (let k = 0; k < a.count; k++) out.push([dv.getFloat32(k * 12, true), dv.getFloat32(k * 12 + 4, true), dv.getFloat32(k * 12 + 8, true)]);
        return out;
    };
    return { j, acc };
}

function bboxOf(b: Buffer) {
    const { j, acc } = loadGLB(b);
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    const stack: Array<[number, number[]]> = j.scenes[0].nodes.map((n: number) => [n, [0, 0, 0]]);
    while (stack.length) {
        const [ni, tr] = stack.pop()!;
        const n = j.nodes[ni];
        const t = n.translation ? [tr[0] + n.translation[0], tr[1] + n.translation[1], tr[2] + n.translation[2]] : tr;
        if (n.mesh !== undefined) for (const prim of j.meshes[n.mesh].primitives) for (const v of acc(prim.attributes.POSITION)) {
            const w = [v[0] + t[0], v[1] + t[1], v[2] + t[2]];
            for (let a = 0; a < 3; a++) { if (w[a] < mn[a]) mn[a] = w[a]; if (w[a] > mx[a]) mx[a] = w[a]; }
        }
        for (const c of n.children ?? []) stack.push([c, t]);
    }
    return { min: mn, max: mx };
}

// [tag, hostFile, expectHostSha16, riderFile, riderAnchor]
const jobs: Array<[string, string, string, string, number[]]> = [
    ["b2-lintel", "village_inn3.glb", "6e6ff2d08df9b3fb", "village_artwalk_b2_lintel.glb", [0, 2.78, 3.03]],
    ["b2-threshold", "village_inn3.glb", "6e6ff2d08df9b3fb", "village_artwalk_b2_threshold.glb", [0, 0.198, 2.95]],
    ["b3-porch", "village_potter3.glb", "dad7c82efbf3202b", "village_artwalk_b3.glb", [1.55, 0, 0.35]],
    ["b7-stars", "village_shrine3.glb", "948d5c494252078b", "village_artwalk_b7.glb", [-0.95, 0.25, -1.16]],
    ["b8-rein", "village_stable3.glb", "5beff62ed41ca6cf", "village_artwalk_b8.glb", [0, 2.22, -2.16]],
    ["b9-loom", "village_dyehouse3.glb", "888be3597d2f772f", "village_artwalk_b9.glb", [0, 0.48, -0.77]],
    ["b10-crown", "village_windmill3.glb", "0993836012d1b17d", "village_artwalk_b10.glb", [0, 2.22, 2.62]],
    ["b12-contours", "village_kiln3.glb", "4d8ef8fc0b0955de", "village_artwalk_b12.glb", [0, 0, 1.15]],
    ["b13-west", "village_gate.glb", "d1b90d6fc66b2db8", "village_artwalk_b13.glb", [-1.5, 0.5, -0.18]],
    ["b13-east", "village_gate.glb", "d1b90d6fc66b2db8", "village_artwalk_b13.glb", [1.5, 0.5, -0.18]],
    ["b14-dawn", "village_gate.glb", "d1b90d6fc66b2db8", "village_artwalk_b14.glb", [0, 2.72, 0.2325]],
    ["b15-dusk", "village_gate.glb", "d1b90d6fc66b2db8", "village_artwalk_b15.glb", [0, 2.72, 0.2325]],
    ["b16-strikes", "village_forge3.glb", "620120c4d6f0b4a0", "village_artwalk_b16.glb", [0, 1.02, 0.39]],
    ["b19-feast", "village_longhouse3.glb", "f2344409ac67fd77", "village_artwalk_b19.glb", [0, 2.22, 4.32]],
    ["b23-rain", "village_bcistern3.glb", "d3d3ad75932cb3da", "village_artwalk_b23.glb", [0, 0.31, 0.33]],
    ["b26-wayband", "village_approach_lamp.glb", "18b69a6bb2f5862f", "village_artwalk_b26.glb", [0, 1.5, 0]],
    ["b4-top", "village_gate.glb", "d1b90d6fc66b2db8", "village_artwalk_b4_top.glb", [0, 2.524133, 0.26]],
    ["b4-threshold", "village_gate.glb", "d1b90d6fc66b2db8", "village_artwalk_b4_threshold.glb", [0, 0, 0]],
    ["b4-hinges", "village_gate.glb", "d1b90d6fc66b2db8", "village_artwalk_b4_hinges.glb", [1.5, 0.7, 0.26]],
];

for (const [tag, hostF, want16, riderF, anchor] of jobs) {
    const hb = A(hostF);
    const got = sha(hb).slice(0, 16);
    if (got !== want16) { console.log(`${tag} SKIP: host bytes ${hostF}=${got} != live ${want16}`); continue; }
    const rb = bboxOf(A(riderF));
    const vol = {
        min: [anchor[0] + rb.min[0], anchor[1] + rb.min[1], anchor[2] + rb.min[2]],
        max: [anchor[0] + rb.max[0], anchor[1] + rb.max[1], anchor[2] + rb.max[2]],
    };
    const { j, acc } = loadGLB(hb);
    let hits = 0; const hitNodes = new Set<string>();
    const stack: Array<[number, number[], string]> = j.scenes[0].nodes.map((n: number) => [n, [0, 0, 0], ""]);
    while (stack.length) {
        const [ni, tr, path] = stack.pop()!;
        const n = j.nodes[ni];
        const t = n.translation ? [tr[0] + n.translation[0], tr[1] + n.translation[1], tr[2] + n.translation[2]] : tr;
        const nm = n.name ? (path ? path + "/" + n.name : n.name) : path;
        if (n.mesh !== undefined) {
            for (const prim of j.meshes[n.mesh].primitives) {
                for (const v of acc(prim.attributes.POSITION)) {
                    const w = [v[0] + t[0], v[1] + t[1], v[2] + t[2]];
                    if (w[0] >= vol.min[0] - 0.02 && w[0] <= vol.max[0] + 0.02 &&
                        w[1] >= vol.min[1] - 0.02 && w[1] <= vol.max[1] + 0.02 &&
                        w[2] >= vol.min[2] - 0.02 && w[2] <= vol.max[2] + 0.02) { hits++; hitNodes.add(nm); }
                }
            }
        }
        for (const c of n.children ?? []) stack.push([c, t, nm]);
    }
    console.log(`${tag} vol=[${vol.min.map(v => +v.toFixed(3))}]->[${vol.max.map(v => +v.toFixed(3))}] bandVerts=${hits}${hitNodes.size ? " nodes=" + [...hitNodes].join(",") : ""}`);
}
