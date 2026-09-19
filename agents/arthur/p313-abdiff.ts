// p313-abdiff.ts — pixel diff before/after for the well-water candidate.
// Usage: bun agents/arthur/p313-abdiff.ts <beforeDir> <afterDir>
import { PNG } from "pngjs";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const A = resolve(process.argv[2] ?? "");
const B = resolve(process.argv[3] ?? "");
const files = readdirSync(B).filter(f => f.endsWith(".png")).sort();
let bad = 0;
for (const f of files) {
  const a = PNG.sync.read(readFileSync(join(A, f)));
  const b = PNG.sync.read(readFileSync(join(B, f)));
  if (a.width !== b.width || a.height !== b.height) { console.log(`${f}: SIZE MISMATCH`); bad++; continue; }
  let changed = 0, maxD = 0, sx = 1e9, ex = -1, sy = 1e9, ey = -1;
  for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
    const i = (y * a.width + x) * 4;
    const d = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
    if (d > 12) { changed++; if (d > maxD) maxD = d; if (x < sx) sx = x; if (x > ex) ex = x; if (y < sy) sy = y; if (y > ey) ey = y; }
  }
  if (changed === 0) console.log(`${f}: 0 changed px (byte-identical within threshold)`);
  else console.log(`${f}: ${changed} px changed, maxDelta ${maxD}, bbox x[${sx}..${ex}] y[${sy}..${ey}]`);
}
process.exit(bad ? 1 : 0);
