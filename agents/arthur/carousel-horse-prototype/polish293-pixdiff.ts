// polish-293: frame diff — count changed pixels and their row/col extent
// between before/ and after/ renders of the same view. Proves the edit's
// pixel footprint is confined to the expected bands (plinth/brass zone).
import { inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const [a, b] = process.argv.slice(2);
const A = decodePNG(a), B = decodePNG(b);
if (A.w !== B.w || A.h !== B.h) throw new Error('size mismatch');
let changed = 0, minY = 1e9, maxY = -1, minX = 1e9, maxX = -1, maxDelta = 0;
for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) {
  const i = (y * A.w + x) * 3;
  const d = Math.max(Math.abs(A.rgb[i] - B.rgb[i]), Math.abs(A.rgb[i + 1] - B.rgb[i + 1]), Math.abs(A.rgb[i + 2] - B.rgb[i + 2]));
  if (d > 2) { // ignore AA/rounding shimmer
    changed++;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (d > maxDelta) maxDelta = d;
  }
}
console.log(JSON.stringify({ a, b, changed, extent: changed ? { minX, maxX, minY, maxY } : null, maxDelta }));

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
      const a2 = x >= 3 ? out[x - 3] : 0, b2 = prev[x], c2 = x >= 3 ? prev[x - 3] : 0;
      let v = row[x];
      if (filter === 1) v += a2; else if (filter === 2) v += b2;
      else if (filter === 3) v += (a2 + b2) >> 1;
      else if (filter === 4) {
        const pp = a2 + b2 - c2, pa = Math.abs(pp - a2), pb = Math.abs(pp - b2), pc = Math.abs(pp - c2);
        v += pa <= pb && pa <= pc ? a2 : pb <= pc ? b2 : c2;
      }
      out[x] = v & 0xff;
    }
  }
  return { w, h, rgb };
}
