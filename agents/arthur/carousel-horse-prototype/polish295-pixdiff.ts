// polish-295: pixel-diff before/after renders — proves the bone-coat
// emissive change is confined to the bone horse (plus day-brightening on
// the same body) and quantifies the night gain in the bone band.
// RGB-level PNG decode (polish-291 chassis, parameterized).
import { inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'agents/arthur/reviews/hero-assets/polish-295-carousel-nightcoats';
const views = ['front', 'right', 'back', 'left', 'gameplay', 'aerial', 'night', 'top', 'horse-front', 'horse-side', 'horse-threequarter', 'horse-rear', 'boarding', 'motion-a', 'motion-b'];

function decodePNG(path: string): { w: number; h: number; rgb: Uint8Array } {
  const buf = readFileSync(path);
  let pos = 8, w = 0, h = 0, bitDepth = 0, colorType = 0;
  const idat: Buffer[] = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) throw new Error(`${path}: unsupported PNG ${bitDepth}/${colorType}`);
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[rp++];
    const row = raw.subarray(rp, rp + stride); rp += stride;
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : out.subarray(0, 0);
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let v = row[x];
      if (filter === 1) v += a; else if (filter === 2) v += b; else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      cur[x] = v & 255;
    }
  }
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0; i < w * h; i++) { rgb[i * 3] = out[i * bpp]; rgb[i * 3 + 1] = out[i * bpp + 1]; rgb[i * 3 + 2] = out[i * bpp + 2]; }
  return { w, h, rgb };
}

for (const view of views) {
  const A = decodePNG(`${base}/before/${view}.png`), B = decodePNG(`${base}/after/${view}.png`);
  if (A.w !== B.w || A.h !== B.h) { console.log(`${view}: SIZE MISMATCH`); continue; }
  let changed = 0, minY = 1e9, maxY = -1, minX = 1e9, maxX = -1, maxDelta = 0;
  let sumA = 0, sumB = 0, n = 0;
  for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) {
    const i = (y * A.w + x) * 3;
    const d = Math.abs(A.rgb[i] - B.rgb[i]) + Math.abs(A.rgb[i + 1] - B.rgb[i + 1]) + Math.abs(A.rgb[i + 2] - B.rgb[i + 2]);
    if (d > 12) { changed++; if (y < minY) minY = y; if (y > maxY) maxY = y; if (x < minX) minX = x; if (x > maxX) maxX = x; }
    if (d > maxDelta) maxDelta = d;
    // bone-band luminance accumulation (changed region proxy)
    if (d > 12) { sumA += (A.rgb[i] + A.rgb[i + 1] + A.rgb[i + 2]); sumB += (B.rgb[i] + B.rgb[i + 1] + B.rgb[i + 2]); n++; }
  }
  const pct = (100 * changed / (A.w * A.h)).toFixed(3);
  const avg = n ? `avgRGB ${(sumA / n / 3).toFixed(0)}->${(sumB / n / 3).toFixed(0)}` : '';
  console.log(`${view.padEnd(18)} changed=${String(changed).padStart(6)} (${pct}%)  maxDelta ${maxDelta}  y ${minY > 1e8 ? '-' : minY}..${maxY < 0 ? '-' : maxY}  x ${minX > 1e8 ? '-' : minX}..${maxX < 0 ? '-' : maxX}  ${avg}`);
}
