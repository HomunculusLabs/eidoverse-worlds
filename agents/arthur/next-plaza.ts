// next-plaza.ts — commons-next plaza staker (nv-lane, fork-2 era).
// Places the beloved three from commons into commons-next at drawn poses:
//   nx-hearth  (0,0)         — the village's center of gravity
//   nx-welcome (-3,0,-4.3)   — lit welcome board, S rim facing N
//   nx-carousel (-18.8,0,25.9) — NW of hearth, same offset as commons
// Uses live commons libs (content-addressed, same bytes = same hash):
//   hearth  43fcaf1442f5d6b8  welcome  6cd75bbbbf379df5  carousel 38fbbc26dcdfcc1a
// All three: no comps yet (empty bag on purpose — carousel motion/sockets/smoke
// ride in the next tick after Bill's eye-check of placement; hearth fire is a
// later tick; welcome lamp likewise). Verbs are paced (600ms) per house law.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const TARGET = "commons-next";
type Ent = { id: string; lib: string; pos: number[]; yaw: number; scale?: number };
const PLAZA: { id: string; lib: string; pos: [number, number, number]; yaw: number }[] = [
  { id: "nx-hearth",   lib: "store/43fcaf1442f5d6b8.glb", pos: [0, 0, 0],        yaw: 0 },
  { id: "nx-welcome",  lib: "store/6cd75bbbbf379df5.glb", pos: [-3, 0, -4.3],    yaw: 0.6092 },
  { id: "nx-carousel", lib: "store/38fbbc26dcdfcc1a.glb", pos: [-18.8, 0, 25.9], yaw: 2.5137 },
];
async function geom(): Promise<Record<string, Ent>> {
  const r = await fetch(`${base}/geom?world=${TARGET}`);
  if (!r.ok) throw Error(`geom ${r.status}`);
  const d = await r.json() as { entities: Ent[] };
  return Object.fromEntries(d.entities.map(e => [e.id, e]));
}
const before = await geom();
console.log("before:", Object.keys(before).length, "entities");
const verbs: [string, any][] = [];
for (const p of PLAZA) {
  if (before[p.id]) { console.log(`skip ${p.id} (already present)`); continue; }
  verbs.push(["spawn", { id: p.id, lib: p.lib, pos: p.pos, yaw: p.yaw, scale: 1 }]);
}
if (!verbs.length) { console.log("NOTHING TO PLACE — plaza already staked"); process.exit(0); }
const ws = new WebSocket(cfg.url);
let n = 0, last = Date.now(), pending: [string, any] | null = null, re = 0;
const timer = setTimeout(() => { console.log("TIMEOUT"); process.exit(1); }, 120000);
function send() { if (n >= verbs.length) return; pending = verbs[n++]; ws.send(JSON.stringify({ type: "verb", verb: pending[0], args: pending[1] })); }
ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: TARGET, id: "arthur-next-plaza", avatar: cfg.avatar, token: cfg.joinToken }));
ws.onmessage = (ev: any) => { const m = JSON.parse(ev.data); if (m.type === "error") console.log("SERVER ERROR", JSON.stringify(m)); if (m.type !== "snapshot" && m.type !== "log") return; last = Date.now(); re = 0; if (n < verbs.length) send(); else pending = null; };
const wd = setInterval(() => { if (!pending || Date.now() - last < 6000) return; if (re >= 3) { console.log("STALLED", pending[0]); process.exit(1); } re++; ws.send(JSON.stringify({ type: "verb", verb: pending[0], args: pending[1] })); }, 1500);
while (n < verbs.length || pending) await new Promise(r => setTimeout(r, 250));
await new Promise(r => setTimeout(r, 1200));
clearInterval(wd); clearTimeout(timer); try { ws.close() } catch {}
const after = await geom();
let ok = true;
for (const p of PLAZA) {
  const a = after[p.id];
  const good = !!a && a.lib === p.lib && Math.abs(a.pos[0] - p.pos[0]) < 0.01 && Math.abs(a.pos[2] - p.pos[2]) < 0.01;
  if (!good) ok = false;
  console.log(`verify ${p.id}: ${good ? "PASS" : "FAIL"}`, JSON.stringify({ lib: a?.lib, pos: a?.pos, yaw: a?.yaw }));
}
console.log("PLAZA STAKED:", ok ? "ALL PASS" : "FAIL");
process.exit(ok ? 0 : 1);
