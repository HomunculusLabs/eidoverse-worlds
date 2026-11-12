// polish-305 — diff-of-diff: over ONLY changed pixels (the wire), report
// before→after mean and p50/p95/max per view. Day + night.
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const dir = "agents/arthur/reviews/hero-assets/polish-305-stringlights-wire";
const sub = process.argv[2] ?? "after";
for (const f of ["front.png", "gameplay.png", "night.png"]) {
  const A = PNG.sync.read(readFileSync(`${dir}/${sub}/${f}`));
  const B = PNG.sync.read(readFileSync(`${dir}/before/${f}`));
  const deltas: number[] = [];
  let rA = 0, gA = 0, bA = 0, rB = 0, gB = 0, bB = 0;
  for (let i = 0; i < A.data.length; i += 4) {
    const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2]));
    if (d > 0) {
      deltas.push(d);
      rA += A.data[i]; gA += A.data[i + 1]; bA += A.data[i + 2];
      rB += B.data[i]; gB += B.data[i + 1]; bB += B.data[i + 2];
    }
  }
  deltas.sort((x, y) => x - y);
  const n = deltas.length;
  const q = (p: number) => deltas[Math.min(n - 1, Math.floor(p * n))];
  console.log(`${f}: n=${n} meanRGB ${n ? `(${(rB / n).toFixed(0)},${(gB / n).toFixed(0)},${(bB / n).toFixed(0)})->(${(rA / n).toFixed(0)},${(gA / n).toFixed(0)},${(bA / n).toFixed(0)})` : "-"} delta p50=${q(.5)} p95=${q(.95)} max=${q(1)}`);
}
