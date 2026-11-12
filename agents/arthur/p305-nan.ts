// polish-305 — NaN/finiteness scan + bbox of candidate local GLB (BIN chunk).
import { readFileSync } from "node:fs";
const buf = readFileSync(process.argv[2]);
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
const binStart = 20 + jsonLen + 8;
let nonFinite = 0, total = 0;
for (const acc of json.accessors ?? []) {
  if (acc.componentType !== 5126 || acc.type !== "VEC3") continue;
  const dv = new DataView(buf.buffer, buf.byteOffset + binStart + (json.bufferViews[acc.bufferView].byteOffset ?? 0), json.bufferViews[acc.bufferView].byteLength);
  for (let i = 0; i < acc.count * 3; i++) { const v = dv.getFloat32(i * 4, true); total++; if (!Number.isFinite(v)) nonFinite++; }
}
const b = json.accessors.find((a: any) => a.type === "VEC3" && a.min)?.min;
console.log(`nonFinite=${nonFinite} of ${total} floats; nodes=${json.nodes.length} meshes=${json.meshes.length} materials=${(json.materials ?? []).map((m: any) => m.name).join(",")}`);
