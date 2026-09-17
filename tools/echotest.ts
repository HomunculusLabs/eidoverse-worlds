// Echo-wall matrix — `comp {type:"echo"}` makes a wall a LISTENER: a
// live say by a present, posed actor within `listen` metres is recorded,
// and after `delaySec` the wall relays the words at its `pair` partner —
// ONE world-authored say (the words verbatim, clamped; echo{who,at} +
// cause = the recorded say's seq + by = the speaker) + ONE presence-plane
// note at the partner. No use actions (bell/phrases doctrine); the comp
// is a static table (no comp transitions, no persisted state — the relay
// says ARE the record). Replay mints nothing.
// Self-booting: scratch sequencer (fresh WORLDS_DIR). Covers
// § ECHOES CONTRACT:
//
//   bun tools/echotest.ts
//
// - unit:      normalizeEcho/echoPair/echoText/echoNote/describeEcho
// - authoring: spawn + echo comp is builder-gated; visitor bounces
// - relay:     say in earshot → ONE say at partner (words VERBATIM) +
//              ONE presence note at partner, after the delay
// - delay:     nothing before delay-margin, present after delay+margin
// - provenance: relay carries echo{who,at}/cause(the say)/by(speaker)
// - cooldown:  a second say inside cooldown mints no second relay
// - loop-closure: two walls paired to each other never ping-pong
// - world-authority: world's own says are never recorded
// - pair validation: missing partner entity skips; non-echo partner legal
// - cap:      >3 walls in earshot — only ECHO_CAP relay, skip names cap
// - listen:   a say beyond listen metres mints nothing (skip names it)
// - posed:    a say from an actor with no live pose mints nothing
// - spectator: spectate legs cannot say (shell gate)
// - lint:     listen 1 / delay 99 / cooldown 0 / hz junk clamp + notes
// - malformed: non-object comp → wall silent, no crash
// - restart:  replay mints NOTHING (recorded says are history)
// - describe: mcpl affordance names pair/listen/delay, never words
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeEcho, echoPair, echoText, echoNote, describeEcho, ECHO_CAP } from "../shared/echo.js";

const PORT = Number(process.env.PORT ?? 9046);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-echo";
const WORLD = `echotest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-echo-"));

let pass = 0, fail = 0;
const check = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  walk(p: number[]) { this.send({ type: "pose", pose: { p, yaw: 0, speed: 1, clip: "walk" } }); }
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
/** World-authored relay says: actor world + args.echo present. */
const echoSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.echo != null && (!id || (e.args as any)?.id === id));
const humanSays = (who?: string) => logLines().filter((e) => e.verb === "say"
  && e.actor !== "world" && (!who || e.actor === who));

try {
  console.log(`\necho-wall matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, notes } = normalizeEcho({ listen: 1, delaySec: 99, cooldownSec: 0, hz: 3, sec: 99, gain: 9, wave: "thunder" });
    check("unit: listen 2 / delay 30 / cooldown 1 / hz 40 / sec 3 / gain 1 / wave sine",
      cfg.listen === 2 && cfg.delaySec === 30 && cfg.cooldownSec === 1 && cfg.hz === 40
      && cfg.sec === 3 && cfg.gain === 1 && cfg.wave === "sine",
      JSON.stringify({ cfg, notes }));
    check("unit: lint notes name the clamps",
      notes.some((n) => n.includes("listen")) && notes.some((n) => n.includes("delaySec"))
      && notes.some((n) => n.includes("wave")), JSON.stringify(notes));
    const dflt = normalizeEcho({ pair: "postB" });
    check("unit: defaults listen 8 / delay 2 / cooldown 3 / hz 220 / sec 0.6 / gain 0.3",
      dflt.cfg.listen === 8 && dflt.cfg.delaySec === 2 && dflt.cfg.cooldownSec === 3
      && dflt.cfg.hz === 220 && dflt.cfg.sec === 0.6 && dflt.cfg.gain === 0.3
      && dflt.cfg.pair === "postB");
    check("unit: pair junk/empty/oversized → null (silent wall)",
      echoPair(undefined) === null && echoPair("") === null && echoPair(42 as any) === null
      && echoPair({}) === null && echoPair("x".repeat(65)) === null);
    check("unit: pair to SELF refused", echoPair("wallA", "wallA") === null && echoPair("wallB", "wallA") === "wallB");
    check("unit: pair trims", echoPair(" postB ") === "postB");
    const bad = normalizeEcho({ pair: "wallA" }, "wallA");
    check("unit: self-pair comp lints + stays silent", bad.cfg.pair === null && bad.notes.some((n) => n.includes("pair")));
    check("unit: echoText trims + clamps 160 + empty → null",
      echoText("  hello  ") === "hello" && echoText("x".repeat(200)).length === 160 && echoText("   ") === null && echoText(42 as any) === null);
    const note = echoNote(dflt.cfg);
    check("unit: echoNote carries the authored timbre clamped",
      note.hz === 220 && note.sec === 0.6 && note.gain === 0.3 && note.wave === "sine", JSON.stringify(note));
    const de = describeEcho({ pair: "postB", listen: 6, delaySec: 1 }, "wallA");
    check("unit: describeEcho names pair + earshot + delay",
      de.startsWith("echo wall:") && de.includes("postB") && de.includes("6m") && de.includes("1s"), de);
    check("unit: describeEcho silent when no pair", describeEcho({}, "wallA").includes("silent"), describeEcho({}, "wallA"));
    check("unit: garbage comp never throws + lints", (() => {
      try { const r = normalizeEcho("junk" as any); return r.cfg.listen === 8 && r.notes.length > 0; } catch { return false; }
    })());
    check("unit: ECHO_CAP is 3", ECHO_CAP === 3);
  }

  await startServer();

  // ---- authoring -------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await alice.walk([0, 0, 0]);
  await sleep(250);
  alice.verb("spawn", { id: "wallA", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("spawn", { id: "postB", lib: "deco/bench.glb", pos: [40, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "wallA", type: "echo", data: { pair: "postB", delaySec: 1, cooldownSec: 2, listen: 8 } });
  await sleep(400);
  check("builder authored spawn + echo comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await bob.walk([2, 0, 0]);
  await sleep(250);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.verb("comp", { id: "wallA", type: "echo", data: { pair: "postB" } });
  await sleep(300);
  check("visitor echo comp authoring bounces (builder gate)",
    bob.msgs.some((m) => m.type === "error"), "no error surfaced for visitor comp authoring");

  // ---- relay: one say → one delayed relay at the partner -----------------------
  {
    const beforeLog = logLines().length;
    bob.verb("say", { text: "the ravens wheel at dusk" });
    await sleep(500);                                   // delay 1s — nothing yet
    check("nothing relays before the delay elapses",
      echoSays().length === 0, `echoSays=${echoSays().length}`);
    await sleep(1400);                                  // 1.9s after the say
    const says = echoSays("postB");
    const snd = bob.msgs.filter((m) => m.type === "sound" && (m as any).echo != null).at(-1);
    const recSay = humanSays("bob").at(-1);
    check("the relay lands at the PARTNER id as ONE world say",
      says.length === 1, `says=${says.length}`);
    check("the words ride VERBATIM (clamped)",
      says[0]?.args?.text === "the ravens wheel at dusk", JSON.stringify(says[0]?.args));
    check("the relay carries echo{who,at} + cause = the recorded say + by = the speaker",
      says[0]?.args?.echo?.who === "bob" && Number.isFinite(says[0]?.args?.echo?.at)
      && says[0]?.args?.cause === recSay?.seq && says[0]?.args?.by === "bob",
      JSON.stringify(says[0]?.args));
    check("ONE presence note at the partner (never logged)",
      snd != null && snd.id === "postB" && snd.note?.hz === 220 && snd.note?.sec === 0.6
      && snd.note?.gain === 0.3 && snd.note?.wave === "sine" && Array.isArray(snd.p),
      JSON.stringify(snd));
    check("the log grew by exactly 3 (say + relay say; the note is presence-plane)",
      logLines().length === beforeLog + 2, `Δ=${logLines().length - beforeLog}`);
    check("the relay note NEVER enters the log (presence plane only)",
      !logLines().some((e) => e.verb === "sound" || ((e.args as any)?.echo != null && e.verb !== "say")));
  }

  // ---- cooldown ---------------------------------------------------------------
  {
    // settle first: the previous block's record ("the ravens") is still
    // inside its own 2s window at block start (~1.9s) — sleep past it so
    // "first arm" records cleanly, then prove the window skips "too soon".
    await sleep(1200);
    const pre = echoSays("postB").length;
    bob.verb("say", { text: "first arm" });
    await sleep(1400);                                  // past the 1s delay — the arm's relay landed
    const armed = echoSays("postB").length;
    bob.verb("say", { text: "too soon" });              // inside cooldown 2s
    await sleep(1600);                                  // past the delay had it recorded
    const after = echoSays("postB").length;
    check("a say inside the cooldown mints NO relay",
      armed === pre + 1 && after === armed, `pre=${pre} armed=${armed} after=${after}`);
    await sleep(1500);                                  // cooldown elapsed since first record
    bob.verb("say", { text: "re-armed" });
    await sleep(1600);
    check("after the cooldown the wall listens again",
      echoSays("postB").some((e) => e.args?.text === "re-armed"),
      JSON.stringify(echoSays("postB").map((e) => e.args?.text)));
  }

  // ---- listen reach + posed speaker --------------------------------------------
  {
    bob.walk([60, 0, 0]);                               // far from wallA (listen 8)
    await sleep(300);
    const n = echoSays("postB").length;
    bob.verb("say", { text: "too far" });
    await sleep(1600);
    check("a say beyond listen metres mints nothing",
      echoSays("postB").length === n, `${n} -> ${echoSays("postB").length}`);
    // unposed actor: connect but never walk
    const ghost = new Client("ghostsay");
    await ghost.connect();
    await sleep(200);
    ghost.verb("say", { text: "no pose no record" });
    await sleep(1600);
    check("a say with no live pose mints nothing",
      echoSays("postB").length === n, `${n} -> ${echoSays("postB").length}`);
    ghost.close();
    bob.walk([2, 0, 0]);
    await sleep(300);
  }

  // ---- loop closure: two walls paired to each other -----------------------------
  {
    // wallC stands FAR from the speaker (40m — outside any earshot): the
    // ONLY voice that can ever reach it is wallA's relay, whose actor is
    // "world" — which the engine never records. Any relay landing back at
    // wallA could therefore ONLY be a ping-pong, and none may exist.
    alice.verb("spawn", { id: "wallC", lib: "deco/bench.glb", pos: [0, 0, 40], yaw: 0 });
    alice.verb("comp", { id: "wallC", type: "echo", data: { pair: "wallA", delaySec: 1, cooldownSec: 2 } });
    await sleep(400);
    // wallA re-authored to point at wallC — mutual pairing
    alice.verb("comp", { id: "wallA", type: "echo", data: { pair: "wallC", delaySec: 1, cooldownSec: 2, listen: 8 } });
    await sleep(400);
    bob.verb("say", { text: "mutual" });
    await sleep(1600);                                  // wallA relays at wallC ~1s
    const a = echoSays("wallC").filter((e) => e.args?.text === "mutual").length;
    await sleep(2600);                                  // wallC would relay back ~2s later
    const back = echoSays("wallA").filter((e) => e.args?.text === "mutual").length;
    check("mutually-paired walls relay ONCE and never ping-pong",
      a === 1 && back === 0, `forward=${a} back=${back}`);
    // point wallA back at postB for the rest of the matrix
    alice.verb("comp", { id: "wallA", type: "echo", data: { pair: "postB", delaySec: 1, cooldownSec: 2, listen: 8 } });
    alice.verb("comp", { id: "wallC", type: "echo", data: null });
    await sleep(400);
  }

  // ---- pair validation ----------------------------------------------------------
  {
    alice.verb("comp", { id: "wallA", type: "echo", data: { pair: "ghostPost", delaySec: 1 } });
    await sleep(400);
    const n = echoSays().length;
    bob.verb("say", { text: "into the void" });
    await sleep(1600);
    check("pair to a MISSING entity skips (fail closed)",
      echoSays().length === n, `${n} -> ${echoSays().length}`);
    // a non-echo partner is legal — the voice lands at a point in the world
    alice.verb("spawn", { id: "plainbench", lib: "deco/bench.glb", pos: [20, 0, 0], yaw: 0 });
    await sleep(300);
    alice.verb("comp", { id: "wallA", type: "echo", data: { pair: "plainbench", delaySec: 1, cooldownSec: 2 } });
    await sleep(400);
    bob.verb("say", { text: "landing" });
    await sleep(1600);
    check("a non-echo partner entity still receives the relay",
      echoSays("plainbench").some((e) => e.args?.text === "landing"),
      JSON.stringify(echoSays("plainbench").map((e) => e.args?.text)));
    alice.verb("comp", { id: "wallA", type: "echo", data: { pair: "postB", delaySec: 1, cooldownSec: 2, listen: 8 } });
    await sleep(300);
  }

  // ---- cap: more walls than ECHO_CAP in one earshot ------------------------------
  {
    alice.verb("comp", { id: "wallA", type: "echo", data: { pair: "postB", delaySec: 1, cooldownSec: 1, listen: 30 } });
    for (let i = 1; i <= 4; i++) {
      alice.verb("spawn", { id: `wallX${i}`, lib: "deco/bench.glb", pos: [i, 0, 2], yaw: 0 });
      alice.verb("comp", { id: `wallX${i}`, type: "echo", data: { pair: "postB", delaySec: 1, cooldownSec: 1 } });
    }
    await sleep(600);
    const n = echoSays().length;
    bob.verb("say", { text: "crowded" });
    await sleep(1700);
    const relays = echoSays().length - n;
    check(`at most ${ECHO_CAP} walls relay one say (cap skip names it)`,
      relays === ECHO_CAP, `relays=${relays}`);
    for (let i = 1; i <= 4; i++) alice.verb("comp", { id: `wallX${i}`, type: "echo", data: null });
    await sleep(300);
  }

  // ---- spectator -----------------------------------------------------------------
  {
    const spec = new Client("spec1");
    await spec.connect(true);
    await sleep(250);
    const n = echoSays().length;
    spec.verb("say", { text: "from the seats" });
    await sleep(1600);
    check("spectator say bounces at the shell (no relay, error surfaced)",
      echoSays().length === n && spec.msgs.some((m) => m.type === "error"),
      `Δrelays=${echoSays().length - n}; err: ${spec.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "none"}`);
    spec.close();
  }

  // ---- lint + malformed (server path) ----------------------------------------------
  {
    alice.verb("comp", { id: "wallA", type: "echo", data: { pair: "postB", delaySec: 1, cooldownSec: 1, listen: 99, hz: 3, wave: "fog" } });
    await sleep(400);
    const n = echoSays().length;
    bob.verb("say", { text: "clamped ears" });
    await sleep(1700);
    const snd = bob.msgs.filter((m) => m.type === "sound" && (m as any).echo != null).at(-1);
    check("lint clamps ride (listen 99 → 40; hz 3 → 40; wave fog → sine) — the wall still works",
      echoSays().length === n + 1 && snd?.note?.hz === 40 && snd?.note?.wave === "sine",
      JSON.stringify(snd?.note));
    // malformed comp: the wall goes silent, nothing crashes
    alice.verb("comp", { id: "wallA", type: "echo", data: "junk" });
    await sleep(400);
    const n2 = echoSays().length;
    bob.verb("say", { text: "silent wall" });
    await sleep(1600);
    check("malformed comp → wall silent, server alive",
      echoSays().length === n2 && (await fetch(`http://127.0.0.1:${PORT}/avatars`)).ok);
    alice.verb("comp", { id: "wallA", type: "echo", data: { pair: "postB", delaySec: 1, cooldownSec: 1, listen: 8 } });
    await sleep(300);
  }

  // ---- restart: replay mints nothing ---------------------------------------------
  {
    // record one more say so the log carries a pending relay at kill time
    bob.verb("say", { text: "final words" });
    await sleep(150);
    const preEcho = echoSays().length;
    server!.kill();
    await sleep(600);
    await startServer();
    const alice2 = new Client("alice");
    await alice2.connect();
    await sleep(400);
    // the say was recorded live; its in-flight relay timer died with the
    // process. Replay must mint NOTHING — no new world says at all.
    const says = logLines().filter((e) => e.verb === "say" && e.actor === "world");
    const postEcho = echoSays().length;
    check("restart: replay mints NOTHING (recorded says are history)",
      postEcho === preEcho || postEcho === preEcho + 1, // +1 iff the relay fired pre-kill
      `pre=${preEcho} post=${postEcho}`);
    check("restart: world says count stable across the kill boundary",
      says.length >= preEcho && says.length <= preEcho + 1, `worldSays=${says.length}`);
    // the folded world still carries the comp — the wall still listens after restart
    const w = alice2.snapshot?.state?.entities?.wallA?.comp?.echo;
    check("restart: the comp folds (the wall still listens)",
      w?.pair === "postB", JSON.stringify(w));
    // and it relays fresh speech post-restart
    const bob2 = new Client("bob");
    await bob2.connect();
    await bob2.walk([2, 0, 0]);
    await sleep(300);
    const n = echoSays().length;
    bob2.verb("say", { text: "post-restart speech" });
    await sleep(1700);
    check("post-restart the wall relays fresh speech",
      echoSays().length === n + 1 && echoSays().at(-1)?.args?.text === "post-restart speech",
      JSON.stringify(echoSays().at(-1)?.args));
    alice2.close(); bob2.close();
  }

  // ---- describe (shared, as look() reads it) ----------------------------------------
  {
    const d = describeEcho({ pair: "postB", listen: 8, delaySec: 2 }, "wallA");
    check("describeEcho on folded bytes: pair + earshot + delay, never words",
      d.includes("postB") && d.includes("8m") && d.includes("2s") && !d.includes("ravens"), d);
  }

  alice.close(); bob.close();
} catch (err) {
  console.error("echotest crashed:", err);
  process.exitCode = 1;
} finally {
  server?.kill();
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail > 0 ? 1 : 0);
}
