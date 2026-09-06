// artwalk-52 fleet anchor reconciliation (this tick): full-fleet verification
// for the IMPROVE-PLAN shard row "nx-artwalk riders | 54 | host-anchor
// reconciliation stays artwalk's own". Zero verbs, zero uploads — read-only.
//
// 1) fresh live census → every nx-artwalk-* rider present (54), comps only h6/h7
// 2) host pins: every next-place-artwalk-b*.ts HOST/HL (strict + loose forms) vs live
// 3) host-derived anchors: inverse-transform every rider's live pos into its
//    host's local frame and compare to the placer's pinned L (artwalk-39 law,
//    analytical — no WS, no spawn)
// 4) static h-series tuples + b7 exact + b13/b4 multi-rider arrays + b34 lamp set
import { readFileSync, readdirSync } from "node:fs";

const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: Record<string, any> = Object.fromEntries(d.entities.map((e: any) => [e.id, e]));
const near = (a: number, b: number) => Math.abs(a - b) < 1e-4;
const norm = (a: number) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

const riders = Object.keys(ents).filter((id) => id.startsWith("nx-artwalk-")).sort();
if (riders.length !== 54) throw Error(`rider count ${riders.length} != 54`);
const compOdd = riders.filter((id) => Object.keys(ents[id].comp ?? {}).length > 0 && !/^nx-artwalk-h[67]$/.test(id));
if (compOdd.length) throw Error(`unexpected comp bags: ${compOdd.join(",")}`);

// --- 2) host pins (strict ID/HOST/HL and loose HOST/ HOST_LIB forms) ---
const dir = `${R}/agents/arthur`;
const placers = readdirSync(dir).filter((f) => /^next-place-artwalk-b\d+.*\.ts$/.test(f)).sort();
let pinsOK = 0; const pinStale: string[] = [];
for (const f of placers) {
  const src = readFileSync(`${dir}/${f}`, "utf8");
  const hosts = [...src.matchAll(/HOST(?:_LIB)?\s*=\s*"([\w.-]+)"/g)].map((m) => m[1]);
  const hl = src.match(/(?:^|,)HL="([^"]+)"/)?.[1] ?? src.match(/HOST_LIB="([^"]+)"/)?.[1] ?? src.match(/HOST_LIB\s*=\s*"(store\/[0-9a-f]+\.glb)"/)?.[1];
  for (const h of hosts) {
    if (h.startsWith("store/")) continue;
    const live = ents[h];
    if (!live) { pinStale.push(`${f}: HOST-GONE ${h}`); continue; }
    if (hl) {
      const pinHash = hl.replace("store/", "").replace(".glb", "");
      const liveHash = (live.lib ?? "").replace("store/", "").replace(".glb", "");
      if (liveHash !== pinHash) { pinStale.push(`${f}: STALE ${h} pin ${hl} live ${live.lib}`); continue; }
    }
    pinsOK++;
  }
}

// --- 3) host-derived anchors, single-rider const blocks ---
let anchorOK = 0; const anchorBad: string[] = [];
const anchors: Array<[string, string, [number, number, number], number]> = [];
for (const f of placers) {
  const src = readFileSync(`${dir}/${f}`, "utf8").replace(/\s+/g, " ");
  if (src.includes("IDS=[") || src.includes("specs=[") || f.includes("b34")) continue;
  const id = src.match(/ID = "(nx-artwalk-[\w-]+)"/)?.[1];
  const host = src.match(/HOST = "([\w.-]+)"/)?.[1];
  const l = src.match(/L: \[number, number, number\] = \[([-\d.e]+), ([-\d.e]+), ([-\d.e]+)\]/)?.slice(1) ?? src.match(/L = \[([-\d.e]+), ([-\d.e]+), ([-\d.e]+)\]/)?.slice(1);
  if (!(id && host && l)) continue;
  const dyaw = /ry = \(hy \+ Math\.PI\)/.test(src) ? Math.PI : 0;
  anchors.push([id, host, l.map(Number) as unknown as [number, number, number], dyaw]);
}
// b13 multi
{
  const src = readFileSync(`${dir}/next-place-artwalk-b13.ts`, "utf8").replace(/\s+/g, " ");
  const ids = [...src.matchAll(/"(nx-artwalk-b13-[\w-]+)"/g)].map((m) => m[1]).slice(0, 2);
  const flat: number[][] = [];
  const raw = src.match(/LOC=\[(\[.*?\])\]as const/)![1];
  for (const m of raw.matchAll(/\[([-\d.e]+),([-\d.e]+),([-\d.e]+)\]/g)) flat.push([Number(m[1]), Number(m[2]), Number(m[3])]);
  ids.forEach((id, i) => anchors.push([id, "nx-town-gate-s", flat[i] as unknown as [number, number, number], Math.PI]));
}
// b4 multi
{
  const src = readFileSync(`${dir}/next-place-artwalk-b4.ts`, "utf8");
  for (const m of src.matchAll(/\{id:"(nx-artwalk-[\w-]+)",file:"[^"]+",sha:"[0-9a-f]+",local:\[([-\d.e]+),([-\d.e]+),([-\d.e]+)\]/g))
    anchors.push([m[1], "nx-town-gate-n", [Number(m[2]), Number(m[3]), Number(m[4])], 0]);
}
for (const [id, host, L, dyaw] of anchors) {
  const rr = ents[id], hh = ents[host];
  if (!rr) { anchorBad.push(`${id} RIDER-GONE`); continue; }
  if (!hh) { anchorBad.push(`${id} HOST-GONE ${host}`); continue; }
  const hy = hh.yaw ?? 0, ry = rr.yaw ?? 0;
  if (Math.abs(norm(ry - hy - dyaw)) > 1e-4) { anchorBad.push(`${id} dYAW ${norm(ry - hy)} expect ${dyaw}`); continue; }
  const c = Math.cos(hy), s = Math.sin(hy);
  const dx = rr.pos[0] - hh.pos[0], dz = rr.pos[2] - hh.pos[2];
  const lx = dx * c - dz * s, lz = dx * s + dz * c;
  if (!near(lx, L[0]) || !near(lz, L[2]) || !near(rr.pos[1] - hh.pos[1], L[1]))
    anchorBad.push(`${id} ANCHOR live(${lx.toFixed(4)},${lz.toFixed(4)}) pin(${L})`);
  else anchorOK++;
}
// b34 lamp set
for (const [h, rid] of [["nx-approach-lamp-e", "nx-artwalk-b34-wayband-e"], ["nx-approach-lamp-s", "nx-artwalk-b34-wayband-s"], ["nx-approach-lamp-w", "nx-artwalk-b34-wayband-w"], ["nx-approach-lamp-n", "nx-artwalk-b26-wayband"]] as const) {
  const hh = ents[h], rr = ents[rid];
  if (!hh || !rr) { anchorBad.push(`${rid} MISSING`); continue; }
  const dev = Math.max(Math.abs(rr.pos[0] - hh.pos[0]), Math.abs(rr.pos[1] - 1.5), Math.abs(rr.pos[2] - hh.pos[2]), Math.abs(norm((rr.yaw ?? 0) - (hh.yaw ?? 0))));
  if (dev > 1e-4) anchorBad.push(`${rid} dev ${dev}`);
  else anchorOK++;
}
// b7 exact host-derived tuple
{
  const h = ents["nx-town-shrine"], L = [-0.95, 0.25, -1.16], y = h.yaw, c = Math.cos(y), s = Math.sin(y);
  const P = [h.pos[0] + L[0] * c + L[2] * s, h.pos[1] + L[1], h.pos[2] - L[0] * s + L[2] * c];
  const b7 = ents["nx-artwalk-b7-shrine-stars"];
  if (!b7 || !b7.pos.every((n: number, i: number) => near(n, P[i])) || !near(b7.yaw - y, 0)) throw Error("b7 tuple drift");
}

if (pinStale.length || anchorBad.length) {
  console.log(JSON.stringify({ status: "DRIFT", pinStale, anchorBad }, null, 1));
  process.exit(1);
}
console.log(JSON.stringify({
  status: "ALL_RECONCILED", censusTotal: d.entities.length, riders: riders.length,
  lights: d.entities.filter((e: any) => e.kind === "light").length,
  placers: placers.length, hostPinsOK: pinsOK, anchorsOK: anchorOK,
  verbs: 0, uploads: 0,
}));
