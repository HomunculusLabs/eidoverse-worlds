// polish-299: canopy-band pixel probe on the fresh baseline renders.
// Measures the night seam-tracery question with pixels before any edit:
// in the night gameplay view, does the mid-cone band show radial seam
// structure (batten lines) or read as a near-uniform mass?
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const { PNG } = await import('pngjs') as any;

const dir = resolve(process.argv[2] ?? '');
async function load(p: string) { const png = PNG.sync.read(await readFile(p)); return { w: png.width, h: png.height, d: new Uint8Array(png.data) }; }

// The carousel in the gameplay view: silhouette roughly centered x~480,
// canopy cone y 4.84..5.78 of a 6.77-tall model. Scan columns through the
// cone band and report per-row luminance stats inside the silhouette.
const night = await load(resolve(dir, 'night.png'));
const day = await load(resolve(dir, 'gameplay.png'));

function bandStats(img: typeof night, label: string) {
  // Find the silhouette: against night sky 0x111827 (17,24,39) / day sky 0xcbd6df.
  // Carousel center approx x 480. The cone band: estimate rows by scanning
  // column x=480 for the object (non-sky) extents, then take the upper third.
  const cx = Math.round(img.w * 0.5);
  const sky = (x: number, y: number) => { const i = (y * img.w + x) * 4; return img.d[i] <= 30 && img.d[i+1] <= 40; };
  let yTop = -1, yBot = -1;
  for (let y = 0; y < img.h; y++) { if (!sky(cx, y)) { if (yTop < 0) yTop = y; yBot = y; } }
  // object rows yTop..yBot; the canopy cone occupies roughly the top 35% of the
  // carousel body (valance ~4.8 of 6.77 = 71% up). Cone band = rows between
  // 8% and 30% down from yTop.
  const rows: string[] = [];
  const r0 = Math.round(yTop + 0.06 * (yBot - yTop)), r1 = Math.round(yTop + 0.30 * (yBot - yTop));
  for (let y = r0; y <= r1; y += 2) {
    // walk the row: find left/right object bounds
    let xl = -1, xr = -1;
    for (let x = 0; x < img.w; x++) { if (!sky(x, y)) { if (xl < 0) xl = x; xr = x; } }
    if (xl < 0) { rows.push(`y${y}: sky`); continue; }
    let n = 0, sum = 0, mx = 0, mn = 999, warm = 0;
    for (let x = xl; x <= xr; x++) { const i = (y * img.w + x) * 4; const R = img.d[i], G = img.d[i+1], B = img.d[i+2]; const L = 0.2126*R+0.7152*G+0.0722*B; sum += L; n++; mx = Math.max(mx, L); mn = Math.min(mn, L); if (R > B + 12 && R > 40) warm++; }
    rows.push(`y${y}: x${xl}..${xr} avgL=${(sum/n).toFixed(1)} minL=${mn.toFixed(0)} maxL=${mx.toFixed(0)} spread=${(mx-mn).toFixed(0)} warmPct=${(100*warm/n).toFixed(0)}`);
  }
  console.log(`== ${label}: object rows ${yTop}..${yBot}, cone band ${r0}..${r1} ==`);
  console.log(rows.join('\n'));
}
bandStats(night, 'night gameplay');
bandStats(day, 'day gameplay');
