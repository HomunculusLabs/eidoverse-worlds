// polish-305 probe — pixel metrics for stringlights night wire readability.
// Counts warm px (R>100, R>G, R>B — the polish-304 metric) and faint-warm px
// (40<R<=100, R>G, R>B — the sheen band a wire would occupy) per night frame.
// Usage: bun agents/arthur/p305-nightprobe.ts <night.png> [...]
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

for (const file of process.argv.slice(2)) {
  const png = PNG.sync.read(readFileSync(file));
  const { width: w, height: h, data: d } = png;
  let warm = 0, faint = 0, bg = 0;
  let faintRows = new Set<number>();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r > 100 && r > g && r > b) { warm++; faintRows.add(y); }
      else if (r > 40 && r <= 100 && r >= g && r > b) { faint++; faintRows.add(y); }
      else bg++;
    }
  }
  console.log(`${file}: warm=${warm} faint-warm=${faint} rows-with-any-glow=${faintRows.size} of ${h}`);
}
