// snapshot-sequence-disagreement-test — snapshot seq must match covered log.
//
//   bun tools/snapshot-sequence-disagreement-test.ts
//
// A valid byte boundary is not sufficient. The JSONL entry immediately before
// snapshot.bytes must have the same seq as snapshot.seq. Otherwise snapshot
// state and log prefix describe different timelines; mixing them can silently
// omit covered entities. Reject explicitly and leave both files untouched.

import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

const ROOT = join(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "ew-seq-disagree-"));
const worlds = join(scratch, "worlds");
const badDir = join(worlds, "sequence-disagreement");
const healthyDir = join(worlds, "healthy-control");
mkdirSync(badDir, { recursive: true });
mkdirSync(healthyDir, { recursive: true });

const entries = [
  { seq: 0, ts: 1, actor: "world", verb: "genesis", args: { v: 2, dialect: "eidoverse-log" } },
  { seq: 1, ts: 2, actor: "builder", verb: "spawn", args: { id: "covered-but-missing", lib: "props/covered.glb", pos: [1, 0, 1] } },
  { seq: 2, ts: 3, actor: "builder", verb: "spawn", args: { id: "tail-visible", lib: "props/tail.glb", pos: [2, 0, 2] } },
];
const lines = entries.map((e) => JSON.stringify(e));
const validLog = lines.join("\n") + "\n";
const coveredThroughSeq1 = Buffer.byteLength(lines[0]!) + 1 + Buffer.byteLength(lines[1]!) + 1;
const snapshot = JSON.stringify({
  v: 1,
  seq: 0, // LIE: byte offset below already covers through log seq 1.
  bytes: coveredThroughSeq1,
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
  for (let port = 23600; port < 23700; port++) {
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
  const nonce = `seq-disagree-${crypto.randomUUID().slice(0, 8)}`;
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

console.log("\n— snapshot seq disagrees with the log entry at its byte boundary —");
let run = await boot();
const response = await fetch(`http://127.0.0.1:${run.port}/geom?world=sequence-disagreement&boxes=0`);
const body = await response.json().catch(() => ({}));
await Bun.sleep(100);
const serverLog = readFileSync(run.logPath, "utf8");
check("disagreeing snapshot/log timeline is rejected", !response.ok,
  `${response.status} ${JSON.stringify(body)}`);
check("rejection names both sequence values and the byte offset",
  serverLog.includes(`snapshot seq 0 disagrees with log seq 1 at byte offset ${coveredThroughSeq1}`),
  serverLog.slice(-600));
check("silent mixed state is never served",
  !body?.entities?.some?.((e: any) => e.id === "tail-visible"), JSON.stringify(body));
check("authoritative log remains byte-identical",
  readFileSync(join(badDir, "log.jsonl"), "utf8") === validLog);
check("disagreeing snapshot remains byte-identical for inspection",
  readFileSync(join(badDir, "snapshot.json"), "utf8") === snapshot);
check("no recovery quarantine is fabricated for timeline disagreement",
  !readdirSync(badDir).some((f) => f !== "log.jsonl" && f !== "snapshot.json"),
  JSON.stringify(readdirSync(badDir)));

const healthyResponse = await fetch(`http://127.0.0.1:${run.port}/geom?world=healthy-control&boxes=0`);
const healthy = await healthyResponse.json().catch(() => ({}));
check("bad timeline cannot wedge another world", healthyResponse.ok
  && healthy?.entities?.some((e: any) => e.id === "covered-but-missing"), JSON.stringify(healthy));

console.log("\n— rejection persists across process restart —");
await stop();
run = await boot();
const again = await fetch(`http://127.0.0.1:${run.port}/geom?world=sequence-disagreement&boxes=0`);
await Bun.sleep(100);
const secondLog = readFileSync(run.logPath, "utf8");
check("second process rejects the disagreement again", !again.ok, String(again.status));
check("second process reports the same exact disagreement",
  secondLog.includes(`snapshot seq 0 disagrees with log seq 1 at byte offset ${coveredThroughSeq1}`),
  secondLog.slice(-600));

await stop();
cleanup();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
