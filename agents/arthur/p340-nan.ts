// p340-nan.ts — non-finite scan of all POSITION accessors in a GLB.
// Usage: bun agents/arthur/p340-nan.ts <model.glb>
import { readFileSync } from "node:fs";
const b = readFileSync(process.argv[2]);
const jsonLen = b.readUInt32LE(12);
const j = JSON.parse(b.slice(20, 20 + jsonLen).toString("utf8"));
// gather bin chunk
let off = 20 + jsonLen;
while (off < b.length && b.readUInt32LE(off + 4) !== 0x004E4942) off += 8 + b.readUInt32LE(off); // find BIN
const binStart = off + 8;
const binLen = b.length - binStart;
let nonFinite = 0, total = 0;
for (const acc of j.accessors ?? []) {
  if (acc.componentType !== 5126 || acc.type !== "VEC3") continue;
  const start = (j.bufferViews?.[acc.bufferView]?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
  for (let i = 0; i < acc.count; i++) {
    const p = binStart + start + i * 12;
    for (let c = 0; c < 3; c++) { total++; if (!Number.isFinite(b.readFloatLE(p + c * 4))) nonFinite++; }
  }
}
console.log(JSON.stringify({ file: process.argv[2], floats: total, nonFinite }));
if (nonFinite > 0) process.exit(1);
