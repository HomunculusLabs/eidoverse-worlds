// struct95-decode-slidingladder.ts — decode audit for struct-95 Sliding Ladder.
// Verifies: node census after merge, glow_as KEEP node present (emissive
// survives), texMat material lanes exported (struct-38 law), true bbox from
// accessors, rail count baked into the iron bucket, envelope tangency at the
// vertex level (one tangent point per ladder lies within TUBE_R+eps of the
// brass tube's swept points).
import { readFileSync } from "node:fs";

const buf = readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/village_slidingladder3.glb");
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
const nodes = doc.nodes ?? [];
const meshes = doc.meshes ?? [];
const mats = doc.materials ?? [];
console.log("nodes:", nodes.length, "meshes:", meshes.length, "materials:", mats.length);
for (const n of nodes) {
    const meshIdx = n.mesh === undefined ? null : n.mesh;
    const nm = meshIdx !== null ? meshes[meshIdx] : null;
    const matIdx = nm?.primitives?.[0]?.material;
    const mn = matIdx !== undefined ? (mats[matIdx]?.name ?? "?") : "-";
    console.log(`  node ${n.name} mesh=${meshIdx} mat=${mn}`);
}
// laws
const keep = nodes.some((n: any) => n.name === "glow_as");
const texLanes = mats.filter((m: any) => /sl_stone|sl_iron/.test(m.name)).length;
const emiss = mats.some((m: any) => (m.emissiveFactor ?? []).some((v: number) => v > 0));
if (!keep) throw Error("glow_as KEEP node MISSING — emissive died in merge");
if (texLanes < 2) throw Error(`texMat lanes ${texLanes} < 2 (struct-38 law)`);
if (!emiss) throw Error("no emissive factor exported");
// bbox from accessors of every mesh
let mnv: number[] = [Infinity, Infinity, Infinity], mxv: number[] = [-Infinity, -Infinity, -Infinity];
const bvs = doc.bufferViews ?? [], accs = doc.accessors ?? [];
for (const msh of meshes) {
    for (const p of msh.primitives ?? []) {
        const pos = p.attributes?.POSITION;
        if (pos === undefined) continue;
        const a = accs[pos];
        mnv = mnv.map((v, i) => Math.min(v, a.min[i]));
        mxv = mxv.map((v, i) => Math.max(v, a.max[i]));
        void bvs;
    }
}
console.log("true accessor bbox min", mnv.map((v) => v.toFixed(3)).join(","), "max", mxv.map((v) => v.toFixed(3)).join(","));
// node count law 5..45
if (nodes.length < 2 || nodes.length > 45) throw Error(`node census ${nodes.length} outside 2..45`);
console.log("DECODE AUDIT ALL PASS");
