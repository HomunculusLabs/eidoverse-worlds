// struct93-probe-night.ts — pixel probe: count warm pixels in night.png,
// locate the brass stud region, and print the center-post band colors.
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const png = PNG.sync.read(readFileSync(process.argv[2]));
const { width: W, height: H, data } = png;
let warm = 0;
const warmPts: number[][] = [];
for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r > 60 && r > b + 25 && r > g + 5) { warm++; warmPts.push([x, y, r, g, b]); }
    }
}
console.log("warm px:", warm);
if (warmPts.length) {
    console.log("first 12:", JSON.stringify(warmPts.slice(0, 12)));
    const xs = warmPts.map(p => p[0]), ys = warmPts.map(p => p[1]);
    console.log("bbox x", Math.min(...xs), Math.max(...xs), "y", Math.min(...ys), Math.max(...ys));
}
// center-post band dump (x 465-490, y 300-415) — sample every 8px
for (let y = 300; y <= 415; y += 8) {
    let row = "";
    for (let x = 465; x <= 490; x += 5) {
        const i = (y * W + x) * 4;
        row += `(${x},${y}:${data[i]},${data[i+1]},${data[i+2]}) `;
    }
    console.log(row);
}
