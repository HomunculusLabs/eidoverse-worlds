// next-place-gate-lamps-offaxis.ts — town lane (town-1 real fix, Bill's
// screenshot correction 2026-09-06): "get the lamp out of the path, not lay
// more path to get around it." The four cardinal gate lamps sit dead-center
// on the spoke axes at r10; core-paths doglegs around them (source admits
// it). Fix: translate each lamp 1.75m off-axis (right of the outward walk —
// the side its lanterns already bias toward), companions follow, SAME lib
// (no upload — 18b69a6bb2 already in store), remove+spawn per lamp, then
// verify live tuples + comp bags (all four are {} per gate-pins).
// Chassis: next-place-gates.ts (hash gate, paced remove+spawn, deep verify,
// idempotent rerun prints zero verbs).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import WebSocket from "ws";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_approach_lamp.glb`;
const PINNED_SHA = "18b69a6bb2"; // store lib prefix currently live on all four
const HALF = Math.PI / 2;
// Off-axis targets: right of outward walk on each cardinal spoke. E lamp
// yaw pi (faces -x toward plaza): right of +x walk = -z... no: keep every
// offset on the lantern-bias side and consistent clockwise: E -> -z? The
// lanterns bias 0.10 INWARD (toward axis). Offsets chosen: E(-z side)? We
// place at z = +1.75 for E, x = -1.75 for S, z = -1.75 for N, x = +1.75
// for W — each lamp's inward lantern bias then faces the path it lights.
const SLOTS: Array<{ id: string; pos: [number, number, number]; yaw: number }> = [
  { id: "nx-approach-lamp-e", pos: [10, 0, 1.75],  yaw: Math.PI },
  { id: "nx-approach-lamp-s", pos: [-1.75, 0, -10], yaw: HALF },
  { id: "nx-approach-lamp-n", pos: [1.75, 0, 10],  yaw: -HALF },
  { id: "nx-approach-lamp-w", pos: [-10, 0, -1.75], yaw: 0 },
];
// companions offset 0.10 inward from each host (current pattern: -l sits
// 0.10 toward plaza along the spoke; we keep host-relative offset constant)
const COMP: Record<string, [number, number, number]> = {
  "nx-approach-lamp-e": [9.9, 1.96, 1.75],
  "nx-approach-lamp-s": [-1.75, 1.96, -9.9],
  "nx-approach-lamp-n": [1.75, 1.96, 9.9],
  "nx-approach-lamp-w": [-9.9, 1.96, -1.75],
};

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

async function geom() {
  const r = await fetch(`${base}/geom?world=${WORLD}`);
  if (!r.ok) die(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}

const bytes = readFileSync(FILE);
const sha = createHash("sha256").update(bytes).digest("hex");
if (!sha.startsWith(PINNED_SHA)) die(`local lamp bytes drifted from pinned store lib: ${sha.slice(0, 10)}`);

const before = await geom();
const todo: typeof SLOTS = [];
for (const s of SLOTS) {
  const live = before[s.id];
  if (!live) die(`${s.id} missing before placement`);
  if (live.lib !== `store/${PINNED_SHA}.glb` as string && !(live.lib ?? "").includes(PINNED_SHA))
    die(`${s.id} lib drift: ${live.lib}`);
  if (Object.keys(live.comp ?? {}).length !== 0) die(`${s.id} comp bag not empty`);
  const already = (live.lib ?? "").includes(PINNED_SHA)
    && near(live.pos[0], s.pos[0]) && near(live.pos[1], s.pos[1]) && near(live.pos[2], s.pos[2])
    && near(live.yaw, s.yaw);
  if (!already) todo.push(s);
}
if (todo.length === 0) { console.log("PLACED_VERIFIED already live — no verbs"); process.exit(0); }

// verbs: per lamp — remove host, spawn host off-axis, remove companion, spawn companion at follow-offset
const verbs: Array<() => void> = [];
todo.forEach((s) => {
  verbs.push(() => ws.send(JSON.stringify({ type: "verb", verb: "remove", args: { id: s.id } })));
  verbs.push(() => ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: {
    id: s.id, lib: `store/${PINNED_SHA}.glb`, pos: s.pos, yaw: s.yaw, scale: 1 } })));
  verbs.push(() => ws.send(JSON.stringify({ type: "verb", verb: "remove", args: { id: `${s.id}-l` } })));
  verbs.push(() => ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: {
    id: `${s.id}-l`, kind: "light", pos: COMP[s.id], yaw: 0, scale: 1 } })));
});

const ws = new WebSocket(cfg.url);
await new Promise<void>((resolve, reject) => {
  let joined = false, i = 0;
  const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 90_000);
  const paced = setInterval(() => {
    if (!joined || i >= verbs.length) return;
    verbs[i++]();
    if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 1800);
  }, 700);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-town-gatelamps", avatar: cfg.avatar, token: cfg.joinToken }));
  ws.onerror = () => { clearInterval(paced); clearTimeout(timer); reject(new Error("websocket error")); };
  ws.onmessage = (ev: any) => {
    const m = JSON.parse(ev.data);
    if (m.type === "error") { clearInterval(paced); clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
    if (m.type === "snapshot") { joined = true; console.log("joined, snapshot ok"); }
  };
});
console.log(`moved ${todo.length} gate lamp group(s)`);
const after = await geom();
for (const s of SLOTS) {
  const live = after[s.id];
  if (!live) die(`${s.id} MISSING after placement`);
  if (!(live.lib ?? "").includes(PINNED_SHA)) die(`${s.id} lib drift after: ${live.lib}`);
  if (!near(live.pos[0], s.pos[0]) || !near(live.pos[2], s.pos[2])) die(`${s.id} pos drift after: ${JSON.stringify(live.pos)}`);
  if (Object.keys(live.comp ?? {}).length !== 0) die(`${s.id} comp bag not empty after`);
}
// companions
for (const [id, pos] of Object.entries(COMP)) {
  const live = after[id];
  if (!live) die(`${id} MISSING after`);
  if (!near(live.pos[0], pos[0]) || !near(live.pos[2], pos[2])) die(`${id} pos drift after: ${JSON.stringify(live.pos)}`);
}
console.log("PLACED_VERIFIED all four gate lamps + companions off-axis, comp bags empty");
process.exit(0);
