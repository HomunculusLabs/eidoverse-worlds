// polish-292: pixel falsification for the scenery panel ring.
// (1) NIGHT: the void band rows 285..300 (was 0 warm / 0 lit except pole)
//     must gain warm fill; whole-frame warm count must rise.
// (2) DAY: changed pixels confined to the under-canopy interior region
//     (must NOT touch horses, canopy above eave, or plinth).
// (3) CONTROLS: horse-solo closeups byte-identical.
import { inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const base = 'agents/arthur/reviews/hero-assets/polish-292-carousel';
const before = base + '/before', after = base + '/after';

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

const isWarm = (rgb: Uint8Array, i: number) => rgb[i] > rgb[i + 2] + 18 && rgb[i] + rgb[i + 1] + rgb[i + 2] > 90;

// (1) NIGHT band + frame warm counts
{
  const b = decodePNG(before + '/night.png'), a = decodePNG(after + '/night.png');
  let bandB = 0, bandA = 0, frameB = 0, frameA = 0;
  for (let y = 285; y <= 300; y++) for (let x = 0; x < b.w; x++) {
    const i = (y * b.w + x) * 3;
    if (isWarm(b.rgb, i)) bandB++;
    if (isWarm(a.rgb, i)) bandA++;
  }
  for (let i = 0; i < b.w * b.h * 3; i += 3) { if (isWarm(b.rgb, i)) frameB++; if (isWarm(a.rgb, i)) frameA++; }
  console.log(`NIGHT void-band(285..300) warm: ${bandB} -> ${bandA}`);
  console.log(`NIGHT whole-frame warm: ${frameB} -> ${frameA} (${(100 * (frameA - frameB) / frameB).toFixed(1)}%)`);
}

// (2) DAY confinement: front + gameplay + aerial, changed-pixel bbox
for (const view of ['front', 'gameplay', 'aerial', 'left', 'right', 'back', 'top']) {
  const b = decodePNG(`${before}/${view}.png`), a = decodePNG(`${after}/${view}.png`);
  let changed = 0, minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
    const i = (y * b.w + x) * 3;
    if (Math.abs(b.rgb[i] - a.rgb[i]) > 6 || Math.abs(b.rgb[i + 1] - a.rgb[i + 1]) > 6 || Math.abs(b.rgb[i + 2] - a.rgb[i + 2]) > 6) {
      changed++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  console.log(`DAY ${view}: changed=${changed} bbox=[${changed ? minX + ',' + minY + '..' + maxX + ',' + maxY : '-'}]`);
}

// (3) horse controls byte-identical
for (const view of ['horse-front', 'horse-side', 'horse-threequarter', 'horse-rear', 'boarding', 'motion-a', 'motion-b']) {
  const hb = createHash('sha256').update(readFileSync(`${before}/${view}.png`)).digest('hex').slice(0, 12);
  const ha = createHash('sha256').update(readFileSync(`${after}/${view}.png`)).digest('hex').slice(0, 12);
  console.log(`CONTROL ${view}: ${hb === ha ? 'IDENTICAL' : 'DIFFERS'} (${hb}/${ha})`);
}
