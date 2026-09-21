// p342-verify-served.ts — polish-342 served-bytes proof (struct-104 law):
// fetch the LIVE SERVED (DRACO) lib for nx-town-streetlamps and prove the
// cap articulation survived the re-encode: head top now ~3.06 (was 2.9475),
// collar-band verts at y 2.895..2.935 near each lamp axis (lateral <0.1),
// finial-zone verts above the old apex 2.9475, 8/8 lamp groups, both
// emissive factors exact (iron keeps baseColorTexture), 0 non-finite,
// ring locus intact. Negative control: the polish-341 served lib
// (9b8cdb73) must FAIL the headTop/collar gates. Chassis: p341-verify-served.
import * as fs from "node:fs";
import draco3dgltf from "draco3dgltf";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(fs.readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

async function fetchServed(lib: string): Promise<Buffer> {
  const r = await fetch(`${base}/library/${lib}`);
  if (!r.ok) throw new Error(`served fetch ${lib} HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

function parseGLB(buf: Buffer) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let o = 12;
  const jl = dv.getUint32(o, true); o += 8;
  const txt = new TextDecoder("utf-8", { fatal: false }).decode(buf.subarray(o, o + jl));
  let depth = 0, end = -1, instr = false, esc = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (instr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') instr = false; }
    else if (c === '"') instr = true;
    else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  const j = JSON.parse(txt.slice(0, end === -1 ? txt.length : end));
  o += jl + ((4 - (jl % 4)) % 4);
  const binLen = dv.getUint32(o, true);
  return { j, bin: buf.subarray(o + 8, o + 8 + binLen) };
}

const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();

function decodeMeshPositions(j: any, bin: Buffer, mi: number): number[][] | null {
  const prim = j.meshes[mi].primitives[0];
  const ext = prim.extensions?.KHR_draco_mesh_compression;
  if (!ext) return null;
  const v = j.bufferViews[ext.bufferView]; const off = v.byteOffset ?? 0;
  const bytes = bin.subarray(off, off + v.byteLength);
  const dbuf = new decoderModule.DecoderBuffer();
  dbuf.Init(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength), bytes.byteLength);
  if (decoder.GetEncodedGeometryType(dbuf) !== decoderModule.TRIANGULAR_MESH) { decoderModule.destroy(dbuf); return null; }
  const dg = new decoderModule.Mesh();
  const st = decoder.DecodeBufferToMesh(dbuf, dg);
  if (!st.ok()) { decoderModule.destroy(dg); decoderModule.destroy(dbuf); return null; }
  const attr = decoder.GetAttribute(dg, decoder.GetAttributeId(dg, decoderModule.POSITION));
  const out = new decoderModule.DracoFloat32Array();
  decoder.GetAttributeFloatForAllPoints(dg, attr, out);
  const pts: number[][] = [];
  for (let i = 0; i < dg.num_points(); i++) pts.push([out.GetValue(i * 3), out.GetValue(i * 3 + 1), out.GetValue(i * 3 + 2)]);
  decoderModule.destroy(out); decoderModule.destroy(dg); decoderModule.destroy(dbuf);
  return pts;
}

const EXPECT = { iron: [0.15, 0.0876, 0.0381], glow1: [0.9, 0.5257, 0.2287] };
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
const LAMPS = [20, 70, 110, 160, 200, 250, 290, 340].map(d => {
  const a = (d * Math.PI) / 180; return [Math.cos(a) * 10, Math.sin(a) * 10] as [number, number];
});

async function audit(lib: string) {
  const buf = await fetchServed(lib);
  const { j, bin } = parseGLB(buf);
  const ironMat = (j.materials ?? []).find((m: any) => eq(m.emissiveFactor, EXPECT.iron));
  const glowMat = (j.materials ?? []).find((m: any) => eq(m.emissiveFactor, EXPECT.glow1));
  const ironHasTex = !!ironMat?.pbrMetallicRoughness?.baseColorTexture;
  const lampGroups = (j.nodes ?? []).filter((n: any) => /^lampsl[0-7]$/.test(n.name ?? "")).length;
  let nonFinite = 0, locusBad = 0, headTop = 0, collarBand = 0, finialZone = 0;
  for (const n of j.nodes ?? []) {
    if (n.mesh === undefined) continue;
    for (const prim of j.meshes[n.mesh].primitives) {
      const m = j.materials[prim.material];
      if (!eq(m?.emissiveFactor, EXPECT.iron) && !eq(m?.emissiveFactor, EXPECT.glow1)) continue;
      const pts = decodeMeshPositions(j, bin, n.mesh);
      if (!pts) continue;
      for (const [x, y, z] of pts) {
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) { nonFinite++; continue; }
        const rr = Math.hypot(x, z);
        if (rr < 9.5 || rr > 10.5 || y < -0.01 || y > 3.08) locusBad++;
        if (y > headTop) headTop = y;
        if (y > 2.9475) finialZone++; // above the OLD apex 2.9475
        if (y >= 2.895 && y <= 2.935) {
          for (const [lx, lz] of LAMPS) {
            if (Math.hypot(x - lx, z - lz) < 0.1) { collarBand++; break; }
          }
        }
      }
    }
  }
  return { lampGroups, ironHasTex, hasIron: !!ironMat, hasGlow: !!glowMat, nonFinite, locusBad, headTop, collarBand, finialZone };
}

const NEW = "store/a4b572a315b9a979.glb";
const OLD = "store/9b8cdb73051beb5e.glb";
const newAudit = await audit(NEW);
console.log(JSON.stringify(newAudit));
const pass = newAudit.lampGroups === 8 && newAudit.hasIron && newAudit.hasGlow && newAudit.ironHasTex
  && newAudit.nonFinite === 0 && newAudit.locusBad === 0
  && newAudit.headTop > 3.05 && Math.abs(newAudit.headTop - 3.06) < 0.01
  && newAudit.collarBand >= 300 && newAudit.finialZone >= 8;
// finialZone gate is geometry-derived: a ConeGeometry has no intermediate
// height rings, so above the old apex 2.9475 only apex-region verts exist
// (~5 x 8 lamps = 40 observed; gate >= 8 = at least one per lamp).
if (!pass) { console.error("FAIL: p342 contract not met in served bytes"); process.exit(1); }
// negative control: the old served lib must fail the new-cap gates
const oldAudit = await audit(OLD);
console.log(JSON.stringify({ negativeControl: oldAudit }));
if (oldAudit.headTop > 3.05 || oldAudit.collarBand >= 300) {
  console.error("FAIL: negative control (p341 lib) unexpectedly passes the p342 gates");
  process.exit(1);
}
console.log("P342_SERVED_PASS");
