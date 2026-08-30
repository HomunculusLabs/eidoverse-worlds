// next-place-hearth.ts — polish lane (262): re-place nx-hearth with the
// tightened gathering ring (polish-262 build). Captures the 4-key comp bag
// before spawn, re-applies every key after (comp-wipe law), verifies tuple
// + keys, idempotent rerun prints zero verbs. Verb choreography copied from
// the proven next-place-carousel.ts (snapshot-gated paced sender, `comp`
// verb shape).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const ID = "nx-hearth";
const FILE = `${ROOT}/agents/arthur/assets/village_plaza3.glb`;
const REVIEWED_SHA = "027f6f019f9981bfe11f53963996c5a56594e7021ad962aa40e90c98291ee5e6";
const REVIEWED_LIB = `store/${REVIEWED_SHA.slice(0, 16)}.glb`;
const POSE = { pos: [0, 0, 0] as [number, number, number], yaw: 0, scale: 1 };
const EXPECTED_KEYS = ["motion:pz_kettle", "motion:well_", "particles", "sockets"].sort();
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
if (JSON.stringify(keys) !== JSON.stringify(EXPECTED_KEYS)) die(`comp bag drift: ${JSON.stringify(keys)}`);

const already = live.lib === REVIEWED_LIB
  && near(live.pos[0], POSE.pos[0]) && near(live.pos[1], POSE.pos[1]) && near(live.pos[2], POSE.pos[2])
  && near(live.yaw, POSE.yaw) && (live.scale ?? 1) === 1
  && eq(live.comp, captured);

if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "the plaza hearth — polish-262 gathering ring");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-polish-hearth", avatar: cfg.avatar, token: cfg.joinToken }));
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
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: placed.lib, pos: placed.pos, yaw: placed.yaw, compKeys: Object.keys(placed.comp).sort() }));
