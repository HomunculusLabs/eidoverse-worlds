import { readFileSync } from "node:fs";
const bytes = readFileSync("/tmp/p320-served.glb");
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));
let fails = 0;
const ok = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} [${n}] ${d}`); if (!c) fails++; };
const emis = (json.materials ?? []).map((m: any) => m.emissiveFactor ? m.emissiveFactor.map((x: number) => +x.toFixed(3)).join(",") : "-");
ok("calm-water mat", emis.some((e: string) => e === "0.015,0.038,0.054"));
ok("spray mat", emis.some((e: string) => e === "0.173,0.292,0.361"));
ok("foam mat", emis.some((e: string) => e === "0.304,0.427,0.479"));
const names: string[] = [];
const walk = (n: any) => { names.push(n.name ?? "?"); for (const c of n.children ?? []) walk(json.nodes[c]); };
for (const sn of json.scenes?.[0]?.nodes ?? []) walk(json.nodes[sn]);
const strands = names.filter((n) => n.startsWith("ft_strand_")).length;
const foamEls = names.filter((n) => /^ft_(foam|lobe|drop)_/.test(n)).length;
ok("strand count 12", strands === 12, `strands=${strands}`);
ok("foam elements 15", foamEls === 15, `foam=${foamEls}`);
for (const key of ["ft_lip","ft_splash","ft_dome","ft_jet","ft_crown","ft_basin_water","ft_bowl_water"]) ok(`node ${key}`, names.includes(key));
const binStart = 20 + jsonLen + 8;
let nonFinite = 0, checked = 0;
for (const a of json.accessors ?? []) {
  if (a.type !== "VEC3" || a.componentType !== 5126 || a.bufferView === undefined) continue;
  const bv = json.bufferViews[a.bufferView];
  const stride = bv.byteStride ?? 12;
  const base = binStart + (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
  if (base + a.count * stride > bytes.length) continue;
  for (let k = 0; k < a.count; k++) for (let c = 0; c < 3; c++) { const v = dv.getFloat32(base + k * stride + c * 4, true); if (!Number.isFinite(v)) nonFinite++; checked++; }
}
ok("nonFinite 0", nonFinite === 0, `checked ${checked} components`);
console.log(fails === 0 ? "P320_SERVED_PASS" : "P320_SERVED_FAIL");
process.exit(fails === 0 ? 0 : 1);
