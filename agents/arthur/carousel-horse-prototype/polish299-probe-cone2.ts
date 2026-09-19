// polish-299: correct-row cone probe. Night view rows ~199..252 = canopy cone
// (eave 4.81 @ ~252, panel top 5.78 @ ~199 at ~54.6 px/m vertical scale).
// Classify each row's object pixels: fabric (<90 L), batten-band (95..175 L,
// warm), gold/hub (>175 L). If battens render, batten-band pixels appear as
// periodic runs; if the cone is smooth, the band fraction ~0 or structureless.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const { PNG } = await import('pngjs') as any;
const dir = resolve(process.argv[2] ?? '');
async function load(p: string) { const png = PNG.sync.read(await readFile(p)); return { w: png.width, h: png.height, d: new Uint8Array(png.data) }; }
const night = await load(resolve(dir, 'night.png'));
const day = await load(resolve(dir, 'gameplay.png'));
const lum = (img: any, x: number, y: number) => { const i = (y * img.w + x) * 4; return 0.2126 * img.d[i] + 0.7152 * img.d[i + 1] + 0.0722 * img.d[i + 2]; };
const warm = (img: any, x: number, y: number) => { const i = (y * img.w + x) * 4; return img.d[i] > img.d[i + 2] + 12; };
const isNightSky = (r: number, g: number, b: number) => r <= 30 && g <= 40;

function row(img: any, y: number, sky: (r: number, g: number, b: number) => boolean, label: string) {
  let xl = -1, xr = -1;
  for (let x = 0; x < img.w; x++) { const i = (y * img.w + x) * 4; if (!sky(img.d[i], img.d[i + 1], img.d[i + 2])) { if (xl < 0) xl = x; xr = x; } }
  if (xl < 0) { console.log(`${label} y${y}: sky`); return; }
  let fabric = 0, batten = 0, gold = 0, n = 0;
  const runs: number[] = [];
  let run = 0;
  for (let x = xl; x <= xr; x++) {
    const L = lum(img, x, y); n++;
    if (L > 175) { gold++; run = 0; }
    else if (L >= 95 && warm(img, x, y)) { batten++; run++; }
    else { fabric++; if (run > 0) { if (run >= 3) runs.push(run); run = 0; } }
  }
  if (run >= 3) runs.push(run);
  console.log(`${label} y${y}: x${xl}..${xr} n=${n} fabric=${(100 * fabric / n).toFixed(0)}% battenBand=${(100 * batten / n).toFixed(0)}% gold=${(100 * gold / n).toFixed(0)}% battenRuns>=3px=[${runs.join(',')}]`);
}
for (const y of [200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250]) row(night, y, isNightSky, 'night');
console.log('---');
const isDaySky = (r: number, g: number, b: number) => Math.abs(r - 203) < 10 && Math.abs(g - 214) < 10 && Math.abs(b - 223) < 10;
for (const y of [200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250]) row(day, y, isDaySky, 'day  ');
