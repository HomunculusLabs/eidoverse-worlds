// improve38-rebuild-seed.ts — dedicated window rebuild for the improve-38
// seed-core cure (masonretex chassis, single-work scope). Rebuilds the four
// standing seed works (1644/1657/1670/1683) with the edited
// composeSeedOfLife, through the exact live pipeline:
// compose -> familyPass -> mergeByMaterial -> toGLB -> work_NNNN_seed.glb.
//
// Gates (fail-closed, before any write lands):
//  1. baseline reproduction: importing the CURRENT mason.ts must
//     regenerate work_1644_seed.glb == live pin 710ec3e5... AFTER we
//     verify the on-disk baseline file already matches; the pipeline is
//     deterministic, so the only acceptable outcome is the new sha.
//     (The baseline sha was proven == live census lib prefix this tick.)
//  2. family keeps ONE shared sha: all four outputs identical.
//  3. nothing else changes: 56 sibling works untouched (caller diffs
//     /tmp/improve38-retex-before.txt).
// Determinism: run twice, compare outputs (caller).
import * as THREE from "three";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { toGLB, mat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { famMat } from "./familymap.ts";

const DIR = import.meta.dir;

function rng(seed: number) {
    let s = (seed >>> 0) || 1;
    return () => { s = (s * 16607) % 2147483647; return s / 2147483647; };
}

// familyPass (copied verbatim from masonretex.ts — the live build chain):
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
            let target = FAM_BY_COLOR.get(key);
            if (!target) { target = fam; FAM_BY_COLOR.set(key, target); }
            mesh.material = target;
            swapped++;
        } else {
            kept++;
        }
    }
    return { swapped, kept };
}

// import the composers WITHOUT running the daemon (stop file exists —
// masonretex.ts documents this as safe).
const mason = await import("./mason.ts");
const THEMES = (mason as any).THEMES as ReadonlyArray<readonly [string, (g: THREE.Group, r: () => number) => string]>;
const seedIdx = THEMES.findIndex(([n]) => n === "seed");
if (seedIdx !== 6) throw Error(`seed theme not at idx 6 (found ${seedIdx})`);

// masonretex-compatible work selection: work i uses THEMES[i % 13]; seeds
// are works where i % 13 === 6. The four standing seeds:
const WORKS = [1644, 1657, 1670, 1683];
const OUT = `${DIR}/../mason/glb-retex`;
const LIVE_SHA = "710ec3e5c66a0378";

// gate 1: no disputed bytes — on-disk baseline must be EITHER the live pin
// (first run) or this tool's own deterministic v2 output (re-run via
// --again, which skips the baseline gate and asserts hash equality
// instead). v1 material-less build (3c233f78) caught + superseded.
const AGAIN = process.argv.includes("--again");
const PIN = "e35efe724cd998e6"; // v3 (bead nestled 2.44); v1 3c233f78 material-less, v2 f9d00690 floating bead — both superseded
const baseline = readFileSync(`${OUT}/work_1644_seed.glb`);
const baseHash = createHash("sha256").update(baseline).digest("hex").slice(0, 16);
if (!AGAIN && baseHash !== LIVE_SHA) throw Error(`baseline drift: ${baseHash}`);
if (AGAIN && baseHash !== PIN) throw Error(`--again baseline drift: ${baseHash}`);

const hashes: string[] = [];
for (const i of WORKS) {
    const [themeName, compose] = THEMES[i % THEMES.length];
    if (themeName !== "seed") throw Error(`work ${i} theme ${themeName}`);
    const g = new THREE.Group();
    const r = rng(i + 1);
    const desc = compose(g, r);
    const { swapped, kept } = familyPass(g);
    const merged = mergeByMaterial(g, /_l$/);
    const bytes = toGLB(merged);
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    hashes.push(hash);
    if (hash === LIVE_SHA) throw Error(`work ${i} rebuilt to the OLD sha — edit did not land`);
    writeFileSync(`${OUT}/work_${String(i).padStart(4, "0")}_${themeName}.glb`, bytes);
    console.log(`work_${i} ${themeName}: ${desc} | fam-swapped ${swapped}, flat-kept ${kept} | ${hash}`);
}
// gate 2: one shared family sha
if (new Set(hashes).size !== 1) throw Error(`family shas diverged: ${hashes.join(", ")}`);
console.log(`FAMILY_ONE_SHA ${hashes[0]}`);
