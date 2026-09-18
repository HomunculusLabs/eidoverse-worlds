// polish-292: per-row warm/light analysis of the night frame — localize the
// under-canopy dark band(s) in image rows so the rim-fill intervention has a
// measured target. RGB PNG decode (polish-291 chassis), rows binned over the
// subject x-range only (silhouette mask = non-sky pixels).
import { inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? 'agents/arthur/reviews/hero-assets/polish-292-carousel/before/night.png';
const { w, h, rgb } = decodePNG(path);

// sky is uniform dark navy (#111827 = 17,24,39). Subject mask: pixel differs
// from sky by more than 12 in any channel.
const isSky = (x: number, y: number) => {
  const i = (y * w + x) * 3, r = rgb[i], g = rgb[i + 1], b = rgb[i + 2];
  return Math.abs(r - 17) < 12 && Math.abs(g - 24) < 12 && Math.abs(b - 39) < 14;
};
// warm pixel: red-dominant with meaningful luminance
const isWarm = (x: number, y: number) => {
  const i = (y * w + x) * 3, r = rgb[i], g = rgb[i + 1], b = rgb[i + 2];
  return r > b + 18 && r + g + b > 90;
};
// lit pixel: any clearly-above-sky luminance
const isLit = (x: number, y: number) => {
  const i = (y * w + x) * 3;
  return rgb[i] + rgb[i + 1] + rgb[i + 2] > 17 + 24 + 39 + 60;
};

// find subject x-range
let minX = w, maxX = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!isSky(x, y)) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
console.log(`subject x-range: ${minX}..${maxX} of ${w}`);
let minY = h, maxY = 0;
for (let y = 0; y < h; y++) for (let x = minX; x <= maxX; x++) if (!isSky(x, y)) { if (y < minY) minY = y; if (y > maxY) maxY = y; }
console.log(`subject y-range: ${minY}..${maxY} of ${h}`);

// per-row: subject px, warm px, lit px — binned every 4 rows
console.log('row    subj  warm   lit  pct-warm  pct-lit');
for (let y = minY; y <= maxY; y += 4) {
  let subj = 0, warm = 0, lit = 0;
  for (let x = minX; x <= maxX; x++) {
    if (isSky(x, y)) continue;
    subj++;
    if (isWarm(x, y)) warm++;
    if (isLit(x, y)) lit++;
  }
  const pw = subj ? (100 * warm / subj).toFixed(1) : '0.0';
  const pl = subj ? (100 * lit / subj).toFixed(1) : '0.0';
  console.log(`${String(y).padStart(4)}  ${String(subj).padStart(4)}  ${String(warm).padStart(4)}  ${String(lit).padStart(4)}  ${String(pw).padStart(7)}  ${String(pl).padStart(6)}`);
}

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
      if (filter === 1) v += a; else if (filter === 2) v += b; else if (filter === 3) v += (a + b) >> 1; else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      cur[x] = v & 255;
    }
  }
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0; i < w * h; i++) { rgb[i * 3] = out[i * bpp]; rgb[i * 3 + 1] = out[i * bpp + 1]; rgb[i * 3 + 2] = out[i * bpp + 2]; }
  return { w, h, rgb };
}
