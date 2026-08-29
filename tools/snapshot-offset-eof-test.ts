// snapshot-offset-eof-test — impossible snapshot byte offset recovery.
//
//   bun tools/snapshot-offset-eof-test.ts
//
// A snapshot claiming to cover bytes beyond log.jsonl EOF cannot describe this
// timeline. The log remains truth: quarantine the impossible cache byte-exactly,
// clear the live snapshot path, replay the complete log, and recover only once.

import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

const ROOT = join(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "ew-offset-eof-"));
const worlds = join(scratch, "worlds");
const worldDir = join(worlds, "offset-past-eof");
mkdirSync(worldDir, { recursive: true });

const entries = [
  { seq: 0, ts: 1, actor: "world", verb: "genesis", args: { v: 2, dialect: "eidoverse-log" } },
  { seq: 1, ts: 2, actor: "builder", verb: "spawn", args: { id: "from-log", lib: "props/truth.glb", pos: [5, 0, 6] } },
];
const validLog = entries.map((e) => JSON.stringify(e)).join("\n") + "\n";
const impossibleOffset = Buffer.byteLength(validLog) + 4096;
const invalidSnapshot = JSON.stringify({
  v: 1,
  seq: 1,
  bytes: impossibleOffset,
  ts: 3,
  state: {
    entities: { ghost: { id: "ghost", lib: "props/ghost.glb", pos: [0, 0, 0] } },
    mounts: {}, roles: {}, bans: {}, behaviors: {},
  },
});
writeFileSync(join(worldDir, "log.jsonl"), validLog);
writeFileSync(join(worldDir, "snapshot.json"), invalidSnapshot);

let server: Bun.Subprocess | null = null;
let noncePath = "";
function cleanup() {
  try { server?.kill(); } catch { /* gone */ }
  try { if (noncePath) rmSync(noncePath); } catch { /* gone */ }
  try { rmSync(scratch, { recursive: true, force: true }); } catch { /* gone */ }
}
process.on("exit", cleanup);

async function freePort(): Promise<number> {
  for (let port = 23400; port < 23500; port++) {
    try {
      const probe = Bun.serve({ hostname: "127.0.0.1", port, fetch: () => new Response("") });
      probe.stop(true);
      return port;
    } catch { /* occupied */ }
  }
  throw new Error("no free test port");
}

async function boot(): Promise<number> {
  const port = await freePort();
  const nonce = `offset-eof-${crypto.randomUUID().slice(0, 8)}`;
  noncePath = join(ROOT, "client", `${nonce}.txt`);
  writeFileSync(noncePath, nonce);
  server = Bun.spawn([process.execPath, join(ROOT, "server", "server.ts")], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), WORLDS_DIR: worlds, RECORD_FRAMES: "0" },
    stdout: Bun.file(join(scratch, `server-${port}.log`)),
    stderr: Bun.file(join(scratch, `server-${port}.log`)),
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

async function stop() {
  try { server?.kill(); } catch { /* gone */ }
  if (server) await server.exited.catch(() => null);
  server = null;
  try { if (noncePath) rmSync(noncePath); } catch { /* gone */ }
  noncePath = "";
}

console.log("\n— snapshot offset past log EOF —");
let port = await boot();
const firstResponse = await fetch(`http://127.0.0.1:${port}/geom?world=offset-past-eof&boxes=0`);
const first = await firstResponse.json().catch(() => ({}));
check("world falls back to full authoritative-log replay", firstResponse.ok,
  `${firstResponse.status} ${JSON.stringify(first)}`);
check("fully committed log entity survives", first?.entities?.some((e: any) => e.id === "from-log"),
  JSON.stringify(first));
check("impossible snapshot state is discarded", !first?.entities?.some((e: any) => e.id === "ghost"),
  JSON.stringify(first));
check("invalid snapshot is removed from the live cache path",
  !readdirSync(worldDir).includes("snapshot.json"), JSON.stringify(readdirSync(worldDir)));
const quarantines = readdirSync(worldDir).filter((f) => /^invalid-snapshot-offset-[a-f0-9]{16}\.json$/.test(f));
check("past-EOF snapshot is quarantined exactly once", quarantines.length === 1,
  JSON.stringify(quarantines));
check("offset quarantine is byte-exact", quarantines.length === 1
  && readFileSync(join(worldDir, quarantines[0]!), "utf8") === invalidSnapshot);
check("authoritative log is never rewritten",
  readFileSync(join(worldDir, "log.jsonl"), "utf8") === validLog);

console.log("\n— recovered world survives a second process boot —");
await stop();
port = await boot();
const secondResponse = await fetch(`http://127.0.0.1:${port}/geom?world=offset-past-eof&boxes=0`);
const second = await secondResponse.json().catch(() => ({}));
check("second boot replays cleanly without impossible cache metadata", secondResponse.ok
  && second?.entities?.some((e: any) => e.id === "from-log"), JSON.stringify(second));
check("second boot does not quarantine again",
  readdirSync(worldDir).filter((f) => f.startsWith("invalid-snapshot-offset-")).length === 1);

await stop();
cleanup();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
