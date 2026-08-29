// fork-reset-boundary-test — zero-delay authored verb → fork/reset boundaries.
//
//   bun tools/fork-reset-boundary-test.ts
//
// Sends a spawn and world operation back-to-back on one socket, with no settle
// delay. Fork must copy the just-acknowledged verb. Reset must archive its
// just-acknowledged verb before opening the fresh genesis log. This is the
// executable closure of the synchronous-append law from resilience-6.

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

const ROOT = join(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "ew-boundary-"));
const worlds = join(scratch, "worlds");
const world = "boundary-source";
const copy = "boundary-copy";
const nonce = `boundary-${crypto.randomUUID().slice(0, 8)}`;
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

let port = 23900;
for (; port < 24000; port++) {
  try {
    const probe = Bun.serve({ hostname: "127.0.0.1", port, fetch: () => new Response("") });
    probe.stop(true); break;
  } catch { /* occupied */ }
}
if (port >= 24000) throw new Error("no free test port");
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

type Sock = { ws: WebSocket; messages: any[] };
async function open(id: string, target: string): Promise<Sock> {
  const messages: any[] = [];
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`); sockets.push(ws);
  ws.onmessage = (event) => { try { messages.push(JSON.parse(String(event.data))); } catch { /* ignore */ } };
  await new Promise<void>((resolve, reject) => {
    ws.onopen = () => resolve(); ws.onerror = () => reject(new Error("websocket open failed"));
  });
  ws.send(JSON.stringify({ type: "join", world: target, id, token: "test-door" }));
  for (let i = 0; i < 80 && !messages.some((m) => m.type === "snapshot"); i++) await Bun.sleep(50);
  if (!messages.some((m) => m.type === "snapshot")) throw new Error(`join snapshot never arrived for ${id}`);
  return { ws, messages };
}
async function waitFor(sock: Sock, type: string, pred: (m: any) => boolean = () => true): Promise<any> {
  for (let i = 0; i < 100; i++) {
    const hit = sock.messages.find((m) => m.type === type && pred(m));
    if (hit) return hit;
    await Bun.sleep(40);
  }
  return null;
}

const owner = await open("owner", world);
owner.messages.length = 0;

console.log("\n— zero-delay spawn then fork —");
owner.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "fork-last", lib: "props/fork.glb", pos: [1, 0, 1] } }));
owner.ws.send(JSON.stringify({ type: "world-fork", to: copy }));
const forkEcho = await waitFor(owner, "log", (m) => m.entry?.args?.id === "fork-last");
const forked = await waitFor(owner, "world-forked", (m) => m.to === copy);
check("preceding spawn is acknowledged before fork result",
  Boolean(forkEcho && forked) && owner.messages.indexOf(forkEcho) < owner.messages.indexOf(forked), JSON.stringify(owner.messages));
const sourceBeforeReset = readFileSync(join(worlds, world, "log.jsonl"), "utf8");
const copiedLog = readFileSync(join(worlds, copy, "log.jsonl"), "utf8");
check("fork byte-copy contains the immediately preceding verb",
  copiedLog.includes('"id":"fork-last"') && copiedLog === sourceBeforeReset, copiedLog.slice(-600));
const copyGeom = await fetch(`http://127.0.0.1:${port}/geom?world=${copy}&boxes=0`).then((r) => r.json());
check("fork folds the immediately preceding entity",
  copyGeom.entities?.some((e: any) => e.id === "fork-last"), JSON.stringify(copyGeom));

console.log("\n— zero-delay spawn then reset —");
owner.messages.length = 0;
owner.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "reset-last", lib: "props/reset.glb", pos: [2, 0, 2] } }));
owner.ws.send(JSON.stringify({ type: "world-reset", name: world }));
const resetEcho = await waitFor(owner, "log", (m) => m.entry?.args?.id === "reset-last");
const reset = await waitFor(owner, "world-reset", (m) => m.world === world);
check("preceding spawn is acknowledged before reset result",
  Boolean(resetEcho && reset) && owner.messages.indexOf(resetEcho) < owner.messages.indexOf(reset), JSON.stringify(owner.messages));
const sourceDir = join(worlds, world);
const archives = readdirSync(sourceDir).filter((f) => f.startsWith("erased-")).sort();
check("reset creates exactly one archive", archives.length === 1, JSON.stringify(archives));
const archivedLog = archives.length ? readFileSync(join(sourceDir, archives[0]!, "log.jsonl"), "utf8") : "";
check("reset archive retains every preceding authored verb",
  archivedLog.includes('"id":"fork-last"') && archivedLog.includes('"id":"reset-last"'), archivedLog.slice(-900));
const liveLog = readFileSync(join(sourceDir, "log.jsonl"), "utf8");
check("fresh live log excludes archived entities",
  !liveLog.includes('"id":"fork-last"') && !liveLog.includes('"id":"reset-last"'), liveLog);
const sourceGeom = await fetch(`http://127.0.0.1:${port}/geom?world=${world}&boxes=0`).then((r) => r.json());
check("fresh source is empty after reset",
  !sourceGeom.entities?.some((e: any) => e.id === "fork-last" || e.id === "reset-last"), JSON.stringify(sourceGeom));
const copyAfter = await fetch(`http://127.0.0.1:${port}/geom?world=${copy}&boxes=0`).then((r) => r.json());
check("fork remains independent after source reset",
  copyAfter.entities?.some((e: any) => e.id === "fork-last"), JSON.stringify(copyAfter));

cleanup();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
