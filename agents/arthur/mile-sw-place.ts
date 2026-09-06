// mile-sw-place.ts — mile-3 hash-gated placer: SW midpoint milestone PAIR.
// Entities nx-mile-sw-005 (village-side verge) + nx-mile-sw-006 (district-side
// verge), ONE shared GLB — the SAME proven village_mile_nw.glb (sha 9459eaa3…)
// as mile-1/mile-2's accepted pairs: degenerate-fleet law, byte-identical bytes
// carry the accepted visual verdict (durable anchors: MILESTONE-PLAN mile-1
// entry + ledger mile-1; reviews/mile-nw-001/ frames). Siting derived from the
// committed SW leg polyline (mkv3-sw-approach3.ts): straight radial az217.25
// r24->71; midpoint M = pol(47,217.25) = (-28.4488,-37.4121); pair straddles
// the PERPENDICULAR (az307.25/127.25), N=(cos,-sin); posts at M +/- 2.3m*N.
// Centerline clearance 2.3 - 0.46 paver half = 1.84m (> paver 0.46 + hem 1.35,
// > 1.4 pinch law). Terrain preflight: py -0.0520 / -0.0464
// (next-terrain-mile-sw.ts, fresh this tick). Upload SKIPPED when any live
// entity already carries this lib (sibling no-upload law — the mile-1/2 pairs
// do); fallback upload path retained. Ground-layer exemption: SW leg entity
// (h<0.5 film) excluded from SAT via bbox-height test. Verbs paced 800ms
// (shared 12/4s budget, six-lane wave).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_mile_nw.glb`;
const SHA = "9459eaa30382fb3c7113a449f2403cf427f6be728d0bc047a03a0c47ae88bd9e";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const D2R = (d: number) => (d * Math.PI) / 180;
// SW midpoint M and perpendicular-offset posts (matches preflight exactly)
const B: [number, number] = [-28.4488, -37.4121];
const pa = D2R(307.25);
const N = [Math.cos(pa), -Math.sin(pa)];
const SLOTS = [
  { id: "nx-mile-sw-005", x: B[0] + N[0] * 2.3, z: B[1] + N[1] * 2.3, py: -0.052 },
  { id: "nx-mile-sw-006", x: B[0] - N[0] * 2.3, z: B[1] - N[1] * 2.3, py: -0.0464 },
];
const YAW = pa; // post faces the pair axis (cosmetic for square post)
// local bbox (decode-verified mile-1): x/z ±0.21, y 0..1.04
const HW = 0.21;

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

// ---- SAT preflight: post OBB vs every solid (non-thin) neighbor within 15m ----
const c = Math.cos(YAW), s = Math.sin(YAW);
function obbGap(px: number, pz: number, e: any): number | null {
  const bb = e.bbox; if (!bb) return null;
  const h = bb.max[1] - bb.min[1];
  if (h <= 0.5) return null; // thin film / ground layer — exempt (leg, paths)
  const exw = (bb.max[0] - bb.min[0]) / 2, exd = (bb.max[2] - bb.min[2]) / 2;
  const ecx = (bb.max[0] + bb.min[0]) / 2 + e.pos[0], ecz = (bb.max[2] + bb.min[2]) / 2 + e.pos[2];
  const ey = e.yaw ?? 0; const ec = Math.cos(ey), es = Math.sin(ey);
  const dx = ecx - px, dz = ecz - pz;
  const axes: [number, number, number, number][] = [
    [c, -s, HW, HW],           // post local x
    [s, c, HW, HW],            // post local z
    [ec, -es, exw, exd],       // neighbor local x
    [es, ec, exw, exd],        // neighbor local z
  ];
  let best = -Infinity;
  for (const [ax, az, ra, rb] of axes) {
    const projA = HW * Math.abs(ax * c + az * s) + HW * Math.abs(-ax * s + az * c);
    const projB = exw * Math.abs(ax * ec + az * es) + exd * Math.abs(-ax * es + az * ec);
    const gap = Math.abs(dx * ax + dz * az) - projA - projB;
    if (gap > best) best = gap;
  }
  return best;
}
for (const sl of SLOTS) {
  const selfIds = new Set(SLOTS.map(t => t.id)); // own lane's slots: live instances of THIS pair are self, not obstacles
  let worst = Infinity, worstId = "";
  for (const e of ents) {
    if (!e.pos || e.lib == null) continue;
    if (selfIds.has(e.id)) continue;
    if (Math.hypot(e.pos[0] - sl.x, e.pos[2] - sl.z) > 15) continue;
    const g = obbGap(sl.x, sl.z, e);
    if (g !== null && g < worst) { worst = g; worstId = e.id; }
  }
  if (worst < 1.4) die(`SAT/pinch fail ${sl.id}: min gap ${worst.toFixed(2)} vs ${worstId}`);
  console.log(`SAT ok ${sl.id}: min solid gap ${worst === Infinity ? "none within 15m" : worst.toFixed(2) + "m (" + worstId + ")"}`);
}

// ---- idempotency: skip live-matching slots ----
const todo = SLOTS.filter(sl => {
  const live = byId[sl.id];
  if (!live) return true;
  const ok = live.lib === LIB && near(live.pos[0], sl.x) && near(live.pos[1], sl.py) && near(live.pos[2], sl.z) && near(live.yaw ?? 0, YAW);
  if (ok) console.log(`already live — no verbs: ${sl.id}`);
  else if (live.lib !== LIB) die(`id collision/drift ${sl.id}: lib ${live.lib} want ${LIB}`);
  else die(`id collision/drift ${sl.id}: live ${JSON.stringify(live.pos)} yaw ${live.yaw} want (${sl.x}, ${sl.py}, ${sl.z}) yaw ${YAW}`);
  return false;
});
if (todo.length === 0) { console.log("PLACED_VERIFIED: all slots live at pinned tuples"); process.exit(0); }

// ---- upload: SKIP if a live sibling already carries this exact lib (no-upload law) ----
const siblingLive = ents.find(e => e.lib === LIB && e.pos != null);
if (siblingLive) {
  console.log(`lib already live on sibling ${siblingLive.id} — no upload (${LIB})`);
} else {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next SW midpoint milestone pair mile-3");
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

// ---- spawn verbs over join WS: first snapshot -> schedule ALL verbs by timer ----
await new Promise<void>((resolve, reject) => {
  const ws = new WebSocket(cfg.url);
  const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("spawn timeout")); }, 40_000);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-mile3-place", avatar: cfg.avatar, token: cfg.joinToken }));
  ws.onerror = () => { clearTimeout(timer); reject(new Error("spawn websocket error")); };
  ws.onmessage = (ev: any) => {
    const m = JSON.parse(ev.data);
    if (m.type === "error") { clearTimeout(timer); reject(new Error(`server error ${JSON.stringify(m).slice(0, 200)}`)); return; }
    if (m.type !== "snapshot") return;
    console.log("snapshot received — scheduling", todo.length, "spawns");
    todo.forEach((sl, i) => setTimeout(() => {
      ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: sl.id, lib: LIB, pos: [sl.x, sl.py, sl.z], yaw: YAW, scale: 1 } }));
      console.log(`verb sent: spawn ${sl.id}`);
    }, 800 * (i + 1)));
    setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 800 * todo.length + 1500);
  };
});

// ---- post-place verify (fresh census) ----
await sleep(1500);
const after = await geom();
const afterById = Object.fromEntries(after.map(e => [e.id, e]));
for (const sl of SLOTS) {
  const live = afterById[sl.id];
  if (!live) die(`post-place verify: ${sl.id} not live`);
  if (live.lib !== LIB || !near(live.pos[0], sl.x) || !near(live.pos[2], sl.z)) die(`post-place drift ${sl.id}: ${JSON.stringify(live)}`);
  console.log(`verified live: ${sl.id} (${live.pos.map((n: number) => n.toFixed(3)).join(", ")}) lib ${live.lib}`);
}
console.log("PLACED_VERIFIED:", SLOTS.map(s => s.id).join(" + "));
