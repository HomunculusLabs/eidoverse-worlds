// Isolation probe: does the sequencer close clients that go QUIET?
// 3 performers broadcast 15Hz for 10s, then ALL traffic stops for 15s.
// Nobody closes anything. Any "left" line during the silence = server sheds
// quiet clients (a real defect for the design target). Run against a scratch
// sequencer only.

const URL = process.env.URL ?? "ws://127.0.0.1:8997/ws";
const TOKEN = process.env.TOKEN ?? "test-door";
const WORLD = process.env.WORLD ?? "quiettest";
const LOUD_S = 10, QUIET_S = 15, N = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const logFile = Bun.file(process.env.LOG ?? "/tmp/quiet-probe-server.log");

const socks: WebSocket[] = [];
for (let i = 0; i < N; i++) {
  await new Promise<void>((res, rej) => {
    const ws = new WebSocket(URL);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `quiet-${i}`, avatar: "x.vrm", spectate: false, token: TOKEN }));
    ws.onmessage = (ev) => { if (JSON.parse(String(ev.data)).type === "snapshot") { socks.push(ws); res(); } };
    ws.onclose = (ev) => rej(new Error(`quiet-${i} closed ${ev.code} during join`));
    setTimeout(() => rej(new Error("join timeout")), 10_000);
  });
}
console.log(`${N} performers joined; broadcasting ${LOUD_S}s…`);
const t0 = performance.now();
const tick = setInterval(() => {
  for (let i = 0; i < N; i++) {
    const t = Date.now() / 1000 + i;
    socks[i].send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t) * 5, 0, Math.cos(t) * 5], yaw: t, speed: 1.2, clip: "walk" } }));
  }
}, 1000 / 15);

// client-side close capture during the quiet window
const clientCloses: string[] = [];
for (let i = 0; i < N; i++) socks[i].addEventListener("close", (ev: any) => clientCloses.push(`quiet-${i} code=${ev.code} @${Math.round(performance.now() - t0)}ms`));

await sleep(LOUD_S * 1000);
clearInterval(tick);
console.log(`traffic STOPPED at t+${LOUD_S}s — ${QUIET_S}s of silence begins (no closes from anyone)`);

let serverLeavesDuringSilence = 0;
let firstEvidence = "";
for (let s = 1; s <= QUIET_S; s++) {
  await sleep(1000);
  const txt = await logFile.text();
  const lines = txt.split("\n").filter(Boolean);
  const leaves = lines.filter((l: string) => l.includes("left") && !l.includes("folded"));
  const joinedCount = lines.filter((l: string) => /joined\s*$/.test(l)).length;
  // any leave beyond the zero expected while all 3 clients hold their sockets
  if (leaves.length > 0) { serverLeavesDuringSilence = leaves.length; firstEvidence = leaves[leaves.length - 1]; }
  if (s % 5 === 0) console.log(`t+${LOUD_S + s}s: leaves=${leaves.length} clientCloses=${clientCloses.length} rosterTail="${lines[lines.length - 1]?.slice(0, 80)}"`);
}
console.log(`\nVERDICT: serverLeavesDuringSilence=${serverLeavesDuringSilence} clientCloses=${clientCloses.length}${firstEvidence ? ` evidence="${firstEvidence}"` : ""}`);
const pass = serverLeavesDuringSilence === 0 && clientCloses.length === 0;
console.log(pass
  ? "QUIET CLIENTS SURVIVE — the pressure-3 performer leaves were teardown artifacts, not server shedding"
  : "SERVER SHEDS QUIET CLIENTS — real defect, escalate");
for (const ws of socks) { try { ws.close(); } catch {} }
process.exit(pass ? 0 : 1);
