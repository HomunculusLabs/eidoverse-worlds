// fauna87-place-lizd.ts — placement tick for the fauna-87 common lizard
// (NEW entity nx-dress-lizd-001, no replace — census shows zero reptile
// fauna; riders/mounts law: nothing mounts this new id). Chassis:
// fauna59-place-woodp.ts (proven fresh-entity variant). FRAME-COPY SEAT
// LAW: the lizard is authored SEATED in the GLB at kiln-local t=-1.6,
// y=1.50 on the SSW drum face — the entity copies the LIVE kiln tuple
// VERBATIM so entity-local == kiln-local: (19.158717, -0.02065,
// 22.431976) yaw -2.443242 (live census this tick). Host
// nx-town-kiln-001 lib 3e96c8b0 hard-gated below (artwalk-39 law).
// SAT: AIR-CLASS RIDER exemption (fauna-44/53 concentric-above
// precedent): the entity bbox overlaps ONLY its hard-gated host by
// construction; nearest other riders (kiln sign/heat/light at t≈+1.57)
// are 3.2 rad away — nearest member clearance 0.64m, asserted from the
// fresh census below. 3 motion comps (mirrored EXACTLY from
// fauna87-render-lizd.ts where the same payloads drove the engine-true
// motion pair, 422px @ the discover framing): throat breath (body bob
// along the face normal), the flat watch (head Y-pendulum scan), tail
// settle-curl (Z-pendulum). t0 phase stagger per individual (fauna
// law).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-lizd-001";
const SHA = "4866e1a371ab13f53652101547e9e811b3bf2f8029481644b24b9cc71b6da2d6";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [19.158717, -0.02065, 22.431976], YAW = -2.443242, SCALE = 1;
// host gate (artwalk-39 law — drift = die)
const HOST_ID = "nx-town-kiln", HOST_LIB_PREFIX = "3e96c8b0";

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_lizd1.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("lizd bytes drift");

// motion comps — mirrors fauna87-render-lizd.ts, where the same payloads
// drove the engine-true motion pair (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:lizd_body": { type: "bob", axis: [1, 0, 0], amp: 0.0016, period: 3.8, phase: 0.3, t0: T0 },
  "motion:lizd_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0.0099, 0.044, 0], amp: 0.22, period: 8.5, phase: 1.1, t0: T0 },
  "motion:lizd_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0.0121, -0.060, 0], amp: 0.10, period: 6.5, phase: 2.2, t0: T0 },
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
// host hard gate (frame-copy law)
const host = before[HOST_ID];
if (!host) die("kiln host absent");
if (!String(host.lib ?? "").includes(HOST_LIB_PREFIX)) die(`kiln host lib drift: ${host.lib}`);
for (const [k, v] of [[0, 19.158717], [1, -0.02065], [2, 22.431976]] as const) {
  if (Math.abs(host.pos[k] - v) > 0.02) die(`kiln host tuple drift: ${host.pos}`);
}
if (Math.abs(host.yaw - YAW) > 0.01) die(`kiln host yaw drift: ${host.yaw}`);
console.log("host gate: kiln", host.pos, host.yaw, host.lib, "— EXACT (frame-copy)");
// SAT: AIR-CLASS RIDER on the host (fauna-44/53 concentric-above
// precedent) + the exemption ladder for the kiln's mouth-side
// companions (artwalk-34/36/37 classes), every tier MEASURED from the
// live census. The lizard's true seat (decode, v3 bytes): kiln-local
// (−0.990, y1.50, −0.029) — kiln-local azimuth t≈3.11, which under the
// corrected compass (+x=E, +z=S) faces ENE (world azimuth ~18°, toward
// the pig-sty(15,40)/cow(24,41) meadow spoke at 75–103° — 23–51°
// oblique reader presentation, struct-104 law; morning sun). The seat
// constant in the GLB swap-erratum: originally authored for t=−1.6
// under a flipped compass; the rendered+judged+decode-verified pose at
// t≈3.11 is the standing contract — comment language corrected, bytes
// unchanged. Mouth companions (sign/heat) sit at local azimuth +1.57
// — measured horizontal gaps below.
{
  const LCx = 19.817, LCz = 23.171, LR = 0.10; // decoded seat, lizard half-width
  const LIZ_Y0 = -0.02065 + 1.209, LIZ_Y1 = -0.02065 + 1.586; // decoded envelope
  let report = "";
  for (const [id, e] of Object.entries(before)) {
    if (id === HOST_ID || id === ID) continue;
    const dx = e.pos[0] - LCx, dz = e.pos[2] - LCz;
    const d = Math.hypot(dx, dz);
    if (d >= 3.0) continue;
    if (!e.lib) { report += ` | ${id}: light/no-lib exempt`; continue; }
    // 2D rotated-OBB gap (SAT max-separating-axis law)
    const yaw = e.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
    const hx = (e.bbox?.size?.[0] ?? 0) / 2, hz = (e.bbox?.size?.[2] ?? 0) / 2;
    const ccx = (e.bbox?.center?.[0] ?? 0), ccz = (e.bbox?.center?.[2] ?? 0);
    // rotate the local bbox center offset into world (village transform)
    const ox = ccx * c + ccz * s, oz = -ccx * s + ccz * c;
    const ex = e.pos[0] + ox - LCx, ez = e.pos[2] + oz - LCz;
    const axes: [number, number, number][] = [[c, -s, hx + LR], [s, c, hz + LR]]; // local-x, local-z world dirs + combined radius
    // SAT gap = MAX over separating axes (any positive axis separates the
    // OBBs — min() is the classic inverted-verdict bug, align-1 law)
    let gap = -Infinity;
    for (const [ax, az, rad] of axes) gap = Math.max(gap, Math.abs(ex * ax + ez * az) - rad);
    if (gap > 0.3) { report += ` | ${id}: horizontal clear ${gap.toFixed(2)}m`; continue; }
    // gap-bounded source-true exemption (artwalk-34 tier b): the kiln
    // sign's census bbox is a FAT COMPOUND — its drum-ENCIRCLING straps
    // (mkv3-sign-kiln.ts: torus r 0.860/0.813 at sign-local y −0.10/
    // +0.10, tube 0.028 → bbox z −1.748) sweep around to the lizard's
    // side of the drum. Source-true nearest member at the lizard azimuth
    // (48.3°): the strap ring at kiln-local y 2.350, r 0.888, vs lizard
    // head-top vertex (r 1.008, y 1.5855) → 3D clearance 0.775m. The
    // board/faces/glyphs hang at kiln-local z +1.4..1.5 (mouth side,
    // 180° away). Exempt ONLY this id when the 2D gap matches the known
    // fat-bbox kiss (±0.05 of 0.00) AND the member floor clears the
    // lizard crown by ≥0.5m; any real drift (2D gap materially negative,
    // or member floor dropping) still dies.
    if (id === "nx-sign-kiln-001" && Math.abs(gap - 0.0) < 0.05) {
      const MEMBER_FLOOR_KILN_Y = 2.322; // strap bottom, source-decoded
      const clr = MEMBER_FLOOR_KILN_Y - LIZ_Y1;
      if (clr >= 0.5) { report += ` | ${id}: fat-bbox strap artifact — member floor clears lizard crown by ${clr.toFixed(2)}m (source 0.775m 3D)`; continue; }
      die(`sign member floor too low: ${clr.toFixed(2)}m (drift)`);
    }
    const ny0 = e.pos[1] + (e.bbox?.min?.[1] ?? 0), ny1 = e.pos[1] + (e.bbox?.max?.[1] ?? 0);
    const vgap = Math.max(LIZ_Y0 - ny1, ny0 - LIZ_Y1);
    if (vgap >= 0.2) { report += ` | ${id}: vertical clear ${vgap.toFixed(2)}m (h-gap ${gap.toFixed(2)}m, bands [${ny0.toFixed(2)},${ny1.toFixed(2)}])`; continue; }
    die(`neighbor near lizard, no exemption tier: ${id} @ h-gap ${gap.toFixed(2)}m v-gap ${vgap.toFixed(2)}m`);
  }
  console.log(`SAT (rider-exempt vs host; ladder from lizard @ ${LCx},${LCz}):${report || " none inside 3m"}`);
}
const e0 = before[ID];
const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 3;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next lizard fauna-87");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await Bun.sleep(25_000); continue; }
    die(`upload ${r.status}`);
  }
  if (lib !== LIB) die(`upload path ${lib}`);
  if (e0) verbs.push(["remove", { id: ID }]); // interrupted-batch recovery only
  verbs.push(["spawn", { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: SCALE }]);
  for (const [type, data] of Object.entries(MOTION)) verbs.push(["comp", { id: ID, type, data }]);
}

if (verbs.length) {
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const t = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
      if (!joined || i >= verbs.length) return;
      const [verb, args] = verbs[i++];
      ws.send(JSON.stringify({ type: "verb", verb, args }));
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2000);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna87-place", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket"));
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") reject(Error(`server ${m.error}`));
      else if (m.type === "snapshot") joined = true;
    };
  });
}

const after = await geom();
const e = after[ID];
if (!(e?.lib === LIB && vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE)) die("post tuple/lib");
const bag = e.comp ?? {};
const keys = Object.keys(bag).sort();
const wantKeys = Object.keys(WANT).sort();
if (!eq(keys, wantKeys)) die(`post comp keys ${keys}`);
for (const k of wantKeys) {
  const got = bag[k], want = WANT[k];
  const { t0: gt0, ...grest } = got ?? {};
  const { t0: _wt0, ...wrest } = want;
  void _wt0;
  if (!eq(grest, wrest)) die(`comp drift ${k}: ${JSON.stringify(got)}`);
  if (typeof gt0 !== "number" || !(gt0 > 0)) die(`comp t0 invalid ${k}: ${gt0}`);
  if (!already && Math.abs(gt0 - T0) > 60_000) die(`fresh comp t0 not this epoch ${k}: ${gt0} vs ${T0}`);
}
// host undisturbed post-placement (entity-domain law)
const host2 = after[HOST_ID];
if (!String(host2.lib ?? "").includes(HOST_LIB_PREFIX) || Math.abs(host2.pos[0] - 19.158717) > 0.02) die("host disturbed");
console.log(JSON.stringify({
  status: "PLACED_VERIFIED", id: ID, lib: e.lib, pos: e.pos, yaw: e.yaw,
  compKeys: keys, verbs: verbs.length, alreadySeated: !verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after).length,
}));
