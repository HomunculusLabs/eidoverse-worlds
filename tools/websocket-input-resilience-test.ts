// websocket-input-resilience-test — malformed and oversized frame boundaries.
//
//   bun tools/websocket-input-resilience-test.ts
//
// Malformed JSON gets an explicit, nonfatal refusal and the same socket remains
// usable. A frame above the global 256KB cap closes only its sender with 1009
// before JSON parsing or authored mutation. A healthy peer and the server live on.

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

const ROOT = join(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "ew-ws-input-"));
const worlds = join(scratch, "worlds");
const world = "ws-input";
const logPath = join(worlds, world, "log.jsonl");
const nonce = `ws-input-${crypto.randomUUID().slice(0, 8)}`;
const noncePath = join(ROOT, "client", `${nonce}.txt`);
writeFileSync(noncePath, nonce);

let server: Bun.Subprocess | null = null;
const sockets: WebSocket[] = [];
function cleanup() {
  for (const ws of sockets) try { ws.close(); } catch { /* gone */ }
  try { server?.kill(); } catch { /* gone */ }
  try { rmSync(noncePath); } catch { /* gone */ }
  try { rmSync(scratch, { recursive: true, force: true }); } catch { /* gone */ }
}
process.on("exit", cleanup);

let port = 24000;
for (; port < 24100; port++) {
  try {
    const probe = Bun.serve({ hostname: "127.0.0.1", port, fetch: () => new Response("") });
    probe.stop(true); break;
  } catch { /* occupied */ }
}
if (port >= 24100) throw new Error("no free test port");
server = Bun.spawn([process.execPath, join(ROOT, "server", "server.ts")], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(port), WORLDS_DIR: worlds, JOIN_TOKEN: "test-door", RECORD_FRAMES: "0" },
  stdout: Bun.file(join(scratch, "server.log")), stderr: Bun.file(join(scratch, "server.log")),
});
let own = false;
for (let i = 0; i < 80 && !own; i++) {
  await Bun.sleep(100);
  own = await fetch(`http://127.0.0.1:${port}/${nonce}.txt`)
    .then(async (r) => r.ok && await r.text() === nonce).catch(() => false);
}
if (!own) throw new Error("scratch sequencer never came up on its verified port");

type Sock = { ws: WebSocket; messages: any[]; closeCode: number | null };
async function open(id: string): Promise<Sock> {
  const sock: Sock = { ws: new WebSocket(`ws://127.0.0.1:${port}/ws`), messages: [], closeCode: null };
  sockets.push(sock.ws);
  sock.ws.onmessage = (event) => { try { sock.messages.push(JSON.parse(String(event.data))); } catch { /* ignore */ } };
  sock.ws.onclose = (event) => { sock.closeCode = event.code; };
  await new Promise<void>((resolve, reject) => {
    sock.ws.onopen = () => resolve(); sock.ws.onerror = () => reject(new Error("websocket open failed"));
  });
  sock.ws.send(JSON.stringify({ type: "join", world, id, token: "test-door" }));
  for (let i = 0; i < 80 && !sock.messages.some((m) => m.type === "snapshot"); i++) await Bun.sleep(50);
  if (!sock.messages.some((m) => m.type === "snapshot")) throw new Error(`join snapshot never arrived for ${id}`);
  sock.messages.length = 0;
  return sock;
}
async function waitFor(sock: Sock, pred: () => boolean, ticks = 80): Promise<boolean> {
  for (let i = 0; i < ticks; i++) { if (pred()) return true; await Bun.sleep(40); }
  return pred();
}

const healthy = await open("healthy");

console.log("\n— malformed JSON is refused but nonfatal —");
healthy.ws.send("{this is not json");
await waitFor(healthy, () => healthy.messages.some((m) => m.type === "error"), 20);
check("malformed JSON receives explicit refusal",
  healthy.messages.some((m) => m.type === "error" && /malformed JSON/.test(String(m.error))), JSON.stringify(healthy.messages));
check("malformed JSON does not close its socket", healthy.closeCode === null, String(healthy.closeCode));
healthy.messages.length = 0;
healthy.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: "healthy-after-malformed" } }));
await waitFor(healthy, () => healthy.messages.some((m) => m.type === "log" && m.entry?.args?.text === "healthy-after-malformed"));
check("same socket authors normally after malformed refusal",
  healthy.messages.some((m) => m.type === "log" && m.entry?.args?.text === "healthy-after-malformed"), JSON.stringify(healthy.messages));

console.log("\n— oversized frame closes only its sender before parse —");
const large = await open("large");
const marker = "OVERSIZED-MARKER-MUST-NOT-LAND";
const huge = JSON.stringify({ type: "verb", verb: "say", args: { text: marker + "x".repeat(300_000) } });
check("test frame genuinely exceeds 256KB", Buffer.byteLength(huge) > 256_000, String(Buffer.byteLength(huge)));
large.ws.send(huge);
await waitFor(large, () => large.closeCode !== null, 80);
check("oversized sender is closed with message-too-big code 1009", large.closeCode === 1009, String(large.closeCode));
check("oversized sender receives no authoritative log echo",
  !large.messages.some((m) => m.type === "log" && String(m.entry?.args?.text ?? "").includes(marker)), JSON.stringify(large.messages));
await Bun.sleep(200);
const diskAfterHuge = readFileSync(logPath, "utf8");
check("oversized payload never reaches authored log", !diskAfterHuge.includes(marker), diskAfterHuge.slice(-500));

healthy.messages.length = 0;
healthy.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: "healthy-after-oversized" } }));
await waitFor(healthy, () => healthy.messages.some((m) => m.type === "log" && m.entry?.args?.text === "healthy-after-oversized"));
check("healthy peer continues authoring after oversized peer is removed",
  healthy.messages.some((m) => m.type === "log" && m.entry?.args?.text === "healthy-after-oversized"), JSON.stringify(healthy.messages));
const health = await fetch(`http://127.0.0.1:${port}/version`);
check("sequencer remains HTTP-responsive", health.ok, String(health.status));

console.log("\n— structurally hostile but parseable frames never wedge presence —");
// pressure-11: a pose is RETAINED state — it rides three JSON.stringify sites
// (stage frames every tick, join snapshots' present[]/restore, poses.json on
// close). A parse-valid but pathologically deep value (a 60k-deep array is
// 120KB — legal at the 256KB gate) blows the serializer's stack downstream,
// and the stage tick throws BEFORE dirty.clear(): one frame from one client
// wedges the whole world's presence plane forever while HTTP and authored
// verbs stay green (measured: 30/30 frames before → 0 after).
const hostile = await open("hostile");
const framesOf = (sock: Sock, id: string) =>
  sock.messages.filter((m) => m.type === "frame" && m.poses && id in m.poses).length;
const sanePose = JSON.stringify({ type: "pose", pose: { p: [0, 0, 0], yaw: 0, speed: 1, clip: "walk" } });
hostile.ws.send(sanePose);
const pre = await waitFor(healthy, () => framesOf(healthy, "hostile") >= 1, 40);
check("sane hostile pose flows to frames before hostility", pre, `${framesOf(healthy, "hostile")} frames`);

// the garbage menu — every entry is size-legal, and each breaks a different
// assumption: envelopes that are not objects, a truncated JSON prefix, a
// well-formed-but-wrong pose, an unknown type, and last the serializer killer
hostile.ws.send("5");
hostile.ws.send("null");
hostile.ws.send('"a string envelope"');
hostile.ws.send('{"type":"verb","verb":"say","args":');
hostile.ws.send('{"type":"pose","pose":{"p":"not-a-point"}}');
hostile.ws.send('{"type":"totally-unknown-type","payload":{"x":1}}');
const depth = 60_000;
const deep = "[".repeat(depth) + "]".repeat(depth);
hostile.ws.send(`{"type":"pose","pose":{"p":[0,0,0],"junk":${deep}}}`);
await Bun.sleep(300);
check("hostile socket survives non-JSON garbage (only size closes)", hostile.closeCode === null, String(hostile.closeCode));
check("hostile socket received explicit refusals, not silence",
  hostile.messages.some((m) => m.type === "error" && /malformed JSON/.test(String(m.error))),
  JSON.stringify(hostile.messages.filter((m) => m.type === "error")).slice(0, 200));

// gate 1 — the stage tick: healthy presence frames must still flow. Send
// several poses across ~500ms and require frames in ≥3 distinct ticks —
// proves the stream is alive over time, not just one final flush.
healthy.messages.length = 0;
for (let k = 0; k < 6; k++) {
  healthy.ws.send(JSON.stringify({ type: "pose", pose: { p: [1 + k, 0, 0], yaw: k, speed: 1, clip: "walk" } }));
  await Bun.sleep(80);
}
const flowed = await waitFor(healthy, () => framesOf(healthy, "healthy") >= 3, 60);
check("presence frames keep flowing for healthy peers after deep-nested poison", flowed, `${framesOf(healthy, "healthy")} frames`);

// gate 2 — the join snapshot: a newcomer mid-hostility must still get one
// (present[] carries settledPose(lastPose) — a retained poison pose throws
// inside the join case and every joiner gets an error instead of a world).
// open() clears its buffer, so this inline join KEEPS the snapshot.
async function joinKeepSnap(id: string): Promise<{ sock: Sock; snap: any }> {
  const sock: Sock = { ws: new WebSocket(`ws://127.0.0.1:${port}/ws`), messages: [], closeCode: null };
  sockets.push(sock.ws);
  sock.ws.onmessage = (event) => { try { sock.messages.push(JSON.parse(String(event.data))); } catch { /* ignore */ } };
  sock.ws.onclose = (event) => { sock.closeCode = event.code; };
  await new Promise<void>((resolve, reject) => {
    sock.ws.onopen = () => resolve(); sock.ws.onerror = () => reject(new Error("websocket open failed"));
  });
  sock.ws.send(JSON.stringify({ type: "join", world, id, token: "test-door" }));
  const snap = await new Promise<any>((resolve, reject) => {
    const to = setTimeout(() => reject(new Error(`${id}: no snapshot`)), 4_000);
    const iv = setInterval(() => {
      const s = sock.messages.find((m) => m.type === "snapshot");
      if (s) { clearTimeout(to); clearInterval(iv); resolve(s); }
    }, 40);
  });
  return { sock, snap };
}
let midstorm: { sock: Sock; snap: any } | null = null;
try { midstorm = await joinKeepSnap("midstorm"); } catch { /* stays null */ }
check("fresh joiner receives a snapshot mid-hostility", midstorm !== null, "no snapshot within 4s");
check("midstorm snapshot's present[] stringifies the hostile body sanely",
  midstorm !== null && Array.isArray(midstorm.snap.present)
  && midstorm.snap.present.every((o: any) => o.pose === null || o.pose === undefined || typeof o.pose === "object"),
  midstorm ? JSON.stringify(midstorm.snap.present).slice(0, 160) : "no snapshot");

// gate 3 — the rest-pose memory: hostile leaves (rememberPose settles its
// last pose into poses.json), then rejoins — its own restore must not break
// the snapshot. Poison at intake means the LAST SANE pose is what's remembered.
sockets.splice(sockets.indexOf(hostile.ws), 1);
try { hostile.ws.close(); } catch { /* gone */ }
await Bun.sleep(300);
let rejoined: { sock: Sock; snap: any } | null = null;
try { rejoined = await joinKeepSnap("hostile"); } catch { /* stays null — check below */ }
check("poisoned body's own rejoin still gets a snapshot (rest pose stayed sane)",
  rejoined !== null, "rejoin never snapshotted");
check("poisoned body's restore is the last SANE pose, not the junk",
  rejoined !== null && (rejoined.snap.restore === null || rejoined.snap.restore === undefined
  || (typeof rejoined.snap.restore === "object" && !("junk" in rejoined.snap.restore))),
  rejoined ? JSON.stringify(rejoined.snap.restore).slice(0, 160) : "no snapshot");

const srvLog = readFileSync(join(scratch, "server.log"), "utf8");
check("no serializer stack explosions in server log", !srvLog.includes("RangeError"),
  srvLog.split("\n").filter((l) => l.includes("RangeError")).slice(0, 3).join(" | "));

// ---- pressure-16: numerically hostile but STRUCTURALLY sane poses -------------
// pressure-11 guards pose SHAPE (depth/nodes/strings); nothing guards pose
// VALUES. A finite p=1e6 rides frames, join snapshots and poses.json verbatim;
// a ~217KB string-stuffed pose (1024-node legal) relays to every spectator;
// MSG_RATE drops are silent on the message lane. The contract this block pins:
// magnitude/fat hostility is refused EXPLICITLY at intake (receipt + flight-
// recorder trace, never propagated), boundary-legitimate extremes (|p|=9999.5)
// still flow, and rapid over-cap sending leaves a rate-limit note in the
// recorder instead of silence.
console.log("\n— numerically hostile poses: refused explicitly, never propagated —");
const spoof1 = await open("spoof-magnitude");
spoof1.messages.length = 0;
healthy.messages.length = 0;   // witness cleared BEFORE the hostility — the very
                               // next tick's relay is what this buffer must judge
spoof1.ws.send(JSON.stringify({ type: "pose", pose: { p: [1_000_000, 0, 0], yaw: 0, speed: 0, clip: "idle", pitch: 0 } }));
spoof1.ws.send(JSON.stringify({ type: "pose", pose: { p: [0, -1e9, 0], yaw: 0, speed: 1e7, clip: "walk", pitch: 1e5 } }));
spoof1.ws.send(JSON.stringify({ type: "pose", pose: { p: [1, 1, 1], yaw: 0, speed: 0, clip: "idle", pose: { boneA: [1e18, 1e18, 1e18, 1e18] } } }));
await Bun.sleep(250);
check("magnitude spoofer gets an explicit refusal receipt",
  spoof1.messages.some((m) => m.type === "error" && /pose refused/i.test(String(m.error))),
  JSON.stringify(spoof1.messages.filter((m) => m.type === "error")).slice(0, 200));
check("magnitude spoofer's socket survives (refusal, not close)",
  spoof1.closeCode === null, String(spoof1.closeCode));
await Bun.sleep(700);
// any finite monster will do: the three sends coalesce (latest-value-wins), so
// what relays is pose #3 (boneA 1e18) — scan for ANY oversized numeric form,
// not one literal (that is how the first draft of this check passed vacuously)
const relayedOversized = healthy.messages.filter((m) => m.type === "frame" && /[0-9]{7,}|1e\+\d{2,}/.test(JSON.stringify(m.poses ?? {})));
check("no oversized value is ever relayed to spectators",
  relayedOversized.length === 0,
  `${relayedOversized.length} frames carry an oversized number, e.g. ${JSON.stringify(relayedOversized[0]?.poses ?? {}).slice(0, 140)}`);

const boundary = await open("spoof-bonsai");
boundary.ws.send(JSON.stringify({ type: "pose", pose: { p: [9999, -9999, 9999.5], yaw: 6.28, speed: 79.2, clip: "walk", pitch: -1.5 } }));
const flowed2 = await waitFor(healthy, () => framesOf(healthy, "spoof-bonsai") >= 1, 40);
check("boundary-legitimate extreme (|p|=9999.5) still flows to frames",
  flowed2, `${framesOf(healthy, "spoof-bonsai")} frames`);
check("boundary leg got no refusal",
  !boundary.messages.some((m) => m.type === "error" && /pose refused/i.test(String(m.error))),
  JSON.stringify(boundary.messages.filter((m) => m.type === "error")).slice(0, 160));

const fatStrings = 830; // 830 x 256B ≈ 217KB — under BOTH the 1024-node and 256KB-frame gates
const fatPose: any = { p: [1, 2, 3], yaw: 1, speed: 1, clip: "walk", pitch: 0.5, pose: { b0: [0.1, 0.2, 0.3, 0.4] } };
for (let k = 0; k < fatStrings; k++) fatPose[`x${k}`] = "S".repeat(256);
const fatFrame = JSON.stringify({ type: "pose", pose: fatPose });
check("fat pose is genuinely under both gates", fatFrame.length < 256_000 && fatFrame.length > 150_000, String(fatFrame.length));
const spoof2 = await open("spoof-fat");
spoof2.messages.length = 0;
healthy.messages.length = 0;
spoof2.ws.send(fatFrame);
await Bun.sleep(250);
check("fat-pose spoofer gets an explicit refusal receipt",
  spoof2.messages.some((m) => m.type === "error" && /pose refused/i.test(String(m.error))),
  JSON.stringify(spoof2.messages.filter((m) => m.type === "error")).slice(0, 200));
await Bun.sleep(700);
const maxFrame = Math.max(0, ...healthy.messages.filter((m) => m.type === "frame").map((m) => JSON.stringify(m).length));
check("fat pose never rides a frame (fanout amplification contained)",
  maxFrame < 50_000, `largest frame ${maxFrame}B`);

// rapid over-cap sender: 200 messages inside ~1s against MSG_RATE=60 — the
// drops must leave a rate-limit note in the flight recorder, and the sender
// must be coalesced (latest-value-wins bounds relayed frames)
const rapid = await open("spoof-rapid");
rapid.messages.length = 0;
for (let k = 0; k < 200; k++) rapid.ws.send(JSON.stringify({ type: "pose", pose: { p: [k % 10, 0, 0], yaw: k, speed: 2, clip: "run" } }));
await Bun.sleep(1_500);
check("rapid sender's socket is not closed for over-cap posing",
  rapid.closeCode === null, String(rapid.closeCode));
const relayed = framesOf(healthy, "spoof-rapid");
check("rapid sender is coalesced (≈15Hz relay, not 200Hz)", relayed > 0 && relayed <= 25, `${relayed} frames`);

// the flight recorder must carry the treatment traces (world_debug's surface)
const rec: Sock = { ws: new WebSocket(`ws://127.0.0.1:${port}/ws`), messages: [], closeCode: null };
sockets.push(rec.ws);
rec.ws.onmessage = (event) => { try { rec.messages.push(JSON.parse(String(event.data))); } catch { /* ignore */ } };
rec.ws.onclose = (event) => { rec.closeCode = event.code; };
await new Promise<void>((resolve, reject) => {
  rec.ws.onopen = () => resolve(); rec.ws.onerror = () => reject(new Error("recorder socket failed"));
});
rec.ws.send(JSON.stringify({ type: "join", world, id: "recorder-16", token: "test-door", spectate: true }));
await waitFor(rec, () => rec.messages.some((m) => m.type === "snapshot"), 40);
rec.ws.send(JSON.stringify({ type: "debug", limit: 300 }));
const recEvents = await new Promise<any[]>((resolve) => {
  const to = setTimeout(() => resolve([]), 3_000);
  const iv = setInterval(() => {
    const d = rec.messages.find((m) => m.type === "debug");
    if (d) { clearTimeout(to); clearInterval(iv); resolve(d.events ?? []); }
  }, 40);
});
check("flight recorder notes the hostile-pose refusals",
  recEvents.some((e) => String(e.kind).includes("pose-refused") || /pose/i.test(String(e.kind ?? "")) && /refus/i.test(JSON.stringify(e))),
  JSON.stringify(recEvents.slice(0, 6)).slice(0, 240));
check("flight recorder notes the message-rate drops (no silent cap)",
  recEvents.some((e) => e.kind === "rate-limit"),
  JSON.stringify(recEvents.filter((e) => e.kind === "rate-limit")).slice(0, 160));

cleanup();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
