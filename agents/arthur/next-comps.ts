// next-comps.ts — nv-2: comp bags for the staked plaza trio in commons-next.
// Applies VERBATIM the live bags read fresh from commons /geom this tick
// (read-commons-bags.ts, 2026-08-21) — the queue prose undercounted both
// (carousel 6→7: it forgot particles:smoke; hearth 3→4 keys + 5 sockets:
// log_0..3 AND tale_seat — prose only knew 3 logs). Live bag wins, always.
//   nx-carousel  7 comps: motion:carousel, motion:horse_0/2/4/6, sockets(4), particles:smoke
//   nx-hearth    4 comps: particles(embers), motion:well_, sockets(5), motion:pz_kettle
//   nx-welcome   0 comps (empty in commons too — verbatim = leave empty)
// Plus two lights (light verb, not comps):
//   nx-plaza-l   (0,1.2,0)     — av-plaza-l twin; params merged from commons
//                 world_history light entries (fold §3.1 partial-update semantics);
//                 fallback = av-plaza era house params (0xffb066/1.8/5).
//   nx-welcome-l (-3,2.2,-4.3) — new, warm modest.
// Idempotent per key: skips a comp already present with deep-equal data.
// Verbs paced 600ms per nv law. Verify via /geom census after.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const TARGET = "commons-next";
type Ent = { id: string; lib: string | null; kind?: string; pos: number[]; yaw: number; scale?: number; comp?: Record<string, any> };

// ---- verbatim bags (from /geom?world=commons, live read this tick) ----
const CAROUSEL: Record<string, any> = {
  "motion:carousel": { type: "spin", axis: [0, 1, 0], pivot: [0, 0, 0], degPerSec: 6 },
  "motion:horse_0": { type: "bob", amp: 0.18, period: 2.4, phase: 0 },
  "motion:horse_2": { type: "bob", amp: 0.18, period: 2.4, phase: 1.57 },
  "motion:horse_4": { type: "bob", amp: 0.18, period: 2.4, phase: 3.14 },
  "motion:horse_6": { type: "bob", amp: 0.18, period: 2.4, phase: 4.71 },
  "sockets": {
    horse_0: { pos: [2, 1.97, 0], yaw: 3.141592653589793, part: "horse_0" },
    horse_2: { pos: [0, 1.97, 2], yaw: 1.5707963267948966, part: "horse_2" },
    horse_4: { pos: [-2, 1.97, 0], yaw: 0, part: "horse_4" },
    horse_6: { pos: [0, 1.97, -2], yaw: -1.5707963267948966, part: "horse_6" },
  },
  // particles origins are ENTITY-RELATIVE (shared/particles.js), not world-space.
  // The inherited commons bag is a latent clamped-offset defect; never re-copy it.
  "particles:smoke": { preset: "smoke", count: 50, size: 0.4, speed: 0.35, origin: [0, 6.3, 0] },
};
const HEARTH: Record<string, any> = {
  "particles": { preset: "embers", origin: [0, 0.7, 0], count: 30, size: 0.22, speed: 0.32 },
  "motion:well_": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 3, period: 9, damp: 0.99, t0: null },
  "sockets": {
    log_0: { pos: [1.344, 0.32, 1.344], yaw: -2.356 },
    log_1: { pos: [-1.344, 0.32, 1.344], yaw: 2.356 },
    log_2: { pos: [-1.344, 0.32, -1.344], yaw: 0.785 },
    log_3: { pos: [1.344, 0.32, -1.344], yaw: -0.785 },
    tale_seat: { pos: [0.8, 0.55, 2.9], yaw: -2.872 },
  },
  "motion:pz_kettle": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 1.55, 0], amp: 2.5, period: 11 },
};
const WELCOME: Record<string, any> = {};  // verbatim empty

const eq = (a: any, b: any): boolean => JSON.stringify(a) === JSON.stringify(b);

async function geom(): Promise<Record<string, Ent>> {
  const r = await fetch(`${base}/geom?world=${TARGET}`);
  if (!r.ok) throw Error(`geom ${r.status}`);
  const d = await r.json() as { entities: Ent[] };
  return Object.fromEntries(d.entities.map(e => [e.id, e]));
}

// ---- 1) av-plaza-l params from commons world log (spectator history read) ----
type LightParams = { pos?: number[]; color?: number; intensity?: number; range?: number };
async function readPlazaL(): Promise<LightParams | null> {
  const ws = new WebSocket(cfg.url);
  const done = new Promise<LightParams | null>((resolve) => {
    const t = setTimeout(() => { console.log("history read timeout"); resolve(null); }, 20000);
    let joined = false; const acc: LightParams = {}; let found = false; let pages = 0;
    let before = Infinity;
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { console.log("history err", JSON.stringify(m).slice(0, 200)); return; }
      if (!joined && m.type === "snapshot") {
        joined = true;
        ws.send(JSON.stringify({ type: "history", verbs: ["light"], limit: 300, before }));
        return;
      }
      if (m.type !== "history") return;
      pages++;
      const entries = m.entries ?? [];
      // server hands back WORLD ORDER (oldest→newest, world.ts L227) — merge
      // in given order so newer entries overwrite older: fold semantics.
      for (const r of entries) {
        const a = r.args ?? r;
        if (a?.id === "av-plaza-l") {
          found = true;
          for (const k of ["pos", "color", "intensity", "range"] as const) if (a[k] !== undefined) acc[k] = a[k];
        }
      }
      const oldest = m.oldestSeq ?? (entries.length ? entries[0].seq : null);
      if (m.hasMore && oldest !== null && oldest > 0 && pages < 12) {
        ws.send(JSON.stringify({ type: "history", verbs: ["light"], limit: 300, before: oldest }));
      } else {
        clearTimeout(t); resolve(found ? acc : null);
      }
    };
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: "commons", id: "arthur-bagread", avatar: cfg.avatar, token: cfg.joinToken, spectate: true }));
    ws.onerror = () => { clearTimeout(t); resolve(null); };
  });
  const r = await done;
  try { ws.close(); } catch {}
  return r;
}
const plazaL = await readPlazaL();
let PL: [number, number, number] = [0xffb066, 1.8, 5];  // house-placer era fallback
if (plazaL) {
  PL = [plazaL.color ?? PL[0], plazaL.intensity ?? PL[1], plazaL.range ?? PL[2]];
  console.log("av-plaza-l authored params:", JSON.stringify(plazaL));
} else {
  console.log("av-plaza-l not in commons history — fallback 0xffb066/1.8/5");
}
const posOk = !plazaL?.pos || eq(plazaL.pos, [0, 1.2, 0]);
console.log("av-plaza-l pos cross-check:", posOk ? "matches (0,1.2,0)" : "DIFFERS " + JSON.stringify(plazaL?.pos));

// ---- 2) build verb queue from live before-state ----
const before = await geom();
console.log("before:", Object.keys(before).length, "entities");
for (const id of ["nx-hearth", "nx-carousel", "nx-welcome"]) {
  const e = before[id];
  if (!e) { console.log(`MISSING ${id} — plaza not staked?`); process.exit(1); }
  console.log(`${id}: ${Object.keys(e.comp ?? {}).length} comps now`);
}
const verbs: Array<[string, any]> = [];
function pushComps(id: string, bag: Record<string, any>) {
  const have = before[id]?.comp ?? {};
  for (const [type, data] of Object.entries(bag)) {
    if (eq(have[type], data)) { console.log(`skip ${id} ${type} (already equal)`); continue; }
    verbs.push(["comp", { id, type, data }]);
  }
}
pushComps("nx-carousel", CAROUSEL);
pushComps("nx-hearth", HEARTH);
pushComps("nx-welcome", WELCOME);
const LIGHTS: Array<{ id: string; pos: [number, number, number]; color: number; intensity: number; range: number }> = [
  { id: "nx-plaza-l", pos: [0, 1.2, 0], color: PL[0], intensity: PL[1], range: PL[2] },
  { id: "nx-welcome-l", pos: [-3, 2.2, -4.3], color: 0xffb066, intensity: 1.2, range: 4 },
];
for (const L of LIGHTS) {
  if (before[L.id] && before[L.id].kind === "light") { console.log(`skip ${L.id} (light present)`); continue; }
  verbs.push(["light", { id: L.id, pos: L.pos, color: L.color, intensity: L.intensity, range: L.range }]);
}
console.log("verbs to send:", verbs.length);
if (!verbs.length) { console.log("NOTHING TO SEND"); process.exit(0); }

// ---- 3) paced send (600ms) ----
const ws = new WebSocket(cfg.url);
let n = 0, last = Date.now(), pending: [string, any] | null = null, re = 0;
const timer = setTimeout(() => { console.log("TIMEOUT"); process.exit(1); }, 180000);
function send() { if (n >= verbs.length) return; pending = verbs[n++]; ws.send(JSON.stringify({ type: "verb", verb: pending[0], args: pending[1] })); }
ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: TARGET, id: "arthur-next-comps", avatar: cfg.avatar, token: cfg.joinToken }));
ws.onmessage = (ev: any) => {
  const m = JSON.parse(ev.data);
  if (m.type === "error") console.log("SERVER ERROR", JSON.stringify(m).slice(0, 300));
  if (m.type !== "snapshot" && m.type !== "log") return;
  last = Date.now(); re = 0;
  if (n < verbs.length) send(); else pending = null;
};
const wd = setInterval(() => {
  if (!pending || Date.now() - last < 6000) return;
  if (re >= 3) { console.log("STALLED", pending[0]); process.exit(1); }
  re++; ws.send(JSON.stringify({ type: "verb", verb: pending[0], args: pending[1] }));
}, 1500);
while (n < verbs.length || pending) await new Promise(r => setTimeout(r, 250));
await new Promise(r => setTimeout(r, 1200));
clearInterval(wd); clearTimeout(timer); try { ws.close(); } catch {}

// ---- 4) verify via /geom ----
const after = await geom();
let ok = true;
const expect: Record<string, [Record<string, any>, string[]]> = {
  "nx-carousel": [CAROUSEL, ["motion:carousel", "motion:horse_0", "motion:horse_2", "motion:horse_4", "motion:horse_6", "sockets", "particles:smoke"]],
  "nx-hearth": [HEARTH, ["particles", "motion:well_", "sockets", "motion:pz_kettle"]],
  "nx-welcome": [WELCOME, []],
};
for (const [id, [bag, keys]] of Object.entries(expect)) {
  const live = after[id]?.comp ?? {};
  const missing = keys.filter(k => !(k in live));
  const extra = Object.keys(live).filter(k => !keys.includes(k));
  let good = missing.length === 0 && extra.length === 0;
  if (!good) ok = false;
  console.log(`verify ${id}: ${good ? "PASS" : "FAIL"} — ${Object.keys(live).length} comps${missing.length ? " missing:" + missing : ""}${extra.length ? " extra:" + extra : ""}`);
  for (const k of keys) if (k in live && !eq(live[k], bag[k])) { console.log(`  MISMATCH ${id} ${k}: live=${JSON.stringify(live[k])} want=${JSON.stringify(bag[k])}`); ok = false; }
}
for (const L of LIGHTS) {
  const e = after[L.id];
  const good = !!e && e.kind === "light" && eq(e.pos, L.pos);
  if (!good) ok = false;
  console.log(`verify ${L.id}: ${good ? "PASS" : "FAIL"}`, JSON.stringify({ kind: e?.kind, pos: e?.pos }));
}
console.log("NV-2 COMPS:", ok ? "ALL PASS" : "FAIL");
process.exit(ok ? 0 : 1);
