// glbwrite.ts — shared minimal GLB writer (position + normal + COLOR_0,
// one node per group child, named nodes for part-motion targeting).
// GLB spec: chunk lengths INCLUDE space-padding to 4-byte boundaries.
// v2: keeps indices for indexed geometries (3x fewer verts for boxes/
// cylinders/cones) and stores COLOR_0 as normalized UNSIGNED_BYTE
// (12 → 3 bytes/vertex). ~4x smaller files at equal visual fidelity.
// v3.3 (texture loop tex-0): TEXCOORD_0 passthrough + full images/
// samplers/textures/materials chain for materials carrying a .map
// (DataTexture from texMat). Untextured meshes take the identical
// byte path as v3.2 — existing GLBs stay byte-stable.
import * as THREE from "three";

export const mat = (color: number, rough = 0.85, metal = 0.1) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

// ---------- texture lane (tex-0) ----------
// Pure-code deterministic PNG encoder: no image deps, fixed zlib opts →
// byte-identical output for identical pixel input (same toolchain).
const CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c >>> 0;
    }
    return t;
})();
function crc32(buf: Uint8Array): number {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
    const out = new Uint8Array(12 + data.length);
    const dv = new DataView(out.buffer);
    dv.setUint32(0, data.length);
    for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    out.set(data, 8);
    dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
    return out;
}
export function encodePNG(w: number, h: number, rgba: Uint8Array): Buffer {
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const ihdr = new Uint8Array(13);
    const hd = new DataView(ihdr.buffer);
    hd.setUint32(0, w); hd.setUint32(4, h);
    ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
    const raw = Buffer.alloc(h * (1 + w * 4));
    for (let y = 0; y < h; y++) {
        raw[y * (1 + w * 4)] = 0; // filter: none
        rgba.subarray(y * w * 4, (y + 1) * w * 4).forEach((v, i) => (raw[y * (1 + w * 4) + 1 + i] = v));
    }
    const zlib = require("node:zlib");
    const idat = zlib.deflateSync(raw, { level: 9, memLevel: 8, strategy: zlib.constants.Z_FILTERED });
    return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", new Uint8Array(0))]);
}
// deterministic int hash (splitmix-style, no float paths)
function hash2(x: number, y: number, seed: number): number {
    let h = (x * 0x9e3779b1 + y * 0x85ebca6b + seed * 0xc2b2ae35) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
    h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
    return (h ^ (h >>> 15)) >>> 0;
}

export type TexOpts = { rough?: number; metal?: number; scale?: number; weights?: number[]; seed?: number; cell?: number; stripe?: number };
// 256px deterministic tile of 2-4 muted tones; full tint baked in (COLOR_0
// becomes white for mapped meshes — glTF multiplies COLOR_0 × texture).
// cell (px): when set, the palette pick is quantized to cell-sized BLOCKS —
// stone/ashlar reads as coursed blocks, not per-pixel noise.
// stripe (px): when set, the palette alternates in BANDS along Y — woven
// cloth reads as warp/weft; pair with close tones for a weave shimmer.
// seed: per-instance seed — two texMats with identical params but different
// seeds yield DIFFERENT tiles (soil law: no two pavers alike).
export function texMat(name: string, tones: number[], opts: TexOpts = {}): THREE.MeshStandardMaterial {
    const N = 256;
    const { rough = 0.9, metal = 0, scale = 1, weights = tones.map(() => 1), seed = name.length * 7919 + 13, cell = 0, stripe = 0 } = opts;
    const cols = tones.map((t) => [(t >> 16) & 255, (t >> 8) & 255, t & 255]); // sRGB bytes straight from hex
    const tot = weights.reduce((a, b) => a + b, 0);
    const bounds: number[] = [];
    let acc = 0;
    for (const w of weights) bounds.push((acc += w / tot));
    const rgba = new Uint8Array(N * N * 4);
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            let r: number;
            if (stripe) {
                // banded pick: the band index comes from floor(y/stripe) —
                // close tones alternate in stripes (woven cloth)
                r = (hash2(0, Math.floor(y / stripe), seed) % 100000) / 100000;
            } else {
                // block-quantized pick when cell is set (stone), else per-pixel
                const sx = cell ? Math.floor(x / cell) : x;
                const sy = cell ? Math.floor(y / cell) : y;
                r = (hash2(sx, sy, seed) % 100000) / 100000;
            }
            const c = cols[bounds.findIndex((b) => r < b)];
            const i = (y * N + x) * 4;
            rgba[i] = c[0];
            rgba[i + 1] = c[1];
            rgba[i + 2] = c[2];
            rgba[i + 3] = 255;
        }
    }
    const tex = new THREE.DataTexture(rgba, N, N, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.repeat.set(scale, scale);
    tex.needsUpdate = true;
    const m = new THREE.MeshStandardMaterial({ roughness: rough, metalness: metal });
    m.map = tex;
    (m as any).userData = { texName: name };
    return m;
}

export function toGLB(group: THREE.Group): Buffer {
    const json: any = { asset: { version: "2.0", generator: "arthur-glbwrite" }, scenes: [{ nodes: [] }], scene: 0 };
    const buffers: Uint8Array[] = [];
    const materials: any[] = [];
    const images: any[] = [];
    const samplers: any[] = [];
    const textures: any[] = [];
    const texDedup = new Map<string, number>();
    const round4 = (v: number) => Math.round(v * 10000) / 10000;
    const accessors: any[] = [];
    const meshes: any[] = [];
    const nodes: any[] = [];
    let byteOffset = 0;
    const views: any[] = [];

    // generic view pusher: byteLength/byteOffset always 4-aligned
    const pushView = (u8: Uint8Array): number => {
        const pad = (4 - (byteOffset % 4)) % 4;
        byteOffset += pad;
        const idx = views.length;
        views.push({ buffer: 0, byteOffset, byteLength: u8.byteLength });
        buffers.push(u8);
        byteOffset += u8.byteLength;
        return idx;
    };
    const f32view = (f: Float32Array) => pushView(new Uint8Array(f.buffer.slice(0)));

    group.updateMatrixWorld(true);
    // recursive walk: emits named GROUP nodes with children (so a comp can
    // target one named node whose children all ride its transform), and
    // named mesh nodes at any depth. Sibling order preserved.
    const walk = (parent: THREE.Object3D): number[] => {
        const childIdxs: number[] = [];
        for (const child of parent.children) {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                childIdxs.push(emitMesh(mesh));
            } else if ((child as THREE.Group).isGroup) {
                const nodeIdx = nodes.length;
                nodes.push({ name: child.name || undefined, children: [] as number[], translation: [child.position.x, child.position.y, child.position.z], rotation: [child.quaternion.x, child.quaternion.y, child.quaternion.z, child.quaternion.w] });
                const kids = walk(child);
                nodes[nodeIdx].children = kids;
                childIdxs.push(nodeIdx);
            }
        }
        return childIdxs;
    };
    const emitMesh = (mesh: THREE.Mesh): number => {
        const geom = mesh.geometry;
        const hasIdx = !!geom.index;
        const pos = geom.attributes.position as THREE.BufferAttribute;
        const nor = geom.attributes.normal as THREE.BufferAttribute;

        // texture lane: material with a .map DataTexture (texMat) →
        // TEXCOORD_0 (uvs × dtex.repeat — a GLB carries no repeat; tiling
        // density bakes into the UVs, the sampler's REPEAT does the wrap)
        // + PNG image/texture/material chain. Tint lives in the tile, so
        // COLOR_0 must be WHITE below (glTF multiplies COLOR_0 × texture).
        const mm = mesh.material as THREE.MeshStandardMaterial;
        const dtex = mm.map as THREE.DataTexture | null;
        let uvAcc: number | undefined;
        let mappedMatIdx: number | undefined;
        if (dtex && (dtex as any).isDataTexture) {
            const uvArr = new Float32Array(pos.count * 2);
            const src = (geom.attributes.uv as THREE.BufferAttribute | undefined)?.array as ArrayLike<number> | undefined;
            const rx = dtex.repeat.x || 1, ry = dtex.repeat.y || 1;
            if (src) for (let i = 0; i < pos.count * 2; i++) uvArr[i] = (src[i] ?? 0) * (i % 2 ? ry : rx);
            accessors.push({ bufferView: f32view(uvArr), componentType: 5126, count: pos.count, type: "VEC2" });
            uvAcc = accessors.length - 1;
            const w = dtex.image.width, h = dtex.image.height;
            const px = dtex.image.data as Uint8Array;
            let h1 = 0x811c9dc5, h2 = 0x9e3779b9;
            for (let i = 0; i < px.length; i++) { h1 = Math.imul(h1 ^ px[i], 0x01000193) >>> 0; h2 = Math.imul(h2 + px[i] + 1, 0x85ebca6b) >>> 0; }
            const key = `${w}x${h}:${h1.toString(16)}:${h2.toString(16)}:${mm.roughness}:${mm.metalness}`;
            let matIdx = texDedup.get(key);
            if (matIdx === undefined) {
                const png = encodePNG(w, h, px);
                const bufView = pushView(png as unknown as Uint8Array);
                const imgIdx = images.length;
                images.push({ bufferView: bufView, mimeType: "image/png" });
                const smpIdx = samplers.length;
                samplers.push({ magFilter: 9729, minFilter: 9986, wrapS: 10497, wrapT: 10497 }); // linear + mips + repeat; 256 is pow2
                textures.push({ sampler: smpIdx, source: imgIdx });
                const em = (mm as any).emissive as THREE.Color | undefined;
                const ei2 = (mm as any).emissiveIntensity as number | undefined;
                const eArr = em && (em.r > 0 || em.g > 0 || em.b > 0)
                    ? [round4(em.r * (ei2 ?? 1)), round4(em.g * (ei2 ?? 1)), round4(em.b * (ei2 ?? 1))]
                    : undefined;
                materials.push({
                    name: (mm as any).userData?.texName ?? `tex${materials.length}`,
                    pbrMetallicRoughness: { baseColorTexture: { index: textures.length - 1 }, baseColorFactor: [1, 1, 1, 1], roughnessFactor: mm.roughness, metallicFactor: mm.metalness },
                    ...(eArr ? { emissiveFactor: eArr } : {}),
                    // v3.4 doubleSided lane (struct-136): non-orientable films
                    // (Boy's RP2) have NO consistent winding — FrontSide culling
                    // would hole the surface at every camera. EXPLICIT OPT-IN via
                    // userData.glTFDoubleSide (NOT side=DoubleSide, which legacy
                    // builds set for render-side reasons — their export bytes
                    // must stay pinned). Every existing GLB stays byte-identical.
                    ...((mm as any).userData?.glTFDoubleSide === true ? { doubleSided: true } : {}),
                });
                matIdx = materials.length - 1;
                texDedup.set(key, matIdx);
            }
            mappedMatIdx = matIdx;
        }
        // COLOR_0 as normalized bytes (3/vertex); WHITE when texture-mapped
        const col = new Uint8Array(pos.count * 3);
        if (mappedMatIdx !== undefined) {
            col.fill(255);
        } else {
            const c = new THREE.Color(mm.color);
            for (let i = 0; i < pos.count; i++) {
                col[i * 3] = Math.round(c.r * 255);
                col[i * 3 + 1] = Math.round(c.g * 255);
                col[i * 3 + 2] = Math.round(c.b * 255);
            }
        }

        const nv = f32view(new Float32Array(pos.array as ArrayLike<number>));
        const nn = f32view(new Float32Array(nor.array as ArrayLike<number>));
        const nc = pushView(col);
        accessors.push(
            { bufferView: nv, componentType: 5126, count: pos.count, type: "VEC3", min: [0, 0, 0], max: [0, 0, 0] },
            { bufferView: nn, componentType: 5126, count: nor.count, type: "VEC3" },
            { bufferView: nc, componentType: 5121, count: pos.count, type: "VEC3", normalized: true },
        );
        const posIdx = accessors.length - 3, norIdx = accessors.length - 2, colIdx = accessors.length - 1;
        {
            const a = accessors[accessors.length - 3];
            const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
            const pa = pos.array as ArrayLike<number>;
            const n = hasIdx ? (geom.index!.count) : pos.count;
            for (let vi = 0; vi < n; vi++) {
                const i = hasIdx ? geom.index!.array[vi] : vi;
                for (let k = 0; k < 3; k++) {
                    const v = pa[i * 3 + k];
                    mn[k] = Math.min(mn[k], v); mx[k] = Math.max(mx[k], v);
                }
            }
            a.min = mn; a.max = mx;
        }
        // indices kept when present (uint16; uint32 fallback for big meshes)
        let indicesAccessor: number | undefined;
        if (hasIdx) {
            const idx = geom.index!;
            const big = (idx.array as ArrayLike<number>).some((v) => v > 65535);
            const arr = big ? new Uint32Array(idx.count) : new Uint16Array(idx.count);
            for (let i = 0; i < idx.count; i++) arr[i] = idx.array[i];
            const iv = pushView(new Uint8Array(arr.buffer.slice(0)));
            accessors.push({ bufferView: iv, componentType: big ? 5125 : 5123, count: idx.count, type: "SCALAR" });
            indicesAccessor = accessors.length - 1;
        }
        const meshIdx = meshes.length;
        const primitive: any = { attributes: { POSITION: posIdx, NORMAL: norIdx, COLOR_0: colIdx }, mode: 4 };
        if (uvAcc !== undefined) primitive.attributes.TEXCOORD_0 = uvAcc;
        if (indicesAccessor !== undefined) primitive.indices = indicesAccessor;
        // MATERIAL: texture-mapped materials (texMat) got their glTF
        // material above; otherwise when the mesh's material is emissive
        // (windows/lights), emit a real glTF material so the glow survives
        // export. One material per unique signature, shared by every match.
        // v3.5 FLAT-MAT LANE (fauna-87, 2026-09-21): non-emissive flat
        // mats now ALSO emit a real dielectric glTF material (metal/
        // rough from the authored mat, white baseColorFactor so COLOR_0
        // carries the tint). Root cause: COLOR_0-only prims with NO
        // material load as the glTF default — metallicFactor 1.0 — in
        // every standard client, rendering the whole dress fauna lineage
        // as dark metal silhouettes (probe fauna87-served-mats.ts: live
        // woodp/rat served bytes carry 0 materials, 10/17 no-material
        // prims; the store re-encoder materializes COLOR_0-only prims
        // only when the upload ships a materials[] at all — the kiln's
        // 4 local materials became 15 served dielectrics). Existing GLBs
        // on disk are untouched; only future rebuilds change bytes.
        const emissive = (mm as any).emissive as THREE.Color | undefined;
        const ei = (mm as any).emissiveIntensity as number | undefined;
        if (mappedMatIdx !== undefined) {
            primitive.material = mappedMatIdx;
        } else if (emissive && (emissive.r > 0 || emissive.g > 0 || emissive.b > 0)) {
            const eArr = [round4(emissive.r * (ei ?? 1)), round4(emissive.g * (ei ?? 1)), round4(emissive.b * (ei ?? 1))];
            const eSig = JSON.stringify(eArr);
            let matIdx = ((json as any)._emissive as Map<string, number> | undefined)?.get(eSig);
            if (matIdx === undefined) {
                materials.push({ name: `glow${materials.length}`, pbrMetallicRoughness: { baseColorFactor: [round4(mm.color.r), round4(mm.color.g), round4(mm.color.b), 1], roughnessFactor: mm.roughness, metallicFactor: mm.metalness }, emissiveFactor: eArr, ...((mm as any).userData?.glTFDoubleSide === true ? { doubleSided: true } : {}) });
                matIdx = materials.length - 1;
                ((json as any)._emissive ??= new Map()).set(eSig, matIdx);
            }
            primitive.material = matIdx;
        } else {
            // v3.5 flat-mat lane: dielectric material, white baseColor so
            // COLOR_0 carries the tint (see header comment above)
            const fSig = `${round4(mm.roughness)}:${round4(mm.metalness)}:${(mm as any).userData?.glTFDoubleSide === true ? 1 : 0}`;
            let matIdx = ((json as any)._flat as Map<string, number> | undefined)?.get(fSig);
            if (matIdx === undefined) {
                materials.push({ name: `flat${materials.length}`, pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], roughnessFactor: mm.roughness, metallicFactor: mm.metalness }, ...((mm as any).userData?.glTFDoubleSide === true ? { doubleSided: true } : {}) });
                matIdx = materials.length - 1;
                ((json as any)._flat ??= new Map()).set(fSig, matIdx);
            }
            primitive.material = matIdx;
        }
        meshes.push({ name: mesh.name || `mesh${meshIdx}`, primitives: [primitive] });
        nodes.push({
            name: mesh.name || undefined,
            mesh: meshIdx,
            translation: [mesh.position.x, mesh.position.y, mesh.position.z],
            rotation: [mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w],
        });
        return nodes.length - 1;
    };
    json.scenes[0].nodes = walk(group);

    json.meshes = meshes; json.nodes = nodes;
    if (materials.length) { json.materials = materials; delete json._emissive; }
    if (images.length) json.images = images;
    if (samplers.length) json.samplers = samplers;
    if (textures.length) json.textures = textures;
    json.bufferViews = views;
    json.accessors = accessors;
    json.buffers = [{ byteLength: byteOffset }];

    const jsonStr = JSON.stringify(json);
    // GLB spec: chunk length INCLUDES padding (spaces, 0x20) to 4-byte
    // boundary. Readers advance by chunkLength — an unpadded length lands
    // them mid-pad and the BIN header reads as garbage.
    const jsonPad = (4 - (jsonStr.length % 4)) % 4;
    const jsonBuf = Buffer.from(jsonStr + " ".repeat(jsonPad), "utf8");
    const totalLen = 12 + 8 + jsonBuf.length + 8 + byteOffset;
    const out = Buffer.alloc(totalLen);
    let o = 0;
    out.writeUInt32LE(0x46546c67, o); o += 4;
    out.writeUInt32LE(2, o); o += 4;
    out.writeUInt32LE(totalLen, o); o += 4;
    out.writeUInt32LE(jsonBuf.length, o); o += 4;
    out.writeUInt32LE(0x4e4f534a, o); o += 4;
    jsonBuf.copy(out, o); o += jsonBuf.length;
    out.writeUInt32LE(byteOffset, o); o += 4;
    out.writeUInt32LE(0x004e4942, o); o += 4;
    let p = 0;
    for (const chunk of buffers) {
        Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength).copy(out, o + p);
        p += chunk.byteLength + ((4 - (chunk.byteLength % 4)) % 4);
    }
    return out;
}
