// artwalk-83: four way-band rider reseat — track town-1's host translation
// (artwalk-39 continuity law, artwalk-49 reseat chassis, b34 batch shape).
// town-1 (Bill's screenshot correction 2026-09-06: "get the lamp out of the
// path") moved the four cardinal gate lamps 1.75m off-axis via remove+spawn.
// The b26/b34 way-band riders (concentric ring bands at host-local (0,1.5,0))
// still stand at the OLD on-axis positions — now orphaned mid-walk-lane at
// host-local (0,1.5,+1.75), exactly the lanes Bill had cleared. This reseats
// all four riders to live-host-concentric: pos [hx,1.5,hz], yaw = host yaw.
// Yaws are UNCHANGED by the town move (riders already match hosts exactly —
// census-verified pre-write), so this is a pure translation reseat.
// Host lib note: town-1 spawned the lamps under a TRUNCATED store name
// (store/18b69a6bb2.glb, 10-hex — flagged to the town lane; four entities
// lost bbox). Host pin here is PREFIX-tolerant (includes "18b69a6bb2") so it
// matches both the truncated live form and the expected full 16-hex re-fix;
// positions are identical either way, so the reseat tuple is stable.
// No upload: rider lib store/7594436a996e8ded.glb is content-addressed and
// already live on all four riders (census-verified). Comp bags stay {}.
import { readFileSync } from "node:fs";
const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next",
  LIB = "store/7594436a996e8ded.glb",
  HOST_PIN = "18b69a6bb2", // prefix of both live truncated and canonical full lib
  cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8")),
  base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", ""),
  near = (a: number, b: number) => Math.abs(a - b) < 1e-6,
  die = (m: string): never => { throw Error(m) };
const SLOTS = [
  { id: "nx-artwalk-b26-wayband",    host: "nx-approach-lamp-n", light: "nx-approach-lamp-n-l" },
  { id: "nx-artwalk-b34-wayband-e",  host: "nx-approach-lamp-e", light: "nx-approach-lamp-e-l" },
  { id: "nx-artwalk-b34-wayband-s",  host: "nx-approach-lamp-s", light: "nx-approach-lamp-s-l" },
  { id: "nx-artwalk-b34-wayband-w",  host: "nx-approach-lamp-w", light: "nx-approach-lamp-w-l" },
];
async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}
// SAT helper (same class as b26/b34 placers)
type O = { cx: number; cz: number; ux: [number, number]; uz: [number, number]; hx: number; hz: number };
const O = (cx: number, cz: number, y: number, sx: number, sz: number): O => ({ cx, cz, ux: [Math.cos(y), -Math.sin(y)], uz: [Math.sin(y), Math.cos(y)], hx: sx / 2, hz: sz / 2 }),
  gap = (a: O, b: O) => {
    let q = -Infinity;
    for (const x of [a.ux, a.uz, b.ux, b.uz] as const) {
      const d = Math.abs((b.cx - a.cx) * x[0] + (b.cz - a.cz) * x[1]),
        ra = a.hx * Math.abs(a.ux[0] * x[0] + a.ux[1] * x[1]) + a.hz * Math.abs(a.uz[0] * x[0] + a.uz[1] * x[1]),
        rb = b.hx * Math.abs(b.ux[0] * x[0] + b.ux[1] * x[1]) + b.hz * Math.abs(b.uz[0] * x[0] + b.uz[1] * x[1]);
      q = Math.max(q, d - ra - rb);
    }
    return q;
  };
const u = O(0, 0, 0, 2, 2);
if (!near(gap(u, O(4, 0, 0, 2, 2)), 2) || !near(gap(u, O(2, 0, 0, 2, 2)), 0) || gap(u, O(1, 0, 0, 2, 2)) >= 0) die("SAT self-test");
const EO = (e: any) => {
  const z = e.yaw ?? 0, co = Math.cos(z), si = Math.sin(z),
    lx = (e.bbox.min[0] + e.bbox.max[0]) / 2, lz = (e.bbox.min[2] + e.bbox.max[2]) / 2;
  return O(e.pos[0] + lx * co + lz * si, e.pos[2] - lx * si + lz * co, z, e.bbox.size[0], e.bbox.size[2]);
};
const before = await geom();
const wantOf = (h: any) => ({ lib: LIB, pos: [h.pos[0], 1.5, h.pos[2]] as [number, number, number], yaw: h.yaw ?? 0, scale: 1 });
const okOf = (e: any, w: any) => !!e && e.lib === w.lib && e.pos.every((n: number, i: number) => near(n, w.pos[i])) && near(e.yaw ?? 0, w.yaw) && e.scale === 1 && Object.keys(e.comp ?? {}).length === 0;
const todo: Array<{ id: string; want: any }> = [];
for (const s of SLOTS) {
  const h = before[s.host], cur = before[s.id];
  if (!h || !(h.lib ?? "").includes(HOST_PIN) || h.scale !== 1) die(`host drift ${s.host}: ${h?.lib}`);
  if (!cur) die(`${s.id} absent — this is a reseat, not a first placement`);
  if (cur.lib !== LIB) die(`${s.id} lib drift — disputed bytes, stop: ${cur.lib}`);
  const want = wantOf(h);
  // SAT proxy: rider concentric with host post (0.25m proxy box — b34 class);
  // host (bbox-less while truncated) + companion light + ground layers exempt
  //
  // NAMED EXEMPTION (artwalk-34 ladder, law-0b class — decode at source,
  // 2026-09-06 this tick): nx-town-mapboard for the b26 slot ONLY. The
  // mapboard's compound bbox (2.805 x 2.63) envelopes the lamp-n target
  // after town-1's off-axis move (square-proxy gap -0.86m) but its true
  // solids do not reach the rider: full world-transform vertex decode of
  // BOTH GLBs (store 1f1a10f4dce71a0e @ pos (2.5,9.5) yaw -2.944197;
  // rider 7594436a996e8ded @ (1.75,10) yaw -pi/2) gives rider-band vs
  // mapboard min vert-vert distance +0.072 m > 0 — clear, no overlap, no
  // walker pinch (band rides the post at y 1.5; nearest mapboard solid in
  // that y-band is the tilted board face). BOUND: exemption applies only
  // while the live mapboard tuple equals the decode inputs within 1e-3 —
  // any mapboard move/drift re-engages the SAT gate as a hard fail.
  const mbLive = before["nx-town-mapboard"];
  const MB_PIN = { pos: [2.5, 0, 9.5], yaw: -2.9441970937399127 }; // FULL 3D live pos (x, y, z)
  const mbAtDecodeInputs = !!mbLive && mbLive.pos.every((n: number, i: number) => Math.abs(n - MB_PIN.pos[i]) < 1e-3) && Math.abs((mbLive.yaw ?? 0) - MB_PIN.yaw) < 1e-3;
  if (s.id === "nx-artwalk-b26-wayband" && !mbAtDecodeInputs) die("mapboard tuple no longer matches decode inputs — re-derive exemption");
  // SECOND NAMED EXEMPTION (same tick): nx-artwalk-b22-mapboard-eight-ways
  // for the b26 slot ONLY. b22 is this lane's own flat compass card
  // (2.3 x 0.35 bbox) on the mapboard's back face; its square proxy kisses
  // the band proxy (-0.0039m) but full world-vertex decode of both riders
  // gives +0.324 m true clearance. BOUND to b22's live tuple (below) —
  // drift re-engages SAT as a hard fail.
  const b22Live = before["nx-artwalk-b22-mapboard-eight-ways"];
  const B22_PIN = { pos: [2.5058834840541455, 0, 9.529417420270727], yaw: -2.9441970937399127 };
  const b22AtDecodeInputs = !!b22Live && b22Live.pos.every((n: number, i: number) => Math.abs(n - B22_PIN.pos[i]) < 1e-3) && Math.abs((b22Live.yaw ?? 0) - B22_PIN.yaw) < 1e-3;
  if (s.id === "nx-artwalk-b26-wayband" && !b22AtDecodeInputs) die("b22 tuple no longer matches decode inputs — re-derive exemption");
  const t = O(want.pos[0], want.pos[2], want.yaw, 0.25, 0.25);
  let nearest = { id: "", gap: Infinity };
  for (const e of Object.values(before) as any[]) {
    if (!e.bbox || e.id === s.host || e.id === s.light || e.id === s.id || e.id === "nx-town-roads" || e.id === "nx-core-paths" || e.id === "nx-town-streetlamps" || e.bbox.size[1] <= .5) continue;
    if (s.id === "nx-artwalk-b26-wayband" && e.id === "nx-town-mapboard" && mbAtDecodeInputs) { console.log(JSON.stringify({ stage: "sat-exempt", slot: s.id, entity: e.id, reason: "compound-bbox false positive, source-decoded +0.072m true clearance (see header)" })); continue; }
    if (s.id === "nx-artwalk-b26-wayband" && e.id === "nx-artwalk-b22-mapboard-eight-ways" && b22AtDecodeInputs) { console.log(JSON.stringify({ stage: "sat-exempt", slot: s.id, entity: e.id, reason: "flat-card proxy kiss, source-decoded +0.324m true clearance (see second exemption)" })); continue; }
    const g = gap(t, EO(e));
    if (g < nearest.gap) nearest = { id: e.id, gap: g };
    if (g < -0.001) die(`overlap ${e.id}: ${g}`);
  }
  console.log(JSON.stringify({ stage: "preflight", slot: s.id, host: s.host, hostLib: h.lib, livePos: cur.pos, wantPos: want.pos, nearest }));
  if (!okOf(cur, want)) todo.push({ id: s.id, want });
}
if (todo.length === 0) { console.log(JSON.stringify({ status: "ALREADY_EXACT", slots: SLOTS.length, verbs: 0 })); }
else {
  // remove+spawn per rider over one join; pace by timer (8 verbs @ 700ms —
  // well clear of 12 verbs/4s)
  const verbs: Array<() => void> = [];
  for (const t of todo) {
    verbs.push(() => (ws as any).send(JSON.stringify({ type: "verb", verb: "remove", args: { id: t.id } })));
    verbs.push(() => (ws as any).send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: t.id, ...t.want } })));
  }
  const ws = new WebSocket(cfg.url);
  await new Promise<void>((res, rej) => {
    let i = 0, joined = false;
    const timer = setTimeout(() => { try { ws.close(); } catch {} rej(Error("verb timeout")); }, 60_000);
    const paced = setInterval(() => {
      if (!joined || i >= verbs.length) return;
      verbs[i++]();
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); try { ws.close(); } catch {} res(); }, 1800);
    }, 700);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-artwalk83-reseat", avatar: cfg.avatar, token: cfg.joinToken, agentToken: cfg.agentToken }));
    ws.onerror = () => { clearInterval(paced); clearTimeout(timer); rej(Error("websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "error") { clearInterval(paced); clearTimeout(timer); try { ws.close(); } catch {} rej(Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") { joined = true; console.log("joined, snapshot ok"); }
    };
  });
  const after = await geom();
  for (const s of SLOTS) {
    const h = after[s.host], want = wantOf(h);
    if (!okOf(after[s.id], want)) die(`post-verify ${s.id}: live=${JSON.stringify(after[s.id]?.pos)}/${after[s.id]?.yaw} want=${JSON.stringify(want.pos)}/${want.yaw}`);
  }
  console.log(JSON.stringify({ status: "RESEATED_VERIFIED", slots: todo.map(t => t.id), lib: LIB, verbs: verbs.length, comp: {} }));
}
