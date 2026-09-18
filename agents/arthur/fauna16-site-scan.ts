// fauna16-site-scan.ts — read-only census scan of the dovecote candidate
// zone (FAUNA-PLAN fauna-15 proposal row: orchard-edge NW arc, grass between
// nx-dress-nw-orchard-rows-001 and the skeps/hedge, roughly x -50..-44,
// z 55..62). Lists every live entity within 26m of the zone center
// (-47, 58.5) with tuple + bbox + lib, so the build tick can choose a seat
// with real SAT inputs (orchard crowns are 14.5m — footprint SAT will be
// dominated by them; the exact vertical-clearance test decides).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const Z = 26, CX = -47, CZ = 58.5;
const rows = (d.entities as any[])
  .filter((e) => Math.hypot(e.pos[0] - CX, e.pos[2] - CZ) < Z)
  .sort((a, b) => Math.hypot(a.pos[0] - CX, a.pos[2] - CZ) - Math.hypot(b.pos[0] - CX, b.pos[2] - CZ));
for (const e of rows) {
  const b = e.bbox;
  console.log(JSON.stringify({
    id: e.id, pos: e.pos.map((v: number) => +v.toFixed(3)), yaw: +e.yaw.toFixed(3),
    lib: (e.lib ?? "").slice(6, 22), size: b ? b.size.map((v: number) => +v.toFixed(2)) : null,
    bbmin: b ? b.min.map((v: number) => +v.toFixed(2)) : null,
    bbmax: b ? b.max.map((v: number) => +v.toFixed(2)) : null,
    dist: +Math.hypot(e.pos[0] - CX, e.pos[2] - CZ).toFixed(2),
    comps: Object.keys(e.comp ?? {}).length,
  }));
}
console.log("total in zone:", rows.length, "| world total:", d.entities.length);
