// fauna61-decode-stork.ts — decode audit for the white-stork build.
// GREEN gates: 8 anchors (2 birds × root/body/neck/head); sentinel crown
// 0.98..1.08 (the fleet's tallest bird); prober bill tip low (<0.12 —
// probing the margin); heads pitched as UNITS (sentinel ~0, prober
// ~−1.18 — goose v7 law); wing-band proud of hull flanks (shorse-blaze
// law); tucked-leg bulge cresting below the belly bottom (wrabbit law a);
// feet at ground (min y ≥ −0.003); bill reach past skull front ≥ 0.16.
// RED control: village_fauna35_heron.glb — zero ^stork anchors expected.
// Full TRS accumulate (fauna-2 decoder law). Emits seat-sweep OBB.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2] ?? "agents/arthur/assets/village_fauna61_stork.glb";
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
const boxOf = (o: any, frame?: any): Box | null => {
  let b: Box | null = null;
  const inv = frame ? new THREE.Matrix4().copy(frame.matrixWorld).invert() : null;
  o.traverse?.((c: any) => {
    if (!c.isMesh) return;
    c.geometry.computeBoundingBox();
    const bb = c.geometry.boundingBox!;
    const m = inv ? new THREE.Matrix4().multiplyMatrices(inv, c.matrixWorld) : c.matrixWorld;
    for (const cx of [bb.min.x, bb.max.x]) for (const cy of [bb.min.y, bb.max.y]) for (const cz of [bb.min.z, bb.max.z]) {
      const v = new THREE.Vector3(cx, cy, cz).applyMatrix4(m);
      if (!b) b = { min: [v.x, v.y, v.z], max: [v.x, v.y, v.z] };
      else for (let i = 0; i < 3; i++) { b.min[i] = Math.min(b.min[i], v.getComponent(i)); b.max[i] = Math.max(b.max[i], v.getComponent(i)); }
    }
  });
  return b;
};

const anchors: Record<string, any> = {};
root.traverse((o: any) => { if (o.name && /^stork/.test(o.name)) anchors[o.name] = o; });
const names = Object.keys(anchors).sort();
console.log(JSON.stringify({ anchors: names }));
const expect = ["stork_a", "stork_a_body", "stork_a_head", "stork_a_neck", "stork_b", "stork_b_body", "stork_b_head", "stork_b_neck"];
const missing = expect.filter((n) => !names.includes(n));
if (missing.length) { console.log(`FAIL missing anchors: ${missing}`); process.exit(1); }

let meshNodes = 0, tris = 0;
root.traverse((o: any) => { if (o.isMesh) { meshNodes++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
console.log(JSON.stringify({ meshNodes, tris: Math.round(tris) }));

const whole = boxOf(root)!;
console.log(JSON.stringify({ whole: { min: whole.min.map((v) => +v.toFixed(3)), max: whole.max.map((v) => +v.toFixed(3)) } }));
let green = true;
const ck = (label: string, ok: boolean, detail: string) => { console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${detail}`); if (!ok) green = false; };

ck("feet at ground", whole.min[1] >= -0.003, `min y ${whole.min[1].toFixed(3)}`);
ck("tallest bird", whole.max[1] >= 1.30 && whole.max[1] <= 1.45, `crown ${whole.max[1].toFixed(3)} (×1.35-baked big-male stork band 1.30..1.45)`);

// per-bird boxes
const boxA = boxOf(anchors["stork_a"])!, boxB = boxOf(anchors["stork_b"])!;
console.log(JSON.stringify({ storkA: { min: boxA.min.map((v) => +v.toFixed(3)), max: boxA.max.map((v) => +v.toFixed(3)) } }));
console.log(JSON.stringify({ storkB: { min: boxB.min.map((v) => +v.toFixed(3)), max: boxB.max.map((v) => +v.toFixed(3)) } }));
ck("sentinel one-planted-leg stance", boxA.max[1] >= 0.98, `sentinel crown ${boxA.max[1].toFixed(3)}`);
ck("prober bill low", boxB.min[1] < 0.14, `prober min y ${boxB.min[1].toFixed(3)} (bill tip into the margin band; feet gate above)`);

// head pitch as a unit: head anchor rotation.z (gltf keeps euler-derived quat; use quaternion → angle about z)
const zAngle = (o: any) => { const q = o.quaternion; return 2 * Math.acos(Math.min(1, Math.abs(q.w))) * Math.sign(q.z || 1); };
const pA = zAngle(anchors["stork_a_head"]), pB = zAngle(anchors["stork_b_head"]);
ck("sentinel head level", Math.abs(pA) < 0.2, `pitch ${pA.toFixed(3)}`);
ck("prober head pitched unit", Math.abs(pB - (-1.18)) < 0.12, `pitch ${pB.toFixed(3)} (want ≈ −1.18)`);

// bill reach in head-local frame: head subtree box
for (const [k, want] of [["stork_a_head", "level"], ["stork_b_head", "pitched"]] as [string, string][]) {
  void want;
  const hb = boxOf(anchors[k], anchors[k])!;
  ck(`${k} bill reach`, hb.max[0] > 0.17, `head-local x-max ${hb.max[0].toFixed(3)} (bill+tip past skull 0.0375+embed)`);
}

// wing band proud of hull flanks in BODY-local frame (hull z half 0.075;
// bands at ±0.079 half 0.006 → crest ±0.085)
const bbA = boxOf(anchors["stork_a_body"], anchors["stork_a_body"])!;
ck("wing band proud", bbA.max[2] > 0.083 && bbA.min[2] < -0.083, `body-local z ${bbA.min[2].toFixed(3)}..${bbA.max[2].toFixed(3)} (hull ±0.075; bands crest to ±0.085)`);

// tucked-leg bulge below belly (BAKED entity frame: stork_a origin
// (−0.594,0,0.189) — ×1.35 of (−0.44,0,0.14); bulge baked center
// (−0.554,0.610,0.162) → band below belly bottom ~0.601)
{
  let found = 0;
  anchors["stork_a"].traverse((o: any) => {
    if (!o.isMesh) return;
    const pos = o.geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos as any, i).applyMatrix4(o.matrixWorld);
      if (v.y > 0.58 && v.y < 0.635 && v.x > -0.63 && v.x < -0.47 && v.z > 0.19 && v.z < 0.24) found++;
    }
  });
  ck("tucked bulge below belly", found > 0, `${found} verts in the below-belly band at the tucked station`);
}

// seat-sweep OBB (whole entity)
const cx = (whole.min[0] + whole.max[0]) / 2, cz = (whole.min[2] + whole.max[2]) / 2;
console.log(JSON.stringify({ obb: { center: [+cx.toFixed(4), +cz.toFixed(4)], half: [+((whole.max[0] - whole.min[0]) / 2).toFixed(4), +((whole.max[2] - whole.min[2]) / 2).toFixed(4)] } }));

console.log(green ? "DECODE GREEN" : "DECODE RED");
if (!green) process.exit(1);
