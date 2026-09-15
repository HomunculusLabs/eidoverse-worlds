// Proximity-trigger matrix — `comp {type:"proximity"}` makes a thing greet
// arrivals and bid farewells. Self-booting: scratch sequencer (fresh
// WORLDS_DIR), builder authors triggers, visitors WALK (pose messages), and
// the world answers on boundary crossings. Covers the contract in
// VOCABULARY-LOOP.md § PROXIMITY:
//
//   bun tools/proxtest.ts
//
// - authoring:  spawn + proximity comp is builder-gated; visitor comp bounces
// - triggering: enter says on crossing radius; hysteresis band (radius..exitRadius)
//               does not flap; exit says only past exitRadius
// - spam:       standing inside emits nothing further (1Hz sweep, transition-only)
// - re-arm:     exit disarms for exitSec — out-and-back does not re-welcome
// - cooldown:   per (entity,visitor) pair, an enter says once per cooldownSec
// - cap:        at most 8 triggers fire per sweep; overflow skips (prox-cap)
// - spectator:  spectate legs never occupy
// - lint:       out-of-range numbers clamp with a prox-lint note
// - removal:    nulling the comp drops occupancy silently (prox-skip)
// - restart:    replay mints nothing; occupancy rebuilds from the say ring;
//               a fresh approach re-welcomes (documented re-welcome)
// - fold:       late joiner sees the lines as ordinary chat

import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = Number(process.env.PORT ?? 8996);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const WORLD = `proxtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-prox-"));

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
  connect(spectate = false): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(URL_);
      const t = setTimeout(() => reject(new Error(`${this.id}: join timeout`)), 8000);
      this.ws.onopen = () => this.ws.send(JSON.stringify({
        type: "join", world: WORLD, id: this.id, token: TOKEN,
        ...(spectate ? { spectate: true } : {}),
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
  /** Walk: an ordinary presence-plane pose at p. */
  walk(p: number[]) { this.send({ type: "pose", pose: { p, yaw: 0, speed: 1, clip: "walk" } }); }
  debug(kind: string) {
    this.send({ type: "debug", reqId: `d${this.msgs.length}`, kinds: [kind], limit: 80 });
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
/** world-authored says that are proximity effects */
const proxSays = () => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.prox != null);

const SWEEP = 1400;   // > the 1s sweep tick

try {
  console.log(`\nproximity-trigger matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");
  await alice.connect();                              // first joiner owns
  await sleep(200);
  alice.verb("spawn", { id: "shrine1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "shrine1", type: "proximity", data: {
    radius: 5, exitRadius: 8, exitSec: 15, cooldownSec: 10,
    enter: "the shrine hums a welcome",
    exit: "the shrine dims, quieter now",
  } });
  alice.verb("spawn", { id: "stone2", lib: "deco/bench.glb", pos: [40, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "stone2", type: "proximity", data: {
    radius: 4, enter: "the wayside stone glows briefly",
  } });
  await sleep(400);
  check("builder authored spawn + proximity comps", alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  // ---- enter: a visitor walks in -------------------------------------------
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });   // owned worlds default builder
  await sleep(300);
  bob.walk([30, 0, 0]);                                   // far from everything
  await sleep(SWEEP);
  check("standing far away says nothing", proxSays().length === 0,
    `${proxSays().length} prox says`);

  bob.walk([2, 0, 0]);                                    // inside radius 5
  await sleep(SWEEP);
  const enters = proxSays().filter((e) => (e.args as any).prox?.enter === "shrine1");
  check("crossing radius says the enter line", enters.length === 1, `${enters.length} enters`);
  const e1 = enters[0];
  check("enter carries provenance {id, by, prox{enter,who}}",
    (e1?.args as any)?.id === "shrine1" && (e1?.args as any)?.by === "bob"
      && (e1?.args as any)?.prox?.who === "bob" && typeof (e1?.args as any)?.prox?.at === "number",
    JSON.stringify(e1?.args));
  check("enter text is the authored line", (e1?.args as any)?.text === "the shrine hums a welcome",
    JSON.stringify(e1?.args?.text));
  check("the enter broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.prox?.who === "bob"));

  // ---- no per-frame spam: standing inside is silent -------------------------
  const saidNow = proxSays().length;
  await sleep(SWEEP * 2);
  check("standing inside emits nothing further (no per-frame spam)",
    proxSays().length === saidNow, `${proxSays().length} vs ${saidNow}`);

  // ---- hysteresis: the band does not flap -----------------------------------
  bob.walk([6, 0, 0]);                                    // past radius 5, inside exitRadius 8
  await sleep(SWEEP + 400);
  check("the hysteresis band does not exit (6 vs radius 5 / exitRadius 8)",
    proxSays().filter((e) => (e.args as any).prox?.exit != null).length === 0,
    `${proxSays().filter((e) => (e.args as any).prox?.exit != null).length} exits`);
  bob.walk([12, 0, 0]);                                   // past exitRadius 8
  await sleep(SWEEP + 400);
  const exits = proxSays().filter((e) => (e.args as any).prox?.exit === "shrine1");
  check("crossing exitRadius says the exit line", exits.length === 1, `${exits.length} exits`);
  const x1 = exits[0];
  check("exit carries prox{exit,who,causeEnter} chain",
    (x1?.args as any)?.prox?.who === "bob"
      && (x1?.args as any)?.prox?.causeEnter === e1?.seq,
    JSON.stringify(x1?.args?.prox));

  // ---- re-arm: out-and-back does not re-welcome -----------------------------
  bob.walk([1, 0, 0]);                                    // straight back in
  await sleep(SWEEP);
  check("re-arm: immediate return does not re-welcome",
    proxSays().filter((e) => (e.args as any).prox?.enter === "shrine1").length === 1,
    `${proxSays().filter((e) => (e.args as any).prox?.enter === "shrine1").length} enters`);
  bob.walk([12, 0, 0]);                                   // back out (silent: enter never said)
  await sleep(SWEEP + 400);
  check("silent occupancy flip exits silently (pair discipline)",
    proxSays().filter((e) => (e.args as any).prox?.exit === "shrine1").length === 1,
    `${proxSays().filter((e) => (e.args as any).prox?.exit === "shrine1").length} exits`);

  // ---- cooldown: a second visitor, then a fast second crossing --------------
  const carol = new Client("carol");
  await carol.connect();
  await sleep(200);
  alice.verb("grant", { id: "carol", role: "visitor" });
  await sleep(300);
  carol.walk([30, 0, 0]);
  await sleep(SWEEP);                                     // cooldown window is per-pair; shrine is disarmed
  carol.walk([3, 0, 0]);                                  // bob's exit was > exitSec ago? no — still armed
  await sleep(SWEEP);
  // shrine1 is disarmed (exitSec 15) — carol's enter may be suppressed by re-arm,
  // which is the authored behavior; wait out the re-arm window and re-approach.
  await sleep(15_000 - SWEEP * 3);                        // total > 15s since bob's exit
  carol.walk([30, 0, 0]);
  await sleep(SWEEP + 300);
  carol.walk([3, 0, 0]);
  await sleep(SWEEP);
  const carolEnters = proxSays().filter((e) => (e.args as any).prox?.enter === "shrine1"
    && (e.args as any).prox?.who === "carol");
  check("after the re-arm window a new visitor is welcomed",
    carolEnters.length === 1, `${carolEnters.length} carol enters`);
  carol.walk([30, 0, 0]);                                 // out
  await sleep(SWEEP + 400);
  const carolExits = proxSays().filter((e) => (e.args as any).prox?.exit === "shrine1"
    && (e.args as any).prox?.who === "carol");
  check("carol's exit says with her causeEnter chain",
    carolExits.length === 1 && (carolExits[0]?.args as any)?.prox?.causeEnter === carolEnters[0]?.seq,
    JSON.stringify(carolExits[0]?.args?.prox));

  // ---- cap: 9 colocated triggers, one crossing ------------------------------
  for (let i = 1; i <= 9; i++) {
    alice.verb("spawn", { id: `capstone${i}`, lib: "deco/bench.glb", pos: [80 + i * 0.1, 0, 0], yaw: 0 });
    alice.verb("comp", { id: `capstone${i}`, type: "proximity", data: {
      radius: 5, enter: `capstone ${i} nods`, exitSec: 15,
    } });
  }
  await sleep(400);
  bob.walk([70, 0, 0]);                                   // approach from afar
  await sleep(SWEEP);
  bob.walk([80.5, 0, 0]);                                 // inside all 9
  await sleep(SWEEP);
  const capEnters = proxSays().filter((e) => String((e.args as any).prox?.enter ?? "").startsWith("capstone"));
  check("at most 8 triggers fire for one crossing", capEnters.length === 8,
    `${capEnters.length} capstone enters`);
  bob.debug("prox-cap");
  await sleep(300);
  const dbg = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("flight recorder tells the cap story",
    JSON.stringify(dbg?.events ?? []).includes("capstone"),
    JSON.stringify(dbg?.events ?? []).slice(0, 200));

  // ---- spectator never occupies ---------------------------------------------
  const eye = new Client("watcher");
  await eye.connect(true);                                // spectate
  await sleep(200);
  eye.walk([0, 0, 0]);                                    // dead center of shrine1's radius
  await sleep(SWEEP * 2);
  check("spectator poses never occupy",
    proxSays().filter((e) => (e.args as any).prox?.who === "watcher").length === 0,
    `${proxSays().filter((e) => (e.args as any).prox?.who === "watcher").length} watcher says`);

  // ---- lint: clamp + note ----------------------------------------------------
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [200, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "linty", type: "proximity", data: { radius: 500, exitSec: 1, enter: "x" } });
  await sleep(SWEEP + 300);
  alice.debug("prox-lint");
  await sleep(300);
  const lint = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("out-of-range numbers clamp with a prox-lint note",
    JSON.stringify(lint?.events ?? []).includes("linty"),
    JSON.stringify(lint?.events ?? []).slice(0, 200));

  // ---- comp removal drops occupancy silently --------------------------------
  bob.walk([40, 0, 0]);                                   // into stone2's radius (4)
  await sleep(SWEEP);
  const s2e = proxSays().filter((e) => (e.args as any).prox?.enter === "stone2");
  check("stone2 welcomes too (defaults: authored exitRadius derived)", s2e.length === 1,
    `${s2e.length} stone2 enters`);
  alice.verb("comp", { id: "stone2", type: "proximity", data: null });
  await sleep(SWEEP * 2);
  const s2x = proxSays().filter((e) => (e.args as any).prox?.exit === "stone2");
  check("nulling the comp drops occupancy silently",
    s2x.length === 0, `${s2x.length} stone2 exits after removal`);

  // ---- late join sees the lines as ordinary chat -----------------------------
  const late = new Client("latejoiner");
  await late.connect();
  await sleep(300);
  const rc = late.snapshot?.state?.recentChat ?? [];
  check("late joiner folds the proximity lines as chat",
    rc.some((m: any) => m.actor === "world"), `${rc.length} recentChat lines`);

  // ---- restart: replay mints nothing; a fresh approach re-welcomes ----------
  const saidBefore = proxSays().length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const rejoin = new Client("rejoiner");
  await rejoin.connect();
  await sleep(SWEEP * 2);
  check("restart replays history, mints nothing", proxSays().length === saidBefore,
    `${proxSays().length} vs ${saidBefore}`);
  const bob2 = new Client("bob");
  await bob2.connect();
  await sleep(300);
  bob2.walk([2, 0, 0]);                                   // fresh approach (occupancy rebuilt: outside)
  await sleep(SWEEP + 300);
  const reEnters = proxSays().filter((e) => (e.args as any).prox?.enter === "shrine1"
    && (e.args as any).prox?.who === "bob");
  check("a fresh approach after restart re-welcomes (documented)",
    reEnters.length === 2, `${reEnters.length} total bob enters`);

  // ---- authority: visitor cannot author proximity ----------------------------
  alice2g: {
    const alice2 = new Client("alice");                   // ownership is durable history
    await alice2.connect();
    await sleep(200);
    alice2.verb("grant", { id: "rejoiner", role: "visitor" });
    await sleep(300);
    rejoin.verb("comp", { id: "shrine1", type: "proximity", data: { enter: "nope" } });
    await sleep(300);
    check("visitor comp bounces with rank prose",
      rejoin.msgs.some((m) => m.type === "error" && /builder rights/.test(String(m.error))),
      rejoin.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "");
    alice2.close();
  }

  // ---- cleanup ---------------------------------------------------------------
  bob.close(); carol.close(); late.close(); rejoin.close(); bob2.close(); eye.close();
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
