// improve40-rebuild-mosaic.ts — dedicated window rebuild for the improve-40
// mosaic-panel cure (masonretex chassis, improve38-rebuild-seed pattern).
// Rebuilds the four standing gallery mosaic works (1643/1656/1669/1682)
// with the edited composeMosaic, through the exact live pipeline:
// compose -> familyPass -> mergeByMaterial -> toGLB -> work_NNNN_mosaic.glb.
// Distinct rng per work -> FOUR distinct shas (family is NOT degenerate).
//
// Modes:
//   (no flag)  baseline gate: mason.ts must still reproduce the four LIVE
//              pins byte-identically (no disputed bytes); writes NOTHING to
//              glb-retex (only /tmp), then exits — run BEFORE the edit.
//   --again    determinism gate: on-disk outputs must equal this tool's
//              own v1 pins (hash equality), rewrites nothing to glb-retex.
//   --write    post-edit: writes the four new outputs to glb-retex and
//              prints the new shas; baseline = the four live pins must NOT
//              regenerate (edit landed), 56 sibling works untouched
//              (caller diffs /tmp/improve40-retex-before.txt).
import * as THREE from "three";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { toGLB } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { famMat } from "./familymap.ts";

const DIR = import.meta.dir;

function rng(seed: number) {
    let s = (seed >>> 0) || 1;
    return () => { s = (s * 16607) % 2147483647; return s / 2147483647; };
}

// familyPass (copied verbatim from masonretex.ts — the live build chain)
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
        } else kept++;
    }
    return { swapped, kept };
}

// import the composers WITHOUT running the daemon (stop file exists —
// masonretex.ts documents this as safe).
const mason = await import("./mason.ts");
const THEMES = (mason as any).THEMES as ReadonlyArray<readonly [string, (g: THREE.Group, r: () => number) => string]>;
const mosIdx = THEMES.findIndex(([n]) => n === "mosaic");
if (mosIdx !== 5) throw Error(`mosaic theme not at idx 5 (found ${mosIdx})`);

// masonretex-compatible work selection: work i uses THEMES[i % 13]; mosaics
// are works where i % 13 === 5. The four standing mosaics and their LIVE pins
// (census 2026-09-07 improve-40, no disputed bytes):
const WORKS: Array<[number, string]> = [
    [1643, "1655ae806c3b8fe3"], // live nx-gallery-mosaic-0036
    [1656, "b6491515b25ef439"], // live nx-gallery-mosaic-0048
    [1669, "83c4817f73507493"], // live nx-gallery-mosaic-0052
    [1682, "505bec0b589f786f"], // live nx-gallery-mosaic-0059
];
const OUT = `${DIR}/../mason/glb-retex`;

const AGAIN = process.argv.includes("--again");
const WRITE = process.argv.includes("--write");
if (AGAIN && WRITE) throw Error("pick one mode");

const shas = new Map<number, string>();
for (const [i, pin] of WORKS) {
    const [themeName, compose] = THEMES[i % THEMES.length];
    if (themeName !== "mosaic") throw Error(`work ${i} theme ${themeName}`);
    const g = new THREE.Group();
    const r = rng(i + 1);
    const desc = compose(g, r);
    const { swapped, kept } = familyPass(g);
    const merged = mergeByMaterial(g, /_l$/);
    const bytes = toGLB(merged);
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    shas.set(i, hash);
    if (AGAIN) {
        // determinism: on-disk must equal this run exactly
        const disk = readFileSync(`${OUT}/work_${String(i).padStart(4, "0")}_mosaic.glb`);
        const diskHash = createHash("sha256").update(disk).digest("hex").slice(0, 16);
        if (diskHash !== hash) throw Error(`work ${i} --again drift: disk ${diskHash} vs built ${hash}`);
        console.log(`work_${i} DETERMINISTIC ${hash}`);
        continue;
    }
    if (WRITE) {
        if (hash === pin) throw Error(`work ${i} rebuilt to the OLD live sha — edit did not land`);
        writeFileSync(`${OUT}/work_${String(i).padStart(4, "0")}_mosaic.glb`, bytes);
        console.log(`work_${i}: ${desc} | swapped ${swapped} kept ${kept} | ${hash} (was ${pin})`);
    } else {
        // baseline reproduction gate (pre-edit): byte-equal to live pin
        if (hash !== pin) throw Error(`work ${i} baseline drift: ${hash} want ${pin}`);
        writeFileSync(`/tmp/improve40-repro-${i}.glb`, bytes);
        console.log(`work_${i}: ${desc} | swapped ${swapped} kept ${kept} | ${hash} == LIVE PIN REPRODUCED`);
    }
}
if (!AGAIN) console.log(WRITE ? "FOUR_NEW_SHAS " + [...shas.values()].join(",") : "BASELINE_ALL_FOUR_REPRODUCED");
