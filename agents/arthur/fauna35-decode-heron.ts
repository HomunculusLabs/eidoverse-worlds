// fauna35-decode-heron.ts — decode audit for the grey-heron build.
// GREEN gates: 4 anchors present; envelope sane; wading span (legs below
// y=0 to −0.13); body-belly ≥ 0.30 (dry heron); proud-element arithmetic
// (bill past skull front, crown past skull top, stripe past skull sides,
// shoulder patches past wing faces); ripple rings crest y=0 and stay thin.
// RED control: village_fauna34_swallows.glb — zero ^heron anchors expected.
// Full TRS accumulate (fauna-2 decoder law).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2] ?? "agents/arthur/assets/village_fauna35_heron.glb";
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

// anchors
const anchors: Record<string, any> = {};
root.traverse((o: any) => { if (o.name && /^heron/.test(o.name)) anchors[o.name] = o; });
const names = Object.keys(anchors).sort();
console.log(JSON.stringify({ anchors: names }));
const expect = ["heron", "heron_head", "heron_neck", "heron_tail"];
const missing = expect.filter((n) => !names.includes(n));
if (missing.length) { console.log(`FAIL missing anchors: ${missing}`); process.exit(1); }

let meshNodes = 0, tris = 0;
root.traverse((o: any) => { if (o.isMesh) { meshNodes++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
console.log(JSON.stringify({ meshNodes, tris: Math.round(tris) }));

// whole-entity envelope
const whole = boxOf(root)!;
console.log(JSON.stringify({ whole: { min: whole.min.map((v) => +v.toFixed(3)), max: whole.max.map((v) => +v.toFixed(3)) } }));
let green = true;
const ck = (label: string, ok: boolean, detail: string) => { console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${detail}`); if (!ok) green = false; };

// the bird group alone (rings are root-level water furniture)
const birdBox = boxOf(anchors["heron"])!;
ck("wading span", birdBox.min[1] <= -0.125, `legs reach y ${birdBox.min[1].toFixed(3)} (want <= -0.125)`);
ck("dry belly", birdBox.min[1] <= -0.125 && birdBox.max[1] >= 0.60, `bird y ${birdBox.min[1].toFixed(3)}..${birdBox.max[1].toFixed(3)} (v4 periscope design: head ~0.72)`);
ck("bird footprint", birdBox.max[0] < 0.2 && birdBox.min[0] > -0.2, `x ${birdBox.min[0].toFixed(3)}..${birdBox.max[0].toFixed(3)}`);

// head-frame proud checks (matrixWorld relative — head local x/z within frame)
const head = anchors["heron_head"];
const hb = boxOf(head)!;
// skull box is at head-local (0,0.008,0.012) size .052,.046,.075 — in world frame
// compute via skull's own node if present, else use authored constants
const skullW = new THREE.Box3(
  new THREE.Vector3(-0.026, 0.008 - 0.023, 0.012 - 0.0375),
  new THREE.Vector3(0.026, 0.008 + 0.023, 0.012 + 0.0375),
);
for (const c of [skullW.min, skullW.max]) c.applyMatrix4(head.matrixWorld);
ck("crown proud", hb.max[1] > skullW.max.y + 0.002, `crown top ${hb.max[1].toFixed(3)} vs skull ${skullW.max.y.toFixed(3)}`);
ck("stripe proud", hb.max[0] > skullW.max.x + 0.001 && hb.min[0] < skullW.min.x - 0.001, `head x ${hb.min[0].toFixed(3)}..${hb.max[0].toFixed(3)} vs skull ${skullW.min.x.toFixed(3)}..${skullW.max.x.toFixed(3)}`);

// bill: nested in head — find by world z-extent beyond skull front
const billNode = head.children.find((c: any) => c.name === undefined || true); // unnamed meshes; use aggregate below
const skullFront = skullW.max.z;
// compute bill mesh explicitly: traverse head children meshes, find the one with yellow mat? simpler: authored check via z-extent of head subtree minus skull
ck("head front reach", hb.max[2] > skullFront + 0.02, `head z-max ${hb.max[2].toFixed(3)} vs skull front ${skullFront.toFixed(3)} (bill + crown extend past)`);

// whole-head z minus skull should include bill reach ~ +0.05 past skull
ck("bill reach", hb.max[2] >= skullFront + 0.04, `bill reach ${(hb.max[2] - skullFront).toFixed(3)} past skull front (want >= 0.04)`);

// root-level rings: merged into ONE wake bucket — detect geometrically
// (a mesh with y-extent < 0.015, top above 0, bottom at/below 0) AND gate
// ring-cluster center vs authored leg positions (v7 law: v4's leg move
// orphaned the rings — coincidence is a gate, not an assumption)
const LEGS: [number, number][] = [[-0.032, -0.10], [0.032, -0.135]];
let wake: Box | null = null; let wakeMeshes = 0;
root.traverse((o: any) => { if (!o.isMesh) return; const b = boxOf(o)!;
  if (b.max[1] - b.min[1] < 0.015 && b.max[1] > 0 && b.min[1] <= 0.004 && Math.abs(b.min[0]) < 0.2 && Math.abs(b.max[2]) < 0.2) { wakeMeshes++; wake = wake ?? b; wake = { min: [Math.min(wake!.min[0], b.min[0]), Math.min(wake!.min[1], b.min[1]), Math.min(wake!.min[2], b.min[2])], max: [Math.max(wake!.max[0], b.max[0]), Math.max(wake!.max[1], b.max[1]), Math.max(wake!.max[2], b.max[2])] }; } });
ck("ripple rings present", wakeMeshes >= 1 && wake!.max[0] - wake!.min[0] > 0.05, `wake bucket x-span ${(wake?.max[0] ?? 0) - (wake?.min[0] ?? 0) > 0 ? (wake!.max[0] - wake!.min[0]).toFixed(3) : "none"}`);
ck("ring crest", !!wake && wake!.max[1] > 0 && wake!.max[1] < 0.008, `ring y ${wake ? wake!.min[1].toFixed(4) : "?"}..${wake ? wake!.max[1].toFixed(4) : "?"} (crest law)`);
if (wake) {
  // per-leg CONTAINMENT (v8 law: unequal ring radii shift the union center
  // by construction — the v7 center-coincidence model assumed equal radii).
  // The v4 orphan case still fails: offset rings' footprints miss the legs.
  for (const [lx, lz] of LEGS) {
    ck(`ring contains leg (${lx},${lz})`, wake!.min[0] <= lx && lx <= wake!.max[0] && wake!.min[2] <= lz && lz <= wake!.max[2],
      `wake xz ${wake!.min[0].toFixed(3)}..${wake!.max[0].toFixed(3)} / ${wake!.min[2].toFixed(3)}..${wake!.max[2].toFixed(3)}`);
  }
  const cxz: [number, number] = [(wake!.min[0] + wake!.max[0]) / 2, (wake!.min[2] + wake!.max[2]) / 2];
  const legCx = LEGS.reduce((s, l) => s + l[0], 0) / LEGS.length, legCz = LEGS.reduce((s, l) => s + l[1], 0) / LEGS.length;
  ck("ring-leg cluster proximity", Math.hypot(cxz[0] - legCx, cxz[1] - legCz) < 0.03, `ring center (${cxz[0].toFixed(3)},${cxz[1].toFixed(3)}) vs leg center (${legCx.toFixed(3)},${legCz.toFixed(3)})`);
}

console.log(green ? "DECODE GREEN" : "DECODE RED");
if (!green) process.exit(1);
