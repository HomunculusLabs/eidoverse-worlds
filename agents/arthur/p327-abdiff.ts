// p327-abdiff.ts — pixel diff before vs after for the polish-327
// contact-shadow candidate (pngjs from repo node_modules). Reports
// changed-px count, active row span, and grounding values in the plinth
// base strip vs far ground, before vs after.
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const load = (p: string) => PNG.sync.read(readFileSync(p));
const A = load(process.argv[2]);
const B = load(process.argv[3]);
const W = A.width, H = A.height;
if (B.width !== W || B.height !== H) { console.log("SIZE_MISMATCH"); process.exit(1); }

let changed = 0;
const rows = new Map<number, number>();
for (let y = 0; y < H; y++) {
    let rowChanged = 0;
    for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]);
        if (d > 12) { changed++; rowChanged++; }
    }
    if (rowChanged) rows.set(y, rowChanged);
}
const ys = Array.from(rows.keys()).sort((a, b) => a - b);
console.log(`changed=${changed} (${(changed / (W * H) * 100).toFixed(2)}%)`);
console.log(`rows y[${ys.length ? ys[0] : "none"}..${ys.length ? ys[ys.length - 1] : "none"}] with ${rows.size} active rows`);

const strip = (img: PNG, y0: number, y1: number) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = y0; y <= y1; y++) for (let x = 300; x < 660; x++) {
        const i = (y * W + x) * 4;
        r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; n++;
    }
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
};
console.log("after  base-strip y470..520:", JSON.stringify(strip(B, 470, 520)));
console.log("before base-strip y470..520:", JSON.stringify(strip(A, 470, 520)));
console.log("after  far-ground  y560..600:", JSON.stringify(strip(B, 560, 600)));
console.log("before far-ground  y560..600:", JSON.stringify(strip(A, 560, 600)));
