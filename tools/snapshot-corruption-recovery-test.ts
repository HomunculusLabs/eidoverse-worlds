// snapshot-corruption-recovery-test — corrupt snapshot cache quarantine.
//
//   bun tools/snapshot-corruption-recovery-test.ts
//
// snapshot.json is a rebuildable cache; log.jsonl is truth. Malformed snapshot
// bytes must therefore be quarantined byte-exactly, removed from the live cache
// path, and followed by a complete log replay. Recovery must be one-time across
// process restarts, never a silent retry of the same corrupt cache.

import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

const ROOT = join(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "ew-snapshot-corrupt-"));
const worlds = join(scratch, "worlds");
const worldDir = join(worlds, "corrupt-snapshot");
mkdirSync(worldDir, { recursive: true });

const entries = [
  { seq: 0, ts: 1, actor: "world", verb: "genesis", args: { v: 2, dialect: "eidoverse-log" } },
  { seq: 1, ts: 2, actor: "builder", verb: "spawn", args: { id: "from-log", lib: "props/truth.glb", pos: [3, 0, 4] } },
];
const validLog = entries.map((e) => JSON.stringify(e)).join("\n") + "\n";
const corruptSnapshot = '{"v":1,"seq":1,"bytes":217,"state":{"entities":{"ghost"';
writeFileSync(join(worldDir, "log.jsonl"), validLog);
writeFileSync(join(worldDir, "snapshot.json"), corruptSnapshot);

let server: Bun.Subprocess | null = null;
let noncePath = "";
function cleanup() {
  try { server?.kill(); } catch { /* gone */ }
  try { if (noncePath) rmSync(noncePath); } catch { /* gone */ }
  try { rmSync(scratch, { recursive: true, force: true }); } catch { /* gone */ }
}
process.on("exit", cleanup);

async function freePort(): Promise<number> {
  for (let port = 23300; port < 23400; port++) {
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
  const nonce = `snap-corrupt-${crypto.randomUUID().slice(0, 8)}`;
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

console.log("\n— malformed snapshot cache —");
let port = await boot();
const firstResponse = await fetch(`http://127.0.0.1:${port}/geom?world=corrupt-snapshot&boxes=0`);
const first = await firstResponse.json().catch(() => ({}));
check("world reopens by replaying its authoritative log", firstResponse.ok,
  `${firstResponse.status} ${JSON.stringify(first)}`);
check("fully committed log entity survives", first?.entities?.some((e: any) => e.id === "from-log"),
  JSON.stringify(first));
check("partial snapshot ghost is never invented", !first?.entities?.some((e: any) => e.id === "ghost"),
  JSON.stringify(first));
check("corrupt snapshot is removed from the live cache path",
  !readdirSync(worldDir).includes("snapshot.json"), JSON.stringify(readdirSync(worldDir)));
const quarantines = readdirSync(worldDir).filter((f) => /^corrupt-snapshot-[a-f0-9]{16}\.json$/.test(f));
check("corrupt snapshot is quarantined exactly once", quarantines.length === 1,
  JSON.stringify(quarantines));
check("snapshot quarantine is byte-exact", quarantines.length === 1
  && readFileSync(join(worldDir, quarantines[0]!), "utf8") === corruptSnapshot);
check("authoritative log is never rewritten during snapshot recovery",
  readFileSync(join(worldDir, "log.jsonl"), "utf8") === validLog);

console.log("\n— recovered world survives a second process boot —");
await stop();
port = await boot();
const secondResponse = await fetch(`http://127.0.0.1:${port}/geom?world=corrupt-snapshot&boxes=0`);
const second = await secondResponse.json().catch(() => ({}));
check("second boot replays cleanly without the corrupt cache", secondResponse.ok
  && second?.entities?.some((e: any) => e.id === "from-log"), JSON.stringify(second));
check("second boot does not quarantine again",
  readdirSync(worldDir).filter((f) => f.startsWith("corrupt-snapshot-")).length === 1);

await stop();
cleanup();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
