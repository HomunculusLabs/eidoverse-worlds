// p321-abdiff.ts — pixel diff before/after rigs (polish-321). PNG decode via zlib.
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

function decodePNG(path: string): { w: number; h: number; rgb: Uint8Array } {
  const buf = readFileSync(path);
  let pos = 8;
  let w = 0, h = 0, bitDepth = 0, colorType = 0;
  const idat: Buffer[] = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) throw new Error(`bitDepth ${bitDepth} unsupported`);
  // colorType 6 = RGBA, 2 = RGB
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!ch) throw new Error(`colorType ${colorType} unsupported`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = new Uint8Array(w * h * 3);
  let prev = new Uint8Array(stride);
  let cur = new Uint8Array(stride);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[rp++];
    for (let i = 0; i < stride; i++) cur[i] = raw[rp++];
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0;
      const b = prev[i];
      const c = i >= ch ? prev[i - ch] : 0;
      let v = cur[i];
      if (filter === 1) v = (v + a) & 255;
      else if (filter === 2) v = (v + b) & 255;
      else if (filter === 3) v = (v + ((a + b) >> 1)) & 255;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
      cur[i] = v;
    }
    for (let x = 0; x < w; x++) {
      out[(y * w + x) * 3] = cur[x * ch];
      out[(y * w + x) * 3 + 1] = cur[x * ch + 1];
      out[(y * w + x) * 3 + 2] = cur[x * ch + 2];
    }
    const t = prev; prev = cur; cur = t;
  }
  return { w, h, rgb: out };
}

const base = process.argv[2] ?? "agents/arthur/reviews/hero-assets/polish-321-fountain-crown";
const THR = 8;
for (const view of ["gameplay", "night", "front", "back", "left", "right", "top", "aerial", "motion-a", "motion-b"]) {
  const A = decodePNG(`${base}/before/${view}.png`);
  const B = decodePNG(`${base}/after/${view}.png`);
  if (A.w !== B.w || A.h !== B.h) { console.log(view, "SIZE MISMATCH"); continue; }
  let n = 0, minx = 1e9, maxx = -1, miny = 1e9, maxy = -1, maxD = 0;
  for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) {
    const i = (y * A.w + x) * 3;
    const d = Math.max(Math.abs(A.rgb[i] - B.rgb[i]), Math.abs(A.rgb[i + 1] - B.rgb[i + 1]), Math.abs(A.rgb[i + 2] - B.rgb[i + 2]));
    if (d > maxD) maxD = d;
    if (d > THR) { n++; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; }
  }
  console.log(view.padEnd(9), String(n).padStart(6), "px  maxD", String(maxD).padStart(3), n ? `bbox x[${minx}..${maxx}] y[${miny}..${maxy}]` : "");
}
