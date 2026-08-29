// snapshot-offset-boundary-test — mid-record snapshot offsets fail closed.
//
//   bun tools/snapshot-offset-boundary-test.ts
//
// An in-range offset is not credible merely because it is <= EOF. It must point
// just after a JSONL newline. A mid-record offset is rejected explicitly, with
// both snapshot and log left byte-identical for operator inspection. Unlike a
// past-EOF cache, this ambiguity is not auto-healed.

import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

const ROOT = join(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "ew-offset-boundary-"));
const worlds = join(scratch, "worlds");
const badDir = join(worlds, "offset-mid-record");
const healthyDir = join(worlds, "healthy-control");
mkdirSync(badDir, { recursive: true });
mkdirSync(healthyDir, { recursive: true });

const entries = [
  { seq: 0, ts: 1, actor: "world", verb: "genesis", args: { v: 2, dialect: "eidoverse-log" } },
  { seq: 1, ts: 2, actor: "builder", verb: "spawn", args: { id: "one", lib: "props/one.glb", pos: [1, 0, 1] } },
  { seq: 2, ts: 3, actor: "builder", verb: "spawn", args: { id: "two", lib: "props/two.glb", pos: [2, 0, 2] } },
];
const lines = entries.map((e) => JSON.stringify(e));
const validLog = lines.join("\n") + "\n";
const firstBoundary = Buffer.byteLength(lines[0]!) + 1;
const middleOffset = firstBoundary + 11;
const snapshot = JSON.stringify({
  v: 1,
  seq: 0,
  bytes: middleOffset,
  ts: 4,
  state: { entities: {}, mounts: {}, roles: {}, bans: {}, behaviors: {} },
});
writeFileSync(join(badDir, "log.jsonl"), validLog);
writeFileSync(join(badDir, "snapshot.json"), snapshot);
writeFileSync(join(healthyDir, "log.jsonl"), validLog);

let server: Bun.Subprocess | null = null;
let noncePath = "";
let bootNumber = 0;
function cleanup() {
  try { server?.kill(); } catch { /* gone */ }
  try { if (noncePath) rmSync(noncePath); } catch { /* gone */ }
  try { rmSync(scratch, { recursive: true, force: true }); } catch { /* gone */ }
}
process.on("exit", cleanup);

async function freePort(): Promise<number> {
  for (let port = 23500; port < 23600; port++) {
    try {
      const probe = Bun.serve({ hostname: "127.0.0.1", port, fetch: () => new Response("") });
      probe.stop(true);
      return port;
    } catch { /* occupied */ }
  }
  throw new Error("no free test port");
}

async function boot(): Promise<{ port: number; logPath: string }> {
  const port = await freePort();
  const nonce = `offset-boundary-${crypto.randomUUID().slice(0, 8)}`;
  noncePath = join(ROOT, "client", `${nonce}.txt`);
  writeFileSync(noncePath, nonce);
  const logPath = join(scratch, `server-${++bootNumber}-${port}.log`);
  server = Bun.spawn([process.execPath, join(ROOT, "server", "server.ts")], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), WORLDS_DIR: worlds, RECORD_FRAMES: "0" },
    stdout: Bun.file(logPath), stderr: Bun.file(logPath),
  });
  let own = false;
  for (let i = 0; i < 80 && !own; i++) {
    await Bun.sleep(100);
    own = await fetch(`http://127.0.0.1:${port}/${nonce}.txt`)
      .then(async (r) => r.ok && await r.text() === nonce).catch(() => false);
  }
  if (!own) throw new Error("scratch sequencer never came up on its verified port");
  return { port, logPath };
}

async function stop() {
  try { server?.kill(); } catch { /* gone */ }
  if (server) await server.exited.catch(() => null);
  server = null;
  try { if (noncePath) rmSync(noncePath); } catch { /* gone */ }
  noncePath = "";
}

console.log("\n— snapshot offset inside a committed JSONL record —");
let run = await boot();
const rejected = await fetch(`http://127.0.0.1:${run.port}/geom?world=offset-mid-record&boxes=0`);
await Bun.sleep(100);
const logText = readFileSync(run.logPath, "utf8");
check("mid-record snapshot offset is rejected", !rejected.ok, String(rejected.status));
check("rejection is an explicit record-boundary diagnosis",
  logText.includes(`snapshot offset ${middleOffset} is not a JSONL record boundary`), logText.slice(-500));
check("authoritative log remains byte-identical",
  readFileSync(join(badDir, "log.jsonl"), "utf8") === validLog);
check("ambiguous snapshot remains byte-identical for operator inspection",
  readFileSync(join(badDir, "snapshot.json"), "utf8") === snapshot);
check("no recovery quarantine is fabricated for an ambiguous boundary",
  !readdirSync(badDir).some((f) => f !== "log.jsonl" && f !== "snapshot.json"),
  JSON.stringify(readdirSync(badDir)));

const healthyResponse = await fetch(`http://127.0.0.1:${run.port}/geom?world=healthy-control&boxes=0`);
const healthy = await healthyResponse.json().catch(() => ({}));
check("bad world cannot wedge the sequencer or another world", healthyResponse.ok
  && healthy?.entities?.some((e: any) => e.id === "two"), JSON.stringify(healthy));

console.log("\n— rejection persists across process restart —");
await stop();
run = await boot();
const rejectedAgain = await fetch(`http://127.0.0.1:${run.port}/geom?world=offset-mid-record&boxes=0`);
await Bun.sleep(100);
const secondLog = readFileSync(run.logPath, "utf8");
check("second process also rejects until operator intervention", !rejectedAgain.ok,
  String(rejectedAgain.status));
check("second process reports the same explicit boundary fault",
  secondLog.includes(`snapshot offset ${middleOffset} is not a JSONL record boundary`), secondLog.slice(-500));

await stop();
cleanup();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
