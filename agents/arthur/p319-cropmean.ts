// p319-cropmean.ts — mean RGB of a crop box across N images (tube-region
// probe). Usage: bun p319-cropmean.ts <x0> <y0> <x1> <y1> <img...>
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const [x0, y0, x1, y1] = process.argv.slice(2, 6).map(Number);
for (const p of process.argv.slice(6)) {
    const I = PNG.sync.read(readFileSync(p));
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const i = (y * I.width + x) * 4;
        r += I.data[i]; g += I.data[i + 1]; b += I.data[i + 2]; n++;
    }
    console.log(p.split("/").slice(-2).join("/"), `mean(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)}) n=${n}`);
}
