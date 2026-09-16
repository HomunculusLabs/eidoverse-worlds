// survey379-warm-probe.ts — deterministic full-frame warm-cluster census on the
// survey379 nephroid night frames (s363 sole-bead law: exactly ONE warm
// cluster per frame — the glow_as_1 bead at the nephroid CUSP; zero spill).
// Warm = R>140, R-B>60, G strictly between (struct171 law). 8-neighbor
// connected components; clusters >=2 px reported (single-px = alias noise).
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const frames = [
    ["night (gameplay 18m)", "agents/arthur/reviews/survey382-folium/night.png"],
    ["night-face (front)", "agents/arthur/reviews/survey382-folium/night-face.png"],
] as const;

for (const [name, path] of frames) {
    const png = PNG.sync.read(readFileSync(path));
    const { width: W, height: H, data } = png;
    const warm = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const i = (W * y + x) << 2;
            const R = data[i], G = data[i + 1], B = data[i + 2];
            if (R > 140 && R - B > 60 && G > B && G < R) warm[W * y + x] = 1;
        }
    }
    const seen = new Uint8Array(W * H);
    const clusters: Array<{ px: number; x0: number; x1: number; y0: number; y1: number }> = [];
    const stack: number[] = [];
    for (let p = 0; p < W * H; p++) {
        if (!warm[p] || seen[p]) continue;
        stack.length = 0; stack.push(p); seen[p] = 1;
        let px = 0, x0 = W, x1 = 0, y0 = H, y1 = 0;
        while (stack.length) {
            const q = stack.pop()!;
            const qx = q % W, qy = (q / W) | 0;
            px++; x0 = Math.min(x0, qx); x1 = Math.max(x1, qx);
            y0 = Math.min(qy, y0); y1 = Math.max(qy, y1);
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = qx + dx, ny = qy + dy;
                    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
                    const nq = W * ny + nx;
                    if (warm[nq] && !seen[nq]) { seen[nq] = 1; stack.push(nq); }
                }
            }
        }
        clusters.push({ px, x0, x1, y0, y1 });
    }
    const significant = clusters.filter(c => c.px >= 2);
    console.log(`${name}: ${significant.length} warm cluster(s) >=2px`);
    for (const c of significant.sort((a, b) => b.px - a.px)) {
        console.log(`  cluster ${c.px}px bbox x${c.x0}-${c.x1} y${c.y0}-${c.y1}`);
    }
    const singles = clusters.length - significant.length;
    if (singles > 0) console.log(`  (${singles} single-px warm px, alias noise)`);
}
console.log("PROBE DONE");
