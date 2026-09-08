// struct109-decode-rule30wall.ts — decode audit of village_rule30wall3.glb.
// Verifies from BYTES: pinned sha, node budget, texMat lanes (rw_*), brass
// emissive exported, KEEP nodes (glow_rw_1 bead + glow_rw_socket), TRUE
// world-frame envelope, THE RULE-30 LAW — the live bucket's block positions
// reconstruct the automaton's spacetime diagram exactly (row n carries live
// cells at exactly the rule-30 column set, every row spans ±n), no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_rule30wall3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const BIN = 20 + jl + 8;
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);

// build math replica (constants must match mkv3-rule30wall.ts)
const NR = 15, PITCH = 0.72;
type Row = Set<number>;
function step(prev: Row): Row {
    const lo = Math.min(...prev) - 1, hi = Math.max(...prev) + 1;
    const nxt: Row = new Set();
    for (let c = lo; c <= hi; c++) {
        const L = prev.has(c - 1), C = prev.has(c), R = prev.has(c + 1);
        if ((L ? 1 : 0) ^ (C || R ? 1 : 0)) nxt.add(c);
    }
    return nxt;
}
const rowsCA: Row[] = [new Set([0])];
for (let n = 1; n < NR; n++) rowsCA.push(step(rowsCA[n - 1]));

ck("sha pinned v1", sha === "e70161322c42c2eb7eaee34af50fe3eb045ada79db44ef46d857110269c87915", sha.slice(0, 16));
ck("node budget 1-45", j.nodes.length >= 1 && j.nodes.length <= 45, `${j.nodes.length} nodes / ${j.meshes.length} meshes`);
ck("texMat lanes", ["rw_live", "rw_bed", "rw_plinth"].every(m => j.materials.some((x: any) => x.name === m)));
const glow = j.materials.find((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((c: number) => c > 0));
ck("brass emissive exported", !!glow, glow?.name);
ck("bead KEEP node", names.includes("glow_rw_1"));
ck("socket KEEP node", names.includes("glow_rw_socket"));

// ---- gather rw_live bucket vertices (baked frame; nodes carry translation) ----
const views = j.bufferViews ?? [];
const liveNode = j.nodes.find((n: any) => {
    if (n.mesh === undefined) return false;
    const m = j.meshes[n.mesh].primitives[0];
    return j.materials[m.material]?.name === "rw_live";
});
ck("rw_live bucket node found", !!liveNode, liveNode?.name ?? "(none)");
let lv: number[][] = [];
if (liveNode) {
    const prim = j.meshes[liveNode.mesh].primitives[0];
    const acc = j.accessors[prim.attributes.POSITION];
    const bv = views[acc.bufferView];
    const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const t = liveNode.translation ?? [0, 0, 0];
    for (let i = 0; i < acc.count; i++) {
        const p = BIN + off + i * 12;
        lv.push([bytes.readFloatLE(p) + t[0], bytes.readFloatLE(p + 4) + t[1], bytes.readFloatLE(p + 8) + t[2]]);
    }
    console.log(`rw_live bucket: ${acc.count} verts (expect 131 blocks x 24 = ${131 * 24})`);
}
ck("rw_live vert count == 131 blocks", lv.length === 131 * 24, `${lv.length}`);

// ---- THE RULE-30 LAW: block positions reconstruct the spacetime diagram ----
// cluster vertices into blocks by (y-row, x-col); row n center y =
// (NR-1-n)*PITCH + PITCH/2; live cell x = c*PITCH.
if (lv.length === 131 * 24) {
    let rowsOK = 0; const bad: string[] = [];
    for (let n = 0; n < NR; n++) {
        const yc = (NR - 1 - n) * PITCH + PITCH / 2;
        const inRow = lv.filter(([x, y]) => Math.abs(y - yc) < 0.345); // block half 0.3384 + margin
        // distinct x clusters (min separation PITCH/2)
        const xs = [...new Set(inRow.map(([x]) => Math.round(x / PITCH)))] as number[];
        const want = [...rowsCA[n]].sort((a, b) => a - b);
        const got = xs.sort((a, b) => a - b);
        const same = want.length === got.length && want.every((w, i) => Math.abs(w - got[i]) === 0);
        if (same) rowsOK++; else bad.push(`row ${n}: want[${want}] got[${got}]`);
    }
    ck("RULE-30 LAW live cells exact 15/15 rows from bytes", rowsOK === NR, `${rowsOK}/${NR}${bad.length ? " — " + bad.join(" ; ") : ""}`);
    // block count per row vs live count
    const liveCounts = rowsCA.map(r => r.size).join(",");
    console.log(`live counts from source: ${liveCounts}`);
}

// ---- true world-frame envelope + NaN ----
{
    let wmn = [Infinity, Infinity, Infinity], wmx = [-Infinity, -Infinity, -Infinity];
    let nan = 0;
    for (const nd of j.nodes) {
        if (nd.mesh === undefined) continue;
        const prims = j.meshes[nd.mesh].primitives;
        for (const prim of prims) {
            const acc = j.accessors[prim.attributes.POSITION];
            const bv = views[acc.bufferView];
            const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
            const t = nd.translation ?? [0, 0, 0];
            for (let i = 0; i < acc.count; i++) {
                const p = BIN + off + i * 12;
                const x = bytes.readFloatLE(p) + t[0], y = bytes.readFloatLE(p + 4) + t[1], z = bytes.readFloatLE(p + 8) + t[2];
                if ([x, y, z].some(isNaN)) { nan++; continue; }
                wmn = [Math.min(wmn[0], x), Math.min(wmn[1], y), Math.min(wmn[2], z)];
                wmx = [Math.max(wmx[0], x), Math.max(wmx[1], y), Math.max(wmx[2], z)];
            }
        }
    }
    ck("no NaN vertices", nan === 0, `${nan}`);
    const sz = [wmx[0] - wmn[0], wmx[1] - wmn[1], wmx[2] - wmn[2]].map(v => v.toFixed(3)).join("x");
    ck("envelope ~23.87x11.20x1.16 y[-0.42..10.778]", Math.abs((wmx[0] - wmn[0]) - 23.87) < 0.05 && Math.abs((wmx[1] - wmn[1]) - 11.198) < 0.05 && wmn[1] > -0.43 && wmn[1] < -0.41 && Math.abs(wmx[1] - 10.778) < 0.01, `${sz} y[${wmn[1].toFixed(3)}..${wmx[1].toFixed(3)}] z[${wmn[2].toFixed(2)}..${wmx[2].toFixed(2)}]`);
}

console.log(f === 0 ? "ALL PASS" : `${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
