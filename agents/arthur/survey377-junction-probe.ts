// survey377-junction-probe.ts — deterministic falsification of the closeface
// judge's "floating outer terminus" claim. In closeface.png (960x720 full-res;
// judge coords were 480x360 small => x2), the judge put the terminus at
// small(340,130) => full(680,260) and the mast at x full(500-514), junction
// height full-y ~234 (small ~117). Corridor test: walk x from 690 down to 495,
// following the band slope (26px drop over 180px), tolerance +-30px, and
// classify each column: SKY-ONLY (gap) vs STONE/DARK PRESENT (band continues).
// A continuous run of sky-only columns between terminus and mast = real gap;
// no gap = the "terminus" is the band's silhouette edge and the coil continues
// to the mast (misread class, probe-law-11 resolution).
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const png = PNG.sync.read(readFileSync("agents/arthur/reviews/survey377-archispiral/closeface.png"));
const { width: W, data } = png;
const H = png.height;

// sky bg is 0xcbd6df (203,214,223); night not used here
const isSky = (R: number, G: number, B: number) => Math.abs(R - 203) < 26 && Math.abs(G - 214) < 26 && Math.abs(B - 223) < 26;

// band path: from (690, ~262) to (495, ~234), linear
const x0 = 690, y0 = 262, x1 = 495, y1 = 234;
const slope = (y1 - y0) / (x1 - x0);
const TOL = 30;

let gapRuns: Array<{ from: number; to: number }> = [];
let runStart = -1;
const cols: Array<{ x: number; skyOnly: boolean; stone: number; dark: number; sky: number; brass: number }> = [];
for (let x = x0; x >= x1; x--) {
    const yc = Math.round(y0 + slope * (x - x0));
    let sky = 0, stone = 0, dark = 0, brass = 0, n = 0;
    for (let y = Math.max(0, yc - TOL); y < Math.min(H, yc + TOL); y++) {
        const i = (W * y + x) << 2;
        const R = data[i], G = data[i + 1], B = data[i + 2];
        n++;
        if (isSky(R, G, B)) sky++;
        else if (R > 100 && R - B > 40 && G > 60 && G < R) brass++;          // warm brass peg
        else if (R + G + B < 260) dark++;                                     // iron mast / deep shadow / dark ground
        else stone++;                                                          // pale stone band
    }
    const skyOnly = stone === 0 && dark === 0 && brass === 0;
    cols.push({ x, skyOnly, stone, dark, sky, brass });
    if (skyOnly) { if (runStart < 0) runStart = x; }
    else { if (runStart >= 0) { gapRuns.push({ from: runStart, to: x + 1 }); runStart = -1; } }
}
if (runStart >= 0) gapRuns.push({ from: runStart, to: x1 });

console.log(`corridor ${x0}->${x1} (y ${y0}->${y1}, tol ${TOL}):`);
console.log(`  sky-only column runs (gaps): ${gapRuns.length}`);
for (const g of gapRuns) console.log(`    GAP x ${g.from}..${g.to} (${g.from - g.to + 1} cols)`);
// summary by 20-col segments
for (let s = x0; s > x1; s -= 40) {
    const seg = cols.filter(c => c.x <= s && c.x > s - 40);
    const avg = (k: "stone" | "dark" | "sky" | "brass") => Math.round(seg.reduce((a, c) => a + c[k], 0) / seg.length);
    const gaps = seg.filter(c => c.skyOnly).length;
    console.log(`  x ${s}..${s - 39}: stone~${avg("stone")} dark~${avg("dark")} sky~${avg("sky")} brass~${avg("brass")} skyOnlyCols=${gaps}`);
}
console.log("JUNCTION PROBE DONE");
