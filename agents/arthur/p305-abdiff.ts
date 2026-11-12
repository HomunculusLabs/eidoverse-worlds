// polish-305 — A/B pixel diff between before/ and after/ rigs (same renderer,
// same views). Reports changed-px count per view + a warm/faint-warm recount
// of the night frames. Usage: bun agents/arthur/p305-abdiff.ts <beforeDir> <afterDir>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";

const [bDir, aDir] = [process.argv[2], process.argv[3]].map(p => join(process.cwd(), p));
const files = readdirSync(aDir).filter(f => f.endsWith(".png")).sort();
for (const f of files) {
  let bp: Buffer;
  try { bp = readFileSync(join(bDir, f)); } catch { console.log(`${f}: NO-BASELINE`); continue; }
  const A = PNG.sync.read(readFileSync(join(aDir, f)));
  const B = PNG.sync.read(bp);
  if (A.width !== B.width || A.height !== B.height) { console.log(`${f}: SIZE-MISMATCH`); continue; }
  let changed = 0, maxD = 0;
  let warmA = 0, warmB = 0, faintA = 0, faintB = 0;
  for (let y = 0; y < A.height; y++) for (let x = 0; x < A.width; x++) {
    const i = (y * A.width + x) * 4;
    const dr = Math.abs(A.data[i] - B.data[i]), dg = Math.abs(A.data[i + 1] - B.data[i + 1]), db = Math.abs(A.data[i + 2] - B.data[i + 2]);
    const d = Math.max(dr, dg, db);
    if (d > 0) { changed++; if (d > maxD) maxD = d; }
    const warm = (d_: PNG, i_: number) => {
      const r = d_.data[i_], g = d_.data[i_ + 1], b = d_.data[i_ + 2];
      if (r > 100 && r > g && r > b) return 2;       // warm
      if (r > 40 && r <= 100 && r >= g && r > b) return 1; // faint-warm
      return 0;
    };
    const wa = warm(A, i), wb = warm(B, i);
    if (wa === 2) warmA++; else if (wa === 1) faintA++;
    if (wb === 2) warmB++; else if (wb === 1) faintB++;
  }
  const extra = f === "night.png" ? ` | warm ${warmB}->${warmA} faint ${faintB}->${faintA}` : "";
  console.log(`${f}: changed=${changed} maxDelta=${maxD}${extra}`);
}
