// write-failure-ack-test — authored write refusal must fail before echo/state.
//
//   bun tools/write-failure-ack-test.ts
//
// A `log` echo is the protocol's success acknowledgement. Make the scratch
// world's log read-only after join, submit a spawn, then restore writes and
// submit another. The refused verb must receive an error, never broadcast,
// never enter memory, and never hitchhike into a later successful flush.

import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

const ROOT = join(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "ew-write-refusal-"));
const worlds = join(scratch, "worlds");
const world = "write-refusal";
const logPath = join(worlds, world, "log.jsonl");
const nonce = `write-refusal-${crypto.randomUUID().slice(0, 8)}`;
const noncePath = join(ROOT, "client", `${nonce}.txt`);
writeFileSync(noncePath, nonce);

let server: Bun.Subprocess | null = null;
let ws: WebSocket | null = null;
function cleanup() {
  try { ws?.close(); } catch { /* gone */ }
  try { if (existsSync(logPath)) chmodSync(logPath, 0o600); } catch { /* gone */ }
  try { server?.kill(); } catch { /* gone */ }
  try { rmSync(noncePath); } catch { /* gone */ }
  try { rmSync(scratch, { recursive: true, force: true }); } catch { /* gone */ }
}
process.on("exit", cleanup);

let port = 23700;
for (; port < 23800; port++) {
  try {
    const probe = Bun.serve({ hostname: "127.0.0.1", port, fetch: () => new Response("") });
    probe.stop(true); break;
  } catch { /* occupied */ }
}
if (port >= 23800) throw new Error("no free test port");
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

const messages: any[] = [];
ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
ws.onmessage = (event) => { try { messages.push(JSON.parse(String(event.data))); } catch { /* ignore */ } };
await new Promise<void>((resolve, reject) => {
  ws!.onopen = () => resolve();
  ws!.onerror = () => reject(new Error("websocket open failed"));
});
ws.send(JSON.stringify({ type: "join", world, id: "writer", token: "test-door" }));
for (let i = 0; i < 80 && !messages.some((m) => m.type === "snapshot"); i++) await Bun.sleep(50);
if (!messages.some((m) => m.type === "snapshot")) throw new Error("join snapshot never arrived");
await Bun.sleep(200); // initial genesis/owner grant must reach disk before refusal
messages.length = 0;

console.log("\n— authored append while log is read-only —");
chmodSync(logPath, 0o400);
ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "must-not-land", lib: "props/no.glb", pos: [1, 0, 1] } }));
await Bun.sleep(700);
const refusedMessages = [...messages];
const refusedDisk = readFileSync(logPath, "utf8");
const refusedGeom = await fetch(`http://127.0.0.1:${port}/geom?world=${world}&boxes=0`).then((r) => r.json());
check("write refusal returns an explicit request error",
  refusedMessages.some((m) => m.type === "error" && /failed server-side/.test(String(m.error))), JSON.stringify(refusedMessages));
check("write refusal never emits authoritative log echo",
  !refusedMessages.some((m) => m.type === "log" && m.entry?.args?.id === "must-not-land"), JSON.stringify(refusedMessages));
check("write refusal never mutates in-memory world state",
  !refusedGeom.entities?.some((e: any) => e.id === "must-not-land"), JSON.stringify(refusedGeom));
check("write refusal never reaches disk", !refusedDisk.includes("must-not-land"), refusedDisk.slice(-500));

console.log("\n— service recovers after storage becomes writable —");
chmodSync(logPath, 0o600);
messages.length = 0;
ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "does-land", lib: "props/yes.glb", pos: [2, 0, 2] } }));
for (let i = 0; i < 80 && !messages.some((m) => m.type === "log" && m.entry?.args?.id === "does-land"); i++) await Bun.sleep(50);
await Bun.sleep(200);
const recoveredDisk = readFileSync(logPath, "utf8");
const recoveredGeom = await fetch(`http://127.0.0.1:${port}/geom?world=${world}&boxes=0`).then((r) => r.json());
check("next writable verb receives its authoritative echo",
  messages.some((m) => m.type === "log" && m.entry?.args?.id === "does-land"), JSON.stringify(messages));
check("next writable verb reaches memory and disk",
  recoveredGeom.entities?.some((e: any) => e.id === "does-land") && recoveredDisk.includes("does-land"),
  JSON.stringify({ messages, recoveredGeom, disk: recoveredDisk.slice(-500) }));
check("refused verb never hitchhikes into later successful persistence",
  !recoveredGeom.entities?.some((e: any) => e.id === "must-not-land") && !recoveredDisk.includes("must-not-land"),
  JSON.stringify({ recoveredGeom, disk: recoveredDisk.slice(-500) }));

cleanup();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
