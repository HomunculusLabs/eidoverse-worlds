// torn-tail-recovery-test — crash-torn final JSONL recovery.
//
//   bun tools/torn-tail-recovery-test.ts
//
// The only recoverable parse failure is an invalid, unterminated FINAL fragment:
// quarantine it byte-exactly, trim the live log to its last committed newline,
// and preserve the valid folded world. A malformed newline-committed record is
// corruption, not a torn append, and must remain fail-closed.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

const ROOT = join(import.meta.dir, "..");
const scratch = join(mkdtemp(), "ew-torn-tail");
const worlds = join(scratch, "worlds");
const tornWorld = join(worlds, "torn-tail");
const committedWorld = join(worlds, "committed-corruption");
mkdirSync(tornWorld, { recursive: true });
mkdirSync(committedWorld, { recursive: true });

const entries = [
  { seq: 0, ts: 1, actor: "world", verb: "genesis", args: { v: 2, dialect: "eidoverse-log" } },
  { seq: 1, ts: 2, actor: "builder", verb: "spawn", args: { id: "kept", lib: "props/kept.glb", pos: [1, 0, 2] } },
];
const validLog = entries.map((e) => JSON.stringify(e)).join("\n") + "\n";
const tornFragment = '{"seq":2,"ts":3,"actor":"builder","verb":"spawn","args":{"id":"lost-mid-write"';
writeFileSync(join(tornWorld, "log.jsonl"), validLog + tornFragment);
writeFileSync(join(committedWorld, "log.jsonl"), validLog + "{not-json}\n");

let server: Bun.Subprocess | null = null;
let noncePath = "";
function mkdtemp(): string {
  return require("node:fs").mkdtempSync(join(tmpdir(), "ew-torn-"));
}
function cleanup() {
  try { server?.kill(); } catch { /* gone */ }
  try { if (noncePath) rmSync(noncePath); } catch { /* gone */ }
  try { rmSync(scratch, { recursive: true, force: true }); } catch { /* gone */ }
}
process.on("exit", cleanup);

async function freePort(): Promise<number> {
  for (let port = 23200; port < 23300; port++) {
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
  const nonce = `torn-${crypto.randomUUID().slice(0, 8)}`;
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

console.log("\n— crash-torn final fragment —");
let port = await boot();
const recoveredResponse = await fetch(`http://127.0.0.1:${port}/geom?world=torn-tail&boxes=0`);
const recovered = await recoveredResponse.json().catch(() => ({}));
check("world reopens instead of throwing on its torn final append", recoveredResponse.ok,
  `${recoveredResponse.status} ${JSON.stringify(recovered)}`);
check("every fully committed entity survives recovery",
  recovered?.entities?.some((e: any) => e.id === "kept"), JSON.stringify(recovered));
check("the incomplete entity is never invented",
  !recovered?.entities?.some((e: any) => e.id === "lost-mid-write"), JSON.stringify(recovered));
check("live log is trimmed exactly to the last committed newline",
  readFileSync(join(tornWorld, "log.jsonl"), "utf8") === validLog);
const recoveries = readdirSync(tornWorld).filter((f) => /^torn-tail-.*\.jsonfrag$/.test(f));
check("torn bytes are quarantined once rather than silently discarded", recoveries.length === 1,
  JSON.stringify(recoveries));
check("quarantine is byte-exact", recoveries.length === 1
  && readFileSync(join(tornWorld, recoveries[0]!), "utf8") === tornFragment);

console.log("\n— newline-committed corruption is NOT auto-healed —");
const corruptBefore = readFileSync(join(committedWorld, "log.jsonl"), "utf8");
const corruptResponse = await fetch(`http://127.0.0.1:${port}/geom?world=committed-corruption&boxes=0`);
check("committed malformed record remains fail-closed", !corruptResponse.ok,
  String(corruptResponse.status));
check("committed corruption is never rewritten",
  readFileSync(join(committedWorld, "log.jsonl"), "utf8") === corruptBefore);
check("committed corruption produces no torn-tail quarantine",
  !readdirSync(committedWorld).some((f) => f.startsWith("torn-tail-")));

console.log("\n— recovered world survives a second process boot —");
await stop();
port = await boot();
const secondResponse = await fetch(`http://127.0.0.1:${port}/geom?world=torn-tail&boxes=0`);
const second = await secondResponse.json().catch(() => ({}));
check("second boot folds the recovered log cleanly", secondResponse.ok
  && second?.entities?.some((e: any) => e.id === "kept"), JSON.stringify(second));
check("second boot does not quarantine again",
  readdirSync(tornWorld).filter((f) => f.startsWith("torn-tail-")).length === 1);

await stop();
cleanup();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
