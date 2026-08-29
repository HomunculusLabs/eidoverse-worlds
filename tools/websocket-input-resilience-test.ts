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

cleanup();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
