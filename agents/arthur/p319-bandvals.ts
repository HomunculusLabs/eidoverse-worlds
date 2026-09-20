// p319-bandvals.ts — knot-band mean RGB before/after in the night gameplay
// frames (18m): the knot occupies the mid-upper silhouette band. Usage:
// bun p319-bandvals.ts <before.png> <after.png> [y0] [y1]
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const B = PNG.sync.read(readFileSync(process.argv[2]));
const A = PNG.sync.read(readFileSync(process.argv[3]));
// find the monument band: rows where any pixel differs
let y0 = parseInt(process.argv[4] ?? "0"), y1 = parseInt(process.argv[5] ?? `${A.height}`);
let lo = A.height, hi = 0;
for (let y = 0; y < A.height; y++) for (let x = 0; x < A.width; x++) {
    const i = (y * A.width + x) * 4;
    if (Math.abs(A.data[i] - B.data[i]) > 6 || Math.abs(A.data[i + 2] - B.data[i + 2]) > 6) { if (y < lo) lo = y; if (y > hi) hi = y; }
}
y0 = Math.max(y0, lo); y1 = Math.min(y1, hi);
const band = (img: PNG) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = y0; y <= y1; y++) for (let x = 0; x < img.width; x++) {
        const i = (y * img.width + x) * 4;
        r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; n++;
    }
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
};
const cb = band(B), ca = band(A);
console.log(`band rows ${y0}..${y1}: before(${cb}) after(${ca}) delta(${ca.map((v, k) => v - cb[k])})`);
