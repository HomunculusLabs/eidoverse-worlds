// artwalk49-mount-diff.ts — old (store DRACO) vs new (local) host geometry at rider bands.
// Uses accessor min/max + node translations (DRACO-safe). Compares the set of
// mesh-node world bboxes intersecting each rider volume; reports any node present
// in NEW but absent (moved/added) within the band, and any OLD node gone.
import { readFileSync } from "node:fs";

function nodeBoxes(buf: Buffer) {
    const jsonLen = Number(new DataView(buf.buffer, buf.byteOffset + 12, 4).getUint32(0, true));
    const j = JSON.parse(new TextDecoder().decode(buf.subarray(20, 20 + jsonLen)));
    const out: Array<{ min: number[]; max: number[] }> = [];
    const stack: Array<[number, number[]]> = j.scenes[0].nodes.map((n: number) => [n, [0, 0, 0]]);
    while (stack.length) {
        const [ni, tr] = stack.pop()!;
        const n = j.nodes[ni];
        const t = n.translation ? [tr[0] + n.translation[0], tr[1] + n.translation[1], tr[2] + n.translation[2]] : tr;
        if (n.mesh !== undefined) {
            for (const prim of j.meshes[n.mesh].primitives) {
                const a = j.accessors[prim.attributes.POSITION];
                if (!a.min || !a.max) continue;
                out.push({
                    min: [a.min[0] + t[0], a.min[1] + t[1], a.min[2] + t[2]],
                    max: [a.max[0] + t[0], a.max[1] + t[1], a.max[2] + t[2]],
                });
            }
        }
        for (const c of n.children ?? []) stack.push([c, t]);
    }
    return out;
}
const overlap = (a: { min: number[]; max: number[] }, vol: { min: number[]; max: number[] }, pad = 0.05) =>
    a.min[0] <= vol.max[0] + pad && a.max[0] >= vol.min[0] - pad &&
    a.min[1] <= vol.max[1] + pad && a.max[1] >= vol.min[1] - pad &&
    a.min[2] <= vol.max[2] + pad && a.max[2] >= vol.min[2] - pad;
const key = (b: { min: number[]; max: number[] }) => b.min.map(v => +v.toFixed(2)).join(",") + "|" + b.max.map(v => +v.toFixed(2)).join(",");

// [tag, oldStoreFile, newLocalFile, riderVolMin, riderVolMax]
const jobs: Array<[string, string, string, number[], number[]]> = [
    ["b2-lintel", "/tmp/artwalk49-oldhosts/9fdf24522f0de63f.glb", "agents/arthur/assets/village_inn3.glb", [-1.175, 2.5, 2.945], [1.175, 3.06, 3.15]],
    ["b2-threshold", "/tmp/artwalk49-oldhosts/9fdf24522f0de63f.glb", "agents/arthur/assets/village_inn3.glb", [-0.83, 0.198, 2.77], [0.83, 0.25, 3.13]],
    ["b3-porch", "/tmp/artwalk49-oldhosts/a4e277782dde8c04.glb", "agents/arthur/assets/village_potter3.glb", [-0.725, 0, -1.725], [3.825, 3.085, 2.425]],
    ["b9-loom", "/tmp/artwalk49-oldhosts/8d750d7826584d9d.glb", "agents/arthur/assets/village_dyehouse3.glb", [-1.125, 0.48, -0.805], [1.125, 1.34, -0.668]],
    ["b10-crown", "/tmp/artwalk49-oldhosts/4feee38977d7c6e5.glb", "agents/arthur/assets/village_windmill3.glb", [-1.125, 2.22, 2.585], [1.125, 2.87, 2.755]],
    ["b12-contours", "/tmp/artwalk49-oldhosts/69c0e48a917d4ed2.glb", "agents/arthur/assets/village_kiln3.glb", [-0.775, 0.026, 1.145], [0.775, 1.614, 1.27]],
    ["b13-posts", "/tmp/artwalk49-oldhosts/558489ed8a6477c4.glb", "agents/arthur/assets/village_gate.glb", [-1.7, 0.5, -0.212], [1.7, 2.12, -0.102]],
];

for (const [tag, oldF, newF, vmin, vmax] of jobs) {
    const oldBoxes = nodeBoxes(readFileSync(oldF)).filter(b => overlap(b, { min: vmin, max: vmax }));
    const newBoxes = nodeBoxes(readFileSync(newF)).filter(b => overlap(b, { min: vmin, max: vmax }));
    const oldKeys = new Set(oldBoxes.map(key));
    const newKeys = new Set(newBoxes.map(key));
    const added = [...newKeys].filter(k => !oldKeys.has(k));
    const removed = [...oldKeys].filter(k => !newKeys.has(k));
    // coverage: fraction of the band spanned by old vs new (max extent per axis among band nodes)
    const ext = (bs: typeof oldBoxes) => {
        if (!bs.length) return null;
        const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
        for (const b of bs) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], b.min[a]); mx[a] = Math.max(mx[a], b.max[a]); }
        return [mn.map(v => +v.toFixed(2)), mx.map(v => +v.toFixed(2))];
    };
    console.log(`${tag}: oldNodes=${oldBoxes.length} newNodes=${newBoxes.length} added=${JSON.stringify(added)} removed=${JSON.stringify(removed)}`);
    console.log(`   oldExt=${JSON.stringify(ext(oldBoxes))} newExt=${JSON.stringify(ext(newBoxes))}`);
}
