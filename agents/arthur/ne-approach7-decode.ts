// nw-approach6-decode.ts — decode audit for the approach-7 D2 rebuild of
// village_ne_approach2.glb: node census, KEEP trees, pillar/bead world
// positions, lamp-group translations vs the live -l light entities, and
// material-name inventory (stone/bone/bead families present, soils intact).
import { readFileSync } from "node:fs";

const buf = readFileSync("agents/arthur/assets/village_ne_approach2.glb");
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) throw new Error("not GLB");
let off = 12;
let json: any = null, bin: any = null;
while (off < buf.byteLength) {
  const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
  const chunk = buf.subarray(off + 8, off + 8 + len);
  if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(chunk));
  if (type === 0x004e4942) bin = chunk;
  off += 8 + len;
}
const nodes = json.nodes ?? [], meshes = json.meshes ?? [], acc = json.accessors ?? [], views = json.bufferViews ?? [], mats = json.materials ?? [];
console.log("nodes:", nodes.length, "meshes:", meshes.length, "materials:", mats.length);
console.log("material names:", mats.map((m: any) => m.name).join(", "));

const compType: any = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const nComp: any = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

function primBounds(meshIdx: number) {
  const min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
  let verts = 0;
  for (const p of meshes[meshIdx].primitives ?? []) {
    const a = acc[p.attributes.POSITION];
    const ab = views[a.bufferView];
    const f = new compType[a.componentType](bin.buffer, bin.byteOffset + (ab.byteOffset ?? 0) + (a.byteOffset ?? 0), a.count * nComp[a.type]);
    verts += a.count;
    for (let i = 0; i < a.count; i++) {
      for (let k = 0; k < 3; k++) {
        const v = f[i * 3 + k];
        if (v < min[k]) min[k] = v;
        if (v > max[k]) max[k] = v;
      }
    }
  }
  return { min: min.map(v => +v.toFixed(2)), max: max.map(v => +v.toFixed(2)), verts };
}

function walk(idx: number, depth: number, path: string) {
  const n = nodes[idx];
  const name = n.name ?? `#${idx}`;
  const here = path ? `${path}/${name}` : name;
  if (n.mesh !== undefined) {
    const b = primBounds(n.mesh);
    const t = n.translation ?? [0, 0, 0];
    const tag = t.some(v => v !== 0) ? ` (node translation [${t.map(v => +v.toFixed(2))}])` : "";
    console.log(`${"  ".repeat(depth)}${here}: verts=${b.verts} y ${b.min[1]}..${b.max[1]} x ${b.min[0]}..${b.max[0]} z ${b.min[2]}..${b.max[2]}${tag}`);
  } else if (n.children) {
    const t = n.translation ?? [0, 0, 0];
    const tag = t.some(v => v !== 0) ? ` (node translation [${t.map(v => +v.toFixed(2))}])` : "";
    console.log(`${"  ".repeat(depth)}${here}: group${tag}`);
  } else {
    console.log(`${"  ".repeat(depth)}${here}: (leaf, no mesh)`);
  }
  for (const c of n.children ?? []) walk(c, depth + 1, here);
}
for (const r of json.scenes[0].nodes) walk(r, 0, "");

// pillar/bead world positions: beads are KEEP meshes inside flame_beads_ne;
// world pos = group translation + local position (group has rotation 0).
const pg = nodes.findIndex((n: any) => n.name === "flame_beads_ne");
if (pg < 0) { console.log("NO pillar group found"); process.exit(1); }
const gt = nodes[pg].translation ?? [0, 0, 0];
const beads: number[][] = [];
const bodies: number[][] = [];
const collect = (idx: number) => {
  const n = nodes[idx];
  if (n.mesh !== undefined) {
    const t = n.translation ?? [0, 0, 0];
    (n.name === "flame" ? beads : bodies).push([t[0] + gt[0], t[1] + gt[1], t[2] + gt[2]]);
  }
  for (const c of n.children ?? []) collect(c);
};
collect(pg);
console.log(`\npillar group: ${bodies.length} bodies, ${beads.length} beads`);
console.log("bead world positions (x,y,z):");
for (const b of beads) console.log(`  ${b.map(v => v.toFixed(2)).join(", ")}`);
const ySpans = bodies.map((_, i) => i);
void ySpans;

// lamp keep-group translations vs live light entities
const LIVE_LIGHTS = [[-39.09, 1.96, 30.26], [-47.96, 1.96, 46.71]];
for (const n of nodes) {
  if ((n.name ?? "").startsWith("wlamp_")) {
    const t = n.translation ?? [0, 0, 0];
    // live light x,z vs group translation x,z; flame cores sit at local y1.96
    const near = LIVE_LIGHTS.find(l => Math.hypot(l[0] - t[0], l[2] - t[2]) < 1.2);
    console.log(`lamp group ${n.name}: translation [${t.map(v => +v.toFixed(2)).join(", ")}] -> live light ${near ? "MATCH(" + near.map(v => v.toFixed(2)).join(", ") + ")" : "NONE WITHIN 1.2m"}`);
  }
}

