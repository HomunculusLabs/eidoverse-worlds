// p339-verify-served.ts — did the 8 road-out extensions survive the DRACO
// re-encode? (struct-104 law: served bytes are the player's truth.) Decodes
// the LIVE SERVED bytes of nx-town-mapboard and checks:
//   1) ROAD SURVIVAL: face-plane vertices in the extension radial band
//      r 0.42..0.66 binned by AUTHORED angle — each of the 8 rays (±8° of
//      0/45/90/135/180/225/270/315) must carry >= 8 vertices, and MORE than
//      the p303 served control (which had none beyond the plaque corners).
//   2) NO REGRESSION: 0 non-finite; ink-envelope reach >= 0.60 (fringe).
// Face-plane projection identical to p303 (mapG tilt -0.21 about x, center
// (0,1.55,-0.06); u = (y-1.55)*cos(.21) - (z+0.06)*sin(.21); authored angle
// = atan2(-u, x)). Chassis: p303-verify-served.ts VERBATIM decode loop
// (collect pts[], then analyze — my first draft filtered inside the read
// loop and produced unstable reads; self-caught, rewritten on the proven
// chassis).
import * as fs from "node:fs";
import draco3dgltf from "draco3dgltf";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(fs.readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const WORLD = "commons-next", ID = "nx-town-mapboard";
const gr = await fetch(`${base}/geom?world=${WORLD}`);
if (!gr.ok) throw new Error(`geom ${gr.status}`);
const ents = Object.fromEntries(((await gr.json() as any).entities ?? []).map((e: any) => [e.id, e]));
const ent = ents[ID];
if (!ent?.lib) throw new Error(`${ID} not standing`);
console.log(`live lib: ${ent.lib} pos ${JSON.stringify(ent.pos)} yaw ${ent.yaw}`);

const buf = Buffer.from(await (await fetch(`${base}/library/${ent.lib}`)).arrayBuffer());
const bufOld = Buffer.from(await (await fetch(`${base}/library/store/02f6cb96442af8cd.glb`)).arrayBuffer()); // p303 served control

const parseHdr = (b: Buffer) => {
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    let o = 12;
    const jl = dv.getUint32(o, true); o += 8;
    const txt = new TextDecoder("utf-8", { fatal: false }).decode(b.subarray(o, o + jl));
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
    const binLen = dv.getUint32(o, true); o += 8;
    const bin = b.subarray(o, o + binLen);
    return { j, bin };
};
const COS = Math.cos(0.21), SIN = Math.sin(0.21);
const radius = (x: number, y: number, z: number) => Math.hypot(x, (y - 1.55) * COS - (z + 0.06) * SIN);
const authoredAngle = (x: number, y: number, z: number) => Math.atan2(-((y - 1.55) * COS - (z + 0.06) * SIN), x);
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
const ROAD_LO = 0.42, ROAD_HI = 0.66;

const analyze = async (b: Buffer) => {
    const { j, bin } = parseHdr(b);
    const decoderModule = await draco3dgltf.createDecoderModule({});
    const decoder = new decoderModule.Decoder();
    const rayCounts: Record<number, number> = Object.fromEntries(RAYS.map(r => [r, 0]));
    let nonFinite = 0, dracoMeshes = 0, inkMaxR = 0;
    for (let mi = 0; mi < j.meshes.length; mi++) {
        const prim = j.meshes[mi].primitives[0];
        const ext = prim.extensions?.KHR_draco_mesh_compression;
        if (!ext) continue;
        const bytes = (() => { const v = j.bufferViews[ext.bufferView]; const off = v.byteOffset ?? 0; return bin.subarray(off, off + v.byteLength); })();
        const dbuf = new decoderModule.DecoderBuffer();
        dbuf.Init(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength), bytes.byteLength);
        if (decoder.GetEncodedGeometryType(dbuf) !== decoderModule.TRIANGULAR_MESH) { decoderModule.destroy(dbuf); continue; }
        const dg = new decoderModule.Mesh();
        const st = decoder.DecodeBufferToMesh(dbuf, dg);
        if (!st.ok()) { decoderModule.destroy(dg); decoderModule.destroy(dbuf); continue; }
        dracoMeshes++;
        const attr = decoder.GetAttribute(dg, decoder.GetAttributeId(dg, decoderModule.POSITION));
        const out = new decoderModule.DracoFloat32Array();
        decoder.GetAttributeFloatForAllPoints(dg, attr, out);
        const pts: number[][] = [];
        for (let i = 0; i < dg.num_points(); i++) pts.push([out.GetValue(i * 3), out.GetValue(i * 3 + 1), out.GetValue(i * 3 + 2)]);
        decoderModule.destroy(out); decoderModule.destroy(dg); decoderModule.destroy(dbuf);
        for (const [x, y, z] of pts) {
            if (![x, y, z].every(Number.isFinite)) { nonFinite++; continue; }
            const r = radius(x, y, z);
            if (r > inkMaxR && r < 3) inkMaxR = r;   // garbage-finite guard (re-encode dust > 3 excluded)
            if (r >= ROAD_LO && r <= ROAD_HI) {
                const deg = (authoredAngle(x, y, z) * 180) / Math.PI;
                for (const t of RAYS) {
                    let d = Math.abs(deg - t) % 360; if (d > 180) d = 360 - d;
                    if (d <= 8) { rayCounts[t]++; break; }
                }
            }
        }
    }
    decoderModule.destroy(decoder);
    return { dracoMeshes, nonFinite, rayCounts, inkMaxR };
};

const neu = await analyze(buf);
const old = await analyze(bufOld);
console.log(JSON.stringify({ servedNew: { dracoMeshes: neu.dracoMeshes, nonFinite: neu.nonFinite, inkMaxR: +neu.inkMaxR.toFixed(3), rayCounts: neu.rayCounts }, servedP303Control: { rayCounts: old.rayCounts, inkMaxR: +old.inkMaxR.toFixed(3) } }, null, 1));
let fail = false;
for (const t of RAYS) {
    if (neu.rayCounts[t] < 8) { console.error(`FAIL: ray ${t}° extension band carries only ${neu.rayCounts[t]} verts`); fail = true; }
    if (neu.rayCounts[t] <= old.rayCounts[t]) { console.error(`FAIL: ray ${t}° did not grow vs p303 control (${neu.rayCounts[t]} <= ${old.rayCounts[t]})`); fail = true; }
}
if (neu.inkMaxR < 0.60) { console.error(`FAIL: ink envelope ${neu.inkMaxR.toFixed(3)} < 0.60`); fail = true; }
if (neu.nonFinite > 0) { console.error(`FAIL: ${neu.nonFinite} non-finite vertices`); fail = true; }
if (fail) process.exit(1);
console.log(`P339_SERVED_PASS: all 8 road extensions present in served DRACO bytes (rays grew vs p303 control); ink envelope r ${neu.inkMaxR.toFixed(3)}; NaN clean.`);
