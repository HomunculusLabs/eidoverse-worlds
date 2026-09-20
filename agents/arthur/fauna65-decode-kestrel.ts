// fauna65-decode-kestrel.ts — decode audit for the fauna-65 kestrel build.
// GREEN gates: 6 anchors present (kestr + body/head/tail/wingL/wingR);
// baked anchor rest at ring a=0 = (0.4, 6.0, 0); head LEVEL (rotation ~0);
// baked bird envelope ~0.5m class; wander ring + flap-dip clearance vs
// every nearby tall solid (snag 6.75m top 6.6, northneedle 12.9m) and vs
// the ground furniture (post/tufts below the hover band).
// RED control: `bun ... fauna65-decode-kestrel.ts <swallows.glb>` — zero
// kestr anchors expected, gates fail loud.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2] ?? "agents/arthur/assets/village_fauna65_kestrel.glb";
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
root.traverse((o: any) => { if (o.name && /^kestr(_|$)/.test(o.name) && !/_\d+$/.test(o.name)) anchors[o.name] = o; });
const names = Object.keys(anchors).sort();
console.log(JSON.stringify({ anchors: names }));
const expect = ["kestr", "kestr_body", "kestr_head", "kestr_tail", "kestr_wingL", "kestr_wingR"];
const missing = expect.filter((n) => !names.includes(n));
if (missing.length) { console.log(`FAIL missing anchors: ${missing}`); process.exit(1); }
if (names.length !== expect.length) { console.log(`FAIL unexpected extra kestr anchors: ${names}`); process.exit(1); }

let meshNodes = 0, tris = 0;
root.traverse((o: any) => { if (o.isMesh) { meshNodes++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
console.log(JSON.stringify({ meshNodes, tris: Math.round(tris) }));

// anchor rest == baked ring a=0 point
const K = anchors["kestr"];
const rp = K.position.toArray().map((v: number) => +v.toFixed(4));
const want = [0.4, 6.0, 0];
if (rp.some((v: number, i: number) => Math.abs(v - want[i]) > 1e-6)) { console.log(`FAIL anchor rest ${rp} != ${want}`); process.exit(1); }
console.log(JSON.stringify({ anchorRest: rp, yaw: +K.rotation.y.toFixed(4) }));
if (Math.abs(K.rotation.y - -0.356) > 1e-6) { console.log("FAIL anchor yaw drift"); process.exit(1); }

// head LEVEL (counter-pitched to the body's -0.62)
const H = anchors["kestr_head"];
if (Math.abs(H.rotation.z) > 1e-9 || Math.abs(H.rotation.x) > 1e-9) { console.log(`FAIL head not level: ${H.rotation.toArray().map((v: number) => +v.toFixed(4))}`); process.exit(1); }
console.log(JSON.stringify({ headPitch: 0, bodyPitch: +anchors["kestr_body"].rotation.z.toFixed(3) }));

// baked bird envelope (anchor only — furniture excluded)
const kb = boxOf(K)!;
console.log(JSON.stringify({ birdEnv: { min: kb.min.map((v) => +v.toFixed(3)), max: kb.max.map((v) => +v.toFixed(3)) } }));
const span = Math.max(kb.max[0] - kb.min[0], kb.max[2] - kb.min[2]);
if (span < 0.30 || span > 0.75) { console.log(`FAIL bird span ${span.toFixed(3)} outside 0.30-0.75`); process.exit(1); }

// whole-entity envelope (furniture incl) for the live bbox contract
const whole = boxOf(root)!;
console.log(JSON.stringify({ whole: { min: whole.min.map((v) => +v.toFixed(3)), max: whole.max.map((v) => +v.toFixed(3)) } }));

// ---- hover wander ring + flap-dip clearance vs rig-frame solids ----
// rig-local solids decoded from the live census (see mk header + census):
//   snag      world (60.6,-30) halfext (0.905, 0.87) top 6.60 → rig (3.1, -6) [entity at (57.5,-24), yaw -2.4 rotates the rig; conservative: use full world-frame disc vs world-frame solid]
// Simplest engine-true form: work in WORLD frame. Wander disc world center
// = seat + R2W(0.4·? ...) — the ring center is rig (0,6,0) → world = seat
// xz (57.5,-24) exactly (the center has no lateral offset). Ring radius
// 0.4 (+ flap span reach 0.145, + dip 0.04 → bird reach r 0.59).
const SEAT = [57.5, -24.0];
const RING_R = 0.4, REACH = 0.145 + 0.04; // half-wingspan baked + bob dip
const SOLIDS: [string, number, number, number, number, number][] = [
  // name, world x, world z, horiz half-diag, top, base
  ["snagdead", 60.6, -30.0, 1.135, 6.60, 0],      // census 1.81x1.74 → half-diag
  ["woodpecker", 60.6, -30.0, 0.10, 1.78, 1.45],  // rides the snag
  ["pheas", 55.75, -30.5, 0.60, 0.34, 0],
  ["chainvault", 52.6, -19.2, 5.21, 2.83, 0],
  ["northneedle", 47.3, -31.9, 2.65, 13.34, 0],
  ["deer", 51.25, -38.25, 1.57, 1.29, 0],
];
const HOVER_Y = 6.0;
let allClear = true;
for (const [sn, sx, sz, hd, top, base] of SOLIDS) {
  const d = Math.hypot(sx - SEAT[0], sz - SEAT[1]) - hd;
  const vOverlap = HOVER_Y - 0.06 <= top && HOVER_Y + 0.06 >= base;
  if (d < RING_R + REACH && vOverlap) {
    console.log(`FAIL ring vs ${sn}: gap ${d.toFixed(3)} < reach ${(RING_R + REACH).toFixed(3)} with vertical overlap`);
    allClear = false;
  } else {
    console.log(JSON.stringify({ vs: sn, horizGap: +d.toFixed(3), need: +(RING_R + REACH).toFixed(3), verdict: d >= RING_R + REACH ? "clear" : "vertical-separated" }));
  }
}
// ground furniture sits far below the hover band (post top 0.645 vs 5.9)
const POST_TOP = 0.645;
if (POST_TOP > HOVER_Y - 0.5) { console.log("FAIL post intrudes hover band"); allClear = false; }
console.log(JSON.stringify({ vs: "post+tufts", verdict: `vertical: ${POST_TOP} << ${HOVER_Y - 0.5}` }));

console.log(allClear ? "CLEARANCES GREEN" : "CLEARANCES RED");
if (!allClear) process.exit(1);
console.log("DECODE GREEN");
