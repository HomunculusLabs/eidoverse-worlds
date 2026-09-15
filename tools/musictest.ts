// Music matrix — `comp {type:"music"}` makes a thing PLAYABLE: use
// {action:"ding"} (an authored note name), use {action:"play"} (the first
// authored note), or use {action:"note", n:"C5"|3|442.5} resolves any pitch
// through one shared arithmetic (shared/music.js), and the performance is an
// INSTANTANEOUS CAUSE — the exact force doctrine: the `use` verb is the
// logged audit, the FOLD ignores it, and the sound itself rides the presence
// plane as ONE {type:"sound"} broadcast that is never logged, never folded,
// never replayed. A bell that rang before you arrived is history, not
// audio. Covers § MUSIC CONTRACT:
//
//   bun tools/musictest.ts
//
// - shared math: noteHz names (A4/C5/A3), degree resolution (0/5/-1 over
//                the pentatonic), raw hz, clamp to piano range, hzName
//                round-trip, describeMusic affordance line
// - authoring:   spawn + music comp is builder-gated; visitor comp bounces
// - pass-through: a non-music action on a music entity falls through to
//                other evaluators (no sound, no music writes)
// - fire:        a named note broadcasts ONE sound message with
//                {id, note:{hz,sec,wave,gain}, p, at, by, cause} and mints
//                ZERO log entries beyond the use itself (mint-nothing)
// - resolution:  action "note" with n as name / degree / raw hz; out-of-
//                range hz clamps + lints; unresolvable n skips
// - reserved:    play (first authored note); play with no notes skips
// - reach:       out-of-reach use skips with the distance
// - spectator:   spectate legs cannot use (shell gate)
// - rate caps:   per-entity 8/2s (a crowd hammering one bell), per-world
//                24/2s (many instruments cannot gang into noise) — the use
//                still logs, the sound does not mint
// - lock:        a locked instrument still sounds (lock refuses moves, not
//                use)
// - late join:   folds the standing comp; hears NO past sounds
// - restart:     replay mints no sounds; the log carries ZERO entries with
//                verb "sound" — ever (fold-is-sacred proof)
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = Number(process.env.PORT ?? 8985);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const WORLD = `music-a-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-music-"));

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const close = (a: number, b: number) => Math.abs(a - b) < 0.01;

// shared/music.js is loaded lazily: at RED time it does not exist yet, and
// the matrix must still run its engine checks against the stock server.
let shared: any = null;
try { shared = await import("../shared/music.js"); } catch { /* RED: absent */ }

class Client {
  ws!: WebSocket;
  msgs: any[] = [];
  snapshot: any = null;
  world: string;
  constructor(public id: string, world: string) { this.world = world; }
  connect(spectate = false): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(URL_);
      const t = setTimeout(() => reject(new Error(`${this.id}: join timeout`)), 8000);
      this.ws.onopen = () => this.ws.send(JSON.stringify({
        type: "join", world: this.world, id: this.id, token: TOKEN,
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
  sounds(id?: string) { return this.msgs.filter((m) => m.type === "sound" && (!id || m.id === id)); }
  debug(kind: string) {
    this.send({ type: "debug", reqId: `d${this.msgs.length}`, kinds: [kind], limit: 160 });
  }
  close() { try { this.ws.close(); } catch { /* already gone */ } }
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

const logLines = (world: string) => {
  const p = join(worldsDir, world, "log.jsonl");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
};

async function main() {
  console.log(`music matrix — scratch world ${WORLD} (shared module ${shared ? "loaded" : "ABSENT"})`);
  await startServer();

  // ---- shared math (pure, no server)
  if (shared) {
    check("noteHz resolves names (A4/C5/A3)",
      close(shared.noteHz("A4"), 440) && close(shared.noteHz("C5"), 523.25) && close(shared.noteHz("A3"), 220));
    check("noteHz accepts sharps/flats (C#4/Ab4)",
      close(shared.noteHz("C#4"), 277.18) && close(shared.noteHz("Ab4"), 415.30));
    const pent = shared.normalizeMusic({}).cfg;
    check("degree 0 of pentatonic A3 is the root", close(shared.degreeHz(0, [0, 2, 4, 7, 9], 220), 220));
    check("degree 5 wraps the octave", close(shared.degreeHz(5, [0, 2, 4, 7, 9], 220), 440));
    check("degree -1 descends one step", close(shared.degreeHz(-1, [0, 2, 4, 7, 9], 220), 220 * 2 ** (-3 / 12)));
    check("hzName round-trips a played C5", shared.hzName(523.25) === "C5");
    const desc = shared.describeMusic({ notes: { ding: "C5", dong: 2 } });
    check("describeMusic names the notes + the note hint",
      String(desc).includes("ding") && String(desc).includes("note"), String(desc));
  } else {
    check("shared music module imports", false, "shared/music.js absent (RED)");
  }

  // ---- setup: builder + visitor + one instrument
  const bob = new Client("bob", WORLD);   // builder (first embodied join = owner)
  await bob.connect();
  const alice = new Client("alice", WORLD);   // visitor (rank 0)
  await alice.connect();
  bob.verb("grant", { id: "alice", role: "visitor" });
  await sleep(300);
  await bob.walk([3.5, 0, 2]); await sleep(150);
  bob.verb("spawn", { id: "chime1", lib: "eidoverse/assets/misc/plinth.glb", pos: [2, 0, 2] });
  await sleep(300);

  // ---- authoring is builder-gated
  alice.verb("comp", { id: "chime1", type: "music", data: { notes: { ding: "C5" } } });
  await sleep(300);
  check("visitor music comp bounces (builder-gated)",
    !logLines(WORLD).some((e) => e.verb === "comp" && (e.args as any)?.type === "music" && e.actor === "alice"));
  bob.verb("comp", { id: "chime1", type: "music", data: {
    notes: { ding: "C5", dong: "A3", toot: { n: 442.5, sec: 0.4, wave: "triangle" } },
  } });
  await sleep(300);
  check("builder authors the music comp",
    logLines(WORLD).some((e) => e.verb === "comp" && (e.args as any)?.type === "music" && e.actor === "bob"));

  // ---- pass-through: a non-music action on a music entity
  alice.walk([3, 0, 2]); await sleep(150);
  alice.verb("use", { id: "chime1", action: "ring" });
  await sleep(300);
  check("non-music action passes through (no sound)",
    bob.sounds("chime1").length === 0 && alice.sounds("chime1").length === 0);

  // ---- fire: a named note is ONE presence-plane sound, ZERO log writes
  const logBefore = logLines(WORLD).length;
  alice.verb("use", { id: "chime1", action: "ding" });
  await sleep(400);
  const s1 = bob.sounds("chime1");
  check("named note broadcasts ONE sound message", s1.length === 1, `got ${s1.length}`);
  const snd = s1[s1.length - 1];
  check("sound message carries note{id,note{hz,sec,wave,gain},p,at,by,cause}",
    snd?.id === "chime1" && close(snd?.note?.hz, 523.25) && snd?.note?.sec === 1.2
    && snd?.note?.wave === "sine" && typeof snd?.note?.gain === "number"
    && Array.isArray(snd?.p) && snd?.by === "alice" && typeof snd?.cause === "number",
    JSON.stringify(snd ?? null).slice(0, 200));
  const grown = logLines(WORLD).length - logBefore;
  check("fire mints ZERO log entries beyond the use", grown === 1, `log grew ${grown}`);
  check("the one new entry IS the use",
    logLines(WORLD).at(-1)?.verb === "use" && logLines(WORLD).at(-1)?.actor === "alice");

  // ---- resolution on the reserved "note" action
  const sendNote = async (args: unknown) => {
    const n0 = bob.sounds("chime1").length;
    alice.verb("use", { id: "chime1", action: "note", ...args });
    await sleep(300);
    const arr = bob.sounds("chime1");
    return { count: arr.length - n0, last: arr[arr.length - 1] };
  };
  let r = await sendNote({ n: "C5" });
  check('note action resolves a NAME ("C5")', r.count === 1 && close(r.last?.note?.hz, 523.25),
    JSON.stringify(r.last?.note ?? null));
  r = await sendNote({ n: 3 });
  check("note action resolves a DEGREE (3 → pentatonic step 7)",
    r.count === 1 && close(r.last?.note?.hz, 220 * 2 ** (7 / 12)),
    JSON.stringify(r.last?.note ?? null));
  r = await sendNote({ n: 442.5, sec: 2.5 });
  check("note action resolves RAW hz + sec override",
    r.count === 1 && close(r.last?.note?.hz, 442.5) && r.last?.note?.sec === 2.5);
  r = await sendNote({ n: 20000 });
  check("out-of-range hz clamps to the piano ceiling", r.count === 1 && r.last?.note?.hz === 4186.006,
    JSON.stringify(r.last?.note ?? null));
  if (r.count === 1) {
    alice.debug("music-lint"); await sleep(300);
    const lint = alice.msgs.filter((m) => m.type === "debug").at(-1);
    check("the clamp lints (music-lint)", JSON.stringify(lint?.events ?? []).includes("clamped"),
      JSON.stringify(lint?.events ?? []).slice(0, 160));
  } else check("the clamp lints (music-lint)", false, "no sound fired");
  r = await sendNote({ n: "not a note" });
  check("unresolvable n skips with music-skip", r.count === 0);
  {
    alice.debug("music-skip"); await sleep(300);
    const sk = alice.msgs.filter((m) => m.type === "debug").at(-1);
    check("music-skip names the unresolvable pitch",
      JSON.stringify(sk?.events ?? []).includes("cannot resolve"), JSON.stringify(sk?.events ?? []).slice(0, 160));
  }

  // ---- reserved "play": the first authored note
  {
    const n0 = bob.sounds("chime1").length;
    alice.verb("use", { id: "chime1", action: "play" });
    await sleep(300);
    const arr = bob.sounds("chime1");
    check("play fires the FIRST authored note (ding)",
      arr.length === n0 + 1 && close(arr[arr.length - 1]?.note?.hz, 523.25));
  }

  // ---- authored note object overrides (toot: {n, sec, wave})
  {
    const n0 = bob.sounds("chime1").length;
    alice.verb("use", { id: "chime1", action: "toot" });
    await sleep(300);
    const arr = bob.sounds("chime1");
    check("authored note object carries its own sec/wave",
      arr.length === n0 + 1 && close(arr[arr.length - 1]?.note?.hz, 442.5)
      && arr[arr.length - 1]?.note?.sec === 0.4 && arr[arr.length - 1]?.note?.wave === "triangle",
      JSON.stringify(arr[arr.length - 1]?.note ?? null));
  }

  // ---- play with no notes authored skips
  bob.verb("spawn", { id: "bare1", lib: "eidoverse/assets/misc/plinth.glb", pos: [4, 0, 3] });
  await sleep(300);
  bob.verb("comp", { id: "bare1", type: "music", data: {} });
  await sleep(300);
  {
    const n0 = bob.msgs.filter((m) => m.type === "sound").length;
    bob.verb("use", { id: "bare1", action: "play" });
    await sleep(300);
    check("play with no notes skips (no sound)",
      bob.msgs.filter((m) => m.type === "sound").length === n0);
  }

  // ---- reach gate
  await alice.walk([30, 0, 30]); await sleep(150);
  {
    const n0 = bob.sounds("chime1").length;
    alice.verb("use", { id: "chime1", action: "ding" });
    await sleep(300);
    check("out-of-reach use skips", bob.sounds("chime1").length === n0);
    alice.debug("music-skip"); await sleep(300);
    const sk = alice.msgs.filter((m) => m.type === "debug").at(-1);
    check("reach skip names the distance",
      JSON.stringify(sk?.events ?? []).includes("out of reach"), JSON.stringify(sk?.events ?? []).slice(0, 160));
  }
  await alice.walk([3, 0, 2]); await sleep(150);

  // ---- spectator bounces at the shell
  const spec = new Client("spec", WORLD);
  await spec.connect(true);
  {
    const n0 = bob.sounds("chime1").length;
    spec.verb("use", { id: "chime1", action: "ding" });
    await sleep(300);
    check("spectator use bounces at the shell", bob.sounds("chime1").length === n0);
    spec.close();
  }

  // ---- rate caps: entity 8/2s, world 24/2s (one fast burst, same window)
  await sleep(2200);   // clear the window
  for (const [i, x] of [2, 3, 4, 5].entries()) {
    bob.verb("spawn", { id: `chime${x}`, lib: "eidoverse/assets/misc/plinth.glb", pos: [x, 0, 2] });
    await sleep(200);
    bob.verb("comp", { id: `chime${x}`, type: "music", data: { notes: { ding: "C5" } } });
    await sleep(200);
  }
  await bob.walk([3.5, 0, 2]); await sleep(150);
  const burst = (id: string, n: number) => { for (let i = 0; i < n; i++) bob.verb("use", { id, action: "ding" }); };
  const c0 = (id: string) => bob.sounds(id).length;
  const preBurst: Record<string, number> = { chime1: c0("chime1"), chime2: c0("chime2"), chime3: c0("chime3"), chime4: c0("chime4") };
  burst("chime1", 12); burst("chime2", 12); burst("chime3", 12); burst("chime4", 6);
  await sleep(600);
  const minted = (id: string) => c0(id) - preBurst[id];
  check("per-entity cap: 12 fires on one bell mint 8 sounds", minted("chime1") === 8, `minted ${minted("chime1")}`);
  check("per-world cap: the 25th+ sound in the window does not mint",
    minted("chime2") === 8 && minted("chime3") === 8 && minted("chime4") === 0,
    `c2=${minted("chime2")} c3=${minted("chime3")} c4=${minted("chime4")}`);
  {
    bob.debug("music-skip"); await sleep(300);
    const sk = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("over-cap fires record a rate skip",
      JSON.stringify(sk?.events ?? []).includes("rate"), JSON.stringify(sk?.events ?? []).slice(0, 160));
  }

  // ---- the use still logs when the sound is capped (the gesture happened)
  {
    const uses = logLines(WORLD).filter((e) => e.verb === "use" && (e.args as any)?.id === "chime1");
    check("capped uses still log (the audit is the verb)",
      uses.filter((e) => e.actor === "bob").length >= 12);
  }

  // ---- lock composes: a locked instrument still sounds
  bob.verb("comp", { id: "chime1", type: "lock", data: true });
  await sleep(300);
  await sleep(2200);   // clear the rate window again
  {
    const n0 = bob.sounds("chime1").length;
    alice.verb("use", { id: "chime1", action: "ding" });
    await sleep(400);
    check("a locked instrument still sounds", bob.sounds("chime1").length === n0 + 1);
  }

  // ---- music-trigger flight entry with the cause chain
  {
    alice.debug("music-trigger"); await sleep(300);
    const tr = alice.msgs.filter((m) => m.type === "debug").at(-1);
    check("music-trigger records cause→note",
      JSON.stringify(tr?.events ?? []).includes("cause"), JSON.stringify(tr?.events ?? []).slice(0, 160));
  }

  // ---- late joiner: standing comp folded, NO past sounds replayed
  const late = new Client("latejoin", WORLD);
  await late.connect();
  await sleep(500);
  check("late joiner folds the standing music comp",
    late.snapshot?.state?.entities?.["chime1"]?.comp?.music?.notes?.ding === "C5",
    JSON.stringify(late.snapshot?.state?.entities?.["chime1"]?.comp?.music ?? null).slice(0, 120));
  check("late joiner hears NO replayed sounds", late.sounds().length === 0);

  // ---- restart: replay mints nothing, and the log NEVER carries a sound verb
  const logUseCount = logLines(WORLD).filter((e) => e.verb === "use").length;
  server!.kill("SIGKILL");
  await sleep(500);
  await startServer();
  const fresh = new Client("fresh", WORLD);
  await fresh.connect();
  await sleep(800);
  check("restart replays uses as history (count preserved)",
    logLines(WORLD).filter((e) => e.verb === "use").length === logUseCount);
  check("no sound traffic after restart (replay-inert)", fresh.sounds().length === 0);
  check("the log carries ZERO sound entries, ever",
    !logLines(WORLD).some((e) => e.verb === "sound"));

  server!.kill("SIGKILL");
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e); server?.kill("SIGKILL"); process.exit(1); });
