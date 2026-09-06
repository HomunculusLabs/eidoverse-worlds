// nw-approach6-place.ts — approach lane D1-fix placer (approach-6).
// One entity (nx-approach-nw-lane-001) reseats from the approach-1/5 lib to
// the D1 night-wayfinding rebuild at the SAME tuple (remove+spawn, comp {}).
// The two budgeted lights are UNCHANGED — gates verify their standing state
// only; no light verbs are expected (they are live at the exact authored
// positions; bead pillars are emissive geometry, not light entities).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_nw_approach1.glb`;
const SHA = "dc256065879371d8ebcf4dd9552be93e34cf098cf3ef1056cd3c4163b42bcaf7";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
// the approach-1..5 accepted lib — the only lib authorized for reseat
const PRIOR = "store/d46a60fb3ad301e3.glb";
const ID = "nx-approach-nw-lane-001";
const POS = [0, 0, 0], YAW = 0;
const LIGHTS = [
  { id: "nx-approach-nw-lamp-001-l", pos: [-39.09, 1.96, 30.26] },
  { id: "nx-approach-nw-lamp-002-l", pos: [-47.96, 1.96, 46.71] },
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-approach6-lightread", avatar: cfg.avatar, token: cfg.joinToken, spectate: true }));
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
const BLOCKERS = ["nx-carousel", "nx-town-garden-cottage", "nx-struct-amphi", "nx-gallery-mosaic-0052", "nx-cultivation-lavender-0027", "nx-cultivation-orchard-0033"];
for (const b of BLOCKERS) if (!before[b]) die(`siting blocker ${b} missing from live census — census epoch changed, re-derive`);
const e = before[ID];
let reseat = false;
if (e) {
  if (!(vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1)) die(`${ID} tuple drift: ${JSON.stringify(e)}`);
  if (e.lib === PRIOR) reseat = true;           // authorized lib refresh at exact tuple
  else if (e.lib !== LIB) die(`${ID} unexpected lib ${e.lib}`); // disputed bytes — hard stop
}
for (const l of LIGHTS) {
  const le = before[l.id], authored = beforeLights[l.id];
  if (le && !(le.kind === "light" && vec(le.pos, l.pos))) die(`${l.id} collision/drift`);
  if (authored && !(authored.color === COLOR && near(authored.intensity, INTENSITY) && near(authored.range, RANGE))) die(`${l.id} authored drift`);
}

const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next NW approach winding lane approach-6 D1 night cadence");
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
if (reseat) verbs.push(["remove", { id: ID }]);  // spawn never moves a standing entity
if (!before[ID] || reseat) verbs.push(["spawn", { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: 1 }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-approach6-place", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearInterval(paced); clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => { const m = JSON.parse(ev.data); if (m.type === "error") { clearInterval(paced); clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); } else if (m.type === "snapshot") joined = true; };
  });
} else console.log("approach-6 ensemble already live — no verbs");

const after = await geom();
const afterLights = await lightFold();
const ea = after[ID];
if (!(ea?.lib === LIB && vec(ea.pos, POS) && near(ea.yaw ?? 0, YAW) && (ea.scale ?? 1) === 1)) die(`${ID} post-place failed: ${JSON.stringify(ea)}`);
for (const l of LIGHTS) {
  const le = after[l.id], authored = afterLights[l.id];
  if (!(le?.kind === "light" && vec(le.pos, l.pos) && authored?.color === COLOR && near(authored.intensity, INTENSITY) && near(authored.range, RANGE))) die(`${l.id} post-place failed: ${JSON.stringify({ geom: le, authored })}`);
}
console.log(JSON.stringify({ status: "PLACED_VERIFIED", lib: LIB, entity: ID, lights: LIGHTS.map(l => l.id), verbs: verbs.length }));
