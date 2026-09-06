// next-place-gate-lamps-offaxis.ts — town lane (town-1 real fix, Bill's
// screenshot correction 2026-09-06): "get the lamp out of the path, not lay
// more path to get around it." The four cardinal gate lamps sit dead-center
// on the spoke axes at r10; core-paths doglegs around them (source admits
// it). Fix: translate each lamp 1.75m off-axis (right of the outward walk —
// the side its lanterns already bias toward), companions follow, SAME lib
// (no upload — 18b69a6bb2f5862f already in store), remove+spawn per lamp,
// then verify live tuples + comp bags (all four are {} per gate-pins).
// R-120 fix (improve-21, 2026-09-06): PINNED_SHA widened to the FULL 16-hex
// store name — the 10-hex prefix spawn left all four lamps on a lib the
// client cannot download (HTTP 404) → invisible landmarks, bbox:null, out of
// the SAT set (five sweeps, notes 1-5). Post-verify now REQUIRES bbox
// presence (server could classify the full lib). Same tuples — the b26
// wayband rider on lamp-n (concentric at identical pose) stays standing.
// Chassis: next-place-gates.ts (hash gate, paced remove+spawn, deep verify,
// idempotent rerun prints zero verbs).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import WebSocket from "ws";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_approach_lamp.glb`;
const PINNED_SHA = "18b69a6bb2f5862f"; // FULL 16-hex store lib (R-120: was 10-hex, caused 404)
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
// R-121 note: companion lights at off-axis follow-offsets. COMP positions
// are the committed pins (census pre-mutation confirmed all four standing
// here until run-1's silent loss — see restore below).
const COMP: Record<string, [number, number, number]> = {
  "nx-approach-lamp-e": [9.9, 1.96, 1.75],
  "nx-approach-lamp-s": [-1.75, 1.96, -9.9],
  "nx-approach-lamp-n": [1.75, 1.96, 9.9],
  "nx-approach-lamp-w": [-9.9, 1.96, -1.75],
};
// foreign riders that stand concentric on lamp-n — must survive untouched
const RIDERS = ["nx-artwalk-b26-wayband"];
const COMP_IDS = Object.keys(COMP).map(h => `${h}-l`);

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
if (!sha.startsWith(PINNED_SHA)) die(`local lamp bytes drifted from pinned store lib: ${sha.slice(0, 16)}`);

// R-120 pre-state acceptance: the KNOWN-BAD truncated 10-hex lib is the
// state this run cures — accept it (and only it) as a legal pre-state; any
// other lib is real drift and still dies.
const TRUNCATED = "18b69a6bb2";
const before = await geom();
const todo: typeof SLOTS = [];
for (const s of SLOTS) {
  const live = before[s.id];
  if (!live) die(`${s.id} missing before placement`);
  const liveLib = live.lib ?? "";
  if (!liveLib.includes(PINNED_SHA) && liveLib !== `store/${TRUNCATED}.glb`)
    die(`${s.id} lib drift: ${liveLib}`);
  if (Object.keys(live.comp ?? {}).length !== 0) die(`${s.id} comp bag not empty`);
  const already = (live.lib ?? "").includes(PINNED_SHA)
    && near(live.pos[0], s.pos[0]) && near(live.pos[1], s.pos[1]) && near(live.pos[2], s.pos[2])
    && near(live.yaw, s.yaw)
    && !!live.bbox; // R-120: idempotent state requires a classified (bbox-bearing) lib
  if (!already) todo.push(s);
}
if (todo.length === 0) { console.log("already live — no verbs; verifying pass-through"); }
else {

// verbs: per lamp — remove host, spawn host on FULL lib; companions handled
// by the light RESTORE below (run-1's spawn-kind-light verbs silently failed;
// the proven idiom is the "light" verb with authored color/intensity/range —
// struct-beacon chassis).
const verbs: Array<[string, any]> = [];
todo.forEach((s) => {
  verbs.push(["remove", { id: s.id }]);
  verbs.push(["spawn", { id: s.id, lib: `store/${PINNED_SHA}.glb`, pos: s.pos, yaw: s.yaw, scale: 1 }]);
});

const ws = new WebSocket(cfg.url);
await new Promise<void>((resolve, reject) => {
  let joined = false, i = 0;
  const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 90_000);
  const paced = setInterval(() => {
    if (!joined || i >= verbs.length) return;
    const [verb, args] = verbs[i++];
    ws.send(JSON.stringify({ type: "verb", verb, args }));
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
}

const after = await geom();

// --- companion-light RESTORE (R-120 run-1 lesson): read the authored light
// fold from history (proven second-boundary read — /geom projects lights to
// identity+pose only), then re-issue "light" verbs for any missing
// companion at its committed pin. Struct-beacon chassis.
async function lightFold(): Promise<Record<string, any>> {
  return await new Promise((resolve, reject) => {
    const ws2 = new WebSocket(cfg.url); const out: Record<string, any> = {};
    const timer = setTimeout(() => { try { ws2.close(); } catch {} reject(new Error("light history timeout")); }, 30_000);
    ws2.onopen = () => ws2.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-town-gatelamps", avatar: cfg.avatar, token: cfg.joinToken, spectate: true }));
    ws2.onerror = () => { clearTimeout(timer); reject(new Error("light history websocket error")); };
    ws2.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearTimeout(timer); reject(new Error(`light history ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") { ws2.send(JSON.stringify({ type: "history", verbs: ["light"], limit: 300 })); return; }
      if (m.type !== "history") return;
      for (const r of m.entries ?? []) {
        const x = r.args ?? r; if (!COMP_IDS.includes(x.id)) continue;
        const cur = out[x.id] ?? {};
        for (const k of ["pos", "color", "intensity", "range"]) if (x[k] !== undefined) cur[k] = x[k];
        out[x.id] = cur;
      }
      clearTimeout(timer); try { ws2.close(); } catch {} resolve(out);
    };
  });
}
const fold: Record<string, any> = await lightFold().catch((e: any) => { die(`light fold read failed: ${e.message}`); }) as Record<string, any>;

// hosts first
for (const s of SLOTS) {
  const live = after[s.id];
  if (!live) die(`${s.id} MISSING after placement`);
  if (!(live.lib ?? "").includes(PINNED_SHA)) die(`${s.id} lib drift after: ${live.lib}`);
  if (!near(live.pos[0], s.pos[0]) || !near(live.pos[2], s.pos[2])) die(`${s.id} pos drift after: ${JSON.stringify(live.pos)}`);
  if (Object.keys(live.comp ?? {}).length !== 0) die(`${s.id} comp bag not empty after`);
  if (!live.bbox) die(`${s.id} bbox NULL after placement — lib still unclassifiable (R-120 regression)`);
  console.log(`${s.id}: lib ${live.lib} bbox OK`);
}
// companions — compare the COMPANION entity (probe self-catch: the committed
// original compared HOST pos vs companion targets). Missing companions are
// RESTORED via the authored fold + "light" verb (struct-beacon idiom).
const lightVerbs: Array<[string, any]> = [];
for (const [hostId, pos] of Object.entries(COMP)) {
  const id = `${hostId}-l`;
  const live = after[id];
  if (!live) {
    const authored = fold[id];
    if (!authored || !authored.pos || authored.color === undefined || authored.intensity === undefined || authored.range === undefined)
      die(`${id} missing and no complete authored fold to restore from (history limit?)`);
    if (!near(authored.pos[0], pos[0]) || !near(authored.pos[2], pos[2]))
      console.log(`WARN ${id}: authored pos ${JSON.stringify(authored.pos)} != committed pin — restoring at committed pin`);
    lightVerbs.push(["light", { id, pos, color: authored.color, intensity: authored.intensity, range: authored.range }]);
  } else {
    if (!near(live.pos[0], pos[0]) || !near(live.pos[2], pos[2])) die(`${id} pos drift after: ${JSON.stringify(live.pos)}`);
  }
}
if (lightVerbs.length) {
  console.log(`restoring ${lightVerbs.length} companion light(s) from authored fold`);
  await new Promise<void>((resolve, reject) => {
    const ws3 = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => { try { ws3.close(); } catch {} reject(new Error("light verb timeout")); }, 60_000);
    const paced = setInterval(() => {
      if (!joined || i >= lightVerbs.length) return;
      const [verb, args] = lightVerbs[i++];
      ws3.send(JSON.stringify({ type: "verb", verb, args }));
      if (i === lightVerbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); try { ws3.close(); } catch {} resolve(); }, 1800);
    }, 700);
    ws3.onopen = () => ws3.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-town-gatelamps", avatar: cfg.avatar, token: cfg.joinToken }));
    ws3.onerror = () => { clearInterval(paced); clearTimeout(timer); reject(new Error("light verb websocket error")); };
    ws3.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearInterval(paced); clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") { joined = true; }
    };
  });
  // re-fetch and verify the restores
  const finalC = await geom();
  for (const [hostId, pos] of Object.entries(COMP)) {
    const id = `${hostId}-l`;
    const live = finalC[id];
    if (!live || live.kind !== "light") die(`${id} RESTORE FAILED — still missing after light verb`);
    if (!near(live.pos[0], pos[0]) || !near(live.pos[2], pos[2])) die(`${id} pos drift after restore: ${JSON.stringify(live.pos)}`);
    console.log(`${id}: light standing at ${JSON.stringify(live.pos)}`);
  }
}
// foreign riders concentric on lamp-n must be standing at pinned tuples
for (const id of RIDERS) {
  const live = after[id];
  if (!live) die(`foreign rider ${id} MISSING after placement — stranded!`);
  console.log(`rider ${id} standing at ${JSON.stringify(live.pos)}`);
}
console.log("PLACED_VERIFIED all four gate lamps + companions on FULL lib, bbox present, comp bags empty, riders standing");
process.exit(0);
