// mkv3-cultivation-lavender-0027-probe.ts — REVIEW-tick rebuild prover (read-only).
// Replicates the lift-99 masonretex pipeline for exactly work index 1692
// (av-mason-0012, orchard): rng(i+1) + THEMES[i%L] + familyPass +
// mergeByMaterial(g,/_l$/) + toGLB. Writes nothing under agents/arthur/mason/.
import * as THREE from "three";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const A = `${import.meta.dir}/..`;
// same module-load contract as masonretex.ts: mason/stop EXISTS so the daemon halts on import
const st = JSON.parse(readFileSync(`${A}/mason/state.json`, "utf8"));
if ((st.idx as number) !== 1695) console.log(`note: state.idx=${st.idx} (window end differs from lift-99 snapshot ${1695})`);
const mason = await import("./mason.ts");
const THEMES = (mason as any).THEMES as ReadonlyArray<readonly [string, (g: THREE.Group, r: () => number) => string]>;
const { famMat } = await import("./familymap.ts");
const { mergeByMaterial } = await import("./mergekit.ts");
const { toGLB } = await import("./glbwrite.ts");

function rng(seed: number) { let s = (seed >>> 0) || 1; return () => { s = (s * 16607) % 2147483647; return s / 2147483647; }; }
function familyPass(g: THREE.Group) {
    const FAM_BY_COLOR = new Map<number, THREE.MeshStandardMaterial>();
    let swapped = 0, kept = 0;
    for (const mesh of g.children as THREE.Mesh[]) {
        const m = mesh.material as THREE.MeshStandardMaterial;
        if (!m) continue;
        const key = m.color ? m.color.getHex() : -1;
        if (key === 0xffffff && !m.map) { kept++; continue; }
        const fam = famMat(key);
        if (fam) { let t = FAM_BY_COLOR.get(key); if (!t) { t = fam; FAM_BY_COLOR.set(key, t); } mesh.material = t; swapped++; }
        else kept++;
    }
    return { swapped, kept };
}
const I = 1647;
const [themeName, compose] = THEMES[I % THEMES.length];
const g = new THREE.Group();
const r = rng(I + 1);
const desc = compose(g, r);
familyPass(g);
const merged = mergeByMaterial(g, /_l$/);
const glb = Buffer.from(toGLB(merged));
const ref = readFileSync(`${A}/mason/glb-retex/work_${I}_lavender.glb`);
console.log(JSON.stringify({
    index: I, theme: themeName, desc,
    rebuiltSha256: createHash("sha256").update(glb).digest("hex"),
    referenceSha256: createHash("sha256").update(ref).digest("hex"),
    byteIdentical: glb.equals(ref),
}));
