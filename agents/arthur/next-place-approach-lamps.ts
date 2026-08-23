// next-place-approach-lamps.ts — nvp-10 atomic four-way lamp placement.
// Target commons-next only. One reviewed model hash, four exact cardinal seats,
// four separately budgeted lights. Idempotent: only missing/drifted members send.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_approach_lamp.glb`;
const SHA = "409084706b801f8d55282b44d2dc4635ea19f5ad4e0eded499aacc7a8932998b";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const COLOR = 0xffb066, INTENSITY = 1.35, RANGE = 4.5;
const MEMBERS = [
  { q: "e", pos: [10, 0, 0], yaw: -Math.PI / 2, light: [9.9, 1.96, 0] },
  { q: "n", pos: [0, 0, 10], yaw: Math.PI, light: [0, 1.96, 9.9] },
  { q: "w", pos: [-10, 0, 0], yaw: Math.PI / 2, light: [-9.9, 1.96, 0] },
  { q: "s", pos: [0, 0, -10], yaw: 0, light: [0, 1.96, -9.9] },
] as const;
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
// /geom intentionally projects lights to identity + pose; authored color,
// intensity, and range live in the light-verb fold. Verify that second boundary
// from history instead of pretending absent /geom fields are drift.
async function lightFold() {
  const ids = new Set(MEMBERS.map(m => `nx-approach-lamp-${m.q}-l`));
  return await new Promise<Record<string, any>>((resolve, reject) => {
    const ws = new WebSocket(cfg.url); const out: Record<string, any> = {};
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("light history timeout")); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-nvp10-lightread", avatar: cfg.avatar, token: cfg.joinToken, spectate: true }));
    ws.onerror = () => { clearTimeout(timer); reject(new Error("light history websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearTimeout(timer); reject(new Error(`light history ${JSON.stringify(m).slice(0,240)}`)); return; }
      if (m.type === "snapshot") { ws.send(JSON.stringify({ type: "history", verbs: ["light"], limit: 300 })); return; }
      if (m.type !== "history") return;
      // Entries arrive in world order; later partial updates overwrite earlier.
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
// Fail closed on id collisions outside the exact reviewed tuple.
for (const m of MEMBERS) {
  const id = `nx-approach-lamp-${m.q}`, lid = `${id}-l`;
  const e = before[id], l = before[lid];
  if (e && !(e.lib === LIB && vec(e.pos, m.pos) && near(e.yaw ?? 0, m.yaw) && (e.scale ?? 1) === 1 && Object.keys(e.comp ?? {}).length === 0)) die(`${id} collision/drift`);
  const authored = beforeLights[lid];
  if (l && !(l.kind === "light" && vec(l.pos, m.light) && authored?.color === COLOR && near(authored?.intensity, INTENSITY) && near(authored?.range, RANGE))) die(`${lid} collision/drift`);
}

// Upload once even if already content-addressed; returned path binds the exact bytes.
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next cardinal approach lamp nvp-10");
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
for (const m of MEMBERS) {
  const id = `nx-approach-lamp-${m.q}`, lid = `${id}-l`;
  if (!before[id]) verbs.push(["spawn", { id, lib: LIB, pos: m.pos, yaw: m.yaw, scale: 1 }]);
  if (!before[lid]) verbs.push(["light", { id: lid, pos: m.light, color: COLOR, intensity: INTENSITY, range: RANGE }]);
}
if (verbs.length) {
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url); let joined = false, i = 0;
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 90_000);
    const paced = setInterval(() => {
      if (!joined || i >= verbs.length) return;
      const [verb, args] = verbs[i++]; ws.send(JSON.stringify({ type: "verb", verb, args }));
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 1800);
    }, 600);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-nvp10-lamps", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearInterval(paced); clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => { const m = JSON.parse(ev.data); if (m.type === "error") { clearInterval(paced); clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0,240)}`)); } else if (m.type === "snapshot") joined = true; };
  });
} else console.log("atomic ensemble already live — no verbs");

const after = await geom();
const afterLights = await lightFold();
for (const m of MEMBERS) {
  const id = `nx-approach-lamp-${m.q}`, lid = `${id}-l`, e = after[id], l = after[lid], authored = afterLights[lid];
  if (!(e?.lib === LIB && vec(e.pos, m.pos) && near(e.yaw ?? 0, m.yaw) && (e.scale ?? 1) === 1 && Object.keys(e.comp ?? {}).length === 0)) die(`${id} post-place failed`);
  if (!(l?.kind === "light" && vec(l.pos, m.light) && authored?.color === COLOR && near(authored?.intensity, INTENSITY) && near(authored?.range, RANGE))) die(`${lid} post-place failed: ${JSON.stringify({ geom: l, authored })}`);
}
console.log(JSON.stringify({ status: "PLACED_VERIFIED", lib: LIB, models: MEMBERS.map(m => `nx-approach-lamp-${m.q}`), lights: MEMBERS.map(m => `nx-approach-lamp-${m.q}-l`), verbs: verbs.length }));
