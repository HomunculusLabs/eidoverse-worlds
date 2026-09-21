// p344-verify-served.ts — polish-344 served-bytes proof (struct-104 law):
// fetch the LIVE SERVED (DRACO) lib for nx-town-streetlamps and prove the
// cage base plate survived the re-encode: iron verts at the plate's unique
// planes (y ~2.33 / ~2.37, nothing else in the anatomy sits there) within
// the plate envelope (|dx|,|dz| <= 0.13) near every lamp; plus regression
// gates — p343 bar loci (>= 400 newLoci, 0 oldFlush), 8/8 lamp groups, both
// emissive factors exact, headTop ~3.06, 0 non-finite. Negative control:
// the polish-343 served lib (fdade00c) must have ZERO plate verts.
// Chassis: p343-verify-served.
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
const near = (y: number, t: number) => Math.abs(y - t) < 0.004;

async function audit(lib: string) {
  const buf = await fetchServed(lib);
  const { j, bin } = parseGLB(buf);
  const ironMat = (j.materials ?? []).find((m: any) => eq(m.emissiveFactor, EXPECT.iron));
  const glowMat = (j.materials ?? []).find((m: any) => eq(m.emissiveFactor, EXPECT.glow1));
  const ironHasTex = !!ironMat?.pbrMetallicRoughness?.baseColorTexture;
  const lampGroups = (j.nodes ?? []).filter((n: any) => /^lampsl[0-7]$/.test(n.name ?? "")).length;
  let nonFinite = 0, locusBad = 0, headTop = 0;
  let newLoci = 0, oldFlush = 0, plateVerts = 0, plateLamps = new Set<number>();
  for (const n of j.nodes ?? []) {
    if (n.mesh === undefined) continue;
    for (const prim of j.meshes[n.mesh].primitives) {
      const m = j.materials[prim.material];
      if (!eq(m?.emissiveFactor, EXPECT.iron)) continue; // plate + bars are iron
      const pts = decodeMeshPositions(j, bin, n.mesh);
      if (!pts) continue;
      for (const [x, y, z] of pts) {
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) { nonFinite++; continue; }
        const rr = Math.hypot(x, z);
        if (rr < 9.5 || rr > 10.5 || y < -0.01 || y > 3.08) locusBad++;
        if (y > headTop) headTop = y;
        const onPlatePlane = near(y, 2.33) || near(y, 2.37);
        const onBarPlane = near(y, 2.36) || near(y, 2.63);
        for (let li = 0; li < LAMPS.length; li++) {
          const [lx, lz] = LAMPS[li];
          if (Math.hypot(x - lx, z - lz) < 0.3) {
            const dx = Math.abs(x - lx), dz = Math.abs(z - lz);
            if (onPlatePlane && dx <= 0.13 && dz <= 0.13) { plateVerts++; plateLamps.add(li); }
            if (onBarPlane) {
              if (dx < 0.055 || dz < 0.055) break; // post/collar-zone iron, not bars
              if (dx >= 0.0805 && dx <= 0.1095 && dz >= 0.0805 && dz <= 0.1095) newLoci++;
              if (dx <= 0.0655 && dz <= 0.0655) oldFlush++;
            }
            break;
          }
        }
      }
    }
  }
  return { lampGroups, ironHasTex, hasIron: !!ironMat, hasGlow: !!glowMat, nonFinite, locusBad, headTop, newLoci, oldFlush, plateVerts, plateLamps: plateLamps.size };
}

const NEW = "store/530fc49a9c31e441.glb";
const OLD = "store/fdade00cdd911e44.glb";
const newAudit = await audit(NEW);
console.log(JSON.stringify(newAudit));
const pass = newAudit.lampGroups === 8 && newAudit.hasIron && newAudit.hasGlow && newAudit.ironHasTex
  && newAudit.nonFinite === 0 && newAudit.locusBad === 0
  // plate survived: DRACO-deduped box = 8 unique corners/lamp -> 64 across 8
  // lamps; >= 48 guards all-lamps presence while the negative control proves
  // the old lib can never pass (0 plate verts).
  && newAudit.plateVerts >= 48 && newAudit.plateLamps === 8
  // p343 bar loci regression gates still hold
  && newAudit.newLoci >= 400 && newAudit.oldFlush === 0
  && newAudit.headTop > 3.05 && Math.abs(newAudit.headTop - 3.06) < 0.01;
if (!pass) { console.error("FAIL: p344 contract not met in served bytes"); process.exit(1); }
// negative control: the old served lib must fail the plate gates
const oldAudit = await audit(OLD);
console.log(JSON.stringify({ negativeControl: oldAudit }));
if (oldAudit.plateVerts !== 0 || oldAudit.plateLamps !== 0) {
  console.error("FAIL: negative control (p343 lib) unexpectedly passes the p344 plate gates");
  process.exit(1);
}
console.log("P344_SERVED_PASS");
