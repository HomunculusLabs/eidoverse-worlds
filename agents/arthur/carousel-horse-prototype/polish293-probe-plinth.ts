// polish-293: night + day band analysis of the plinth/brass/rim zone.
// Measures per-row warm/lit/mean-RGB over the subject mask (same chassis as
// polish292-probe-nightband.ts) so the v6-re-tune candidate has a measured
// target: polish-289 landed stone risers ~85 day / 54-61 night, but the
// judge at polish-292 named the night plinth + brass band as the weakest
// remaining value band. Quantify before editing.
import { inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? 'agents/arthur/reviews/hero-assets/polish-293-carousel-plinth/before/night.png';
const { w, h, rgb } = decodePNG(path);

const isSky = (x: number, y: number) => {
  const i = (y * w + x) * 3, r = rgb[i], g = rgb[i + 1], b = rgb[i + 2];
  return Math.abs(r - 17) < 12 && Math.abs(g - 24) < 12 && Math.abs(b - 39) < 14;
};
const isWarm = (x: number, y: number) => {
  const i = (y * w + x) * 3, r = rgb[i], g = rgb[i + 1], b = rgb[i + 2];
  return r > b + 18 && r + g + b > 90;
};
const isLit = (x: number, y: number) => {
  const i = (y * w + x) * 3;
  return rgb[i] + rgb[i + 1] + rgb[i + 2] > 17 + 24 + 39 + 60;
};

let minX = w, maxX = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!isSky(x, y)) { if (x < minX) minX = x; if (x > maxX) maxX = x; }

// bin rows into 12px bands over the subject range, report stats per band
console.log(JSON.stringify({ path, w, h, subject: { minX, maxX } }));
console.log('band(y-range) | subjPx | warm | lit | meanRGB(subj)');
for (let y0 = 0; y0 < h; y0 += 12) {
  const y1 = Math.min(y0 + 12, h);
  let subj = 0, warm = 0, lit = 0, sr = 0, sg = 0, sb = 0;
  for (let y = y0; y < y1; y++) for (let x = minX; x <= maxX; x++) {
    if (isSky(x, y)) continue;
    const i = (y * w + x) * 3;
    subj++; sr += rgb[i]; sg += rgb[i + 1]; sb += rgb[i + 2];
    if (isWarm(x, y)) warm++;
    if (isLit(x, y)) lit++;
  }
  if (subj < 40) continue;
  const mean = [sr / subj, sg / subj, sb / subj].map(v => v.toFixed(0)).join(',');
  console.log(`${String(y0).padStart(3)}-${String(y1).padStart(3)} | ${String(subj).padStart(6)} | ${String(warm).padStart(5)} | ${String(lit).padStart(5)} | ${mean}`);
}

// PNG decode (polish-291 chassis): RGB8, no interlace
function decodePNG(file: string): { w: number; h: number; rgb: Uint8Array } {
  const buf = readFileSync(file);
  let off = 8, w = 0, h = 0, bitDepth = 0, colorType = 0;
  const idat: Buffer[] = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (bitDepth !== 8 || colorType !== 2) throw new Error(`unsupported PNG ${bitDepth}/${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * 3;
  const rgb = new Uint8Array(w * h * 3);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[p++];
    const row = raw.subarray(p, p + stride); p += stride;
    const prev = y > 0 ? rgb.subarray((y - 1) * w * 3, y * w * 3) : new Uint8Array(stride);
    const out = rgb.subarray(y * w * 3, (y + 1) * w * 3);
    for (let x = 0; x < stride; x++) {
      const a = x >= 3 ? out[x - 3] : 0, b = prev[x], c = x >= 3 ? prev[x - 3] : 0;
      let v = row[x];
      if (filter === 1) v += a; else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[x] = v & 0xff;
    }
  }
  return { w, h, rgb };
}
