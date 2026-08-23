// next-fix-carousel-smoke.ts — nvp-8 smoke-origin repair for nx-carousel.
// The nvp-7 placement reapplied particles:smoke with a WORLD-SPACE origin
// ([-18,6.3,18], inherited verbatim from commons av-carousel at nv-2), but
// authored particles origins are ENTITY-RELATIVE and clamped to ±8m by
// shared/particles.js normalizeOrigin — so every renderer derives a clamped
// local offset (-8, 6.3, 8) and the smoke plume floats ~11.3m off the
// carousel. Correct value is the authored intent: local [0, 6.3, 0], just
// above the 6.26m roof apex, seat-independent. One targeted comp verb; no
// spawn, no comp wipe. Fail-closed: verifies the reviewed nvp-7 tuple first,
// sends exactly one verb, then verifies the full 7-key bag deep-equal to the
// pre-state except the corrected origin.
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const ID = "nx-carousel";
const REVIEWED_LIB = "store/d41a898f3054874b.glb";
const POSE = { pos: [-18, 0.00014950061063032772, 18], yaw: 2.35619 };
const FIXED_ORIGIN = [0, 6.3, 0];
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

// recursive canonical JSON (sorted keys) — key order is not semantic
function canon(v: any): any {
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])]));
  }
  return v;
}
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

async function geom() {
  const r = await fetch(`${base}/geom?world=${WORLD}`);
  if (!r.ok) die(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
const live = before[ID];
if (!live) die(`${ID} missing`);
if (live.lib !== REVIEWED_LIB) die(`lib drift: ${live.lib}`);
if (!near(live.pos[0], POSE.pos[0]) || !near(live.pos[1], POSE.pos[1]) || !near(live.pos[2], POSE.pos[2]) || !near(live.yaw, POSE.yaw)) die("pose drift from reviewed tuple");
const bag: Record<string, any> = structuredClone(live.comp ?? {});
const keys = Object.keys(bag).sort();
const WANT = ["motion:carousel", "motion:horse_0", "motion:horse_2", "motion:horse_4", "motion:horse_6", "particles:smoke", "sockets"];
if (!eq(keys, [...WANT].sort())) die(`unexpected bag: ${keys.join(",")}`);

const cur = bag["particles:smoke"]?.origin;
if (eq(cur, FIXED_ORIGIN)) {
  console.log("already fixed — no verb");
} else {
  if (!Array.isArray(cur) || cur.length !== 3 || Math.abs(cur[0]) > 8 || Math.abs(cur[2]) > 8) {
    console.log(`replacing defective world-space origin ${JSON.stringify(cur)} (clamped by evaluator to ±8 local)`);
  } else {
    console.log(`replacing origin ${JSON.stringify(cur)} with contract-correct apex local`);
  }
  const fixed = { ...bag["particles:smoke"], origin: FIXED_ORIGIN };
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let sent = false;
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("comp timeout")); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-nvp8-smokefix", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (!sent && m.type === "snapshot") {
        sent = true;
        ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: ID, type: "particles:smoke", data: fixed } }));
        return;
      }
      if (sent && (m.type === "log" || m.type === "snapshot")) {
        clearTimeout(timer);
        setTimeout(() => { try { ws.close(); } catch {} resolve(); }, 1200);
      }
    };
  });
}

const after = await geom();
const placed = after[ID];
const want: Record<string, any> = structuredClone(bag);
want["particles:smoke"] = { ...bag["particles:smoke"], origin: FIXED_ORIGIN };
const ok = !!placed
  && placed.lib === REVIEWED_LIB
  && near(placed.pos[0], POSE.pos[0]) && near(placed.pos[1], POSE.pos[1]) && near(placed.pos[2], POSE.pos[2])
  && near(placed.yaw, POSE.yaw)
  && eq(placed.comp, want);
if (!ok) die(`post-fix verification failed: ${JSON.stringify({ placed })}`);
console.log(JSON.stringify({ status: "SMOKE_FIX_VERIFIED", id: ID, origin: placed.comp["particles:smoke"].origin, compKeys: Object.keys(placed.comp).sort(), lib: placed.lib, pos: placed.pos, yaw: placed.yaw }));
