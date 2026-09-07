// improve44-rebuild-orchards.ts — dedicated window rebuild for the improve-44
// orchard family cure (improve43-rebuild-cairns chassis verbatim).
// Rebuilds the FOUR standing rotation orchards (1640/1666/1679/1692) with the
// edited composeOrchard, through the exact live pipeline:
// compose -> familyPass -> mergeByMaterial -> toGLB -> work_NNNN_orchard.glb.
// The fifth family member (orchard-0033) is the bespoke nvp-24 build
// (mkv3-cultivation-orchard-0033.ts) — rebuilt separately by that script.
//
// Modes:
//   (no flag)  baseline gate: mason.ts must still reproduce the four LIVE
//              pins byte-identically (no disputed bytes); writes NOTHING to
//              glb-retex (only /tmp), then exits — run BEFORE the edit.
//   --again    determinism gate: on-disk outputs must equal this tool's
//              own rebuild (hash equality), rewrites nothing.
//   --write    post-edit: writes the four new outputs to glb-retex and
//              prints the new shas; baseline = the four live pins must NOT
//              regenerate (edit landed), 57 sibling works untouched
//              (caller diffs /tmp/improve44-retex-before.txt).
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
const orchIdx = THEMES.findIndex(([n]) => n === "orchard");
if (orchIdx !== 2) throw Error(`orchard theme not at idx 2 (found ${orchIdx})`);

// masonretex-compatible work selection: work i uses THEMES[i % 13]; orchards
// are works where i % 13 === 2. The four standing rotation orchards and their
// LIVE pins (census 2026-09-07 improve-44, no disputed bytes; work 1653 is a
// rotation sibling NOT live anywhere — excluded):
const WORKS: Array<[number, string]> = [
    [1640, "24bcfc6a15d55613"], // live nx-cultivation-orchard-0020
    [1666, "ec93dc09acc0ddfa"], // live nx-cultivation-orchard-0046
    [1679, "8d3959f01e32c335"], // live nx-cultivation-orchard-0059
    [1692, "dc4d7059985e47a8"], // live nx-cultivation-orchard-0012
];
const OUT = `${DIR}/../mason/glb-retex`;

const AGAIN = process.argv.includes("--again");
const WRITE = process.argv.includes("--write");
if (AGAIN && WRITE) throw Error("pick one mode");

const shas = new Map<number, string>();
for (const [i, pin] of WORKS) {
    const [themeName, compose] = THEMES[i % THEMES.length];
    if (themeName !== "orchard") throw Error(`work ${i} theme ${themeName}`);
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
        const disk = readFileSync(`${OUT}/work_${String(i).padStart(4, "0")}_orchard.glb`);
        const diskHash = createHash("sha256").update(disk).digest("hex").slice(0, 16);
        if (diskHash !== hash) throw Error(`work ${i} --again drift: disk ${diskHash} vs built ${hash}`);
        console.log(`work_${i} DETERMINISTIC ${hash}`);
        continue;
    }
    if (WRITE) {
        if (hash === pin) throw Error(`work ${i} rebuilt to the OLD live sha — edit did not land`);
        writeFileSync(`${OUT}/work_${String(i).padStart(4, "0")}_orchard.glb`, bytes);
        console.log(`work_${i}: ${desc} | swapped ${swapped} kept ${kept} | ${hash} (was ${pin})`);
    } else {
        // baseline reproduction gate (pre-edit): byte-equal to live pin
        if (hash !== pin) throw Error(`work ${i} baseline drift: ${hash} want ${pin}`);
        writeFileSync(`/tmp/improve44-repro-${i}.glb`, bytes);
        console.log(`work_${i}: ${desc} | swapped ${swapped} kept ${kept} | ${hash} == LIVE PIN REPRODUCED`);
    }
}
if (!AGAIN) console.log(WRITE ? "FOUR_NEW_SHAS " + [...shas.values()].join(",") : "BASELINE_ALL_FOUR_REPRODUCED");
