// p311-probe.ts — decode + pixel-diff probe for polish-311 (lamp cage emissive).
// Usage: bun agents/arthur/p311-probe.ts
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const base = "agents/arthur/reviews/hero-assets/polish-311-belltower-lampmount/before";
const cand = "agents/arthur/reviews/hero-assets/polish-311-belltower-lampmount/after";

// ---- 1. GLB decode: node census, lamp/lnt_ anchors, materials ----
function decodeGLB(path: string) {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let off = 12, json: any = null;
  while (off < buf.byteLength) {
    const len = dv.getUint32(off, true);
    const typ = dv.getUint32(off + 4, true);
    if (typ === 0x4e4f534a) json = JSON.parse(buf.toString("utf8", off + 8, off + 8 + len));
    off += 8 + len;
  }
  const meshes = (json.meshes ?? []).length;
  const mats = (json.materials ?? []).map((m: any) => ({
    name: m.name,
    emissive: m.emissiveFactor ?? null,
    hasTex: !!(m.pbrMetallicRoughness?.baseColorTexture),
  }));
  const nodes = (json.nodes ?? []).map((n: any) => n.name ?? "(unnamed)");
  // iron-material usage: find mesh indices whose primitive material index has null emissive vs our glow lane
  return { meshes, mats, nodes, json };
}

const b = decodeGLB(`${base}/baseline.glb`);
const c = decodeGLB(`${cand}/candidate.glb`);
console.log("BASE nodes/meshes/mats:", b.nodes.length, b.meshes, b.mats.length);
console.log("CAND nodes/meshes/mats:", c.nodes.length, c.meshes, c.mats.length);
console.log("anchors base:", b.nodes.filter((n: string) => /^(lamp|lnt_)/.test(n)));
console.log("anchors cand:", c.nodes.filter((n: string) => /^(lamp|lnt_)/.test(n)));
const glowMatsB = b.mats.filter((m: any) => m.emissive);
const glowMatsC = c.mats.filter((m: any) => m.emissive);
console.log("emissive mats BASE:", glowMatsB.length, JSON.stringify(glowMatsB));
console.log("emissive mats CAND:", glowMatsC.length, JSON.stringify(glowMatsC));

// NaN scan on POSITION accessors (both files)
function nanScan(path: string) {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let off = 12, json: any = null, chunks: any[] = [];
  while (off < buf.byteLength) {
    const len = dv.getUint32(off, true);
    const typ = dv.getUint32(off + 4, true);
    if (typ === 0x4e4f534a) json = JSON.parse(buf.toString("utf8", off + 8, off + 8 + len));
    else chunks.push({ off: off + 8, len });
    off += 8 + len;
  }
  let nonFinite = 0;
  for (const acc of json.accessors ?? []) {
    if (acc.type === "VEC3" && acc.componentType === 5126) {
      const bv = json.bufferViews[acc.bufferView];
      const start = chunks[bv.buffer].off + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
      for (let i = 0; i < acc.count * 3; i++) {
        const v = dv.getFloat32(start + i * 4, true);
        if (!Number.isFinite(v)) nonFinite++;
      }
    }
  }
  return nonFinite;
}
console.log("nonFinite BASE:", nanScan(`${base}/baseline.glb`), "CAND:", nanScan(`${cand}/candidate.glb`));
// Pixel diffs: use p310-abdiff.ts <beforeDir> <afterDir> (proven chassis).

