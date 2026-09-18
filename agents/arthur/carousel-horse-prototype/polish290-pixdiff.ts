// polish-290: pixel-diff before/after renders — proves the crown emissive
// change is confined to the crown zone (spire/hub/valance teeth band) and
// quantifies the night gain. RGB-level: decodes PNG scanlines via a minimal
// zlib inflate (PNG filters resolved) so per-pixel warm counts are real.
import { inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const base = 'agents/arthur/reviews/hero-assets/polish-290-carousel-rim';
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
  // to RGB
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0; i < w * h; i++) { rgb[i * 3] = out[i * bpp]; rgb[i * 3 + 1] = out[i * bpp + 1]; rgb[i * 3 + 2] = out[i * bpp + 2]; }
  return { w, h, rgb };
}

const warm = (r: number, g: number, b: number) => r > 90 && r > b * 1.25 && g > b * 1.05;
for (const view of views) {
  const A = decodePNG(`${base}/before/${view}.png`), B = decodePNG(`${base}/after/${view}.png`);
  if (A.w !== B.w || A.h !== B.h) { console.log(`${view}: SIZE MISMATCH`); continue; }
  let changed = 0, warmA = 0, warmB = 0, minY = 1e9, maxY = -1, minX = 1e9, maxX = -1;
  for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) {
    const i = (y * A.w + x) * 3;
    const d = Math.abs(A.rgb[i] - B.rgb[i]) + Math.abs(A.rgb[i + 1] - B.rgb[i + 1]) + Math.abs(A.rgb[i + 2] - B.rgb[i + 2]);
    if (d > 12) { changed++; if (y < minY) minY = y; if (y > maxY) maxY = y; if (x < minX) minX = x; if (x > maxX) maxX = x; }
    if (warm(A.rgb[i], A.rgb[i + 1], A.rgb[i + 2])) warmA++;
    if (warm(B.rgb[i], B.rgb[i + 1], B.rgb[i + 2])) warmB++;
  }
  // horizon sanity: the crown band sits in the upper third of frame at 18m
  const pct = (100 * changed / (A.w * A.h)).toFixed(3);
  console.log(`${view.padEnd(18)} changed=${String(changed).padStart(6)} (${pct}%)  warm ${warmA}->${warmB}  changed-y ${minY > 1e8 ? '-' : minY}..${maxY < 0 ? '-' : maxY}  x ${minX > 1e8 ? '-' : minX}..${maxX < 0 ? '-' : maxX}`);
}
