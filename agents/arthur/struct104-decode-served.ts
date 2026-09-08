// struct104-decode-served.ts — decode the LIVE SERVED bytes of
// nx-struct-slidingladder (store DRACO variant, sha 81c4fb0c) and answer
// the survey-70 identity question at the accessor level: DO the rungs and
// rails exist in the served mesh, or did the server transform drop them?
// Law: decode outranks the render claim (probe law 11). Served bytes are
// the player's truth.
//
// Classification math (source: mkv3-slidingladder.ts):
//   L=4, Y0=0.09, ANGLES=[15,30,45,60,75], RAIL_Z=±0.225, RAIL_S=0.06,
//   RUNG_S=0.05, RUNG_STEP=0.4. Rails: 10 boxes rotated about z on the
//   segment foot(a,Y0)->top(0,Y0+b). Rungs: nRungs=floor(len/0.4)−1 boxes
//   centered (fx+s·dx, fy+s·dy+0.025, z 0.2 span) — 45 total expected.
import * as fs from "node:fs";
import draco3dgltf from "draco3dgltf";

const GLB = process.argv[2] ?? "agents/arthur/reviews/survey70-slice/slidingladder.glb";
const L = 4.0, Y0 = 0.09, ANGLES = [15, 30, 45, 60, 75];
const RAIL_Z = 0.225, RAIL_S = 0.06, RUNG_S = 0.05, RUNG_STEP = 0.4;

const buf = fs.readFileSync(GLB);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
let o = 12;
const jl = dv.getUint32(o, true); // json chunk length
o += 8;                            // skip length + chunk-type fields
// served chunk can carry non-UTF8 bytes inside the declared JSON length:
// brace-match for the true end and replace invalid sequences (U+FFFD) —
// same tolerant path the Python decode used
const jsonRaw = buf.subarray(o, o + jl);
const txt = new TextDecoder("utf-8", { fatal: false }).decode(jsonRaw);
let depth = 0, end = -1, instr = false, esc = false;
for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (instr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') instr = false;
    } else if (c === '"') instr = true;
    else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
}
const j = JSON.parse(txt.slice(0, end === -1 ? txt.length : end));
o += jl + ((4 - (jl % 4)) % 4);
const binLen = dv.getUint32(o, true); o += 4;
dv.getUint32(o, true); o += 4;
const bin = buf.subarray(o, o + binLen);
const sliceView = (i: number) => {
    const v = j.bufferViews[i];
    const off = v.byteOffset ?? 0;
    return bin.subarray(off, off + v.byteLength);
};

const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();

// expected centers from source math
const railCenters: [number, number, number][] = [];
const rungCenters: [number, number, number][] = [];
for (const deg of ANGLES) {
    const th = (deg * Math.PI) / 180;
    const a = L * Math.cos(th), b = L * Math.sin(th);
    const fx = a, fy = Y0, tx = 0, ty = Y0 + b;
    const dx = tx - fx, dy = ty - fy, len = Math.hypot(dx, dy);
    railCenters.push([(fx + tx) / 2, (fy + ty) / 2, RAIL_Z]);
    railCenters.push([(fx + tx) / 2, (fy + ty) / 2, -RAIL_Z]);
    const nRungs = Math.floor(len / RUNG_STEP) - 1;
    for (let k = 1; k <= nRungs; k++) {
        const s = (k * RUNG_STEP) / len;
        rungCenters.push([fx + s * dx, fy + s * dy + RUNG_S / 2, 0]);
    }
}
console.log(`expected from source math: ${railCenters.length} rails, ${rungCenters.length} rungs`);

const decodeMeshPositions = (meshIdx: number): number[][] | null => {
    const prim = j.meshes[meshIdx].primitives[0];
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    const name = j.meshes[meshIdx].name;
    if (!ext) { console.log(name, ": not DRACO"); return null; }
    const bytes = sliceView(ext.bufferView);
    const dbuf = new decoderModule.DecoderBuffer();
    dbuf.Init(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength), bytes.byteLength);
    const gtype = decoder.GetEncodedGeometryType(dbuf);
    if (gtype !== decoderModule.TRIANGULAR_MESH) { console.log(name, ": not a mesh"); return null; }
    const dg = new decoderModule.Mesh();
    const st = decoder.DecodeBufferToMesh(dbuf, dg);
    if (!st.ok()) { console.log(name, "decode FAILED:", st.error()); return null; }
    const nPts = dg.num_points(), nFaces = dg.num_faces();
    const attrId = decoder.GetAttributeId(dg, decoderModule.POSITION);
    const attr = decoder.GetAttribute(dg, attrId);
    const out = new decoderModule.DracoFloat32Array();
    decoder.GetAttributeFloatForAllPoints(dg, attr, out);
    const pts: number[][] = [];
    for (let i = 0; i < nPts; i++) pts.push([out.GetValue(i * 3), out.GetValue(i * 3 + 1), out.GetValue(i * 3 + 2)]);
    console.log(`${name}: ${nPts} verts, ${nFaces} faces (draco-decoded)`);
    decoderModule.destroy(out); decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return pts;
};

// iron bucket = the mesh whose node name is slidingladder_1 (source: rails+rungs merged into sl_iron)
for (let mi = 0; mi < j.meshes.length; mi++) {
    const pts = decodeMeshPositions(mi);
    if (!pts) continue;
    const name = j.meshes[mi].name;
    if (!name.includes("1")) continue; // only classify the iron bucket
    // a rail center matches if ≥8 verts sit within its box envelope (half-extents + slack)
    const railHits = railCenters.filter(([cx, cy, cz]) =>
        pts.filter(([x, y, z]) => Math.abs(x - cx) < 2.2 && Math.abs(y - cy) < 2.2 && Math.abs(z - cz) < 0.12).length >= 8);
    // rails are LONG: their center-neighborhood in x/y must span the rail direction;
    // simpler + robust: rung boxes are small — all 24 verts within 0.05 of center box
    // rung boxes: cross 0.05, z-span ±(RAIL_Z*2-RUNG_S)/2 = ±0.2 — verts at
    // z=±0.2, NOT near z=0; test the true box half-extents + quant slack
    const rungHits = rungCenters.filter(([cx, cy, cz]) =>
        pts.filter(([x, y, z]) => Math.abs(x - cx) <= RUNG_S / 2 + 0.04 && Math.abs(y - cy) <= RUNG_S / 2 + 0.04 && Math.abs(z - cz) <= (RAIL_Z * 2 - RUNG_S) / 2 + 0.04).length >= 8);
    console.log(`RAILS present (≥8 verts near center, z-lane tight): ${railHits.length}/${railCenters.length}`);
    console.log(`RUNGS present (≥8 verts in rung box, quant slack 0.03): ${rungHits.length}/${rungCenters.length}`);
    // diagnostics: z-distribution and total vert budget
    const zs = pts.map(p => p[2]);
    const zNeg = zs.filter(z => z < -0.1).length, zPos = zs.filter(z => z > 0.1).length, zMid = zs.length - zNeg - zPos;
    console.log(`z-dist: rails-lane-neg ${zNeg}, mid ${zMid}, rails-lane-pos ${zPos} of ${zs.length}`);
}
decoderModule.destroy(decoder);
