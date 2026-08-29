// snapshot-atomic-kill-test — SIGKILL after tmp write, before rename.
//
//   bun tools/snapshot-atomic-kill-test.ts
//
// Preseed a valid snapshot, append one durable verb with FOLD_EVERY=1, and use
// an inert-by-default test seam to SIGKILL immediately after snapshot.json.tmp
// is complete but before rename. The prior snapshot must remain byte-identical;
// restart must combine it with the committed log tail and recover full state.

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { emptyState, foldEntry } from "../shared/fold.js";

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

const ROOT = join(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "ew-snapshot-kill-"));
const worlds = join(scratch, "worlds");
const world = "snapshot-kill";
const worldDir = join(worlds, world);
const logPath = join(worldDir, "log.jsonl");
const snapPath = join(worldDir, "snapshot.json");
const tmpPath = `${snapPath}.tmp`;
require("node:fs").mkdirSync(worldDir, { recursive: true });

const baseEntries = [
  { seq: 0, ts: 1, actor: "world", verb: "genesis", args: { v: 2, dialect: "eidoverse-log" } },
  { seq: 1, ts: 2, actor: "world", verb: "grant", args: { id: "writer", role: "owner", gen: true } },
  { seq: 2, ts: 3, actor: "writer", verb: "spawn", args: { id: "baseline", lib: "props/base.glb", pos: [1, 0, 1] } },
];
const state = emptyState();
for (const e of baseEntries) foldEntry(state, e as any);
const baseLog = baseEntries.map((e) => JSON.stringify(e)).join("\n") + "\n";
const baselineSnapshot = JSON.stringify({ v: 1, seq: 2, bytes: Buffer.byteLength(baseLog), ts: 4, state });
writeFileSync(logPath, baseLog);
writeFileSync(snapPath, baselineSnapshot);

let server: Bun.Subprocess | null = null;
let ws: WebSocket | null = null;
let noncePath = "";
function cleanup() {
  try { ws?.close(); } catch { /* gone */ }
  try { server?.kill(9); } catch { /* gone */ }
  try { if (noncePath) rmSync(noncePath); } catch { /* gone */ }
  try { rmSync(scratch, { recursive: true, force: true }); } catch { /* gone */ }
}
process.on("exit", cleanup);

async function freePort(): Promise<number> {
  for (let port = 23800; port < 23900; port++) {
    try {
      const probe = Bun.serve({ hostname: "127.0.0.1", port, fetch: () => new Response("") });
      probe.stop(true); return port;
    } catch { /* occupied */ }
  }
  throw new Error("no free test port");
}

async function boot(crashSeam: boolean): Promise<number> {
  const port = await freePort();
  const nonce = `snapshot-kill-${crypto.randomUUID().slice(0, 8)}`;
  noncePath = join(ROOT, "client", `${nonce}.txt`);
  writeFileSync(noncePath, nonce);
  server = Bun.spawn([process.execPath, join(ROOT, "server", "server.ts")], {
    cwd: ROOT,
    env: {
      ...process.env, PORT: String(port), WORLDS_DIR: worlds, JOIN_TOKEN: "test-door",
      FOLD_EVERY: "1", RECORD_FRAMES: "0",
      ...(crashSeam ? { EIDO_TEST_CRASH_AFTER_SNAPSHOT_TMP: "1" } : {}),
    },
    stdout: Bun.file(join(scratch, `server-${crashSeam ? "crash" : "restart"}.log`)),
    stderr: Bun.file(join(scratch, `server-${crashSeam ? "crash" : "restart"}.log`)),
  });
  let own = false;
  for (let i = 0; i < 80 && !own; i++) {
    await Bun.sleep(100);
    own = await fetch(`http://127.0.0.1:${port}/${nonce}.txt`)
      .then(async (r) => r.ok && await r.text() === nonce).catch(() => false);
  }
  if (!own) throw new Error("scratch sequencer never came up on its verified port");
  return port;
}

console.log("\n— SIGKILL between snapshot tmp write and rename —");
let port = await boot(true);
const messages: any[] = [];
ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
ws.onmessage = (event) => { try { messages.push(JSON.parse(String(event.data))); } catch { /* ignore */ } };
await new Promise<void>((resolve, reject) => {
  ws!.onopen = () => resolve(); ws!.onerror = () => reject(new Error("websocket open failed"));
});
ws.send(JSON.stringify({ type: "join", world, id: "writer", token: "test-door" }));
for (let i = 0; i < 80 && !messages.some((m) => m.type === "snapshot"); i++) await Bun.sleep(50);
if (!messages.some((m) => m.type === "snapshot")) throw new Error("join snapshot never arrived");
ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "committed-tail", lib: "props/tail.glb", pos: [2, 0, 2] } }));
const diedAtSeam = await Promise.race([
  server.exited.then(() => true),
  Bun.sleep(2000).then(() => false),
]);
if (!diedAtSeam) { try { server.kill(9); } catch { /* gone */ } await server.exited.catch(() => null); }
server = null; ws = null;
try { rmSync(noncePath); } catch { /* gone */ } noncePath = "";

check("process is actually SIGKILLed at the tmp-before-rename seam", diedAtSeam);
check("prior valid snapshot remains byte-identical",
  readFileSync(snapPath, "utf8") === baselineSnapshot, readFileSync(snapPath, "utf8").slice(0, 200));
check("new snapshot exists only as a complete tmp file", existsSync(tmpPath));
const tmp = existsSync(tmpPath) ? JSON.parse(readFileSync(tmpPath, "utf8")) : null;
check("tmp snapshot contains the new committed state",
  tmp?.seq === 3 && tmp?.state?.entities?.["committed-tail"]?.lib === "props/tail.glb", JSON.stringify(tmp));
const committedLog = readFileSync(logPath, "utf8");
check("authored tail committed before snapshot crash",
  committedLog.includes('"seq":3') && committedLog.includes('"id":"committed-tail"'), committedLog.slice(-500));

console.log("\n— restart from prior snapshot plus committed tail —");
port = await boot(false);
const response = await fetch(`http://127.0.0.1:${port}/geom?world=${world}&boxes=0`);
const recovered = await response.json().catch(() => ({}));
check("restart recovers baseline and committed tail", response.ok
  && recovered?.entities?.some((e: any) => e.id === "baseline")
  && recovered?.entities?.some((e: any) => e.id === "committed-tail"), JSON.stringify(recovered));
check("restart still leaves prior snapshot authoritative until a later fold",
  readFileSync(snapPath, "utf8") === baselineSnapshot);

cleanup();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
