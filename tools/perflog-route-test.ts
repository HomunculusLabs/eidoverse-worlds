// perflog-route-test — server-observed telemetry provenance outranks payload.
//
//   bun tools/perflog-route-test.ts
//
// Boots the real sequencer against scratch state, submits a client beacon that
// attempts to forge `ts` and `ip`, then reads the actual append-only receipt.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

const ROOT = join(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "ew-perflog-"));
const worlds = join(scratch, "worlds");
let server: Bun.Subprocess | null = null;
let noncePath = "";

function cleanup() {
  try { server?.kill(); } catch { /* gone */ }
  try { if (noncePath) rmSync(noncePath); } catch { /* gone */ }
  try { rmSync(scratch, { recursive: true, force: true }); } catch { /* gone */ }
}
process.on("exit", cleanup);

let port = 23100;
for (; port < 23200; port++) {
  try {
    const probe = Bun.serve({ hostname: "127.0.0.1", port, fetch: () => new Response("") });
    probe.stop(true);
    break;
  } catch { /* occupied */ }
}
if (port >= 23200) throw new Error("no free test port");

const nonce = `perflog-${crypto.randomUUID().slice(0, 8)}`;
noncePath = join(ROOT, "client", `${nonce}.txt`);
writeFileSync(noncePath, nonce);
server = Bun.spawn([process.execPath, join(ROOT, "server", "server.ts")], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(port), WORLDS_DIR: worlds, RECORD_FRAMES: "0" },
  stdout: Bun.file(join(scratch, "server.log")),
  stderr: Bun.file(join(scratch, "server.log")),
});

let own = false;
for (let i = 0; i < 60 && !own; i++) {
  await Bun.sleep(100);
  own = await fetch(`http://127.0.0.1:${port}/${nonce}.txt`)
    .then(async (r) => r.ok && await r.text() === nonce).catch(() => false);
}
if (!own) throw new Error("scratch sequencer never came up on its verified port");

const before = Date.now();
const response = await fetch(`http://127.0.0.1:${port}/perflog`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-real-ip": "203.0.113.8" },
  body: JSON.stringify({ ts: 1, ip: "forged-by-client", kind: "provenance-probe" }),
});
const after = Date.now();
check("beacon accepted", response.ok, String(response.status));

const logPath = join(worlds, ".perflogs.jsonl");
const receipt = JSON.parse(readFileSync(logPath, "utf8").trim());
check("server-observed IP cannot be replaced by payload",
  receipt.ip === "203.0.113.8", JSON.stringify(receipt));
check("server timestamp cannot be replaced by payload",
  Number.isFinite(receipt.ts) && receipt.ts >= before && receipt.ts <= after,
  JSON.stringify(receipt));
check("ordinary client fields survive", receipt.kind === "provenance-probe", JSON.stringify(receipt));

cleanup();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
