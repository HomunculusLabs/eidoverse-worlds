// dress95-decode-rainbarrel.ts — decode audit for
// nx-dress-nw-rainbarrel-001 (v1 f02560e3). Chassis: dress94-decode.
// Verifies from the ACTUAL built bytes:
//   1. grounded envelope + node budget + furniture-scale footprint
//   2. barrel buckets present (STAVE / IRON / TIMBER / CUT / WATER)
//   3. barrel rim crest above water disc (water recessed, rim-occlusion law
//      accepted; water must NOT crest the rim)
//   4. stand top surface below barrel base? (barrel sits ON planks: TIMBER
//      top ~0.15; barrel STAVE base ~0.15)
//   5. pail STAVE cylinder separate from barrel body (gap in xz)
//   6. spigot IRON at front (+z) below rim (gravity-honest)
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

const lin = (b: number) => {
  const c = b / 255;
  const l = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return l * 255;
};
type C3 = [number, number, number];
const hex3 = (h: number): C3 => [lin((h >> 16) & 255), lin((h >> 8) & 255), lin((h & 255))];
const PALETTE: Record<string, C3> = {
  STAVE: hex3(0x7d6a4d), IRON: hex3(0x4a4a50), TIMBER: hex3(0x6f6432),
  CUT: hex3(0xe8e2cc), WATER: hex3(0x506a78),
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

const histS = [...byMat.entries()].map(([n, a]) => `${n}:${a.length}`).join(" ");
console.log(`nodes=${root.children.length} verts=${verts} | ${histS}`);

const stave = byMat.get("STAVE") ?? [];
const iron = byMat.get("IRON") ?? [];
const timber = byMat.get("TIMBER") ?? [];
const cut = byMat.get("CUT") ?? [];
const water = byMat.get("WATER") ?? [];

const gsz = gbox.getSize(new THREE.Vector3());
check("grounded", gbox.min.y > -0.05 && gbox.min.y < 0.02, `global y min ${gbox.min.y.toFixed(3)} (embed band)`);
check("node-budget", root.children.length >= 3 && root.children.length <= 25, `${root.children.length} nodes (3-25 dressing law)`);
check("footprint", gsz.x <= 4.2 && gsz.z <= 4.2 && gsz.y <= 1.6, `${gsz.x.toFixed(2)} x ${gsz.z.toFixed(2)} m, h ${gsz.y.toFixed(2)}`);
check("buckets-present", stave.length > 50 && iron.length > 30 && timber.length > 30 && cut.length > 10 && water.length > 20,
  `stave ${stave.length} / iron ${iron.length} / timber ${timber.length} / cut ${cut.length} / water ${water.length}`);

// 3. water recessed below rim: water top < highest stave y near rim radius
if (water.length && stave.length) {
  const wTop = Math.max(...water.map((p) => p.y));
  const rimY = Math.max(...stave.map((p) => p.y));
  check("water-recessed", wTop < rimY - 0.02, `water top ${wTop.toFixed(3)} vs stave rim ${rimY.toFixed(3)} (recess ${(rimY - wTop).toFixed(3)}m)`);
}

// 4. barrel sits on planks: min stave y (barrel) ~= timber top
if (stave.length && timber.length) {
  const barrelBase = Math.min(...stave.filter((p) => p.y > 0.1).map((p) => p.y));
  const plankTop = Math.max(...timber.map((p) => p.y));
  check("barrel-on-planks", Math.abs(barrelBase - plankTop) < 0.04, `barrel base ${barrelBase.toFixed(3)} vs plank top ${plankTop.toFixed(3)}`);
}

// 5. pail separated from barrel in xz (two stave clusters)
if (stave.length) {
  const barrelPts = stave.filter((p) => p.y > 0.3);
  const pailPts = stave.filter((p) => p.y < 0.3);
  check("pail-distinct-cluster", pailPts.length > 20 && barrelPts.length > 50,
    `barrel ${barrelPts.length} verts above 0.3 / pail ${pailPts.length} below`);
  if (pailPts.length && barrelPts.length) {
    const pCx = pailPts.reduce((s, p) => s + p.x, 0) / pailPts.length;
    const pCz = pailPts.reduce((s, p) => s + p.z, 0) / pailPts.length;
    const bCx = barrelPts.reduce((s, p) => s + p.x, 0) / barrelPts.length;
    const bCz = barrelPts.reduce((s, p) => s + p.z, 0) / barrelPts.length;
    check("pail-offset", Math.hypot(pCx - bCx, pCz - bCz) > 0.25, `pail centroid offset ${Math.hypot(pCx - bCx, pCz - bCz).toFixed(3)}m from barrel`);
  }
}

// 6. spigot iron below rim at +z face
if (iron.length) {
  const spigot = iron.filter((p) => p.z > 0.35 && p.y < 0.5);
  check("spigot-low-front", spigot.length > 5, `${spigot.length} iron verts at +z front below 0.5 (spigot + handle)`);
}

console.log(failures.length ? `DECODE FAIL (${failures.join(", ")})` : "DECODE ALL PASS");
process.exit(failures.length ? 1 : 0);
