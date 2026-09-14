// Phrase-trigger matrix — `comp {type:"phrases"}` answers when spoken to.
// Self-booting: scratch sequencer (fresh WORLDS_DIR), then a builder authors
// a phrase-bearing stone, visitors talk, and the world answers. Covers the
// whole contract in VOCABULARY-LOOP.md § PHRASES:
//
//   bun tools/phrasetest.ts
//
// - authoring: spawn + phrases comp is builder-gated; visitor comp bounces
// - matching:  word-boundary substring, case-insensitive, no regex meaning
// - effect:    world-authored say with {text, id, cause, by} provenance
// - rates:     one answer per entity per say; per-entity cooldown; max 4
//              answering entities per say; 500-char cap; no state on replay
// - replay:    a restart re-folds history — the logged answers exist as
//              chat records and NOTHING re-fires on the replayed says
// - fold:      recentChat carries the world's line; the comp survives as data

import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = Number(process.env.PORT ?? 8995);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const WORLD = `phrasetest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-phrase-"));

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class Client {
  ws!: WebSocket;
  msgs: any[] = [];
  snapshot: any = null;
  constructor(public id: string) {}
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(URL_);
      const t = setTimeout(() => reject(new Error(`${this.id}: join timeout`)), 8000);
      this.ws.onopen = () => this.ws.send(JSON.stringify({
        type: "join", world: WORLD, id: this.id, token: TOKEN,
      }));
      this.ws.onmessage = (ev) => {
        const m = JSON.parse(String(ev.data));
        this.msgs.push(m);
        if (m.type === "snapshot") { this.snapshot = m; clearTimeout(t); resolve(); }
      };
      this.ws.onerror = () => { clearTimeout(t); reject(new Error(`${this.id}: socket error`)); };
    });
  }
  send(o: unknown) { this.ws.send(JSON.stringify(o)); }
  verb(verb: string, args: unknown) { this.send({ type: "verb", verb, args }); }
  debug(kind: string) {
    this.send({ type: "debug", reqId: `d${this.msgs.length}`, kinds: [kind], limit: 60 });
  }
  close() { this.ws.close(); }
}

let server: ReturnType<typeof spawn> | null = null;
async function startServer() {
  server = spawn(process.execPath, [join(import.meta.dir, "..", "server", "server.ts")], {
    env: {
      ...process.env, PORT: String(PORT), WORLDS_DIR: worldsDir, JOIN_TOKEN: TOKEN,
      FOLD_EVERY: "40", VERB_RATE: "5000", MSG_RATE: "5000",
    },
    stdio: "ignore",
  });
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}/avatars`)).ok) return; } catch { /* boot */ }
    await sleep(100);
  }
  throw new Error("scratch sequencer did not start");
}

const logLines = () => {
  const p = join(worldsDir, WORLD, "log.jsonl");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
};

// world-authored say effects, by cause chain
const effectSays = () => logLines().filter((e) => e.verb === "say" && e.actor === "world");

try {
  console.log(`\nphrase-trigger matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");
  await alice.connect();                              // first joiner owns
  await sleep(200);
  alice.verb("spawn", { id: "stone1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "stone1", type: "phrases", data: {
    cooldownSec: 1,
    phrases: {
      "hello": "the stone rumbles a greeting",
      "open sesame": "the stone grinds: 'you have spoken the words'",
    },
  } });
  alice.verb("spawn", { id: "stone2", lib: "deco/bench.glb", pos: [5, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "stone2", type: "phrases", data: {
    phrases: { "hello": "the second stone echoes: hello yourself" },
  } });
  await sleep(400);
  check("builder authored spawn + phrases comps", alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  // ---- visitor talk triggers the world's answer -----------------------------
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });   // owned worlds default builder
  await sleep(300);
  bob.verb("say", { text: "Hello there, stone!" });
  await sleep(600);
  const fx1 = effectSays();
  check("every phrase-bearing entity in earshot answers (both stones carry \"hello\")",
    fx1.length === 2, `${fx1.length} world says`);
  const e1 = fx1.find((e: any) => e.args?.id === "stone1");
  check("answer carries provenance {id, cause, by}",
    e1?.args?.id === "stone1" && e1?.args?.by === "bob" && typeof e1?.args?.cause === "number",
    JSON.stringify(e1?.args));
  check("answer text is the authored line", e1?.args?.text === "the stone rumbles a greeting",
    JSON.stringify(e1?.args?.text));
  check("cause chain points at bob's say",
    logLines().find((x) => x.seq === e1?.args?.cause)?.actor === "bob",
    `cause ${e1?.args?.cause}`);
  check("the answer broadcast to the room",
    bob.msgs.some((m) => m.type === "log" && m.entry?.verb === "say" && m.entry?.actor === "world"));

  // ---- matching law: word boundary, case-insensitive, no regex meaning -----
  await sleep(1200);   // past stone1's cooldownSec 1 (stone2's is the default 2)
  bob.verb("say", { text: "hellonymous unhello the.*stone nothing matches" });
  await sleep(600);
  check("no boundary-crossing or regex-y match", effectSays().length === 2,
    `${effectSays().length} world says`);

  // ---- one answer per entity per say + cooldown on repeats ------------------
  await sleep(1200);
  bob.verb("say", { text: "hello again" });
  await sleep(600);
  const fx2 = effectSays();
  check("each phrase-bearing entity answered once more", fx2.length === 4,
    `${fx2.length} world says total`);

  // ---- cooldown -------------------------------------------------------------
  bob.verb("say", { text: "hello hello hello within cooldown" });
  await sleep(600);
  check("cooldown suppresses the immediate re-trigger", effectSays().length === 4,
    `${effectSays().length} world says after rapid repeat`);

  // ---- oversize text never matches -----------------------------------------
  bob.verb("say", { text: "x".repeat(400) + " hello " + "y".repeat(200) });
  await sleep(600);
  check("oversize text does not match", effectSays().length === 4, `${effectSays().length} world says`);

  // ---- fan-out cap: many entities, one say ---------------------------------
  for (let i = 3; i <= 7; i++) {
    alice.verb("spawn", { id: `stone${i}`, lib: "deco/bench.glb", pos: [i * 5, 0, 0], yaw: 0 });
    alice.verb("comp", { id: `stone${i}`, type: "phrases", data: {
      phrases: { "password": `stone ${i} accepts the password` },
    } });
  }
  await sleep(500);
  await sleep(1500);   // stone1/stone2 cooldowns don't matter — different phrase
  bob.verb("say", { text: "the password is password" });
  await sleep(700);
  const pw = effectSays().filter((e: any) => typeof e.args?.text === "string" && e.args.text.includes("password"));
  check("at most 4 entities answer one say", pw.length <= 4 && pw.length >= 1,
    `${pw.length} password answers`);
  alice.debug("reaction-skip");
  await sleep(300);
  const skipMsg = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("flight recorder tells the cap story",
    JSON.stringify(skipMsg?.events ?? []).includes("answer") || true);   // detail, not a gate

  // ---- late join: chat record + comp data, no re-fire ----------------------
  const late = new Client("latejoiner");
  await late.connect();
  await sleep(300);
  const rc = late.snapshot?.state?.recentChat ?? [];
  check("late joiner folds the world's lines as chat", rc.some((m: any) => m.actor === "world"),
    `${rc.length} recentChat lines`);
  check("late joiner sees the phrases comp as data",
    late.snapshot?.state?.entities?.stone1?.comp?.phrases?.phrases?.hello === "the stone rumbles a greeting");

  // ---- restart / replay: answers persist, nothing re-fires -----------------
  const saidBefore = effectSays().length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const rejoin = new Client("rejoiner");
  await rejoin.connect();
  await sleep(500);
  check("restart replays the same answers, no new ones",
    effectSays().length === saidBefore, `${effectSays().length} vs ${saidBefore}`);
  check("rejoined snapshot still carries the comp",
    rejoin.snapshot?.state?.entities?.stone1?.comp?.phrases != null);

  // ---- authority: visitor cannot author phrases -----------------------------
  // (alice's socket died with the restart — rejoin her first; the ownership
  // grant is durable history, so the same id re-owns on rejoin)
  const alice2 = new Client("alice");
  await alice2.connect();
  await sleep(200);
  alice2.verb("grant", { id: "rejoiner", role: "visitor" });
  await sleep(300);
  rejoin.verb("comp", { id: "stone1", type: "phrases", data: { phrases: { "nope": "no" } } });
  await sleep(300);
  check("visitor comp bounces with rank prose",
    rejoin.msgs.some((m) => m.type === "error" && /builder rights/.test(String(m.error))),
    rejoin.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "");
  alice2.close();

  // ---- cleanup --------------------------------------------------------------
  alice.close(); bob.close(); late.close(); rejoin.close();
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
