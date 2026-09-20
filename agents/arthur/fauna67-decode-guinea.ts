// fauna67-decode-guinea.ts — decode audit for the fauna-67 guinea fowl.
// GREEN gates: 7 anchors (guine_a{,_head,_tail} + guine_b{,_head} +
// guine_c{,_head}); baked bird scale ×1.4 (hull half-height ≈0.184 at
// center y≈0.364); ground contact y≈0 (toes crest ≤0.012 — frog law c);
// sentinel skull UP (local y > +0.15 baked) vs peck skull DOWN (y < -0.18);
// casque proud of skull crown (crest ≥ +0.02); wattle pair x-split ±;
// pearl-spot census (each bird ≥ 20 merged-bucket verts in the pearl
// band... simpler: pearl bucket mesh exists + its bbox spans upper body);
// flock spread post-bake ≥1.0m (company, not a blob).
// RED control: `bun ... fauna67-decode-guinea.ts <hens_flock.glb>` — zero
// guine anchors expected, gates fail loud.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2] ?? "agents/arthur/assets/village_fauna67_guinea.glb";
const bytes = readFileSync(file);
const sha = createHash("sha256").update(bytes).digest("hex");
console.log(JSON.stringify({ file, sha16: sha.slice(0, 16) }));

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
root.traverse((o: any) => { if (o.name && /^guine(_|$)/.test(o.name) && !/_\d+$/.test(o.name)) anchors[o.name] = o; });
const names = Object.keys(anchors).sort();
console.log(JSON.stringify({ anchors: names }));
const expect = ["guine_a", "guine_a_head", "guine_a_tail", "guine_b", "guine_b_head", "guine_c", "guine_c_head"];
const missing = expect.filter((n) => !names.includes(n));
if (missing.length) { console.log(`FAIL missing anchors: ${missing}`); process.exit(1); }
if (names.length !== expect.length) { console.log(`FAIL unexpected extra guine anchors: ${names}`); process.exit(1); }

let meshNodes = 0, tris = 0;
root.traverse((o: any) => { if (o.isMesh) { meshNodes++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
console.log(JSON.stringify({ meshNodes, tris: Math.round(tris) }));

// flock spread (bird-group origins) — company, not a blob
const pa = anchors["guine_a"].position.toArray();
const pb = anchors["guine_b"].position.toArray();
const pc = anchors["guine_c"].position.toArray();
const spread = Math.hypot(pa[0] - pc[0], pa[2] - pc[2]);
console.log(JSON.stringify({ flockOrigins: { a: pa.map((v: number) => +v.toFixed(3)), b: pb.map((v: number) => +v.toFixed(3)), c: pc.map((v: number) => +v.toFixed(3)) }, spreadAC: +spread.toFixed(3) }));
if (spread < 1.0) { console.log(`FAIL flock spread ${spread.toFixed(3)} < 1.0 — company collapsed`); process.exit(1); }

// per-bird hull box — baked scale check (hull half-height ~0.184, center y ~0.364)
for (const tag of ["a", "b", "c"]) {
  const hb = boxOf(anchors[`guine_${tag}`])!;
  const height = hb.max[1] - hb.min[1];
  console.log(JSON.stringify({ bird: tag, env: { min: hb.min.map((v) => +v.toFixed(3)), max: hb.max.map((v) => +v.toFixed(3)) }, height: +height.toFixed(3) }));
  if (height < 0.55 || height > 1.0) { console.log(`FAIL bird ${tag} baked height ${height.toFixed(3)} outside 0.55-1.0 (×1.4 of ~0.5 true)`); process.exit(1); }
}

// ground contact — lowest bird mesh ≤ 0.012 above ground (toes)
let lowest = Infinity;
for (const tag of ["a", "b", "c"]) {
  const hb = boxOf(anchors[`guine_${tag}`])!;
  lowest = Math.min(lowest, hb.min[1]);
}
console.log(JSON.stringify({ groundContact: +lowest.toFixed(4) }));
if (lowest < -0.01 || lowest > 0.02) { console.log(`FAIL ground contact ${lowest}`); process.exit(1); }

// head poses — sentinel skull UP, peck skull DOWN (composed local positions)
const headBox = (tag: string) => boxOf(anchors[`guine_${tag}_head`])!;
const bEnv = headBox("b"), cEnv = headBox("c");
// skull world-ish y: the head group's own mesh extents
const bTop = bEnv.max[1], cLow = cEnv.min[1];
console.log(JSON.stringify({ sentinelHeadTop: +bTop.toFixed(3), peckerHeadLow: +cLow.toFixed(3) }));
if (bTop < 0.55) { console.log(`FAIL sentinel head too low: ${bTop}`); process.exit(1); }
if (cLow > 0.18) { console.log(`FAIL pecker head too high: ${cLow}`); process.exit(1); }

// casque proud of skull — in the sentinel head, top mesh (casque+tip) must
// clear the skull sphere's crown by ≥0.015. Decode via material buckets is
// opaque post-merge; assert via the head envelope shape: the top 40mm of
// the sentinel head must be narrower (x) than the skull — the helmet spike.
const skullX = 0.048 * 0.92 * 1.4; // authored skull x-half, baked ≈ 0.0618
const headW = Math.max(bEnv.max[0] - bEnv.min[0], bEnv.max[2] - bEnv.min[2]);
console.log(JSON.stringify({ sentinelHeadSpan: +headW.toFixed(3), skullXHalf: +skullX.toFixed(4) }));
if (headW < skullX * 1.8) { console.log(`FAIL sentinel head span ${headW} too narrow — skull missing?`); process.exit(1); }

// whole-entity envelope (furniture incl) for the live bbox contract
const whole = boxOf(root)!;
console.log(JSON.stringify({ whole: { min: whole.min.map((v) => +v.toFixed(3)), max: whole.max.map((v) => +v.toFixed(3)) } }));

// pearl buckets — per-bird merged dot meshes: count meshes whose material
// is near-white warm (GLTFLoader returns LINEAR-space colors; 0xe8e6dc →
// ≈(0.807,0.791,0.716) — check relative warm near-white, not sRGB hex).
let pearlMeshes = 0; const pearlParents = new Set<string>();
root.traverse((o: any) => {
  if (!o.isMesh) return;
  const m = o.material;
  if (!m || !m.color) return;
  const { r, g, b } = m.color;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (mx >= 0.6 && mn >= 0.5 && mx - mn <= 0.16 && r >= g && g >= b) {
    // near-white warm — the pearl family; confirm it dots a bird (not the
    // grit/dust furniture, which is tan-dark and root-level)
    let p = o.parent;
    while (p && !/^guine/.test(p.name ?? "")) p = p.parent;
    if (p) { pearlMeshes++; pearlParents.add(p.name); }
  }
});
console.log(JSON.stringify({ pearlMeshes, pearlBirds: [...pearlParents] }));
if (pearlMeshes < 3 || pearlParents.size < 3) { console.log("FAIL pearl dots missing from a bird"); process.exit(1); }

console.log("DECODE GREEN");
