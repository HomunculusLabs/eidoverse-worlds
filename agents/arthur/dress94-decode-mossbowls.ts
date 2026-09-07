// dress94-decode-mossbowls.ts — v11 decode audit for nx-dress-se-mossbowls-001.
// Chassis: improve44-decode-orchard.ts + COLOR_0 bucket law. glbwrite bakes
// sRGB hex into COLOR_0 bytes; three's GLTFLoader returns them LINEAR-encoded
// raw in .array (normalized attribute; denormalization happens in shader).
// Classify verts by nearest palette color in linear space.
// Verifies from the ACTUAL built bytes:
//   1. tongue apex plants MID landing patch (nearest MOSS_L vertex to
//      T(0.52, 0.008, -1.00) deep inside the patch56 disc, below its crown)
//   2. pool disc at (-1.18, -0.55), thin film, fully clear of low geometry
//   3. grounded envelope, node budget, footprint
// Read-only. Exit 0 = all checks pass.
import * as THREE from "three";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.argv[2] ?? "");
const bytes = readFileSync(path);

const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const root = gltf.scene;
root.updateMatrixWorld(true);

const failures: string[] = [];
const check = (name: string, ok: boolean, detail: string) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name} — ${detail}`);
  if (!ok) failures.push(name);
};

// sRGB byte -> linear byte (the transfer function three applies)
const lin = (b: number) => {
  const c = b / 255;
  const l = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return l * 255;
};
type C3 = [number, number, number];
const hex3 = (h: number): C3 => [lin((h >> 16) & 255), lin((h >> 8) & 255), lin(h & 255)];
const PALETTE: Record<string, C3> = {
  STONE: hex3(0x8b877e), STONE2: hex3(0x979288), STONE3: hex3(0x7d786f),
  STONE_D: hex3(0x5b564e), MOSS: hex3(0x679a52), MOSS_L: hex3(0x8db877),
  MOSS_Q: hex3(0x54793f), SOIL: hex3(0x54493b), WATER: hex3(0x506a78), TWIG: hex3(0x71644a),
};
const classify = (c: C3): string | null => {
  let best = Infinity, name: string | null = null;
  for (const [n, p] of Object.entries(PALETTE)) {
    const d = Math.abs(c[0] - p[0]) + Math.abs(c[1] - p[1]) + Math.abs(c[2] - p[2]);
    if (d < best) { best = d; name = n; }
  }
  return best < 12 ? name : null;
};

const V = new THREE.Vector3();
interface Pt { x: number; y: number; z: number }
const byMat = new Map<string, Pt[]>();
const push = (n: string, p: Pt) => { const a = byMat.get(n) ?? []; a.push(p); byMat.set(n, a); };
let verts = 0;
const gbox = new THREE.Box3();
root.traverse((o: any) => {
  if (!o.isMesh) return;
  const g = o.geometry as THREE.BufferGeometry;
  const pos = g.getAttribute("position");
  const col = g.getAttribute("color");
  verts += pos.count;
  const arr = pos.array as Float32Array;
  const carr = col ? (col.array as ArrayLike<number>) : null;
  for (let i = 0; i < pos.count; i++) {
    V.set(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]).applyMatrix4(o.matrixWorld);
    gbox.expandByPoint(V);
    if (!carr) continue;
    const c: C3 = [carr[i * col.itemSize], carr[i * col.itemSize + 1], carr[i * col.itemSize + 2]];
    const n = classify(c);
    if (n) push(n, { x: V.x, y: V.y, z: V.z });
  }
});

const waterPts = byMat.get("WATER") ?? [];
const mossLPts = byMat.get("MOSS_L") ?? [];
const histS = [...byMat.entries()].map(([n, a]) => `${n}:${a.length}`).join(" ");
console.log(`nodes=${root.children.length} verts=${verts} | ${histS}`);
check("buckets-present", waterPts.length > 30 && mossLPts.length > 30, `water ${waterPts.length} / mossL ${mossLPts.length} classified verts`);

// global envelope
const gsz = gbox.getSize(new THREE.Vector3());
check("grounded", gbox.min.y > -0.05 && gbox.min.y < 0.02, `global y min ${gbox.min.y.toFixed(3)} (embed band)`);
check("node-budget", root.children.length >= 3 && root.children.length <= 25, `${root.children.length} nodes (3-25 dressing law)`);
check("footprint", gsz.x <= 4.2 && gsz.z <= 4.2, `${(gsz.x).toFixed(2)} x ${(gsz.z).toFixed(2)} m`);

// 1. tongue: nearest MOSS_L vertex to target apex T(0.52, 0.008, -1.00)
let best = Infinity, bestV: Pt = { x: 0, y: 0, z: 0 };
for (const p of mossLPts) {
  const d = Math.hypot(p.x - 0.52, p.y - 0.008, p.z + 1.00);
  if (d < best) { best = d; bestV = p; }
}
check("tongue-apex-mid-patch", best < 0.06, `nearest MOSS_L vertex to T(0.52,0.008,-1.00): d=${best.toFixed(3)} at (${bestV.x.toFixed(3)}, ${bestV.y.toFixed(3)}, ${bestV.z.toFixed(3)})`);

// tongue plants INTO patch56 disc: MOSS_L vertex inside the disc, low y
const inside = mossLPts.find((p) => {
  const dx = (p.x - 0.52) / 0.30, dz = (p.z + 1.00) / 0.24;
  return dx * dx + dz * dz < 1 && p.y < 0.09;
});
check("tongue-plants-into-patch", !!inside, inside ? `MOSS_L vertex inside patch56 disc at (${inside.x.toFixed(3)}, ${inside.y.toFixed(3)}, ${inside.z.toFixed(3)})` : "none inside");

// 2. pool: thin disc at (-1.18, -0.55), all verts low
if (waterPts.length) {
  const xs = waterPts.map((p) => p.x), zs = waterPts.map((p) => p.z), ys = waterPts.map((p) => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const radX = (Math.max(...xs) - Math.min(...xs)) / 2;
  check("pool-center", Math.abs(cx + 1.18) < 0.05 && Math.abs(cz + 0.55) < 0.05, `pool center (${cx.toFixed(3)}, ${cz.toFixed(3)}) expect (-1.18, -0.55), r≈${radX.toFixed(3)}`);
  check("pool-thin", Math.max(...ys) - Math.min(...ys) < 0.03, `pool y-extent ${(Math.max(...ys) - Math.min(...ys)).toFixed(3)}`);
  // pool clear of other low geometry: any STONE*/SOIL/TWIG vert inside pool
  // xz-range + 0.03 margin (moss families may kiss the edge naturally)
  const x0 = Math.min(...xs) - 0.03, x1 = Math.max(...xs) + 0.03, z0 = Math.min(...zs) - 0.03, z1 = Math.max(...zs) + 0.03;
  const clash: { p: Pt; m: string }[] = [];
  for (const [m, pts] of byMat) {
    if (m === "WATER" || m.startsWith("MOSS")) continue;
    for (const p of pts) {
      if (p.y < 0.15 && p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) clash.push({ p, m });
    }
  }
  check("pool-clear-of-geometry", clash.length === 0, clash.length === 0 ? "no stone/soil/twig vertex inside the pool disc margin" : `${clash.length} clash (${clash[0].m} at ${clash[0].p.x.toFixed(3)}, ${clash[0].p.y.toFixed(3)}, ${clash[0].p.z.toFixed(3)})`);
}

console.log(failures.length === 0 ? "DECODE AUDIT ALL PASS" : `DECODE AUDIT FAIL (${failures.join(", ")})`);
process.exit(failures.length === 0 ? 0 : 1);
