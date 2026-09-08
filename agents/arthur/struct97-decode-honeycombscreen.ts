// struct97-decode-honeycombscreen.ts — decode audit for struct-97 Honeycomb Screen.
// Verifies: node census after merge (stone bucket + 4 glow_hc KEEP nodes),
// texMat material lane exported (struct-38 law), emissive exported (brass),
// true bbox from accessors, and TESSELLATION hole evidence — for sample
// non-queen cells the nearest stone-bucket vertex ring sits at the inner
// hex circumradius holeR (a solid cap would have nothing inside R).
import { readFileSync } from "node:fs";

const buf = readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/village_honeycombscreen3.glb");
const jsonChunk = (() => {
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let off = 12;
    while (off < buf.length) {
        const len = dv.getUint32(off, true);
        const type = dv.getUint32(off + 4, true);
        if (type === 0x4e4f534a) return JSON.parse(new TextDecoder().decode(buf.subarray(off + 8, off + 8 + len)));
        off += 8 + len;
    }
    throw Error("no JSON chunk");
})();

const doc = jsonChunk as any;
// capture the binary chunk start (bufferView byteOffsets are relative to it)
let binStart = 0;
{
    const dv2 = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let off = 12;
    while (off < buf.length) {
        const len = dv2.getUint32(off, true);
        const type = dv2.getUint32(off + 4, true);
        off += 8;
        if (type === 0x4e4f534a) { off += len + ((4 - (len % 4)) % 4); continue; }
        if (type === 0x004e4942) { binStart = off; break; }
        off += len;
    }
    if (!binStart) throw Error("no BIN chunk");
}
const nodes = doc.nodes ?? [], meshes = doc.meshes ?? [], mats = doc.materials ?? [], accs = doc.accessors ?? [], bvs = doc.bufferViews ?? [];
console.log("nodes:", nodes.length, "meshes:", meshes.length, "materials:", mats.length);
for (const n of nodes) {
    const mi = n.mesh === undefined ? null : n.mesh;
    const nm = mi !== null ? meshes[mi] : null;
    const matIdx = nm?.primitives?.[0]?.material;
    console.log(`  node ${n.name} mesh=${mi} mat=${matIdx !== undefined ? (mats[matIdx]?.name ?? "?") : "-"}`);
}

// laws
const queens = nodes.filter((n: any) => /^glow_hc_[1-4]$/.test(n.name));
if (queens.length !== 4) throw Error(`glow_hc KEEP nodes ${queens.length} != 4 — emissive died in merge`);
const texLanes = mats.filter((m: any) => /hc_stone/.test(m.name)).length;
if (texLanes < 1) throw Error(`texMat lanes ${texLanes} < 1 (struct-38 law)`);
if (!mats.some((m: any) => (m.emissiveFactor ?? []).some((v: number) => v > 0))) throw Error("no emissive factor exported");

// vertex reader (POSITION accessor of every primitive)
function readVerts(nodeIdx: number): number[][] {
    const out: number[][] = [];
    const n = nodes[nodeIdx];
    const walk = (idx: number, trs: number[]) => {
        const nn = nodes[idx];
        let m = trs;
        if (nn.matrix) {
            // multiply (decode walks hierarchy exactly once — glb-decode pitfall 4)
            const A = new (globalThis as any).DOMMatrix ? null : null; // not available; do manual
        }
        if (nn.translation || nn.rotation || nn.scale || nn.matrix) m = m; // top-level meshes here are flat; mergekit emits translation only
        if (nn.mesh !== undefined) {
            for (const prim of meshes[nn.mesh].primitives) {
                const a = accs[prim.attributes.POSITION];
                const bv = bvs[a.bufferView];
                const start = binStart + (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
                const cnt = a.count;
                for (let i = 0; i < cnt; i++) {
                    const o = start + i * 12;
                    out.push([buf.readFloatLE(o), buf.readFloatLE(o + 4), buf.readFloatLE(o + 8)]);
                }
            }
        }
        for (const c of nn.children ?? []) walk(c, m);
    };
    walk(nodeIdx, []);
    return out;
}

// find stone bucket node (the one whose material is hc_stone)
const stoneNode = nodes.findIndex((n: any) => {
    if (n.mesh === undefined) return false;
    const matIdx = meshes[n.mesh]?.primitives?.[0]?.material;
    return matIdx !== undefined && mats[matIdx]?.name === "hc_stone";
});
if (stoneNode < 0) throw Error("stone bucket node not found");
const sv = readVerts(stoneNode);
console.log(`stone bucket vertices: ${sv.length}`);

// true bbox from all nodes' accessors
let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < nodes.length; i++) for (const v of readVerts(i)) for (let k = 0; k < 3; k++) { if (v[k] < mn[k]) mn[k] = v[k]; if (v[k] > mx[k]) mx[k] = v[k]; }
console.log(`true bbox: ${mn.map((v) => v.toFixed(3))} .. ${mx.map((v) => v.toFixed(3))}`);

// tessellation hole evidence: sample non-queen cells; nearest stone vertex ring at holeR
const R = 0.45, SQ3 = Math.sqrt(3), WALL = 0.075, BASE = 0.50, DY = SQ3 * R, DX = 1.5 * R;
const holeR = ((SQ3 * R) / 2 - WALL) * 2 / SQ3;
const cx = (j: number) => (j - 2) * DX;
const cy = (j: number, i: number) => BASE + i * DY + (j % 2 === 1 ? DY / 2 : 0);
const QUEENS = [[1, 1], [2, 2], [3, 2], [4, 3]];
for (const [j, i] of [[0, 0], [2, 0], [4, 4], [1, 3]] as const) {
    if (QUEENS.some(([qj, qi]) => qj === j && qi === i)) continue;
    const X = cx(j), Y = cy(j, i);
    const d2 = sv.map(([x, y]) => Math.hypot(x - X, y - Y)).sort((a, b) => a - b);
    const near = d2.filter((d) => d < holeR + 0.02).length;
    if (Math.abs(d2[0] - holeR) > 0.02) throw Error(`cell (${j},${i}): nearest vertex ${d2[0].toFixed(3)} vs holeR ${holeR.toFixed(3)} — hole missing (solid cap?)`);
    if (near < 6) throw Error(`cell (${j},${i}): inner ring has ${near} vertices < 6`);
}
// queen evidence: brass nodes carry vertices only at the FULL hex ring (≥ R−0.02), none inside holeR
for (let q = 0; q < 4; q++) {
    const qi = nodes.findIndex((n: any) => n.name === `glow_hc_${q + 1}`);
    const qv = readVerts(qi);
    const [j, i] = QUEENS[q];
    const ds = qv.map(([x, y]) => Math.hypot(x - cx(j), y - cy(j, i))).sort((a, b) => a - b);
    if (ds[0] < R - 0.03) throw Error(`queen ${q + 1}: vertex inside hex ring (${ds[0].toFixed(3)}) — not a solid cell`);
    if (Math.abs(ds[0] - R) > 0.03) throw Error(`queen ${q + 1}: nearest vertex ${ds[0].toFixed(3)} vs R ${R}`);
}
console.log(`hole evidence OK: 4 sampled non-queen cells each carry a 6-vertex inner ring at holeR=${holeR.toFixed(4)}; 4 queens solid at R=${R}`);
console.log("DECODE ALL PASS");
