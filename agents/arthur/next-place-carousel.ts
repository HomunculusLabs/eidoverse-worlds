// next-place-carousel.ts — nvp-7 reviewed optimized carousel placement.
// Target: commons-next only. Captures all seven live component keys before
// re-place, uploads exact reviewed bytes, spawns compact seat, reapplies every
// component, then verifies live.
// Smoke-origin correction (placement tick): authored particles origins are
// ENTITY-RELATIVE and clamped to ±8m by shared/particles.js normalizeOrigin —
// the inherited world-space origin [-18.8,6.3,25.9] (verbatim from commons,
// whose own av-carousel carries the same latent defect) rendered as clamped
// local offset (-8,6.3,8), smoke ~11.6m off the carousel in BOTH worlds. The
// authored intent (commons: pos + [0,6.3,0]) is delivered at ANY seat by the
// contract-correct local [0,6.3,0], just above the 6.26m roof apex. Binding
// tuple (id + SHA-256 + pose/yaw/scale) unchanged — this is the comp re-apply
// doing what the packet's intent always meant.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const ID = "nx-carousel";
const FILE = `${ROOT}/agents/arthur/assets/village_carousel3.glb`;
const REVIEWED_SHA = "ce3633992d07055e02115782f258de59764f5a9d9b6c461460f90931b8823fa7";
const REVIEWED_LIB = `store/${REVIEWED_SHA.slice(0, 16)}.glb`;
const POSE = { pos: [-18, 0.00014950061063032772, 18] as [number, number, number], yaw: 2.35619, scale: 1 };
const SMOKE_ORIGIN = [0, 6.3, 0];  // entity-local, contract-correct (see header)
const EXPECTED_KEYS = ["motion:carousel", "motion:horse_0", "motion:horse_2", "motion:horse_4", "motion:horse_6", "sockets", "particles:smoke"].sort();
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const canon = (v: any): any => Array.isArray(v)
  ? v.map(canon)
  : v && typeof v === "object"
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])]))
    : v;
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

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
const captured: Record<string, any> = structuredClone(live.comp ?? {});
const keys = Object.keys(captured).sort();
if (!eq(keys, EXPECTED_KEYS)) die(`component bag drift: ${JSON.stringify(keys)}`);
for (const root of ["carousel", "horse_0", "horse_2", "horse_4", "horse_6"]) {
  const motionKey = root === "carousel" ? "motion:carousel" : `motion:${root}`;
  if (!captured[motionKey]) die(`missing ${motionKey}`);
}
if (Object.keys(captured.sockets ?? {}).sort().join(",") !== "horse_0,horse_2,horse_4,horse_6") die("socket bag drift");
captured["particles:smoke"] = { ...captured["particles:smoke"], origin: SMOKE_ORIGIN };

const already = live.lib === REVIEWED_LIB
  && near(live.pos[0], POSE.pos[0]) && near(live.pos[1], POSE.pos[1]) && near(live.pos[2], POSE.pos[2])
  && near(live.yaw, POSE.yaw) && (live.scale ?? 1) === 1
  && eq(live.comp, captured);

if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next optimized carousel nvp-7");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
    die(`upload HTTP ${r.status}`);
  }
  if (lib !== REVIEWED_LIB) die(`upload returned ${lib}, expected ${REVIEWED_LIB}`);

  const verbs: Array<[string, any]> = [["spawn", { id: ID, lib, pos: POSE.pos, yaw: POSE.yaw, scale: 1 }]];
  for (const key of EXPECTED_KEYS) verbs.push(["comp", { id: ID, type: key, data: captured[key] }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-nvp7-carousel", avatar: cfg.avatar, token: cfg.joinToken }));
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
const placed = after[ID];
const ok = placed?.lib === REVIEWED_LIB
  && near(placed.pos[0], POSE.pos[0]) && near(placed.pos[1], POSE.pos[1]) && near(placed.pos[2], POSE.pos[2])
  && near(placed.yaw, POSE.yaw) && (placed.scale ?? 1) === 1
  && eq(placed.comp, captured);
if (!ok) die(`post-place verification failed: ${JSON.stringify(placed)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: placed.lib, pos: placed.pos, yaw: placed.yaw, compKeys: Object.keys(placed.comp).sort(), smokeOrigin: placed.comp["particles:smoke"].origin }));
