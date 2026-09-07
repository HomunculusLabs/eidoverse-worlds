// next-reseat-cistern-improve28.ts — improve-28: re-place nx-cistern with the
// raised-water build (water y 0.45→0.60, emissive 0.45→0.70). Empty comp bag
// both sides (verified live this tick). Rider law: nx-artwalk-b23-cistern-rain-count
// is concentric at (15.4435, 0.31, -14.3837) same yaw — NOT touched by this
// placer (no verb targets it; rider pos-anchored world-frame, host bytes-swap
// cannot move it). Chassis: next-place-cistern.ts + hamlet reseat pattern
// (remove+spawn, one snapshot → timer-paced verbs, close after last).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const ID = "nx-cistern";
const FILE = `${ROOT}/agents/arthur/assets/village_bcistern3.glb`;
const RIDER = "nx-artwalk-b23-cistern-rain-count";
const REVIEWED_SHA = "156b4fc8c7287a9d397f8992e7159ca0ce1412d567b12f3c1bfb3fa191df2d95";
const REVIEWED_LIB = `store/${REVIEWED_SHA.slice(0, 16)}.glb`;
const POSE = { pos: [15.703583236444484, 0, -14.586880611718946] as [number, number, number], yaw: -0.90756, scale: 1 };
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
if (sha !== REVIEWED_SHA) die(`reviewed hash mismatch: ${sha}`);

const before = await geom();
const live = before[ID];
if (!live) die(`${ID} missing before placement`);
if (Object.keys(live.comp ?? {}).length !== 0) die(`comp bag not empty: ${JSON.stringify(Object.keys(live.comp))}`);
const rider0 = before[RIDER];
if (!rider0) die(`rider ${RIDER} missing before placement — host-anchor law`);

const already = live.lib === REVIEWED_LIB
  && near(live.pos[0], POSE.pos[0]) && near(live.pos[1], POSE.pos[1]) && near(live.pos[2], POSE.pos[2])
  && near(live.yaw, POSE.yaw) && (live.scale ?? 1) === 1;

if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "bakery cistern — improve-28 raised water");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
    die(`upload HTTP ${r.status}`);
  }
  if (lib !== REVIEWED_LIB) die(`upload returned ${lib}, expected ${REVIEWED_LIB}`);

  const verbs: Array<[string, any]> = [
    ["remove", { id: ID }],
    ["spawn", { id: ID, lib, pos: POSE.pos, yaw: POSE.yaw, scale: 1 }],
  ];
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 60_000);
    const paced = setInterval(() => {
      if (!joined || i >= verbs.length) return;
      const [verb, args] = verbs[i++];
      ws.send(JSON.stringify({ type: "verb", verb, args }));
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 1800);
    }, 700);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-improve28-cistern", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearInterval(paced); clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearInterval(paced); clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") joined = true;
    };
  });
} else {
  console.log("already live at reviewed tuple — no verbs");
}

const after = await geom();
const p = after[ID];
const ok = p?.lib === REVIEWED_LIB
  && near(p.pos[0], POSE.pos[0]) && near(p.pos[1], POSE.pos[1]) && near(p.pos[2], POSE.pos[2])
  && near(p.yaw, POSE.yaw) && (p.scale ?? 1) === 1
  && Object.keys(p.comp ?? {}).length === 0;
if (!ok) die(`post-place verification failed: ${JSON.stringify(p)}`);
const rider1 = after[RIDER];
if (!rider1) die(`rider ${RIDER} lost after re-place`);
if (!near(rider1.pos[0], rider0.pos[0]) || !near(rider1.pos[2], rider0.pos[2])) die(`rider moved: ${JSON.stringify(rider1.pos)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: p.lib, pos: p.pos, yaw: p.yaw, compKeys: Object.keys(p.comp ?? {}).sort(), rider: RIDER, riderLib: rider1.lib }));
