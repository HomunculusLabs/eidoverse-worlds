// artwalk-49: b26 way-band yaw reseat — track polish-280's host rotation (artwalk-39 law).
// polish-280 re-seated all four approach lamps (finial + yaw set n:-pi/2, s:+pi/2, e:pi, w:0
// in next-place-approachlamps.ts). The b34 e/s/w riders (artwalk-45, placed after) inherited
// the new yaws; b26 (artwalk-37, placed before) kept absolute yaw pi while its host went to
// -pi/2 — a 90deg relative misalignment of the band's brass datum vs the host crossarm.
// This reseats the rider to yaw = host yaw (relative angle 0, the set's standing law),
// same concentric pos (0,1.5,0). No upload: store already holds the lib (content-addressed).
// Comp stays empty both sides (census-verified this tick).
import { readFileSync } from "node:fs";
const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next",
  ID = "nx-artwalk-b26-wayband", HOST = "nx-approach-lamp-n",
  HL = "store/18b69a6bb2f5862f.glb", LIB = "store/7594436a996e8ded.glb",
  L: [number, number, number] = [0, 1.5, 0],
  cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8")),
  base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", ""),
  near = (a: number, b: number) => Math.abs(a - b) < 1e-6,
  die = (m: string): never => { throw Error(m) };
async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}
const before = await geom(), h = before[HOST];
if (!h || h.lib !== HL || h.scale !== 1) die("host drift");
const y = h.yaw, c = Math.cos(y), s = Math.sin(y);
const P: [number, number, number] = [h.pos[0] + L[0] * c + L[2] * s, h.pos[1] + L[1], h.pos[2] - L[0] * s + L[2] * c];
const want = { id: ID, lib: LIB, pos: P, yaw: y, scale: 1 };
const ok = (e: any) => !!e && e.lib === LIB && e.pos.every((n: number, i: number) => near(n, P[i])) && near(e.yaw ?? 0, y) && e.scale === 1;
const cur = before[ID];
console.log(JSON.stringify({ stage: "preflight", host: HOST, hostLib: HL, hostYaw: y, liveYaw: cur?.yaw, livePos: cur?.pos, wantPos: P, yawDelta: cur ? +(cur.yaw - y).toFixed(6) : null, liveOK: ok(cur) }));
if (ok(cur)) { console.log(JSON.stringify({ status: "ALREADY_EXACT", id: ID, verbs: 0 })); }
else {
  if (!cur) die("rider absent — this is a reseat, not a first placement");
  if (cur.lib !== LIB) die("rider lib drift — disputed bytes, stop");
  await new Promise<void>((res, rej) => {
    const ws = new WebSocket(cfg.url);
    let sent = 0;
    const timer = setTimeout(() => rej(Error("timeout")), 25_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-artwalk-b26-reseat", avatar: cfg.avatar, token: cfg.joinToken, agentToken: cfg.agentToken }));
    ws.onmessage = (ev: MessageEvent) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "error") { clearTimeout(timer); ws.close(); rej(Error(m.error)); }
      if (m.type === "snapshot" && sent === 0) {
        sent = 1;
        ws.send(JSON.stringify({ type: "verb", verb: "remove", args: { id: ID } }));
        setTimeout(() => { ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: want })); sent = 2; }, 700);
        setTimeout(() => { clearTimeout(timer); ws.close(); res(); }, 2000);
      }
    };
  });
  const after = await geom();
  if (!ok(after[ID])) die(`post-verify failed: live=${JSON.stringify(after[ID]?.pos)}/${after[ID]?.yaw} want=${JSON.stringify(P)}/${y}`);
  if (Object.keys(after[ID].comp ?? {}).length !== 0) die("comp not empty after reseat");
  console.log(JSON.stringify({ status: "RESEATED_VERIFIED", id: ID, lib: LIB, pos: P, yaw: y, verbs: 2, comp: {} }));
}
