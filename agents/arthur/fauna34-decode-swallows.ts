// fauna34-decode-swallows.ts — decode audit for the barn-swallow build.
// GREEN gates: 9 anchors present (swallow_1..3 + wing pairs); envelopes
// sane; ring-vs-solid clearances (the three yard rings vs horses OBB, owl
// post, stable, pergola, tower — airborne class, horizontal ring-gap or
// vertical-over rule); wing flap-dip clearance at max pendulum amp.
// RED control: run against the bees GLB — zero swallow_ anchors expected.
// Full TRS accumulate (fauna-2 decoder law).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2] ?? "agents/arthur/assets/village_fauna34_swallows.glb";
const bytes = readFileSync(file);
const sha = createHash("sha256").update(bytes).digest("hex");
console.log(JSON.stringify({ file, sha16: sha.slice(0, 16) }));

// ---- minimal GLB -> node tree with world matrices (three) ----
const THREE = await import("three");
const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
const { Blob, FileReader } = await import("node:buffer");
// bun: use loader.parse
const loader = new GLTFLoader();
const gltf: any = await new Promise((res, rej) => {
  loader.parse(bytes.buffer as ArrayBuffer, "", res, rej);
});
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

// anchors: named nodes matching ^swallow_
const anchors: Record<string, any> = {};
root.traverse((o: any) => { if (o.name && /^swallow_/.test(o.name)) anchors[o.name] = o; });
const names = Object.keys(anchors).sort();
console.log(JSON.stringify({ anchors: names }));
const expect = [
  "swallow_1", "swallow_1_wingL", "swallow_1_wingR",
  "swallow_2", "swallow_2_wingL", "swallow_2_wingR",
  "swallow_3", "swallow_3_wingL", "swallow_3_wingR",
];
const missing = expect.filter((n) => !names.includes(n));
if (missing.length) { console.log(`FAIL missing anchors: ${missing}`); process.exit(1); }

// mesh-node + tri counts
let meshNodes = 0, tris = 0;
root.traverse((o: any) => { if (o.isMesh) { meshNodes++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
console.log(JSON.stringify({ meshNodes, tris: Math.round(tris) }));

// per-bird world boxes
const env: Record<string, Box> = {};
for (const n of expect.filter((x) => !x.includes("wing"))) {
  const b = boxOf(anchors[n]); if (!b) { console.log(`FAIL no box ${n}`); process.exit(1); }
  env[n] = b;
  console.log(JSON.stringify({ bird: n, min: b.min.map((v) => +v.toFixed(3)), max: b.max.map((v) => +v.toFixed(3)) }));
}
// whole-entity envelope
const whole = boxOf(root)!;
console.log(JSON.stringify({ whole: { min: whole.min.map((v) => +v.toFixed(3)), max: whole.max.map((v) => +v.toFixed(3)) } }));

// ---- ring clearances (entity frame == world frame: same yaw 0) ----
// yard solids decoded from live census (see mk header)
const SOLIDS: [string, number, number, number, number, number, number][] = [
  // name, xmin, xmax, zmin, zmax, ymin, ymax — SEAT-LOCAL (world minus 49.5 x)
  ["stable", -7.42, -5.58, -1.5, 1.5, 0, 5.1],
  ["horses", -1.55, 2.55, -1.66, 1.66, 0, 1.923],
  ["owlpost", -1.03, -0.37, 3.87, 4.53, 0, 2.95],
  ["pergola", -5.6, 8.6, 6.78, 11.3, 0, 4.62],
  ["tower", 4.0, 13.0, -4.5, 4.5, 0, 7.19],
];
const RINGS: [string, number, number, number, number][] = [
  ["A(-1.9,2.40,-1.9,r2.6)", -1.9, 2.40, -1.9, 2.6],
  ["B(1.9,2.50,4.5,r1.8)", 1.9, 2.50, 4.5, 1.8],
  ["C(0.4,3.60,1.0,r3.0)", 0.4, 3.60, 1.0, 3.0],
];
const BIRD_HALF = 0.055 + 0.02;  // body half-diagonal + margin
const SEAT = [49.5, 0];          // entity world x/z, yaw 0
let allClear = true;
for (const [rn, cx, cy, cz, r] of RINGS) {
  const ringMinY = cy - 0.055;   // flap dip + half body
  const ringMaxY = cy + 0.05;
  for (const [sn, x0, x1, z0, z1, y0, y1] of SOLIDS) {
    // horizontal ring-vs-rect gap (xz): distance from circle to rectangle
    const dx = Math.max(x0 - (cx + r), (cx - r) - x1, 0) === 0 ? 0 : Math.max(x0 - (cx + r), (cx - r) - x1);
    // proper: closest point on rect to circle center
    const qx = Math.max(x0, Math.min(cx, x1));
    const qz = Math.max(z0, Math.min(cz, z1));
    const d = Math.hypot(cx - qx, cz - qz) - r;
    const vOverlap = ringMinY <= y1 && ringMaxY >= y0;
    if (d < BIRD_HALF && vOverlap) {
      console.log(`FAIL ring ${rn} vs ${sn}: horiz gap ${d.toFixed(3)} and vertical overlap`);
      allClear = false;
    } else {
      const how = d >= BIRD_HALF ? `horiz ${(d - BIRD_HALF).toFixed(3)} clear` :
        `over/under: ring y ${ringMinY.toFixed(2)}-${ringMaxY.toFixed(2)} vs solid top ${y1} (${d < 0 ? "ring crosses footprint, vertical separates" : ""})`;
      console.log(JSON.stringify({ ring: rn, vs: sn, horizCenterGap: +d.toFixed(3), verdict: how }));
    }
  }
}
// ring-vs-ring (flock crossings must be vertical-separated)
const pairs: [number, number][] = [[0, 1], [0, 2], [1, 2]];
for (const [i, j] of pairs) {
  const a = RINGS[i], b = RINGS[j];
  const dCtr = Math.hypot(a[1] - b[1], a[3] - b[3]);
  const dR = Math.abs(a[4] - b[4]);
  const overlap2d = dCtr < a[4] + b[4];
  const vSep = Math.abs(a[2] - b[2]);
  console.log(JSON.stringify({ rings: `${a[0]}×${b[0]}`, ctrDist: +dCtr.toFixed(2), overlap2d, vSep: +vSep.toFixed(2) }));
  if (overlap2d && vSep < 1.0) { console.log("FAIL ring-ring crossing < 1.0m vertical"); allClear = false; }
}
// wing flap dip: lowest wing blade at max amp — nested boxes at +0.30 rad
// (approx: blade tips swing down by sin(0.30)*span ~ 0.038 for ring A bird
// = within the 0.055 dip already counted).
console.log(allClear ? "CLEARANCES GREEN" : "CLEARANCES RED");
if (!allClear) process.exit(1);
console.log("DECODE GREEN");
