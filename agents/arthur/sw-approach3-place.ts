// sw-approach3-place.ts — approach-3 hash-gated placer for the SW straight.
// One entity (nx-approach-sw-lane-003) + two budgeted lights. Idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_sw_approach3.glb`;
const SHA = "56b35877ecda923d944561d400f8fd146517664331dfa1d2f74cce045828d495";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-approach-sw-lane-003";
const POS = [0, 0, 0], YAW = 0;
const LIGHTS = [
  { id: "nx-approach-sw-lamp-001-l", pos: [-25.20, 1.96, -30.67] },
  { id: "nx-approach-sw-lamp-002-l", pos: [-34.69, 1.96, -43.14] },
];
const COLOR = 0xffb066, INTENSITY = 1.35, RANGE = 4.5;

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: readonly number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));

async function geom() {
  const r = await fetch(`${base}/geom?world=${WORLD}`);
  if (!r.ok) die(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
async function lightFold() {
  const ids = new Set(LIGHTS.map(l => l.id));
  return await new Promise<Record<string, any>>((resolve, reject) => {
    const ws = new WebSocket(cfg.url); const out: Record<string, any> = {};
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("light history timeout")); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-approach3-lightread", avatar: cfg.avatar, token: cfg.joinToken, spectate: true }));
    ws.onerror = () => { clearTimeout(timer); reject(new Error("light history websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearTimeout(timer); reject(new Error(`light history ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") { ws.send(JSON.stringify({ type: "history", verbs: ["light"], limit: 300 })); return; }
      if (m.type !== "history") return;
      for (const r of m.entries ?? []) {
        const x = r.args ?? r; if (!ids.has(x.id)) continue;
        const cur = out[x.id] ?? {};
        for (const k of ["pos", "color", "intensity", "range"]) if (x[k] !== undefined) cur[k] = x[k];
        out[x.id] = cur;
      }
      clearTimeout(timer); try { ws.close(); } catch {} resolve(out);
    };
  });
}

const bytes = readFileSync(FILE);
const hash = createHash("sha256").update(bytes).digest("hex");
if (hash !== SHA) die(`reviewed hash mismatch: ${hash}`);

const before = await geom();
const beforeLights = await lightFold();
const BLOCKERS = ["nx-struct-angler", "nx-struct-reedpool", "nx-town-dyehouse", "nx-town-bunkhouse", "nx-temple-seed-0021"];
for (const b of BLOCKERS) if (!before[b]) die(`siting blocker ${b} missing from live census — census epoch changed, re-derive`);
const e = before[ID];
if (e && !(e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1)) die(`${ID} collision/drift`);
for (const l of LIGHTS) {
  const le = before[l.id], authored = beforeLights[l.id];
  if (le && !(le.kind === "light" && vec(le.pos, l.pos))) die(`${l.id} collision/drift`);
  if (authored && !(authored.color === COLOR && near(authored.intensity, INTENSITY) && near(authored.range, RANGE))) die(`${l.id} authored drift`);
}

const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next SW approach straight approach-3");
u.searchParams.set("by", cfg.id);
let uploaded = "";
for (let attempt = 1; attempt <= 6; attempt++) {
  const r = await fetch(u, { method: "POST", body: bytes });
  if (r.ok) { uploaded = (await r.json()).path; break; }
  if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
  die(`upload HTTP ${r.status}`);
}
if (uploaded !== LIB) die(`upload returned ${uploaded}, expected ${LIB}`);

const verbs: Array<[string, any]> = [];
if (!before[ID]) verbs.push(["spawn", { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: 1 }]);
for (const l of LIGHTS) if (!before[l.id]) verbs.push(["light", { id: l.id, pos: l.pos, color: COLOR, intensity: INTENSITY, range: RANGE }]);
if (verbs.length) {
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url); let joined = false, i = 0;
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 90_000);
    const paced = setInterval(() => {
      if (!joined || i >= verbs.length) return;
      const [verb, args] = verbs[i++]; ws.send(JSON.stringify({ type: "verb", verb, args }));
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 1800);
    }, 600);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-approach3-place", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearInterval(paced); clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => { const m = JSON.parse(ev.data); if (m.type === "error") { clearInterval(paced); clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); } else if (m.type === "snapshot") joined = true; };
  });
} else console.log("approach-3 ensemble already live — no verbs");

const after = await geom();
const afterLights = await lightFold();
const ea = after[ID];
if (!(ea?.lib === LIB && vec(ea.pos, POS) && near(ea.yaw ?? 0, YAW) && (ea.scale ?? 1) === 1)) die(`${ID} post-place failed: ${JSON.stringify(ea)}`);
for (const l of LIGHTS) {
  const le = after[l.id], authored = afterLights[l.id];
  if (!(le?.kind === "light" && vec(le.pos, l.pos) && authored?.color === COLOR && near(authored.intensity, INTENSITY) && near(authored.range, RANGE))) die(`${l.id} post-place failed: ${JSON.stringify({ geom: le, authored })}`);
}
console.log(JSON.stringify({ status: "PLACED_VERIFIED", lib: LIB, entity: ID, lights: LIGHTS.map(l => l.id), verbs: verbs.length }));
