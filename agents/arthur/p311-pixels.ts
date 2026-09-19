// p311-pixels.ts — dropper probe: mean RGB/lum of named rectangles in
// before/after lampFace renders. Settles judge-vs-arithmetic disputes.
// Usage: bun agents/arthur/p311-pixels.ts <before.png> <after.png>
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const A = PNG.sync.read(readFileSync(process.argv[2]));
const B = PNG.sync.read(readFileSync(process.argv[3]));
const lum = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

// rectangles (from judge reads of this 960x720 framing; hood/arm/post band)
const regions: Record<string, [number, number, number, number]> = {
  hoodCore: [462, 300, 505, 322],      // pyramid hood faces
  gableShadow: [430, 240, 540, 285],   // dark shadow band behind/above hood
  armBar: [500, 340, 540, 356],        // mount arm run
  postR: [508, 360, 522, 385],         // right cage post
  timberPost: [540, 320, 566, 380],    // wooden corner post (reference)
  fascia: [430, 286, 530, 296],        // beam behind hood (reference)
};

function sample(img: PNG, [x0, y0, x1, y1]: [number, number, number, number]) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = (y * img.width + x) * 4;
    r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; n++;
  }
  return { rgb: [Math.round(r / n), Math.round(g / n), Math.round(b / n)], lum: Math.round(lum(r / n, g / n, b / n)) };
}

console.log("region        BEFORE rgb(lum)      AFTER rgb(lum)");
for (const [name, rect] of Object.entries(regions)) {
  const a = sample(A, rect), b = sample(B, rect);
  console.log(`${name.padEnd(13)} ${a.rgb.join(",")} (${a.lum})   ${b.rgb.join(",")} (${b.lum})`);
}
