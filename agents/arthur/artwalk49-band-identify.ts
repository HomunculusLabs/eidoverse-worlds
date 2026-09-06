// artwalk-49 band classification, step 2: name the intruding nodes.
// For dyehouse (b9) and windmill (b10): list NAMED nodes + materials whose
// bbox intersects the rider band, so intrusion can be classified honestly.
import { readFileSync } from "node:fs";
const A = (p: string) => readFileSync(`agents/arthur/assets/${p}`);

function nodesIn(b: Buffer, band: { min: number[]; max: number[] }, label: string) {
  const jsonLen = Number(new DataView(b.buffer, b.byteOffset + 12, 4).getUint32(0, true));
  const j = JSON.parse(new TextDecoder().decode(b.subarray(20, 20 + jsonLen)));
  const BIN = 20 + jsonLen + 8;
  const acc = (i: number) => {
    const a = j.accessors[i]; const bv = j.bufferViews[a.bufferView];
    const off = BIN + (bv.byteOffset || 0) + (a.byteOffset || 0);
    const dv = new DataView(b.buffer, b.byteOffset + off, a.count * 12);
    const out: number[][] = [];
    for (let k = 0; k < a.count; k++) out.push([dv.getFloat32(k * 12, true), dv.getFloat32(k * 12 + 4, true), dv.getFloat32(k * 12 + 8, true)]);
    return out;
  };
  const hit = (mn: number[], mx: number[]) => mn.every((v, i) => v <= band.max[i]) && mx.every((v, i) => v >= band.min[i]);
  console.log(`### ${label}`);
  const stack: Array<[number, number[], string]> = j.scenes[0].nodes.map((n: number) => [n, [0, 0, 0], ""]);
  while (stack.length) {
    const [ni, tr, path] = stack.pop()!;
    const n = j.nodes[ni];
    const t = n.translation ? [tr[0] + n.translation[0], tr[1] + n.translation[1], tr[2] + n.translation[2]] : tr;
    const nm = n.name ? (path ? path + "/" + n.name : n.name) : path;
    if (n.mesh !== undefined) {
      let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
      for (const prim of j.meshes[n.mesh].primitives) for (const v of acc(prim.attributes.POSITION)) {
        const w = [v[0] + t[0], v[1] + t[1], v[2] + t[2]];
        for (let a = 0; a < 3; a++) { if (w[a] < mn[a]) mn[a] = w[a]; if (w[a] > mx[a]) mx[a] = w[a]; }
      }
      if (hit(mn, mx)) {
        const mats = j.meshes[n.mesh].primitives.map((p: any) => p.material !== undefined ? (j.materials[p.material].name ?? `mat${p.material}`) : "-").join(",");
        console.log(`  ${nm || "(unnamed)"} verts bbox [${mn.map(v=>v.toFixed(3))}] [${mx.map(v=>v.toFixed(3))}] mats=${mats}`);
      }
    }
    for (const c of n.children ?? []) stack.push([c, t, nm]);
  }
}

// b9 loom rider: anchor (0,0.48,-0.77), own bbox 2.25 x 0.86 x 0.137 — anchor at CENTER per artwalk-19 decode (0.48 mid-height of 0.86)
const B9 = { min: [-1.125 - 0.05, 0.05 - 0.05, -0.8385 - 0.05], max: [1.125 + 0.05, 0.91 + 0.05, -0.7015 + 0.05] };
nodesIn(A("village_dyehouse3.glb"), B9, "b9 loom band in dyehouse (live 888be359)");

// b10 crown rider: anchor (0,2.22,2.62), bbox 2.25 x 0.65 x 0.17, anchor center
const B10 = { min: [-1.125 - 0.05, 2.22 - 0.325 - 0.05, 2.535 - 0.05], max: [1.125 + 0.05, 2.22 + 0.325 + 0.05, 2.705 + 0.05] };
nodesIn(A("village_windmill3.glb"), B10, "b10 crown band in windmill (live 09938360)");
