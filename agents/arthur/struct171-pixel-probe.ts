// struct171-pixel-probe.ts — night-frame warm-pixel census at the bead's
// expected 18m projection (deterministic readback, no judge).
// Geometry: camera (0,1.65,18) → target (0,~1.71,0), 42deg vFOV, 720px tall.
// Bead center world (0,2.42,0): angular elev ≈ atan(0.71/18) → ~77px above
// frame center → expect (480, ~283) ±60. Warm = R>140, R-B>60, G between.
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const frames = [
    ["night v2", "agents/arthur/reviews/struct171-kuen-v2/night.png", 480, 283, 70],
    ["night v1", "agents/arthur/reviews/struct171-kuen/night.png", 480, 283, 70],
    ["gameplay v2 (day)", "agents/arthur/reviews/struct171-kuen-v2/gameplay.png", 480, 283, 70],
] as const;

for (const [name, path, cx, cy, rad] of frames) {
    const png = PNG.sync.read(readFileSync(path));
    const idx = (x: number, y: number) => (png.width * y + x) << 2;
    let warm = 0, brightest: [number, number, number, number, number] | null = null;
    let lumSum = 0, n = 0;
    for (let y = Math.max(0, cy - rad); y < Math.min(png.height, cy + rad); y++) {
        for (let x = Math.max(0, cx - rad); x < Math.min(png.width, cx + rad); x++) {
            const i = idx(x, y);
            const R = png.data[i], G = png.data[i + 1], B = png.data[i + 2];
            n++; lumSum += (R + G + B) / 3;
            if (R > 140 && R - B > 60) { warm++; if (!brightest || R > brightest[3]) brightest = [x, y, 0, R, B]; }
        }
    }
    console.log(`${name}: warm px ${warm}/${n} in ${rad}px window at (${cx},${cy})${brightest ? ` — brightest warm at (${brightest[0]},${brightest[1]}) R${brightest[3]} B${brightest[4]}` : ""} — window mean lum ${(lumSum / n).toFixed(1)}`);
}
