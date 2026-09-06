// mile-nw2-place.ts — mile-5 hash-gated placer: NW district ARRIVAL pair,
// LIT variant. Entities nx-mile-nw-007 (village-side, LIT) + nx-mile-nw-008
// (district-side, unlit twin), ONE shared GLB village_mile_nw2.glb (sha
// 052120d7…, v3 ACCEPT via zai fallback; durable anchors: reviews/mile-nw-007/
// + MILESTONE-PLAN mile-5 entry). Siting: A = pol(71,315) = (-50.2046,
// 50.2046), end of the committed az315 home straight (mkv3-nw-approach1.ts
// P2); perpendicular N = dir(45) = (+0.7071,+0.7071) — dir(az)=(sin,cos) law
// (mile-4 lesson). Posts at A +/- 2.3*N. Post yaws point each arm at the
// centerline: 007 yaw 135deg (arm aims az225 toward A), 008 yaw -45deg
// (arm aims az45 toward A). CENTERLINE CHECK IN CODE (mile-4 law): each
// post's distance to the az315 radial line must be 2.30 +/- 0.02.
// Lamp: village-side only — refine-198 milestone-lamp language, warm
// 0xffb066, range 8. Provably past every NW light (last leg light r66.9,
// marker at r71). Light target = cage center local (0.23, 0.65, 0)
// transformed per-post. Light verified via history fold (nvp-10 chassis).
// SAT: target bbox is ASYMMETRIC (arm +x to 0.325, plinth -0.21) — center
// offset (cx 0.0575, cz 0) transformed at yaw, half-extents hx 0.2675 /
// hz 0.21 (skill target-bbox-center law). Thin films (h<=0.5) exempt
// (ground-layer law — the NW leg pavers, lavender beds). Verbs paced 800ms
// (shared 12/4s budget, six-lane wave). Upload: single, 429 backoff.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_mile_nw2.glb`;
const SHA = "052120d7646f5f746fd3559f7274d4d57d30e0d81ce97b4a741f469162bc9145";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const D2R = (d: number) => (d * Math.PI) / 180;

// arrival zone + perpendicular (dir(az)=(sin,cos) law). Original A =
// pol(71,315); RESITE: live SAT gate caught a 1.37m pinch vs sibling
// nx-dress-nw-skeps-001 (dress lane landed r76.4 mid-tick) — pair pulled
// 1.5m inward along the leg to M = A - 1.5*dir(315) = (-49.1439, 49.1439),
// gaps now 2.87m. N = dir(45) = (+0.7071, +0.7071).
const A: [number, number] = [-49.1439, 49.1439];
const N = [Math.sin(D2R(45)), Math.cos(D2R(45))]; // (+0.7071, +0.7071)
// yaws: each arm aims AT the lane centerline — 007 sits az~317 of center, so
// its arm (+x local) must point az~137 => yaw 135; 008 sits az~313, arm
// points az~317+180-180... computed: post minus center dir -> arm yaw set so
// local +x faces the center. 007 (outer, az317): yaw 135deg. 008 (inner,
// az313): yaw -45deg.
const SLOTS = [
  { id: "nx-mile-nw-007", x: A[0] + N[0] * 2.3, z: A[1] + N[1] * 2.3, py: 0.0282, yaw: D2R(135), lit: true },
  { id: "nx-mile-nw-008", x: A[0] - N[0] * 2.3, z: A[1] - N[1] * 2.3, py: 0.0391, yaw: D2R(-45), lit: false },
];
// local footprint (decode-verified v3): x [-0.21, 0.325], z +/-0.21, y 0..0.91
const CX = 0.0575, CZ = 0, HX = 0.2675, HZ = 0.21;
// cage center local (light target)
const LCX = 0.23, LCY = 0.65;
const COLOR = 0xffb066, INTENSITY = 1.2, RANGE = 8; // refine-198 warm, range 8

// CENTERLINE CHECK (mile-4 law): distance from each post to the az315 radial
// (the line through origin with direction dir(315)). |cross| with unit dir.
const dir315 = [Math.sin(D2R(315)), Math.cos(D2R(315))];
for (const sl of SLOTS) {
  const d = Math.abs(sl.x * dir315[1] - sl.z * dir315[0]); // |x*dz - z*dx|
  if (Math.abs(d - 2.3) > 0.02) die(`centerline fail ${sl.id}: perp dist ${d.toFixed(3)} want 2.30`);
  console.log(`centerline ok ${sl.id}: ${d.toFixed(3)}m off the az315 radial`);
}

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number, eps = 1e-3) => Math.abs(a - b) < eps;

// ---- hash gate ----
const bytes = readFileSync(FILE);
const hash = createHash("sha256").update(bytes).digest("hex");
if (hash !== SHA) die(`reviewed hash mismatch: ${hash}`);

// ---- fresh live census ----
async function geom() {
  const r = await fetch(`${base}/geom?world=${WORLD}`);
  if (!r.ok) die(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return (d.entities ?? []) as any[];
}
const ents = await geom();
const byId = Object.fromEntries(ents.map(e => [e.id, e]));

// ---- SAT preflight: post OBB (center-offset) vs every solid within 15m ----
function satCheck(sl: typeof SLOTS[number]) {
  const cy = Math.cos(sl.yaw), sy = Math.sin(sl.yaw);
  const cx = sl.x + CX * cy + CZ * sy; // target center world (cz=0)
  const cz = sl.z - CX * sy + CZ * cy;
  const selfIds = new Set(SLOTS.map(t => t.id));
  let worst = Infinity, worstId = "";
  for (const e of ents) {
    if (!e.pos || e.lib == null) continue;
    if (selfIds.has(e.id)) continue;
    if (Math.hypot(e.pos[0] - cx, e.pos[2] - cz) > 15) continue;
    const bb = e.bbox; if (!bb) continue;
    if (bb.max[1] - bb.min[1] <= 0.5) continue; // thin film / ground layer exempt
    const exw = (bb.max[0] - bb.min[0]) / 2, exd = (bb.max[2] - bb.min[2]) / 2;
    const ecx = (bb.max[0] + bb.min[0]) / 2 + e.pos[0], ecz = (bb.max[2] + bb.min[2]) / 2 + e.pos[2];
    const ey = e.yaw ?? 0; const ec = Math.cos(ey), es = Math.sin(ey);
    const dx = ecx - cx, dz = ecz - cz;
    const axes: [number, number, number, number][] = [
      [cy, -sy, HX, HZ], [sy, cy, HX, HZ],
      [ec, -es, exw, exd], [es, ec, exw, exd],
    ];
    let best = -Infinity;
    for (const [ax, az] of axes) {
      const projA = HX * Math.abs(ax * cy + az * sy) + HZ * Math.abs(-ax * sy + az * cy);
      const projB = exw * Math.abs(ax * ec + az * es) + exd * Math.abs(-ax * es + az * ec);
      const gap = Math.abs(dx * ax + dz * az) - projA - projB;
      if (gap > best) best = gap;
    }
    if (best < worst) { worst = best; worstId = e.id; }
  }
  if (worst < 1.4) die(`SAT/pinch fail ${sl.id}: min gap ${worst.toFixed(2)} vs ${worstId}`);
  console.log(`SAT ok ${sl.id}: min solid gap ${worst === Infinity ? "none within 15m" : worst.toFixed(2) + "m (" + worstId + ")"}`);
}
for (const sl of SLOTS) satCheck(sl);

// ---- light world target (village-side post) ----
const lit = SLOTS.find(s => s.lit)!;
const LID = `${lit.id}-l`;
const lcy = Math.cos(lit.yaw), lsy = Math.sin(lit.yaw);
const LX = lit.x + LCX * lcy, LZ = lit.z - LCX * lsy, LY = lit.py + LCY;

// ---- idempotency: skip live-matching slots ----
const todo = SLOTS.filter(sl => {
  const live = byId[sl.id];
  if (!live) return true;
  const ok = live.lib === LIB && near(live.pos[0], sl.x) && near(live.pos[1], sl.py) && near(live.pos[2], sl.z) && near(live.yaw ?? 0, sl.yaw);
  if (ok) console.log(`already live — no verbs: ${sl.id}`);
  else if (live.lib !== LIB) die(`id collision/drift ${sl.id}: lib ${live.lib} want ${LIB}`);
  else die(`id collision/drift ${sl.id}: live ${JSON.stringify(live.pos)} yaw ${live.yaw} want (${sl.x}, ${sl.py}, ${sl.z}) yaw ${sl.yaw}`);
  return false;
});

// light history fold (nvp-10 chassis) — read authored light params
async function lightFold() {
  return await new Promise<Record<string, any>>((resolve, reject) => {
    const ws = new WebSocket(cfg.url); const out: Record<string, any> = {};
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("light history timeout")); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-mile5-lightread", avatar: cfg.avatar, token: cfg.joinToken, spectate: true }));
    ws.onerror = () => { clearTimeout(timer); reject(new Error("light history websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearTimeout(timer); reject(new Error(`light history ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") { ws.send(JSON.stringify({ type: "history", verbs: ["light"], limit: 300 })); return; }
      if (m.type !== "history") return;
      for (const r of m.entries ?? []) {
        const x = r.args ?? r; if (x.id !== LID) continue;
        const cur = out[LID] ?? {};
        for (const k of ["pos", "color", "intensity", "range"]) if (x[k] !== undefined) cur[k] = x[k];
        out[LID] = cur;
      }
      clearTimeout(timer); try { ws.close(); } catch {} resolve(out);
    };
  });
}
const beforeLights = await lightFold();
const lightLive = byId[LID] && beforeLights[LID]?.pos && beforeLights[LID].pos.every((n: number, i: number) => near(n, [LX, LY, LZ][i]));
if (lightLive) console.log(`light already live — no verb: ${LID}`);

if (todo.length === 0 && lightLive) { console.log("PLACED_VERIFIED: all slots + light live at pinned tuples"); process.exit(0); }

// ---- upload: skip only if a live sibling already carries this exact lib ----
const siblingLive = ents.find(e => e.lib === LIB && e.pos != null);
if (siblingLive) {
  console.log(`lib already live on sibling ${siblingLive.id} — no upload (${LIB})`);
} else {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next NW arrival milestone pair mile-5");
  u.searchParams.set("by", cfg.id);
  let up = await fetch(u, { method: "POST", body: bytes });
  for (let i = 0; up.status === 429 && i < 5; i++) {
    console.log(`upload 429, backoff ${25 + i * 20}s`); await sleep((25 + i * 20) * 1000);
    up = await fetch(u, { method: "POST", body: bytes });
  }
  if (!up.ok) die(`upload HTTP ${up.status}`);
  const upj: any = await up.json().catch(() => ({}));
  const uploaded = upj.path ?? upj.hash ?? upj.lib ?? "";
  if (uploaded !== "" && uploaded !== LIB) die(`upload returned ${uploaded}, expected ${LIB}`);
  console.log("upload ok:", uploaded);
}

// ---- verbs over join WS: first snapshot -> schedule ALL verbs by timer ----
const verbs: Array<[string, any]> = [];
for (const sl of todo) verbs.push(["spawn", { id: sl.id, lib: LIB, pos: [sl.x, sl.py, sl.z], yaw: sl.yaw, scale: 1 }]);
if (!lightLive) verbs.push(["light", { id: LID, pos: [LX, LY, LZ], color: COLOR, intensity: INTENSITY, range: RANGE }]);
await new Promise<void>((resolve, reject) => {
  const ws = new WebSocket(cfg.url);
  const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 40_000);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-mile5-place", avatar: cfg.avatar, token: cfg.joinToken }));
  ws.onerror = () => { clearTimeout(timer); reject(new Error("spawn websocket error")); };
  ws.onmessage = (ev: any) => {
    const m = JSON.parse(ev.data);
    if (m.type === "error") { clearTimeout(timer); reject(new Error(`server error ${JSON.stringify(m).slice(0, 200)}`)); return; }
    if (m.type !== "snapshot") return;
    console.log("snapshot received — scheduling", verbs.length, "verbs");
    verbs.forEach((v, i) => setTimeout(() => {
      ws.send(JSON.stringify({ type: "verb", verb: v[0], args: v[1] }));
      console.log(`verb sent: ${v[0]} ${v[1].id}`);
    }, 800 * (i + 1)));
    setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 800 * verbs.length + 1500);
  };
});

// ---- post-place verify (fresh census + light fold) ----
await sleep(1500);
const after = await geom();
const afterById = Object.fromEntries(after.map(e => [e.id, e]));
for (const sl of SLOTS) {
  const live = afterById[sl.id];
  if (!live) die(`post-place verify: ${sl.id} not live`);
  if (live.lib !== LIB || !near(live.pos[0], sl.x) || !near(live.pos[2], sl.z) || !near(live.yaw ?? 0, sl.yaw)) die(`post-place drift ${sl.id}: ${JSON.stringify(live)}`);
  console.log(`verified live: ${sl.id} (${live.pos.map((n: number) => n.toFixed(3)).join(", ")}) yaw ${(live.yaw ?? 0).toFixed(3)} lib ${live.lib}`);
}
const afterLights = await lightFold();
const al = afterById[LID], auth = afterLights[LID];
if (!(al?.kind === "light" && al.pos?.every((n: number, i: number) => near(n, [LX, LY, LZ][i])))) die(`light post-place failed: ${JSON.stringify(al)}`);
if (!(auth?.color === COLOR && near(auth.intensity, INTENSITY) && near(auth.range, RANGE))) die(`light params drift: ${JSON.stringify(auth)}`);
console.log(`verified light: ${LID} at (${LX.toFixed(3)}, ${LY.toFixed(3)}, ${LZ.toFixed(3)}) color ${COLOR.toString(16)} intensity ${INTENSITY} range ${RANGE}`);
console.log("PLACED_VERIFIED:", SLOTS.map(s => s.id).join(" + "), "+", LID);
