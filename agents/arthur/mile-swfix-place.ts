// mile-swfix-place.ts — mile-4 CORRECTIVE RESEAT of the SW midpoint pair.
// DEFECT (found this tick, mile-4 wakeup): mile-3's placer derived the
// perpendicular offset as N=(cos(pa),-sin(pa)) with pa=az+90 — the direction
// of azimuth pa+90, i.e. the NEGATED leg travel direction, NOT a perpendicular.
// Live evidence: nx-mile-sw-005/006 sat exactly on the radial centerline
// (r44.7/r49.3, x/z ratio 0.7604 = tan az217.25) — ON the 1.8m pavers,
// violating the lane law "a milestone sits ON the verge, never on the pavers".
// The logged "1.84m clearance" was hand-derived from the wrong formula; no
// code check had measured centerline distance. mile-1 (NW bend) and mile-2
// (NE jink) were re-verified this tick from their committed sources and are
// CORRECT (posts 2.29m/2.13m off their arms) — only mile-3 was affected.
// FIX: dir(az)=(sin,cos) matches pol(); perpendicular axis az127.25/307.25.
// M=pol(47,217.25)=(-28.4488,-37.4121); posts M +/- 2.3*dir(127.25):
//   nx-mile-sw-005 (-26.6191, -0.0472, -38.8057)  [az127 verge]
//   nx-mile-sw-006 (-30.2785, -0.0527, -36.0185)  [az307 verge]
// Same proven GLB village_mile_nw.glb sha 9459eaa3 (degenerate fleet, no
// upload — lib live on nx-mile-nw-001/002). Corrective reseat = REMOVE then
// SPAWN over the same WS (proven: next-place-artwalk-b22.ts). SAT preflight
// at the CORRECTED tuples against the fresh live census, with ground-layer
// exemption (leg film h<0.5). Verbs paced 900ms (shared 12/4s, six lanes).
// The pair is symmetric — village/district labels are cosmetic; live tuples
// are authoritative.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_mile_nw.glb`;
const SHA = "9459eaa30382fb3c7113a449f2403cf427f6be728d0bc047a03a0c47ae88bd9e";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const D2R = (d: number) => (d * Math.PI) / 180;
// corrected perpendicular: pair axis az127.25, dir(az)=(sin,cos)
const pa = D2R(127.25);
const N = [Math.sin(pa), Math.cos(pa)];
const M: [number, number] = [-28.4488, -37.4121];
const SLOTS = [
  { id: "nx-mile-sw-005", x: M[0] + N[0] * 2.3, z: M[1] + N[1] * 2.3, py: -0.0472 },
  { id: "nx-mile-sw-006", x: M[0] - N[0] * 2.3, z: M[1] - N[1] * 2.3, py: -0.0527 },
];
const YAW = D2R(307.25); // post faces the pair axis (cosmetic for square post)
const HW = 0.21; // local bbox (decode-verified mile-1): x/z ±0.21, y 0..1.04

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

// ---- SAT preflight at CORRECTED tuples vs every solid neighbor within 15m ----
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
    [c, -s, HW, HW], [s, c, HW, HW],
    [ec, -es, exw, exd], [es, ec, exw, exd],
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
const selfIds = new Set(SLOTS.map(t => t.id)); // own pair = self, not obstacle
for (const sl of SLOTS) {
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
// centerline clearance check — THE check mile-3 lacked, now in code
const legDir = [Math.sin(D2R(217.25)), Math.cos(D2R(217.25))];
for (const sl of SLOTS) {
  const rel = [sl.x - M[0], sl.z - M[1]];
  const along = rel[0] * legDir[0] + rel[1] * legDir[1];
  const perp = Math.hypot(rel[0] - along * legDir[0], rel[1] - along * legDir[1]);
  if (perp < 2.3 - 1e-6) die(`centerline fail ${sl.id}: perp ${perp.toFixed(3)}m < 2.3m`);
  console.log(`centerline ok ${sl.id}: perp ${perp.toFixed(3)}m, along ${along.toFixed(3)}m (paver half 0.9 -> verge clear ${(perp - 0.9).toFixed(2)}m)`);
}

// ---- idempotency: live-matching slots need no verbs; drifted slots need remove+spawn ----
const already = SLOTS.filter(sl => {
  const live = byId[sl.id];
  if (!live) return false;
  if (live.lib !== LIB) die(`id collision/drift ${sl.id}: lib ${live.lib} want ${LIB}`);
  const ok = near(live.pos[0], sl.x) && near(live.pos[1], sl.py) && near(live.pos[2], sl.z) && near(live.yaw ?? 0, YAW);
  if (ok) console.log(`already live at corrected tuple — no verbs: ${sl.id}`);
  return ok;
});
const toPlace = SLOTS.filter(sl => !already.some(a => a.id === sl.id));
const toRemove = toPlace.filter(sl => byId[sl.id] != null).map(sl => sl.id);
if (toPlace.length === 0) { console.log("PLACED_VERIFIED: all slots live at corrected tuples"); process.exit(0); }
if (toRemove.length !== toPlace.length) {
  console.log(`fresh spawns (no removal needed): ${toPlace.filter(sl => !toRemove.includes(sl.id)).map(s => s.id).join(", ") || "none"}`);
}

// ---- upload: SKIP — lib already live on mile-1/2 siblings (no-upload law) ----
const siblingLive = ents.find(e => e.lib === LIB && e.pos != null && !selfIds.has(e.id));
if (siblingLive) {
  console.log(`lib already live on sibling ${siblingLive.id} — no upload (${LIB})`);
} else {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next SW midpoint milestone pair mile-4 corrective reseat");
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
// removes first (900ms apart), then spawns after a 900ms separation
await new Promise<void>((resolve, reject) => {
  const ws = new WebSocket(cfg.url);
  const verbs: { verb: string; args: any }[] = [];
  for (const id of toRemove) verbs.push({ verb: "remove", args: { id } });
  for (const sl of toPlace) verbs.push({ verb: "spawn", args: { id: sl.id, lib: LIB, pos: [sl.x, sl.py, sl.z], yaw: YAW, scale: 1 } });
  const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 40_000);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-mile4-place", avatar: cfg.avatar, token: cfg.joinToken }));
  ws.onerror = () => { clearTimeout(timer); reject(new Error("verb websocket error")); };
  ws.onmessage = (ev: any) => {
    const m = JSON.parse(ev.data);
    if (m.type === "error") { clearTimeout(timer); reject(new Error(`server error ${JSON.stringify(m).slice(0, 200)}`)); return; }
    if (m.type !== "snapshot") return;
    console.log("snapshot received — scheduling", verbs.length, "verbs:", verbs.map(v => v.verb + ":" + (v.args.id ?? v.args.name)).join(" "));
    verbs.forEach((v, i) => setTimeout(() => {
      ws.send(JSON.stringify({ type: "verb", verb: v.verb, args: v.args }));
      console.log(`verb sent: ${v.verb} ${v.args.id}`);
    }, 900 * (i + 1)));
    setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 900 * verbs.length + 1500);
  };
});

// ---- post-place verify (fresh census) at corrected tuples ----
await sleep(1500);
const after = await geom();
const afterById = Object.fromEntries(after.map(e => [e.id, e]));
for (const sl of SLOTS) {
  const live = afterById[sl.id];
  if (!live) die(`post-place verify: ${sl.id} not live`);
  if (live.lib !== LIB || !near(live.pos[0], sl.x) || !near(live.pos[1], sl.py, 2e-3) || !near(live.pos[2], sl.z)) die(`post-place drift ${sl.id}: ${JSON.stringify(live)}`);
  console.log(`verified live: ${sl.id} (${live.pos.map((n: number) => n.toFixed(3)).join(", ")}) lib ${live.lib}`);
}
console.log("PLACED_VERIFIED (corrective reseat):", SLOTS.map(s => s.id).join(" + "));
