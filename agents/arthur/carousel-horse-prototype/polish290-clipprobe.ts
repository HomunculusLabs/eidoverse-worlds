// polish-290: clip probe — did the day crown clip to near-white (glow-orb risk)?
// Counts near-white pixels inside the changed crown band, before vs after.
import { inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const base = 'agents/arthur/reviews/hero-assets/polish-290-carousel-rim';
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
for (const view of ['front', 'night', 'gameplay']) {
  for (const tag of ['before', 'after']) {
    const { w, h, rgb } = decodePNG(`${base}/${tag}/${view}.png`);
    let nearWhite = 0, goldBright = 0;
    const yLo = view === 'gameplay' ? 145 : 96, yHi = view === 'gameplay' ? 277 : 355;
    for (let y = yLo; y <= yHi && y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3, r = rgb[i], g = rgb[i + 1], b = rgb[i + 2];
      if (r > 245 && g > 240 && b > 225) nearWhite++;
      if (r > 200 && g > 140 && b < 140 && r > b * 1.6) goldBright++;
    }
    console.log(`${view}/${tag}: nearWhite=${nearWhite} goldBright=${goldBright} (band y ${yLo}..${yHi})`);
  }
}
