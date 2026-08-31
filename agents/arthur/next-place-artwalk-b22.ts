import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next",
  ID = "nx-artwalk-b22-mapboard-eight-ways",
  HOST = "nx-town-mapboard", HL = "store/1f1a10f4dce71a0e.glb",
  SHA = "09c800d062057db2c987785bc0488d9ac6a4081b7a3d8882e284ec7bf0af8439",
  L: [number, number, number] = [0, 0, -0.03],
  cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8")),
  base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", ""),
  bytes = readFileSync(`${R}/agents/arthur/assets/village_artwalk_b22.glb`),
  near = (a: number, b: number) => Math.abs(a - b) < 1e-6,
  die = (m: string): never => { throw Error(m) };
if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("hash");
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
const b = await geom(), h = b[HOST];
if (!h || h.lib !== HL || h.scale !== 1) die("host drift");
const y = h.yaw ?? 0, c = Math.cos(y), s = Math.sin(y),
  pos: [number, number, number] = [h.pos[0] + L[0] * c + L[2] * s, h.pos[1] + L[1], h.pos[2] - L[0] * s + L[2] * c],
  want = { lib: `store/${SHA.slice(0, 16)}.glb`, pos, yaw: y, scale: 1 },
  ok = (e: any) => !!e && e.lib === want.lib && e.pos.every((n: number, i: number) => near(n, pos[i])) && near(e.yaw ?? 0, y) && e.scale === 1 && Object.keys(e.comp ?? {}).length === 0;
// migration law: accept the live entity at the REJECTED first-siting anchor
// (0,0,-0.14) exactly, once, so the corrected anchor can re-place the same
// bytes; any other mismatch remains hard drift.
const REJECT_POS: [number, number, number] = [2.527456258919346, 0, 9.637281294596729];
const atReject = (e: any) => !!e && e.lib === want.lib && e.pos.every((n: number, i: number) => near(n, REJECT_POS[i])) && near(e.yaw ?? 0, y) && e.scale === 1;
if (b[ID] && !ok(b[ID]) && !atReject(b[ID])) die("drift");
const EO = (e: any) => {
  const z = e.yaw ?? 0, co = Math.cos(z), si = Math.sin(z),
    lx = (e.bbox.min[0] + e.bbox.max[0]) / 2, lz = (e.bbox.min[2] + e.bbox.max[2]) / 2;
  return O(e.pos[0] + lx * co + lz * si, e.pos[2] - lx * si + lz * co, z, e.bbox.size[0], e.bbox.size[2]);
}, cz = (-0.1749 + 0.1749) / 2, t = O(pos[0], pos[2], y, 2.30, 0.11);
let nearest = { id: "", gap: Infinity };
for (const e of Object.values(b) as any[]) {
  if (!e.bbox || e.id === HOST || e.id === ID || e.id === "nx-town-roads" || e.id === "nx-core-paths" || e.id === "nx-town-streetlamps" || e.bbox.size[1] <= .5) continue;
  const g = gap(t, EO(e));
  if (g < nearest.gap) nearest = { id: e.id, gap: g };
  if (g < -0.001) die(`overlap ${e.id}: ${g}`);
}
console.log(JSON.stringify({ stage: "preflight", host: HOST, hostLib: HL, local: L, pos, nearest }));
if (!b[ID]) {
  const up = new URL(`${base}/upload`);
  up.searchParams.set("token", cfg.agentToken);
  up.searchParams.set("name", "Eight Ways");
  up.searchParams.set("by", cfg.id);
  const r = await fetch(up, { method: "POST", body: bytes, signal: AbortSignal.timeout(30_000) });
  if (!r.ok) die(`upload ${r.status}`);
  if ((await r.json() as any).path !== want.lib) die("path");
}
// WS runs only when the live entity is not already at the exact wanted
// tuple: first spawn when absent, remove+spawn reseat from the rejected
// anchor; a correct live pose skips verbs entirely (idempotent rerun).
if (!ok(b[ID])) await new Promise<void>((res, rej) => {
    const ws = new WebSocket(cfg.url);
    let sent = false;
    const timer = setTimeout(() => rej(Error("timeout")), 20_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-artwalk-b22-builder", avatar: cfg.avatar, token: cfg.joinToken, agentToken: cfg.agentToken }));
    ws.onmessage = (ev: MessageEvent) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "error") { clearTimeout(timer); ws.close(); rej(Error(m.error)); }
      if (m.type === "snapshot" && !sent) {
        sent = true;
        // remove-verb reseat (proven pattern): spawn on the existing id did
        // not move the live entity, so remove then spawn the corrected pose.
        ws.send(JSON.stringify({ type: "verb", verb: "remove", args: { id: ID } }));
        setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: ID, ...want } })), 800);
        setTimeout(() => { clearTimeout(timer); ws.close(); res(); }, 2200);
      }
    };
  });
const a = await geom();
if (!ok(a[ID])) die("post");
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, ...want, emittedVerbs: b[ID] ? 0 : 1 }));
