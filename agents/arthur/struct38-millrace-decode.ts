// struct38-millrace-decode.ts — decode materials + geometry buckets of the
// millrace GLB (probe, not verdict): print every glTF material's
// baseColorFactor/metallic/roughness/emissive and each merged node's mesh
// vertex count + world bbox, so the water-darkness root cause is read from
// accessor data, not guessed from renders.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const file = process.argv[2] ?? "agents/arthur/assets/village_millrace3.glb";
const buf = readFileSync(file);
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));

console.log("MATERIALS:");
(json.materials ?? []).forEach((m: any, i: number) => {
    const p = m.pbrMetallicRoughness ?? {};
    console.log(i, JSON.stringify({
        name: m.name,
        baseColor: p.baseColorFactor,
        metallic: p.metallicFactor,
        roughness: p.roughnessFactor,
        emissive: m.emissiveFactor,
        tex: p.baseColorTexture !== undefined,
    }));
});

// binary chunk
const bOff = 20 + jsonLen + 8;
const bin = buf.subarray(bOff);

function accView(a: any): { dv: DataView; count: number; comps: number; type: string } {
    const acc = json.accessors[a];
    const bv = json.bufferViews[acc.bufferView];
    const comps = acc.type === "VEC3" ? 3 : acc.type === "VEC2" ? 2 : 1;
    return { dv: new DataView(bin.buffer, bin.byteOffset + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0), acc.count * comps * 4), count: acc.count, comps, type: acc.componentType };
}

console.log("\nNODES/MESHES (world-space bbox per primitive):");
(json.meshes ?? []).forEach((mesh: any, mi: number) => {
    mesh.primitives.forEach((prim: any, pi: number) => {
        const pos = accView(prim.attributes.POSITION);
        const dv = pos.dv;
        let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < pos.count; i++) {
            for (let c = 0; c < 3; c++) {
                const v = dv.getFloat32((i * 3 + c) * 4, true);
                if (v < mn[c]) mn[c] = v;
                if (v > mx[c]) mx[c] = v;
            }
        }
        const node = (json.nodes ?? []).find((n: any) => n.mesh === mi);
        const t = node?.translation ?? [0, 0, 0];
        const wmn = mn.map((v, c) => +(v + t[c]).toFixed(3));
        const wmx = mx.map((v, c) => +(v + t[c]).toFixed(3));
        console.log(`${node?.name ?? "?"} prim${pi} mat${prim.material} verts=${pos.count} bbox=[${wmn}] .. [${wmx}]`);
    });
});
