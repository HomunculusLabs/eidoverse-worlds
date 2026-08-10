// flora_lod — blade-level LOD index subsets for tiled 'blades' strokes,
// DOM-free (unit-tested in tools/flora.test.ts). §17b.
//
// The upstream tuft (vegetation.js bunchGeometry) builds perBunch blades as
// CONTIGUOUS runs: each blade pushes (LOOPS+1)×2 = 10 vertices, then LOOPS×6
// = 24 index entries referencing only its own 10 (meadow grass 8 blades →
// 80 verts/192 entries; galleta 34 → 340/816). A far-LOD geometry keeps
// whole blades by keeping whole 24-entry runs: the subset index still points
// into the SHARED vertex buffers — dropped blades' vertices simply go
// unreferenced — so the far variant costs one small index buffer per stroke
// and not one byte of copied vertex data.
//
// The layout is verified against the construction loop upstream AND
// re-verified structurally here at runtime, entry by entry: version skew in
// vegetation.js degrades to "no LOD" (null), never to a torn tuft.

export const BLADE_VERTS = 10;    // (LOOPS+1) × 2 — vegetation.js LOOPS = 4
export const BLADE_INDICES = 24;  // LOOPS × 6

/** Far-LOD index subset: keep ceil(blades × keep) whole blades, evenly
 *  strided across the tuft (every kth blade, NOT the first k — construction
 *  order scatters blades radially, so a stride keeps the tuft balanced).
 *  `index` is the source index array, `vertexCount` the geometry's position
 *  count, `keep` the fraction of blades the far field draws. Returns a
 *  same-typed array of index entries, or null when the geometry is not
 *  blade-shaped or the subset would not actually drop anything. */
export function bladeLodIndex(index, vertexCount, keep) {
  if (!index || !(keep > 0) || keep >= 1) return null;
  const blades = index.length / BLADE_INDICES;
  if (!Number.isInteger(blades) || blades < 2) return null;
  if (vertexCount !== blades * BLADE_VERTS) return null;
  for (let b = 0; b < blades; b++) {          // whole-blade contiguity proof
    const lo = b * BLADE_VERTS, hi = lo + BLADE_VERTS;
    for (let e = b * BLADE_INDICES; e < (b + 1) * BLADE_INDICES; e++) {
      const v = index[e];
      if (v < lo || v >= hi) return null;     // cross-blade reference: not our layout
    }
  }
  const kept = Math.ceil(blades * keep);
  if (kept >= blades) return null;            // nothing to save
  const out = new index.constructor(kept * BLADE_INDICES);
  for (let i = 0; i < kept; i++) {
    const b = Math.floor((i * blades) / kept);    // even stride across the tuft
    const s = b * BLADE_INDICES, d = i * BLADE_INDICES;
    for (let e = 0; e < BLADE_INDICES; e++) out[d + e] = index[s + e];
  }
  return out;
}
