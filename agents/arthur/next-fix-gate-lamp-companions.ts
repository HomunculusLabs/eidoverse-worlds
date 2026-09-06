// next-fix-gate-lamp-companions.ts — repair the 4 gate-lamp companion lights
// (town-1 real fix followup). The off-axis placer removed companions but its
// respawn used spawn+kind:"light" which does not stick — the correct verb is
// `light` with {id,pos,color,intensity,range} (next-place-approach-lamps.ts
// chassis). Original params: color 0xffb066, intensity 1.35, range 4.5.
// New positions: 0.10 inward of each moved host.
import { readFileSync } from "node:fs";
import WebSocket from "ws";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const COLOR = 0xffb066, INTENSITY = 1.35, RANGE = 4.5;
const LIGHTS: Array<{ id: string; pos: [number, number, number] }> = [
  { id: "nx-approach-lamp-e-l", pos: [9.9, 1.96, 1.75] },
  { id: "nx-approach-lamp-s-l", pos: [-1.75, 1.96, -9.9] },
  { id: "nx-approach-lamp-n-l", pos: [1.75, 1.96, 9.9] },
  { id: "nx-approach-lamp-w-l", pos: [-9.9, 1.96, -1.75] },
];

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

async function geom() {
  const r = await fetch(`${base}/geom?world=${WORLD}`);
  if (!r.ok) die(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
const todo = LIGHTS.filter(l => {
  const live = before[l.id];
  return !live || !near(live.pos[0], l.pos[0]) || !near(live.pos[2], l.pos[2]);
});
if (todo.length === 0) { console.log("companions already live at target — zero verbs"); process.exit(0); }

const verbs: Array<[string, any]> = todo.map(l => ["light", { id: l.id, pos: l.pos, color: COLOR, intensity: INTENSITY, range: RANGE }] as [string, any]);
await new Promise<void>((resolve, reject) => {
  const ws = new WebSocket(cfg.url);
  let joined = false, i = 0;
  const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 45_000);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-town-companions", avatar: cfg.avatar, token: cfg.joinToken }));
  ws.onerror = () => { clearTimeout(timer); reject(new Error("websocket error")); };
  ws.onmessage = (ev: any) => {
    const m = JSON.parse(ev.data);
    if (m.type === "error") { clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 200)}`)); return; }
    if (m.type === "snapshot" && !joined) {
      joined = true;
      const paced = setInterval(() => {
        if (i >= verbs.length) { clearInterval(paced); setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 1800); return; }
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
      }, 700);
    }
  };
});

const after = await geom();
let ok = 0;
for (const l of LIGHTS) {
  const live = after[l.id];
  if (!live) die(`${l.id} still missing after light verbs`);
  if (!near(live.pos[0], l.pos[0]) || !near(live.pos[2], l.pos[2])) die(`${l.id} pos wrong: ${JSON.stringify(live.pos)}`);
  ok++;
}
console.log(JSON.stringify({ status: "COMPANIONS_VERIFIED", lights: ok, color: COLOR.toString(16), intensity: INTENSITY, range: RANGE }));
