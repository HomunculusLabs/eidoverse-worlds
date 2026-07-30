// grass groom — client-side polish over Skye's makeGrass at zero added frame
// cost. makeGrass builds correct geometry but ships a flat look: every blade
// the same base→tip lerp, per-face normals that light half the visible faces
// wrong (DoubleSide backfaces get flipped normals — the speckled, disjointed
// carpet), a constant emissive "backlight" that glows at night, and sway with
// no visible light response. Everything here is either a one-time vertex
// rewrite at build or a trivial shader node swap:
//
//   - GROUND NORMALS: blades shade like the meadow surface (material.normalNode
//     bypasses the DoubleSide faceDirection flip — setupNormal() returns it
//     verbatim), with a whisper of the blade's own normal kept for variation.
//   - PER-BLADE VARIATION: lightness jitter per blade + large-scale dry
//     patches from value noise, written into the existing vertex colours.
//   - BASE AO: the down-blade darkening that makes a field read dense/rooted.
//   - GUST SHEEN: tips brighten where a gust passes. The gust texture in
//     grass.js is a deterministic hash, so we rebuild it BIT-IDENTICAL and
//     drive sheen from the same value that drives the sway — light waves
//     travel exactly with the motion waves.
//   - ARC DIP: tips dip down ∝ sway², so a gust reads as bending, not skating.
//   - DAY-AWARE BACKLIGHT: the emissive follows sky.js's dayness — sun-through
//     -the-tips by day, no radioactive meadow at midnight.
//
// Coupling: only the documented makeGrass return shape ({mesh, material,
// uniforms.wind}) plus its aH/aPh attributes and 5-verts-per-blade layout.
// Anything missing → the field is returned untouched.

import { THREE, TSL } from './core.js';
import { dayness } from './sky.js';

// Bit-identical rebuild of grass.js's private gust field (same hash, same
// octaves) so the sheen samples the SAME wind the sway moves to.
let _gust = null;
function gustTex() {
  if (_gust) return _gust;
  const n = 256, d = new Uint8Array(n * n * 4);
  const val = (x, y) => { const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return h - Math.floor(h); };
  const sm = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = val(xi, yi), b = val(xi + 1, yi), c = val(xi, yi + 1), e = val(xi + 1, yi + 1);
    const ux = xf * xf * (3 - 2 * xf), uy = yf * yf * (3 - 2 * yf);
    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + e * ux * uy;
  };
  for (let i = 0; i < n * n; i++) {
    const x = i % n, y = (i / n) | 0; let v = 0, amp = 0.6, f = 0.05;
    for (let o = 0; o < 4; o++) { v += sm(x * f, y * f) * amp; amp *= 0.5; f *= 2; }
    const c = Math.max(0, Math.min(255, v * 255)) | 0;
    d[i * 4] = c; d[i * 4 + 1] = c; d[i * 4 + 2] = c; d[i * 4 + 3] = 255;
  }
  const t = new THREE.DataTexture(d, n, n, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.needsUpdate = true;
  _gust = t; return t;
}

export function groomGrass(field, args = {}) {
  try {
    const mesh = field?.mesh;
    const mat = field?.material;
    const windU = field?.uniforms?.wind;
    const g = mesh?.geometry;
    const posA = g?.attributes?.position;
    const colA = g?.attributes?.color;
    const aHA = g?.attributes?.aH;
    if (!posA || !colA || !aHA || !mat) return field;

    // ---------------- build-time vertex rewrites (one pass, then free) ----
    const val = (x, y) => { const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return h - Math.floor(h); };
    const sm = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const a = val(xi, yi), b = val(xi + 1, yi), c = val(xi, yi + 1), e = val(xi + 1, yi + 1);
      const ux = xf * xf * (3 - 2 * xf), uy = yf * yf * (3 - 2 * yf);
      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + e * ux * uy;
    };
    const patchAt = (x, z) => sm(x * 0.06, z * 0.06) * 0.7 + sm(x * 0.21 + 13.7, z * 0.21 + 7.3) * 0.3;

    const count = colA.count;
    for (let b = 0; b + 4 < count; b += 5) {          // 5 verts per blade
      const bx = (posA.getX(b) + posA.getX(b + 1)) * 0.5;
      const bz = (posA.getZ(b) + posA.getZ(b + 1)) * 0.5;
      // dry-patch factor: broad swathes of sun-tired grass through the green
      const dryK = Math.min(1, Math.max(0, (patchAt(bx, bz) - 0.48) * 2.6));
      // per-blade lightness jitter breaks the carpet uniformity
      const jit = 0.74 + 0.4 * val(bx * 57.13, bz * 91.71);
      for (let v = b; v < b + 5; v++) {
        const hl = aHA.getX(v);
        // mild gamma deepen — up-normal lighting is flat-bright, and without
        // this the field reads milky; the power restores saturated body
        let r = Math.pow(colA.getX(v), 1.25), gc = Math.pow(colA.getY(v), 1.25), bc = Math.pow(colA.getZ(v), 1.25);
        r *= 1 + dryK * 0.38;                          // yellow the dry patches
        gc *= 1 + dryK * 0.06;
        bc *= 1 - dryK * 0.5;
        const ao = 0.42 + 0.58 * hl;                     // rooted, crowded base
        const k = jit * ao;
        colA.setXYZ(v, Math.min(1, r * k), Math.min(1, gc * k), Math.min(1, bc * k));
      }
    }
    colA.needsUpdate = true;

    // ---------------- shader node swaps (same cost class as before) ------
    const { vec2, vec3, sin, texture, uniform, attribute,
      positionLocal, normalLocal, transformNormalToView, mix, normalize } = TSL;

    // Ground normals: shade the blades like the surface they grow from.
    // normalNode IS normalView (setupNormal returns it verbatim), so the
    // DoubleSide faceDirection flip never touches it — both faces stable.
    mat.normalNode = transformNormalToView(normalize(mix(normalLocal, vec3(0, 1, 0), 0.7)));

    const H = attribute('aH');
    const h2 = H.mul(H);
    const dayU = uniform(1);
    const windAmp = args.wind ?? 0.18;
    let gustNode = null;
    if (windU && windAmp > 0) {
      // Faithful copy of grass.js's sway (same constants, same clock, and a
      // bit-identical gust texture) so we own the gust node for the sheen —
      // plus the arc dip the original lacks.
      const PH = attribute('aPh');
      const px = positionLocal.x, pz = positionLocal.z;
      const sway = sin(windU.mul(1.0).add(px.mul(0.45)).add(PH));
      const cuv = vec2(px.mul(0.012).add(windU.mul(0.05)), pz.mul(0.012).add(windU.mul(0.085)));
      gustNode = texture(gustTex(), cuv).r.sub(0.5);
      const amt = sway.mul(windAmp).add(gustNode.mul(windAmp * 2.4)).mul(h2);
      mat.positionNode = positionLocal.add(vec3(amt, amt.mul(amt).mul(-0.55), amt.mul(0.4)));
    }

    // Backlight + gust sheen, both riding the vertex colour so tint follows
    // the blade, both scaled by daylight so night grass does not glow.
    const backlight = args.backlight ?? 0.22;
    let em = h2.mul(backlight * 0.55);
    if (gustNode) em = em.add(gustNode.clamp(0.0, 0.5).mul(h2).mul(0.3));
    mat.emissiveNode = attribute('color').mul(em).mul(dayU);
    // (deliberately NO tip gloss: lowering roughness pulls blue env-specular
    // onto the up-facing normals and the whole field goes milky mint)

    // dayness is sky.js's live 0(night)→1(noon); ride the same per-frame
    // hook the wind uses.
    (globalThis._autoParticleSystems ||= []).push(() => {
      dayU.value = 0.1 + 0.9 * dayness;
    });

    console.log(`[grass] groomed ${((count / 5) | 0)} blades — ground normals, patches, gust sheen`);
  } catch (e) {
    console.warn('[grass] groom skipped', e?.message ?? e);
  }
  return field;
}
