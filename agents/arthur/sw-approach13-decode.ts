// sw-approach13-decode.ts — decode audit for the approach-13 D4 rebuild of
// village_sw_approach3.glb: node census before-vs-after (pillar group must be
// the ONLY delta), bead world positions, lamp-group translations vs the live
// -l light entities, material inventory.
import { readFileSync } from "node:fs";

function parseGLB(path: string) {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error(`not GLB: ${path}`);
  let off = 12, json: any = null, bin: any = null;
  while (off < buf.byteLength) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
    const chunk = buf.subarray(off + 8, off + 8 + len);
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(chunk));
    if (type === 0x004e4942) bin = chunk;
    off += 8 + len;
  }
  return { json, bin };
}

const compType: any = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const nComp: any = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

function meshStats(json: any, bin: any) {
  const nodes = json.nodes ?? [], meshes = json.meshes ?? [], acc = json.accessors ?? [], views = json.bufferViews ?? [];
  const out: Record<string, string> = {};
  const walk = (idx: number, path: string) => {
    const n = nodes[idx];
    const here = path ? `${path}/${n.name ?? `#${idx}`}` : (n.name ?? `#${idx}`);
    if (n.mesh !== undefined) {
      const m = meshes[n.mesh];
      let verts = 0; const min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
      for (const p of m.primitives ?? []) {
        const a = acc[p.attributes.POSITION];
        const ab = views[a.bufferView];
        const f = new compType[a.componentType](bin.buffer, bin.byteOffset + (ab.byteOffset ?? 0) + (a.byteOffset ?? 0), a.count * nComp[a.type]);
        verts += a.count;
        for (let i = 0; i < a.count; i++) for (let k = 0; k < 3; k++) {
          const v = f[i * 3 + k]; if (v < min[k]) min[k] = v; if (v > max[k]) max[k] = v;
        }
      }
      const t = n.translation ?? [0, 0, 0];
      out[here] = `verts=${verts} y[${min[1].toFixed(2)}..${max[1].toFixed(2)}] x[${min[0].toFixed(2)}..${max[0].toFixed(2)}] z[${min[2].toFixed(2)}..${max[2].toFixed(2)}] t[${t.map((v: number) => +v.toFixed(2))}]`;
    }
    for (const c of n.children ?? []) walk(c, here);
  };
  for (const r of json.scenes[0].nodes) walk(r, "");
  return { out, nodes, mats: (json.materials ?? []).map((m: any) => m.name) };
}

const A = meshStats(...((): [any, any] => { const p = parseGLB("agents/arthur/reviews/sw-approach13/before/before.glb"); return [p.json, p.bin]; })());
const B = meshStats(...((): [any, any] => { const p = parseGLB("agents/arthur/assets/village_sw_approach3.glb"); return [p.json, p.bin]; })());

console.log("AFTER: nodes", B.nodes.length, "| materials:", B.mats.join(", "));
console.log("BEFORE: nodes", A.nodes.length, "| materials:", A.mats.join(", "));

const ak = Object.keys(A.out), bk = Object.keys(B.out);
const added = bk.filter(k => !ak.includes(k));
const gone = ak.filter(k => !bk.includes(k));
const changed = bk.filter(k => ak.includes(k) && A.out[k] !== B.out[k]);
console.log(`\nDELTA vs live 43817a4f: ${added.length} added, ${gone.length} gone, ${changed.length} changed`);
for (const k of added) console.log(`  + ${k}: ${B.out[k]}`);
for (const k of gone) console.log(`  - ${k}: ${A.out[k]}`);
for (const k of changed) console.log(`  ~ ${k}\n      A: ${A.out[k]}\n      B: ${B.out[k]}`);
if (gone.length || changed.length) { console.log("\nFAIL: expected pillar group ONLY as delta"); process.exit(1); }

// bead world positions from the pillar keep-group
const pg = B.nodes.findIndex((n: any) => n.name === "flame_beads_sw");
if (pg < 0) { console.log("FAIL: no flame_beads_sw group"); process.exit(1); }
const gt = B.nodes[pg].translation ?? [0, 0, 0];
const beads: number[][] = [], bodies: number[][] = [];
const collect = (idx: number) => {
  const n = B.nodes[idx];
  if (n.mesh !== undefined) {
    const t = n.translation ?? [0, 0, 0];
    (n.name === "flame" ? beads : bodies).push([t[0] + gt[0], t[1] + gt[1], t[2] + gt[2]]);
  }
  for (const c of n.children ?? []) collect(c);
};
collect(pg);
console.log(`\npillar group: ${bodies.length} bodies, ${beads.length} beads`);
for (const b of beads) {
  const r = Math.hypot(b[0], b[2]);
  console.log(`  bead (${b.map(v => v.toFixed(2)).join(", ")}) r=${r.toFixed(1)}`);
}
// angler keep-out check on beads+pillars
for (const b of [...beads, ...bodies]) {
  const d = Math.hypot(b[0] + 23.6, b[2] + 38.37);
  if (d < 1.3) { console.log(`FAIL: pillar/bead within angler keep-out: ${d.toFixed(2)}m`); process.exit(1); }
}
console.log("angler keep-out (1.3m): all clear");

// lamp translations vs live lights
const LIVE_LIGHTS = [[-25.20, 1.96, -30.67], [-34.69, 1.96, -43.14]];
for (const n of B.nodes) {
  if ((n.name ?? "").startsWith("wlamp_")) {
    const t = n.translation ?? [0, 0, 0];
    const near = LIVE_LIGHTS.find(l => Math.hypot(l[0] - t[0], l[2] - t[2]) < 1.2);
    console.log(`lamp group ${n.name}: t=[${t.map((v: number) => +v.toFixed(2))}] -> live ${near ? "MATCH" : "NONE WITHIN 1.2m"}`);
  }
}
console.log("\nDECODE_OK");
