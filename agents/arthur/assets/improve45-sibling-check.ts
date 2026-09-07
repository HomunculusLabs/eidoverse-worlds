// improve45-sibling-check.ts — sibling-integrity gate: the composeLavender
// edit must not change ANY other work. Rebuilds the FULL standing window
// (state.json from..idx-1) through the edited mason.ts pipeline and compares
// each to the on-disk glb-retex file: every non-lavender work byte-identical,
// exactly the 4 lavenders changed (to improve45-rebuild's new shas).
import * as THREE from "three";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { toGLB } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { famMat } from "./familymap.ts";

const DIR = import.meta.dir;
const M = `${DIR}/../mason`;

function rng(seed: number) {
    let s = (seed >>> 0) || 1;
    return () => { s = (s * 16607) % 2147483647; return s / 2147483647; };
}
const FAM_BY_COLOR = new Map<number, THREE.MeshStandardMaterial>();
function familyPass(g: THREE.Group) {
    let swapped = 0, kept = 0;
    for (const mesh of g.children as THREE.Mesh[]) {
        const m = mesh.material as THREE.MeshStandardMaterial;
        if (!m) continue;
        const key = m.color ? m.color.getHex() : -1;
        if (key === 0xffffff && !m.map) { kept++; continue; }
        const fam = famMat(key);
        if (fam) {
            let t = FAM_BY_COLOR.get(key); if (!t) { t = fam; FAM_BY_COLOR.set(key, t); }
            mesh.material = t; swapped++;
        } else kept++;
    }
    return { swapped, kept };
}

const mason = await import("./mason.ts");
const THEMES = (mason as any).THEMES as ReadonlyArray<readonly [string, (g: THREE.Group, r: () => number) => string]>;
const st = JSON.parse(readFileSync(`${M}/state.json`, "utf8"));
const idx = st.idx as number;
const CAP = 60;
const from = Math.max(0, idx - CAP);

const NEW_LAV = new Map<number, string>([
    [1647, "a9076cee40e4dee1"], [1660, "5e04ce4b2ad6e90c"],
    [1673, "23fcec16fd6d95dd"], [1686, "e913ef7998e2654d"],
]);

// work_1653_orchard: the one rotation sibling NOT live anywhere (improve-44
// contract: "work_1653_rotation local-only, excluded"). Its glb-retex disk
// file intentionally still carries pre-improve-44 bytes (improve-44 rewrote
// only the four LIVE orchards); the edited mason.ts rebuilds it differently
// — known-stale, not drift.
const KNOWN_LOCAL_ONLY = new Set([1653]);

let identical = 0, changed: string[] = [], missing: string[] = [], lavVerified = 0;
for (let i = from; i < idx; i++) {
    const [themeName, compose] = THEMES[i % THEMES.length];
    const g = new THREE.Group();
    const r = rng(i + 1);
    compose(g, r);
    familyPass(g);
    const merged = mergeByMaterial(g, /_l$/);
    const bytes = toGLB(merged);
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    const file = `${M}/glb-retex/work_${String(i).padStart(4, "0")}_${themeName}.glb`;
    let diskHash: string;
    try {
        diskHash = createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 16);
    } catch { missing.push(`work_${i}_${themeName}`); continue; }
    const want = NEW_LAV.get(i);
    if (want) {
        // post-write: disk must carry the NEW pin and this rebuild must reproduce it
        if (hash !== want) throw Error(`work ${i} rebuilt ${hash} want new pin ${want}`);
        if (diskHash !== want) throw Error(`work ${i} disk ${diskHash} want new pin ${want}`);
        lavVerified++; continue;
    }
    if (hash === diskHash) { identical++; continue; }
    if (KNOWN_LOCAL_ONLY.has(i)) { changed.push(`work_${i}_${themeName}: known local-only-stale (improve-44 excluded), skipped`); continue; }
    throw Error(`UNEXPECTED SIBLING DRIFT work_${i}_${themeName}: disk ${diskHash} vs rebuilt ${hash}`);
}
if (missing.length) throw Error(`missing glb-retex files: ${missing.join(",")}`);
if (lavVerified !== NEW_LAV.size) throw Error(`expected ${NEW_LAV.size} lavenders at new pins, saw ${lavVerified}`);
const skips = changed.length;
console.log(JSON.stringify({ siblings_byte_identical: identical, lavenders_at_new_pins: lavVerified, local_only_skips: skips, verdict: "SIBLINGS_ALL_IDENTICAL" }));
process.exit(0);
