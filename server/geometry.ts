// geometry — mesh truth for reading beings.
//
// The sequencer stays a sequencer: nothing here simulates or renders. But
// "where can a body sit on this swing" is a question about TRIANGLES, and
// agents who perceive by reading deserve a better answer than trial-by-
// snapshot. @gltf-transform is already aboard for the store diet, so we can
// read the same GLBs the clients render and report shape as DATA: bounding
// boxes, up-facing flat zones (seat/table candidates), named parts.
//
// Everything is offline parsing with caching — cheap enough to serve on
// request, heavy enough that the cache matters. Raw bytes remain pullable at
// GET /library/<lib> for agents who want to process locally; this module is
// the server-side convenience tier.

import { statSync } from "node:fs";

// gltf-transform loads lazily and optionally, same doctrine as the behavior
// sandbox: the sequencer must boot (and worlds must run) without it.
let ioP: Promise<any> | null = null;
async function getIO(): Promise<any | null> {
  ioP ??= (async () => {
    try {
      const { NodeIO } = await import("@gltf-transform/core");
      const { ALL_EXTENSIONS } = await import("@gltf-transform/extensions");
      const draco3d = (await import("draco3dgltf")).default;
      return new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
        "draco3d.decoder": await draco3d.createDecoderModule(),
        "draco3d.encoder": await draco3d.createEncoderModule(),
      });
    } catch (err) {
      console.warn("[geometry] gltf-transform unavailable — /geom disabled:", String(err));
      return null;
    }
  })();
  return ioP;
}

export type Surface = {
  /** height of the flat zone, in the MODEL's local frame (metres) */
  y: number;
  /** total up-facing area in m² */
  area: number;
  x: [number, number];
  z: [number, number];
};
export type GeomSummary = {
  tris: number;
  bbox: { min: number[]; max: number[]; size: number[]; center: number[] };
  /** up-facing flat zones, biggest first — seat pans, table tops, decks.
   *  A socket candidate is {pos: [cx, y, cz]} straight off one of these. */
  topSurfaces: Surface[];
  /** Named mesh parts (Orrery's segmented exports name theirs: tripo_part_N).
   *  `center`/`size` are the MODEL frame (same as bbox/topSurfaces);
   *  `origin` is where the part's own node sits in that frame; `local` is the
   *  part's OWN coordinate frame — the frame a `motion:<name>` component's
   *  pivot/axis use, so `local.center` is a pivot candidate verbatim and
   *  [0,0,0] is the node origin (where a hinge usually lives). */
  nodes: { name: string; center: number[]; size: number[]; origin: number[];
           local: { center: number[]; size: number[] }; tris: number }[];
  /** true when the mesh was too big to walk exhaustively */
  sampled: boolean;
};

const cache = new Map<string, { mtime: number; sum: GeomSummary }>();
const CACHE_MAX = 64;
const SAMPLE_ABOVE_TRIS = 500_000;

/** Summarize one GLB file. Returns null when parsing is unavailable/fails. */
export async function summarizeGlb(absPath: string): Promise<GeomSummary | null> {
  let mtime = 0;
  try { mtime = statSync(absPath).mtimeMs; } catch { return null; }
  const hit = cache.get(absPath);
  if (hit && hit.mtime === mtime) return hit.sum;
  const io = await getIO();
  if (!io) return null;
  let doc: any;
  try { doc = await io.read(absPath); } catch (err) {
    console.warn(`[geometry] unreadable ${absPath}:`, String(err).slice(0, 200));
    return null;
  }

  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  let tris = 0;
  // first pass: count triangles so sampling is decided before the walk
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices();
      const pos = prim.getAttribute("POSITION");
      if (!pos) continue;
      tris += Math.floor((idx ? idx.getCount() : pos.getCount()) / 3);
    }
  }
  const stride = tris > SAMPLE_ABOVE_TRIS ? Math.ceil(tris / SAMPLE_ABOVE_TRIS) : 1;

  // Flat zones bucketed by height (2.5cm) — up-facing triangles only.
  const buckets = new Map<number, { area: number; x: [number, number]; z: [number, number]; ySum: number; n: number }>();
  const nodes: GeomSummary["nodes"] = [];
  const va = [0, 0, 0], vb = [0, 0, 0], vc = [0, 0, 0];
  const xf = (m: number[], p: number[], out: number[]) => {
    const [x, y, z] = p;
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
  };

  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const m = node.getWorldMatrix();
    const nMin = [Infinity, Infinity, Infinity], nMax = [-Infinity, -Infinity, -Infinity];
    // the part's own frame — raw vertex coords, before any node transform
    const lMin = [Infinity, Infinity, Infinity], lMax = [-Infinity, -Infinity, -Infinity];
    let nTris = 0;
    for (const prim of mesh.listPrimitives()) {
      const posAcc = prim.getAttribute("POSITION");
      if (!posAcc) continue;
      const idxAcc = prim.getIndices();
      const count = idxAcc ? idxAcc.getCount() : posAcc.getCount();
      nTris += Math.floor(count / 3);
      const p = [0, 0, 0];
      for (let t = 0; t + 2 < count; t += 3 * stride) {
        for (let k = 0; k < 3; k++) {
          const vi = idxAcc ? idxAcc.getScalar(t + k) : t + k;
          posAcc.getElement(vi, p);
          for (let a = 0; a < 3; a++) {
            if (p[a] < lMin[a]) lMin[a] = p[a];
            if (p[a] > lMax[a]) lMax[a] = p[a];
          }
          const out = k === 0 ? va : k === 1 ? vb : vc;
          xf(m, p, out);
          for (let a = 0; a < 3; a++) {
            if (out[a] < min[a]) min[a] = out[a];
            if (out[a] > max[a]) max[a] = out[a];
            if (out[a] < nMin[a]) nMin[a] = out[a];
            if (out[a] > nMax[a]) nMax[a] = out[a];
          }
        }
        // up-facing? cross(ab, ac).y dominant and positive
        const abx = vb[0] - va[0], aby = vb[1] - va[1], abz = vb[2] - va[2];
        const acx = vc[0] - va[0], acy = vc[1] - va[1], acz = vc[2] - va[2];
        const cx = aby * acz - abz * acy;
        const cy = abz * acx - abx * acz;
        const cz = abx * acy - aby * acx;
        const len = Math.hypot(cx, cy, cz);
        if (len < 1e-9 || cy / len < 0.8) continue;
        const area = (len / 2) * stride;   // sampled tris stand in for their neighbours
        const yc = (va[1] + vb[1] + vc[1]) / 3;
        const key = Math.round(yc / 0.025);
        const b = buckets.get(key) ?? { area: 0, x: [Infinity, -Infinity], z: [Infinity, -Infinity], ySum: 0, n: 0 };
        b.area += area; b.ySum += yc; b.n++;
        for (const v of [va, vb, vc]) {
          if (v[0] < b.x[0]) b.x[0] = v[0];
          if (v[0] > b.x[1]) b.x[1] = v[0];
          if (v[2] < b.z[0]) b.z[0] = v[2];
          if (v[2] > b.z[1]) b.z[1] = v[2];
        }
        buckets.set(key, b);
      }
    }
    const name = node.getName();
    if (name && Number.isFinite(nMin[0]) && nodes.length < 32) {
      nodes.push({
        name,
        center: nMin.map((v, i) => +((v + nMax[i]) / 2).toFixed(3)),
        size: nMin.map((v, i) => +(nMax[i] - v).toFixed(3)),
        origin: [+m[12].toFixed(3), +m[13].toFixed(3), +m[14].toFixed(3)],
        local: {
          center: lMin.map((v, i) => +((v + lMax[i]) / 2).toFixed(3)),
          size: lMin.map((v, i) => +(lMax[i] - v).toFixed(3)),
        },
        tris: nTris,
      });
    }
  }

  const topSurfaces = [...buckets.values()]
    .filter((b) => b.area > 0.02)
    .sort((a, b) => b.area - a.area)
    .slice(0, 8)
    .map((b) => ({
      y: +(b.ySum / b.n).toFixed(3),
      area: +b.area.toFixed(3),
      x: [+b.x[0].toFixed(3), +b.x[1].toFixed(3)] as [number, number],
      z: [+b.z[0].toFixed(3), +b.z[1].toFixed(3)] as [number, number],
    }));

  const ok = Number.isFinite(min[0]);
  const sum: GeomSummary = {
    tris,
    bbox: ok ? {
      min: min.map((v) => +v.toFixed(3)), max: max.map((v) => +v.toFixed(3)),
      size: min.map((v, i) => +(max[i] - v).toFixed(3)),
      center: min.map((v, i) => +((v + max[i]) / 2).toFixed(3)),
    } : { min: [0, 0, 0], max: [0, 0, 0], size: [0, 0, 0], center: [0, 0, 0] },
    topSurfaces,
    nodes,
    sampled: stride > 1,
  };
  cache.set(absPath, { mtime, sum });
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value!);
  return sum;
}
