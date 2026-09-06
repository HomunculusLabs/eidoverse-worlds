// mile-ne2-place.ts — mile-6 hash-gated placer: NE district ARRIVAL pair,
// LIT variant. Entities nx-mile-ne-009 (village-side, LIT) + nx-mile-ne-010
// (district-side, unlit twin), ONE shared GLB village_mile_nw2.glb (sha
// 052120d7…, v3 ACCEPT via zai fallback; durable anchors: reviews/mile-nw-007/
// + MILESTONE-PLAN mile-5 entry — degenerate-fleet law: byte-identical bytes
// carry the accepted visual verdict). NO upload: lib already live on sibling
// nx-mile-nw-007 (content-addressed store, no-upload law).
// Siting: A = P3 = pol(72,15) = (18.6346, 69.5467), end of the committed NE
// home straight P2=pol(54,48) -> P3 (mkv3-ne-approach2.ts). Segment travel
// u = (-0.5411, 0.8412); perp N = (0.8412, 0.5411) — dir(az)=(sin,cos) law
// (mile-4 lesson). Posts at A +/- 2.3*N. Yaw law: each arm aims AT the lane
// centerline — yaw = az(post->A) - 90. Origin is on the -N side, so the
// village-side (LIT) post is A - 2.3*N. CENTERLINE CHECK IN CODE (mile-4
// law): each post's distance to the home-straight LINE (through P2, dir u)
// must be 2.30 +/- 0.02, AND its projection must fall within the P2->P3
// segment (marker on the segment's verge, not past its end).
// Lamp: village-side only — refine-198 milestone-lamp language, warm
// 0xffb066, range 8. Provably past every NE light (last leg light
// nx-approach-ne-lamp-002-l at r60.0; marker at r72). Light target = cage
// center local (0.23, 0.65, 0) transformed per-post. Light verified via
// history fold (nvp-10 chassis).
// SAT: target bbox is ASYMMETRIC (arm +x to 0.325, plinth -0.21) — center
// offset (cx 0.0575, cz 0) transformed at yaw, half-extents hx 0.2675 /
// hz 0.21 (skill target-bbox-center law). Thin films (h<=0.5) exempt
// (ground-layer law — the NE leg pavers). Verbs paced 800ms (shared 12/4s
// budget, six-lane wave). No upload path by construction (asserted).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_mile_nw2.glb`;
const SHA = "052120d7646f5f746fd3559f7274d4d57d30e0d81ce97b4a741f469162bc9145";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const D2R = (d: number) => (d * Math.PI) / 180;
const die = (m: string): never => { throw new Error(m); };

// committed polyline (mkv3-ne-approach2.ts): pol(r,az) = (r*sin, r*cos)
const pol = (r: number, azd: number): [number, number] => {
  const a = D2R(azd);
  return [r * Math.sin(a), r * Math.cos(a)];
};
const P2 = pol(54, 48); // (40.2969, 36.1330)
const P3 = pol(72, 15); // (18.6346, 69.5467)
// segment travel u (P2->P3) and perpendicular N
const ux = P3[0] - P2[0], uz = P3[1] - P2[1], L = Math.hypot(ux, uz);
const U: [number, number] = [ux / L, uz / L];   // (-0.5411, +0.8412)
const N: [number, number] = [U[1], -U[0]];      // (+0.8412, +0.5411)
// origin side: dot(N, O-P2) with N=(U.z,-U.x) and O=(0,0) reduces to U.x*P2.z - U.z*P2.x
const sideO = U[0] * P2[1] - U[1] * P2[0];
if (sideO >= 0) die(`side derivation wrong: origin on +N side (sideO ${sideO.toFixed(3)})`);
// village-side post = A - 2.3*N (toward origin), LIT; district-side = A + 2.3*N
const A: [number, number] = P3;
// yaw = az(post->A) - 90 (arm aims at the centerline)
const azTo = (p: [number, number]) => (Math.atan2(A[0] - p[0], A[1] - p[1]) * 180 / Math.PI + 360) % 360;
const yawOf = (p: [number, number]) => D2R(((azTo(p) - 90) + 360) % 360);
const postV: [number, number] = [A[0] - N[0] * 2.3, A[1] - N[1] * 2.3]; // village-side LIT
const postD: [number, number] = [A[0] + N[0] * 2.3, A[1] + N[1] * 2.3]; // district-side unlit
const SLOTS = [
  { id: "nx-mile-ne-009", x: postV[0], z: postV[1], py: 0.0016, yaw: yawOf(postV), lit: true },
  { id: "nx-mile-ne-010", x: postD[0], z: postD[1], py: -0.0006, yaw: yawOf(postD), lit: false },
];
console.log("derived: P2", P2.map(v => v.toFixed(4)).join(", "), "P3", P3.map(v => v.toFixed(4)).join(", "));
console.log("U", U.map(v => v.toFixed(4)).join(", "), "N", N.map(v => v.toFixed(4)).join(", "));
for (const sl of SLOTS) console.log(`slot ${sl.id}: (${sl.x.toFixed(4)}, ${sl.z.toFixed(4)}) yaw ${((sl.yaw * 180 / Math.PI + 360) % 360).toFixed(1)}deg lit=${sl.lit}`);

// ---- CENTERLINE CHECK (mile-4 law) ----
for (const sl of SLOTS) {
  const dx = sl.x - P2[0], dz = sl.z - P2[1];
  const perp = Math.abs(dx * U[1] - dz * U[0]);          // |cross| with unit travel
  const tproj = dx * U[0] + dz * U[1];                    // position along segment
  if (Math.abs(perp - 2.3) > 0.02) die(`centerline fail ${sl.id}: perp dist ${perp.toFixed(3)} want 2.30`);
  if (tproj < -0.5 || tproj > L + 0.5) die(`centerline fail ${sl.id}: proj ${tproj.toFixed(2)} outside segment [0, ${L.toFixed(2)}]`);
  console.log(`centerline ok ${sl.id}: perp ${perp.toFixed(3)}m, proj ${tproj.toFixed(2)}/${L.toFixed(2)}m on P2->P3`);
}

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
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
const CX = 0.0575, CZ = 0, HX = 0.2675, HZ = 0.21;
function satCheck(sl: typeof SLOTS[number]) {
  const cy = Math.cos(sl.yaw), sy = Math.sin(sl.yaw);
  const cx = sl.x + CX * cy + CZ * sy;
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
      const projB = exw * Math.abs(ax * ec + az * es) + exd * Math.abs(-ax * es + az * cy);
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
// cage center local (0.23, 0.65, 0) transformed per-post (axis convention align-1)
const lit = SLOTS.find(s => s.lit)!;
const LID = `${lit.id}-l`;
const lcy = Math.cos(lit.yaw), lsy = Math.sin(lit.yaw);
const LCX = 0.23, LCY = 0.65;
const LX = lit.x + LCX * lcy, LY = lit.py + LCY, LZ = lit.z - LCX * lsy;
const COLOR = 0xffb066, INTENSITY = 1.2, RANGE = 8; // refine-198 warm, range 8

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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-mile6-lightread", avatar: cfg.avatar, token: cfg.joinToken, spectate: true }));
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

// ---- upload: NO-UPLOAD by construction (sibling law) — assert, never upload ----
const siblingLive = ents.find(e => e.lib === LIB && e.pos != null);
if (!siblingLive) die(`no live sibling carries ${LIB} — refusing to upload as a fix (disputed-bytes guard)`);
console.log(`lib already live on sibling ${siblingLive.id} — no upload (${LIB})`);

// ---- verbs over join WS: first snapshot -> schedule ALL verbs by timer ----
const verbs: Array<[string, any]> = [];
for (const sl of todo) verbs.push(["spawn", { id: sl.id, lib: LIB, pos: [sl.x, sl.py, sl.z], yaw: sl.yaw, scale: 1 }]);
if (!lightLive) verbs.push(["light", { id: LID, pos: [LX, LY, LZ], color: COLOR, intensity: INTENSITY, range: RANGE }]);
await new Promise<void>((resolve, reject) => {
  const ws = new WebSocket(cfg.url);
  const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 40_000);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-mile6-place", avatar: cfg.avatar, token: cfg.joinToken }));
  ws.onerror = () => { clearTimeout(timer); reject(new Error("spawn websocket error")); };
  ws.onmessage = (ev: any) => {
    const m = JSON.parse(ev.data);
    if (m.type === "error") { clearTimeout(timer); reject(new Error(`server error ${JSON.stringify(m).slice(0, 200)}`)); return; }
    if (m.type !== "snapshot") return;
    console.log("snapshot received — scheduling", verbs.length, "verbs");
    verbs.forEach((v, i) => setTimeout(() => {
      ws.send(JSON.stringify({ type: "verb", verb: v[0], args: v[1] }));
      console.log(`verb sent: ${v[0]} ${v[1].id}`);
      if (i === verbs.length - 1) setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 1500);
    }, 800 * (i + 1)));
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
