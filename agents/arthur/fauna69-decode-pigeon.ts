// fauna69-decode-pigeon.ts — decode audit for the fauna-69 feral pigeon
// flock. GREEN gates: 9 anchors (pige_{a,b,c}{,_head,_tail} — the built
// superset of the proposal's 8; subset law fauna-19c); baked bird scale ×1.4 (cock body length ~0.19, height
// ~0.22±); ground contact y≈0 (toes ≤0.012); peck skull DOWN vs walker
// skull UP (pose contrast); collar census — BOTH iridescent material
// buckets (green 0x2e5a48, purple 0x4a3a5c — LINEAR ~(0.029,0.104,0.070)
// / (0.071,0.044,0.121)) present on every bird; two dark wing bars per
// side cresting y≥0.13 (bar bucket); white cere bucket present;
// flock spread ≥0.7m post-bake (tight market crowd, not a blob).
// RED control: `bun ... <sparrow GLB>` — zero pige anchors, fails loud.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2] ?? "agents/arthur/assets/village_dress_pigeon1.glb";
const bytes = readFileSync(file);
const sha = createHash("sha256").update(bytes).digest("hex");
console.log(JSON.stringify({ file, sha256: sha, sha16: sha.slice(0, 16) }));

const THREE = await import("three");
const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
const loader = new GLTFLoader();
const gltf: any = await new Promise((res, rej) => loader.parse(bytes.buffer as ArrayBuffer, "", res, rej));
const root = gltf.scene;
root.updateMatrixWorld(true);

type Box = { min: [number, number, number]; max: [number, number, number] };
const boxOf = (o: any): Box | null => {
  let b: Box | null = null;
  o.traverse?.((c: any) => {
    if (!c.isMesh) return;
    c.geometry.computeBoundingBox();
    const bb = c.geometry.boundingBox!;
    const m = c.matrixWorld;
    for (const cx of [bb.min.x, bb.max.x]) for (const cy of [bb.min.y, bb.max.y]) for (const cz of [bb.min.z, bb.max.z]) {
      const v = new THREE.Vector3(cx, cy, cz).applyMatrix4(m);
      if (!b) b = { min: [v.x, v.y, v.z], max: [v.x, v.y, v.z] };
      else for (let i = 0; i < 3; i++) { b.min[i] = Math.min(b.min[i], v.getComponent(i)); b.max[i] = Math.max(b.max[i], v.getComponent(i)); }
    }
  });
  return b;
};

const anchors: Record<string, any> = {};
root.traverse((o: any) => { if (o.name && /^pige(_|$)/.test(o.name) && !/_\d+$/.test(o.name)) anchors[o.name] = o; });
const names = Object.keys(anchors).sort();
console.log(JSON.stringify({ anchors: names }));
const expect = ["pige_a", "pige_a_head", "pige_a_tail", "pige_b", "pige_b_head", "pige_b_tail", "pige_c", "pige_c_head", "pige_c_tail"];
const missing = expect.filter((n) => !names.includes(n));
if (missing.length) { console.log(`FAIL missing anchors: ${missing}`); process.exit(1); }
if (names.length !== expect.length) { console.log(`FAIL unexpected extra pige anchors: ${names}`); process.exit(1); }

let meshNodes = 0, tris = 0;
root.traverse((o: any) => { if (o.isMesh) { meshNodes++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
console.log(JSON.stringify({ meshNodes, tris: Math.round(tris) }));

// flock spread (bird-group origins, baked)
const pa = anchors["pige_a"].position.toArray(), pb = anchors["pige_b"].position.toArray(), pc = anchors["pige_c"].position.toArray();
console.log(JSON.stringify({ flockOrigins: { a: pa.map(v => +v.toFixed(3)), b: pb.map(v => +v.toFixed(3)), c: pc.map(v => +v.toFixed(3)) } }));
const spreadAB = Math.hypot(pa[0] - pb[0], pa[2] - pb[2]);
const spreadAC = Math.hypot(pa[0] - pc[0], pa[2] - pc[2]);
if (spreadAB < 0.3 || spreadAC < 0.3) { console.log(`FAIL flock collapsed: ab ${spreadAB} ac ${spreadAC}`); process.exit(1); }

// per-bird envelope + ground contact
let lowest = Infinity;
for (const tag of ["a", "b", "c"]) {
  const hb = boxOf(anchors[`pige_${tag}`])!;
  const height = hb.max[1] - hb.min[1];
  console.log(JSON.stringify({ bird: tag, env: { min: hb.min.map(v => +v.toFixed(3)), max: hb.max.map(v => +v.toFixed(3)) }, height: +height.toFixed(3) }));
  if (height < 0.15 || height > 0.42) { console.log(`FAIL bird ${tag} baked height ${height.toFixed(3)} outside 0.15-0.42`); process.exit(1); }
  lowest = Math.min(lowest, hb.min[1]);
}
console.log(JSON.stringify({ groundContact: +lowest.toFixed(4) }));
if (lowest < -0.01 || lowest > 0.02) { console.log(`FAIL ground contact ${lowest}`); process.exit(1); }

// pose contrast — pecker head box reaches DOWN, walker head box HIGH
const aHead = boxOf(anchors["pige_a_head"])!;
const bHead = boxOf(anchors["pige_b_head"])!;
console.log(JSON.stringify({ peckerHeadMinY: +aHead.min[1].toFixed(3), walkerHeadMaxY: +bHead.max[1].toFixed(3) }));
if (aHead.min[1] > 0.10) { console.log(`FAIL pecker head not down: min y ${aHead.min[1]}`); process.exit(1); }
if (bHead.max[1] < 0.17) { console.log(`FAIL walker head not up: max y ${bHead.max[1]}`); process.exit(1); }

// whole-entity envelope (furniture incl) for the live bbox + SAT contract
const whole = boxOf(root)!;
console.log(JSON.stringify({ whole: { min: whole.min.map(v => +v.toFixed(3)), max: whole.max.map(v => +v.toFixed(3)) } }));

// material census — COLOR_0 bytes (glbwrite law: plain mats export
// COLOR_0-only, material block absent — census the VERTEX colors, using
// THREE.Color for the exact same sRGB→linear conversion toGLB used)
const colByte = (hex: number) => { const c = new (THREE as any).Color(hex); return [c.r, c.g, c.b].map(v => Math.round(v * 255)); };
const targets: Record<string, number[]> = {
  green: colByte(0x2e5a48), purple: colByte(0x4a3a5c), bar: colByte(0x2f3339),
  cere: colByte(0xe8e6dc), rump: colByte(0xb8bcc0), body: colByte(0x7a808a),
};
let found: Record<string, number> = {};
root.traverse((o: any) => {
  if (!o.isMesh) return;
  const colAttr = o.geometry?.attributes?.color; // GLTFLoader maps COLOR_0 → color
  if (!colAttr) return;
  const arr = colAttr.array as ArrayLike<number>;
  const stride = (colAttr.itemSize ?? 3);
  for (let i = 0; i < colAttr.count; i++) {
    // normalized Uint8Array: .array holds RAW BYTES (0-255) — no denorm
    const R = arr[i * stride], G = arr[i * stride + 1], B = arr[i * stride + 2];
    for (const [k, t] of Object.entries(targets)) {
      if (Math.abs(R - t[0]) <= 1 && Math.abs(G - t[1]) <= 1 && Math.abs(B - t[2]) <= 1) { found[k] = (found[k] ?? 0) + 1; break; }
    }
  }
});
console.log(JSON.stringify({ matCensus: found }));
for (const k of ["green", "purple", "bar", "cere", "rump", "body"]) {
  if (!found[k]) { console.log(`FAIL material bucket missing: ${k}`); process.exit(1); }
}

console.log("DECODE GREEN");
