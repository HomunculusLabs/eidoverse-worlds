// p319-tubestats.ts — knot-tube pixel statistics before vs after in the
// knotclose day frame. The tube occupies the frame center region; we sample
// rows 200..500, cols 250..700 and report luminance percentiles + warm ratio.
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const stats = (path: string) => {
    const I = PNG.sync.read(readFileSync(path));
    const vals: number[] = [];
    let warm = 0, n = 0;
    for (let y = 200; y < 500; y++) for (let x = 250; x < 700; x++) {
        const i = (y * I.width + x) * 4;
        const r = I.data[i], g = I.data[i + 1], b = I.data[i + 2];
        vals.push(Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b));
        if (r > b + 15) warm++;
        n++;
    }
    vals.sort((a, b) => a - b);
    const p = (q: number) => vals[Math.floor(q * (vals.length - 1))];
    return `p10=${p(0.1)} p50=${p(0.5)} p90=${p(0.9)} p99=${p(0.99)} max=${vals[vals.length - 1]} warm%=${(100 * warm / n).toFixed(1)}`;
};
for (const p of process.argv.slice(2)) console.log(p.split("/").slice(-2).join("/"), "=>", stats(p));
