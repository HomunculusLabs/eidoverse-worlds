// polish-298: pixel diff before/after — the rib edit must confine to the
// crown/cone band; horse-solo closeups and structural bands stay identical.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const beforeDir = resolve(process.argv[2] ?? '');
const afterDir = resolve(process.argv[3] ?? '');

// Minimal PNG decode: find IHDR + IDAT, inflate, unfilter. 960x720 RGB.
import { inflateSync } from 'node:zlib';
const { PNG } = await import('pngjs') as any;

async function loadRGB(p: string) {
  const png = PNG.sync.read(await readFile(p));
  return { w: png.width, h: png.height, d: new Uint8Array(png.data) };
}

const views = ['front', 'right', 'back', 'left', 'gameplay', 'aerial', 'top', 'night', 'motion-a', 'motion-b'];
const horseControls = ['horse-side', 'horse-front', 'horse-threequarter', 'horse-rear'];

function diffStats(a: { w: number; h: number; d: Uint8Array }, b: { w: number; h: number; d: Uint8Array }) {
  assert.equal(a.w, b.w); assert.equal(a.h, b.h);
  let changed = 0, maxDelta = 0, sumR = 0, sumG = 0, sumB = 0;
  let yMin = a.h, yMax = 0;
  for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) {
    const i = (y * a.w + x) * 4;
    const dr = Math.abs(a.d[i] - b.d[i]), dg = Math.abs(a.d[i + 1] - b.d[i + 1]), db = Math.abs(a.d[i + 2] - b.d[i + 2]);
    const m = Math.max(dr, dg, db);
    if (m > 3) {
      changed++; yMin = Math.min(yMin, y); yMax = Math.max(yMax, y);
      sumR += b.d[i]; sumG += b.d[i + 1]; sumB += b.d[i + 2];
    }
    if (m > maxDelta) maxDelta = m;
  }
  return { changed, maxDelta, yMin: changed ? yMin : -1, yMax: changed ? yMax : -1, avgChangedRGB: changed ? [Math.round(sumR / changed), Math.round(sumG / changed), Math.round(sumB / changed)] : null };
}

console.log('== ensemble views ==');
for (const v of views) {
  const a = await loadRGB(resolve(beforeDir, v + '.png'));
  const b = await loadRGB(resolve(afterDir, v + '.png'));
  const s = diffStats(a, b);
  console.log(`${v}: changed=${s.changed} maxDelta=${s.maxDelta} rows ${s.yMin}..${s.yMax} avgChangedRGB=${JSON.stringify(s.avgChangedRGB)}`);
}

console.log('\n== horse-solo controls (must be 0) ==');
let allZero = true;
for (const v of horseControls) {
  const a = await loadRGB(resolve(beforeDir, v + '.png'));
  const b = await loadRGB(resolve(afterDir, v + '.png'));
  const s = diffStats(a, b);
  const byteIdentical = createHash('sha256').update(a.d).digest('hex') === createHash('sha256').update(b.d).digest('hex');
  console.log(`${v}: changed=${s.changed} byteIdentical=${byteIdentical}`);
  if (s.changed > 0) allZero = false;
}
console.log(`\nHORSE_CONTROLS_${allZero ? 'CLEAN' : 'DIRTY'}`);
