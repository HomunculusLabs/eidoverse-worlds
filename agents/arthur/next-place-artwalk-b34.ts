import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
// B-34 THE FOUR WAYS-BANDS — completes the set: B-26's band (same bytes,
// lib already in store, content-addressed) spawned at the E/S/W approach
// lamps. One village diagram (mapboard back), four rim echoes.
const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next",
  SHA = "7594436a996e8ded58458521253b01b70cc2e65ea7b9a20857ecb67f699a02c3",
  LIB = `store/${SHA.slice(0, 16)}.glb`,
  cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8")),
  base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", ""),
  bytes = readFileSync(`${R}/agents/arthur/assets/village_artwalk_b26.glb`),
  near = (a: number, b: number) => Math.abs(a - b) < 1e-6,
  die = (m: string): never => { throw Error(m) };
if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("hash");
const SLOTS = [
  { id: "nx-artwalk-b34-wayband-e", host: "nx-approach-lamp-e", light: "nx-approach-lamp-e-l" },
  { id: "nx-artwalk-b34-wayband-s", host: "nx-approach-lamp-s", light: "nx-approach-lamp-s-l" },
  { id: "nx-artwalk-b34-wayband-w", host: "nx-approach-lamp-w", light: "nx-approach-lamp-w-l" },
];
async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}
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
const b = await geom();
const EO = (e: any) => {
  const z = e.yaw ?? 0, co = Math.cos(z), si = Math.sin(z),
    lx = (e.bbox.min[0] + e.bbox.max[0]) / 2, lz = (e.bbox.min[2] + e.bbox.max[2]) / 2;
  return O(e.pos[0] + lx * co + lz * si, e.pos[2] - lx * si + lz * co, z, e.bbox.size[0], e.bbox.size[2]);
};
const wantOf = (h: any) => {
  const y = h.yaw ?? 0;
  return { lib: LIB, pos: [h.pos[0], 1.5, h.pos[2]] as [number, number, number], yaw: y, scale: 1 };
};
const okOf = (e: any, w: any) => !!e && e.lib === w.lib && e.pos.every((n: number, i: number) => near(n, w.pos[i])) && near(e.yaw ?? 0, w.yaw) && e.scale === 1 && Object.keys(e.comp ?? {}).length === 0;
const todo: Array<{ id: string; want: any }> = [];
for (const s of SLOTS) {
  const h = b[s.host];
  if (!h || h.scale !== 1) die(`host drift ${s.host}`);
  const want = wantOf(h);
  if (b[s.id] && !okOf(b[s.id], want)) die(`drift ${s.id}`);
  // SAT proxy: rider concentric with host post; host + companion light exempt
  const t = O(want.pos[0], want.pos[2], want.yaw, 0.25, 0.25);
  let nearest = { id: "", gap: Infinity };
  for (const e of Object.values(b) as any[]) {
    if (!e.bbox || e.id === s.host || e.id === s.light || e.id === s.id || e.id === "nx-town-roads" || e.id === "nx-core-paths" || e.id === "nx-town-streetlamps" || e.bbox.size[1] <= .5) continue;
    const g = gap(t, EO(e));
    if (g < nearest.gap) nearest = { id: e.id, gap: g };
    if (g < -0.001) die(`overlap ${e.id}: ${g}`);
  }
  console.log(JSON.stringify({ stage: "preflight", slot: s.id, host: s.host, want, nearest }));
  if (!okOf(b[s.id], want)) todo.push({ id: s.id, want });
}
if (todo.length) {
  // no upload needed: lib already content-addressed in store (verify by
  // checking the existing b26 entity uses it)
  const b26 = b["nx-artwalk-b26-wayband"];
  if (!b26 || b26.lib !== LIB) die("lib not in store — refusing to upload stale bytes");
  await new Promise<void>((res, rej) => {
    const ws = new WebSocket(cfg.url);
    const timer = setTimeout(() => rej(Error("timeout")), 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-artwalk-b34-builder", avatar: cfg.avatar, token: cfg.joinToken, agentToken: cfg.agentToken }));
    ws.onmessage = (ev: MessageEvent) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "error") { clearTimeout(timer); ws.close(); rej(Error(m.error)); }
      // one snapshot per join: pace the three spawns by timer (verbs 12/4s
      // shared — 600ms is well clear)
      if (m.type === "snapshot") {
        todo.forEach((t, i) => setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: t.id, ...t.want } })), 600 * (i + 1)));
        setTimeout(() => { clearTimeout(timer); ws.close(); res(); }, 600 * todo.length + 1800);
      }
    };
  });
}
const a = await geom();
for (const s of SLOTS) {
  const h = a[s.host], want = wantOf(h);
  if (!okOf(a[s.id], want)) die(`post ${s.id}`);
}
console.log(JSON.stringify({ status: "PLACED_VERIFIED", slots: SLOTS.map(s => s.id), lib: LIB, emittedVerbs: todo.length }));
