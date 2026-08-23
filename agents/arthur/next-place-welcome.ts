// next-place-welcome.ts — nvp-5 reviewed welcome-board placement.
// Target: commons-next only. Exact reviewed hash/pose; captures the empty comp
// bag before re-place, sends one spawn verb, then verifies model + companion light.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const ID = "nx-welcome";
const FILE = `${ROOT}/agents/arthur/assets/village_welcome3.glb`;
const REVIEWED_SHA = "4b94d42b9ef89826261f24651f7f2d480126a6db495792e515f0aed0b383e7ae";
const REVIEWED_LIB = `store/${REVIEWED_SHA.slice(0, 16)}.glb`;
const POSE = { pos: [-3, 0, -4.3] as [number, number, number], yaw: 0.6092, scale: 1 };
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const die = (m: string): never => { throw new Error(m); };
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const near = (a: number, b: number) => Math.abs(a - b) < 1e-4;

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
if (!near(live.pos[0], POSE.pos[0]) || !near(live.pos[2], POSE.pos[2]) || !near(live.yaw, POSE.yaw) || (live.scale ?? 1) !== 1) die("live pose drifted from reviewed tuple");
const capturedComps = { ...(live.comp ?? {}) };
if (Object.keys(capturedComps).length !== 0) die(`unexpected live comps: ${Object.keys(capturedComps).join(",")}`);
if (!before["nx-welcome-l"] || before["nx-welcome-l"].lib) die("companion nx-welcome-l missing or not a light entity");

if (live.lib !== REVIEWED_LIB) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next welcome board nvp-5");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
    die(`upload HTTP ${r.status}`);
  }
  if (lib !== REVIEWED_LIB) die(`upload returned ${lib}, expected ${REVIEWED_LIB}`);

  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let sent = false;
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("spawn timeout")); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-nvp5-welcome", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (!sent && m.type === "snapshot") {
        sent = true;
        ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: ID, lib, pos: POSE.pos, yaw: POSE.yaw, scale: 1 } }));
        return;
      }
      if (sent && (m.type === "log" || m.type === "snapshot")) {
        clearTimeout(timer); setTimeout(() => { try { ws.close(); } catch {} resolve(); }, 1200);
      }
    };
  });
} else {
  console.log("already live at reviewed hash — no spawn verb");
}

const after = await geom();
const placed = after[ID];
const ok = placed?.lib === REVIEWED_LIB
  && near(placed.pos[0], POSE.pos[0]) && near(placed.pos[1], POSE.pos[1]) && near(placed.pos[2], POSE.pos[2])
  && near(placed.yaw, POSE.yaw) && (placed.scale ?? 1) === 1
  && Object.keys(placed.comp ?? {}).length === 0
  && !!after["nx-welcome-l"] && !after["nx-welcome-l"].lib;
if (!ok) die(`post-place verification failed: ${JSON.stringify({ placed, light: after["nx-welcome-l"] })}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: placed.lib, pos: placed.pos, yaw: placed.yaw, comps: Object.keys(placed.comp ?? {}), companionLight: after["nx-welcome-l"].pos }));
