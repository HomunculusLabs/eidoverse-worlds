// fauna14-site-scan2.ts — wider read-only census scan (r35 of zone center
// 11,43.5) + full-world grep for lane/pond/potter/kiln entities, so the SAT
// set and walk route use every real member.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const Z = 35, CX = 11, CZ = 43.5;
const rows = (d.entities as any[])
  .filter((e) => Math.hypot(e.pos[0] - CX, e.pos[2] - CZ) < Z)
  .sort((a, b) => Math.hypot(a.pos[0] - CX, a.pos[2] - CZ) - Math.hypot(b.pos[0] - CX, b.pos[2] - CZ));
for (const e of rows.slice(0, 24)) {
  const b = e.bbox;
  console.log(JSON.stringify({
    id: e.id, pos: e.pos.map((v: number) => +v.toFixed(2)), yaw: +e.yaw.toFixed(3),
    size: b ? b.size.map((v: number) => +v.toFixed(2)) : null,
    dist: +Math.hypot(e.pos[0] - CX, e.pos[2] - CZ).toFixed(1),
  }));
}
console.log("--- named searches (whole world):");
for (const e of d.entities as any[]) {
  if (/approach|fieldpond|potter|kiln|pond|lake|water|spoke|gate-e|gate-s|town-gate/.test(e.id)) {
    console.log(JSON.stringify({ id: e.id, pos: e.pos.map((v: number) => +v.toFixed(2)), yaw: +e.yaw.toFixed(3), size: e.bbox ? e.bbox.size.map((v: number) => +v.toFixed(2)) : null }));
  }
}
