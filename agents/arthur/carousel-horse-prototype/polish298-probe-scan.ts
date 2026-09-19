// polish-298: scanline probe across the cone band in gameplay views —
// measures the actual alternation pattern (runs of cream vs fabric) at
// several rows of the 18m cone band.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const { PNG } = await import('pngjs') as any;

async function scan(p: string, rows: number[]) {
  const png = PNG.sync.read(await readFile(p));
  const { width: w, data: d } = png;
  console.log(`== ${p.split('/').slice(-2).join('/')} (${w}x${png.height}) ==`);
  for (const row of rows) {
    const runs: string[] = [];
    let prev = -1, start = 0;
    const cls = (v: number) => v > 200 ? 'C' : v > 120 ? 'M' : v > 60 ? 'D' : 'K'; // cream/mid/dark/black
    for (let x = 0; x < w; x++) {
      const i = (row * w + x) * 4;
      const lum = Math.round(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
      const c = cls(lum);
      if (c !== prev) { if (prev !== -1) runs.push(`${prev}x${x - start}`); prev = c; start = x; }
    }
    runs.push(`${prev}x${w - start}`);
    console.log(`row ${row}: ${runs.join(' ')}`);
  }
}

const dir = process.argv[2] ?? '';
const which = process.argv[3] ?? 'gameplay';
await scan(resolve(dir, which + '.png'), [190, 195, 199, 203, 208]);
