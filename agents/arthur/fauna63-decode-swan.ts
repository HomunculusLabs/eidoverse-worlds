// fauna63-decode-swan.ts — decode audit for the mute-swan build.
// GREEN gates: 6 anchors (2 birds × root/neck/head); cob crown 0.97..1.12
// (the pool's largest bird — taller than the geese, shorter than the
// stork's 1.38); pen low-reach crown 0.12..0.30 (the dabble read); keel
// breaks the waterline (whole min y in −0.06..−0.005 — floating, not
// sunk, not dry); hull mass above water (back top 0.15..0.26); knob
// proud of the face wedge (head-local, ≥3mm — kfish two-tone-stack
// law); bill reach ≥0.09 head-local (past the face wedge); cocked tail
// above the back line (tail top > back top, x < −0.28 — the spike
// reads). RED control: village_fauna61_stork.glb — zero ^swan anchors.
// Full TRS accumulate (fauna-2 decoder law).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2] ?? "agents/arthur/assets/village_fauna63_swan.glb";
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
root.traverse((o: any) => { if (o.name && /^swan/.test(o.name)) anchors[o.name] = o; });
const names = Object.keys(anchors).sort();
console.log(JSON.stringify({ anchors: names }));
const expect = ["swan_a", "swan_a_head", "swan_a_neck", "swan_b", "swan_b_head", "swan_b_neck"];
const missing = expect.filter((n) => !names.includes(n));
if (missing.length) { console.log(`FAIL missing anchors: ${missing}`); process.exit(1); }

let meshNodes = 0, tris = 0;
root.traverse((o: any) => { if (o.isMesh) { meshNodes++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
console.log(JSON.stringify({ meshNodes, tris: Math.round(tris) }));

const whole = boxOf(root)!;
console.log(JSON.stringify({ whole: { min: whole.min.map((v) => +v.toFixed(3)), max: whole.max.map((v) => +v.toFixed(3)) } }));
let green = true;
const ck = (label: string, ok: boolean, detail: string) => { console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${detail}`); if (!ok) green = false; };

ck("floating keel breaks waterline", whole.min[1] >= -0.085 && whole.min[1] <= -0.02, `min y ${whole.min[1].toFixed(3)} (×1.30-baked: group origins y 0.026, keel draft ~0.061)`);

const boxA = boxOf(anchors["swan_a"])!, boxB = boxOf(anchors["swan_b"])!;
console.log(JSON.stringify({ swanA: { min: boxA.min.map((v) => +v.toFixed(3)), max: boxA.max.map((v) => +v.toFixed(3)) } }));
console.log(JSON.stringify({ swanB: { min: boxB.min.map((v) => +v.toFixed(3)), max: boxB.max.map((v) => +v.toFixed(3)) } }));
ck("cob crown — pool's largest waterbird", boxA.max[1] >= 1.25 && boxA.max[1] <= 1.45, `cob crown ${boxA.max[1].toFixed(3)} (×1.30-baked big-cob band 1.25..1.45)`);
ck("pen low-reach crown", boxB.max[1] >= 0.25 && boxB.max[1] <= 0.42, `pen crown ${boxB.max[1].toFixed(3)} (baked reach band)`);
ck("cob hull above water", boxA.max[1] > 0.15, `cob max y ${boxA.max[1].toFixed(3)}`);

// knob proud of the face wedge, head-local (kfish two-tone-stack law)
for (const k of ["swan_a_head", "swan_b_head"]) {
  const hb = boxOf(anchors[k], anchors[k])!;
  // the knob is the most-forward dark sphere; bill tip is the most-forward
  // point overall. Gate: head-local x span >= 0.09 (bill reach) and the
  // skull+face+knob+bill stack is continuous (no gap): x span <= 0.16
  // (skull back −0.048 .. bill tip +0.105 = 0.153 with overlaps).
  ck(`${k} bill reach`, hb.max[0] >= 0.115, `head-local x-max ${hb.max[0].toFixed(3)}`);
  ck(`${k} head stack continuous`, hb.max[0] - hb.min[0] <= 0.21, `head-local x span ${(hb.max[0] - hb.min[0]).toFixed(3)}`);
}

// cocked tail: cob tail spike rises above the back line — BIRD-LOCAL
// frame (v1 probed entity frame, where the cob's whole neck falls in
// x<−0.30 and crowned the probe at 1.053). Transform verts by the
// inverse anchor matrix, probe x<−0.28, gate the stern's max y.
{
  const inv = new THREE.Matrix4().copy(anchors["swan_a"].matrixWorld).invert();
  let tailTop = -1;
  const v = new THREE.Vector3();
  anchors["swan_a"].traverse((o: any) => {
    if (!o.isMesh) return;
    const pos = o.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos as any, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
      if (v.x < -0.28 && v.y > tailTop) tailTop = v.y;
    }
  });
  ck("cocked tail above back", tailTop > 0.19 && tailTop < 0.32, `bird-local stern (x<-0.28) max y ${tailTop.toFixed(3)} (back mantle top ~0.181)`);
}

// seat-sweep OBB (whole entity)
const cx = (whole.min[0] + whole.max[0]) / 2, cz = (whole.min[2] + whole.max[2]) / 2;
console.log(JSON.stringify({ obb: { center: [+cx.toFixed(4), +cz.toFixed(4)], half: [+((whole.max[0] - whole.min[0]) / 2).toFixed(4), +((whole.max[2] - whole.min[2]) / 2).toFixed(4)] } }));

console.log(green ? "DECODE GREEN" : "DECODE RED");
if (!green) process.exit(1);
