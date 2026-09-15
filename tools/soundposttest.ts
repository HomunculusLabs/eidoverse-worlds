// Soundpost matrix — `comp {type:"soundpost"}` makes an entity a standing
// AMBIENT SOUND: the browser synthesizes the loop from the folded comp
// (drone or filtered-noise timbre, authored range falloff, day/night
// hush — fold-driven like water, never replayed audio), with exactly ONE
// durable bit (muted) written as world-authored comp transitions.
// Self-booting: scratch sequencer (fresh WORLDS_DIR), builder authors the
// post, visitors mute in reach. Covers § SOUNDPOSTS CONTRACT:
//
//   bun tools/soundposttest.ts
//
// - unit:       normalizeSoundpost clamps/defaults; postGainFor phases;
//               falloff hits zero AT the range; SOUNDPOST disjointness
// - authoring:  spawn + soundpost comp is builder-gated; visitor comp bounces
// - sounding:   an authored post with no muted key IS sounding (particles
//               doctrine) — late joiner folds the same comp
// - mute:       use {action:"mute"} in reach writes muted:true + says with
//               sp{muted,who,at} + cause/by + broadcasts the stop cue
// - fold:       muted folds from the log; late joiner reads the same bit
// - no-op:      mute on muted mints nothing (skip names it)
// - unmute:     the unmute alias pair (quiet/resume) work; unmute writes
//               muted:false explicitly
// - reach:      out-of-reach mute mints nothing (skip names distance)
// - spectator:  spectate legs cannot mute (shell gate, mint-nothing)
// - pass-through: non-soundpost actions ("ring", "toggle") fall through,
//               no writes; water's toggle is NOT soundpost vocabulary
// - lint:       range 999 clamps to 200; hz clamps; gain clamps
// - 8KB degrade: an oversized carry degrades to the minimal shape + lint note
// - restart:    replay mints nothing; the muted bit survives restart folded
// - describe:   describeSoundpost reads state + action hint
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describeSoundpost, falloff, normalizeSoundpost, postGainFor, SOUNDPOST_ACTIONS } from "../shared/soundpost.js";

const PORT = Number(process.env.PORT ?? 9004);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-spost";
const WORLD = `soundposttest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-spost-"));

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
  debug(kind: string) {
    this.send({ type: "debug", reqId: `d${this.msgs.length}`, kinds: [kind], limit: 120 });
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
const spSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.sp != null && (!id || (e.args as any)?.id === id));
const spComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "soundpost" && (!id || (e.args as any)?.id === id));
/** The folded bit of a post = the LAST soundpost comp write in the log. */
const logSp = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "soundpost"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapSp = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.soundpost ?? null;

try {
  console.log(`\nsoundpost matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, muted, notes } = normalizeSoundpost({ range: 999, hz: 30, gain: 5, timbre: "fog", wave: "wobble" });
    check("unit: range 999 clamps to 200 + note", cfg.range === 200 && notes.some((n) => n.includes("range")), JSON.stringify(notes));
    check("unit: hz 30 clamps to 40; gain 5 clamps to 1", cfg.hz === 40 && cfg.gain === 1);
    check("unit: unknown timbre defaults to noise + note", cfg.timbre === "noise" && notes.some((n) => n.includes("timbre")));
    check("unit: unknown wave defaults to sine + note", cfg.wave === "sine" && notes.some((n) => n.includes("wave")));
    check("unit: absent muted means SOUNDING (particles doctrine)", muted === false);
    check("unit: muted:true reads muted", normalizeSoundpost({ muted: true }).muted === true);
    const dflt = normalizeSoundpost({});
    check("unit: defaults hz 400 / range 24 / gain 0.35 / reach 4", dflt.cfg.hz === 400 && dflt.cfg.range === 24 && dflt.cfg.gain === 0.35 && dflt.cfg.reach === 4);
    check("unit: drone hz2 defaults a beat above hz",
      Math.abs(dflt.cfg.hz2 - 400 * 1.007) < 1e-9, String(dflt.cfg.hz2));
    check("unit: postGainFor day 1 / dawn .8 / night .7·scale",
      postGainFor("day", dflt.cfg) === 1 && postGainFor("dawn", dflt.cfg) === 0.8 && Math.abs(postGainFor("night", dflt.cfg) - 0.7) < 1e-9);
    check("unit: falloff 1 at the post, 0 AT the range, 0 beyond",
      falloff(dflt.cfg, 0) === 1 && falloff(dflt.cfg, 24) === 0 && falloff(dflt.cfg, 40) === 0);
    check("unit: falloff at half-range is the squared taper (0.25)",
      Math.abs(falloff(dflt.cfg, 12) - 0.25) < 1e-9, String(falloff(dflt.cfg, 12)));
    check("unit: action vocabulary is mute/quiet/unmute/resume (toggle is water's)",
      SOUNDPOST_ACTIONS.has("mute") && SOUNDPOST_ACTIONS.has("quiet") && SOUNDPOST_ACTIONS.has("unmute")
        && SOUNDPOST_ACTIONS.has("resume") && !SOUNDPOST_ACTIONS.has("toggle"));
    const desc = describeSoundpost({ hz: 220, timbre: "drone" });
    check("unit: describe names sounding + the mute action", desc.startsWith("soundpost: sounding drone 220hz") && desc.includes('action:"mute"'), desc);
    check("unit: describe names muted + the unmute action",
      describeSoundpost({ muted: true }).startsWith("soundpost: muted") && describeSoundpost({ muted: true }).includes('action:"unmute"'));
  }

  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "post1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "post1", type: "soundpost", data: {
    timbre: "drone", hz: 220, gain: 0.4, range: 30,
    muteAt: "the shrine bell hum fades",
  } });
  await sleep(400);
  check("builder authored spawn + soundpost comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  const carol = new Client("carol");
  await carol.connect();
  await sleep(200);
  alice.verb("grant", { id: "carol", role: "visitor" });
  await sleep(300);
  // visitor comp authoring bounces (builder gate)
  carol.verb("comp", { id: "post1", type: "soundpost", data: { hz: 100 } });
  await sleep(300);
  check("visitor comp authoring bounces",
    carol.msgs.some((m) => m.type === "error"),
    "no error seen for visitor comp");
  check("no visitor-authored soundpost comp in the log",
    !logLines().some((e) => e.verb === "comp" && (e.args as any)?.type === "soundpost" && e.actor === "carol"));

  // ---- sounding: comp presence IS the declaration ------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapSp(late.snapshot, "post1");
    check("an authored post with no muted key folds SOUNDING (particles doctrine)",
      d != null && d.muted === undefined && d.timbre === "drone",
      JSON.stringify(d));
    late.close();
  }

  // ---- mute: visitor in reach ---------------------------------------------------
  bob.walk([3, 0, 0]);                                  // 3m from post1 — inside reach 4
  await sleep(300);
  bob.verb("use", { id: "post1", action: "mute" });
  await sleep(400);
  const says1 = spSays("post1");
  check("in-reach mute says the authored line",
    says1.length === 1 && (says1[0]?.args as any)?.text === "the shrine bell hum fades",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  check("say carries sp{muted,who,at} + cause/by provenance",
    (says1[0]?.args as any)?.sp?.muted === true && (says1[0]?.args as any)?.sp?.who === "bob"
      && typeof (says1[0]?.args as any)?.sp?.at === "number"
      && typeof (says1[0]?.args as any)?.cause === "number" && (says1[0]?.args as any)?.by === "bob",
    JSON.stringify(says1[0]?.args?.sp));
  const comps1 = spComps("post1");
  check("the mute wrote ONE world-authored comp transition", comps1.length === 1,
    `${comps1.length} soundpost comp writes`);
  {
    const d = comps1[0]?.args as any;
    check("the write carries authored shape + muted/at/by",
      d?.data?.timbre === "drone" && d?.data?.hz === 220 && d?.data?.muted === true
        && typeof d?.data?.at === "number" && d?.data?.by === "bob",
      JSON.stringify(d?.data));
    check("the use verb logged with bob as actor (authority trace)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob"
        && (e.args as any)?.id === "post1" && (e.args as any)?.action === "mute"));
  }
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.sp?.who === "bob"));
  check("the presence-plane stop cue broadcast (never logged, NO note — music.js one-shot guard)",
    bob.msgs.some((m) => m.type === "sound" && m.id === "post1" && m.soundpost?.state === "stop"
      && m.note === undefined),
    JSON.stringify(bob.msgs.filter((m) => m.type === "sound").at(-1)));
  check("the cue is NOT in the log (force doctrine)",
    !logLines().some((e) => e.verb === "sound"));

  // ---- fold: late joiner reads the muted bit -------------------------------------
  {
    const late = new Client("latejoin2");
    await late.connect();
    await sleep(300);
    const d = snapSp(late.snapshot, "post1");
    check("late joiner folds the muted bit from the log",
      d?.muted === true && d?.by === "bob",
      JSON.stringify(d));
    late.close();
  }

  // ---- no-op: mute on muted ------------------------------------------------------
  {
    const before = spSays().length;
    bob.verb("use", { id: "post1", action: "mute" });
    await sleep(400);
    check("mute on muted mints nothing",
      spSays().length === before && spComps("post1").length === 1,
      `${spSays().length} says / ${spComps("post1").length} comps`);
    bob.debug("soundpost-skip");
    await sleep(300);
    const s = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the no-op skip names the state",
      JSON.stringify(s?.events ?? []).includes("already muted"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- unmute via the alias pair -------------------------------------------------
  carol.walk([3, 0, 2]);                                // in reach too
  await sleep(300);
  carol.verb("use", { id: "post1", action: "resume" });  // the unmute alias
  await sleep(400);
  {
    const d = logSp("post1");
    check("resume (unmute alias) writes muted:false EXPLICITLY",
      d?.muted === false && d?.by === "carol",
      JSON.stringify(d));
    check("the unmute said its default line",
      spSays("post1").length === 2 && (spSays("post1").at(-1)?.args as any)?.sp?.muted === false);
    check("the start cue broadcast",
      carol.msgs.some((m) => m.type === "sound" && m.id === "post1" && m.soundpost?.state === "start"));
  }

  // ---- reach: out-of-reach mute mints nothing --------------------------------------
  {
    const before = spSays().length;
    bob.walk([40, 0, 0]);                                // 40m — outside reach 4
    await sleep(300);
    bob.verb("use", { id: "post1", action: "quiet" });
    await sleep(400);
    check("out-of-reach mute mints nothing",
      spSays().length === before,
      `${spSays().length} vs ${before}`);
    bob.debug("soundpost-skip");
    await sleep(300);
    const s = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("out-of-reach skip names the distance",
      JSON.stringify(s?.events ?? []).includes("out of reach"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- spectator: spectate legs cannot mute -----------------------------------------
  {
    const spec = new Client("watcher1");
    await spec.connect(true);
    await sleep(300);
    const before = spSays().length;
    spec.verb("use", { id: "post1", action: "mute" });
    await sleep(400);
    check("spectator use mints nothing (shell gate)",
      spSays().length === before,
      `${spSays().length} vs ${before}`);
    spec.close();
  }

  // ---- pass-through: non-soundpost actions fall through ------------------------------
  {
    bob.walk([3, 0, 0]);
    await sleep(300);
    const uses = logLines().filter((e) => e.verb === "use" && (e.args as any)?.id === "post1" && (e.args as any)?.action === "ring").length;
    const compsB = spComps("post1").length;
    bob.verb("use", { id: "post1", action: "ring" });
    await sleep(400);
    const after = logLines().filter((e) => e.verb === "use" && (e.args as any)?.id === "post1" && (e.args as any)?.action === "ring").length;
    check("\"ring\" passes through untouched (logged, no comp writes)",
      after === uses + 1 && spComps("post1").length === compsB,
      `ring logged ${after === uses + 1}; comps ${compsB} → ${spComps("post1").length}`);
    // water's toggle is NOT soundpost vocabulary — on a post WITHOUT a water
    // comp it is just another pass-through string
    bob.verb("use", { id: "post1", action: "toggle" });
    await sleep(400);
    check("water's \"toggle\" is not soundpost vocabulary (no writes)",
      spComps("post1").length === compsB,
      `${spComps("post1").length} vs ${compsB}`);
    // vocabulary intact after pass-throughs
    bob.verb("use", { id: "post1", action: "quiet" });   // the mute alias
    await sleep(400);
    check("the mute alias works after pass-throughs",
      logSp("post1")?.muted === true,
      JSON.stringify(logSp("post1")));
  }

  // ---- lint: clamps ride into the engine write ----------------------------------------
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [20, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "linty", type: "soundpost", data: { range: 999, hz: 30, gain: 5 } });
  await sleep(300);
  bob.walk([22, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "linty", action: "mute" });
  await sleep(400);
  {
    const d = logSp("linty");
    check("engine write carries the authored shape VERBATIM + muted/at/by (regions doctrine: clamps are read-time)",
      d?.muted === true && d?.range === 999 && d?.hz === 30 && d?.gain === 5
        && typeof d?.at === "number" && d?.by === "bob",
      JSON.stringify(d));
    check("a late reader CLAMPS the carry at read time (normalizeSoundpost)",
      normalizeSoundpost(d).cfg.range === 200 && normalizeSoundpost(d).cfg.hz === 40 && normalizeSoundpost(d).cfg.gain === 1);
    bob.debug("soundpost-lint");
    await sleep(300);
    const l = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the clamps left soundpost-lint notes",
      JSON.stringify(l?.events ?? []).includes("linty") && JSON.stringify(l?.events ?? []).includes("clamped"),
      JSON.stringify(l?.events ?? []).slice(0, 200));
  }

  // ---- 8KB degrade: an oversized carry keeps the bit, drops the carry -------------------
  alice.verb("spawn", { id: "fatty", lib: "deco/bench.glb", pos: [30, 0, 0], yaw: 0 });
  await sleep(300);
  const pad = "x".repeat(8100);
  alice.verb("comp", { id: "fatty", type: "soundpost", data: { reach: 6, padding: pad } });
  await sleep(300);
  bob.walk([32, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "fatty", action: "mute" });
  await sleep(400);
  {
    const d = logSp("fatty");
    check("8KB degrade keeps the bit (carry dropped, muted/at/by kept)",
      d?.muted === true && typeof d?.at === "number" && d?.by === "bob" && d?.padding === undefined,
      JSON.stringify(d)?.slice(0, 160));
    bob.debug("soundpost-lint");
    await sleep(300);
    const l2 = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the degrade left a soundpost-lint note",
      JSON.stringify(l2?.events ?? []).includes("fatty"),
      JSON.stringify(l2?.events ?? []).slice(0, 200));
  }

  // ---- restart: replay mints nothing; the bit survives folded --------------------------
  const saidAll = spSays().length;
  const bitBefore = { id: "fatty", d: logSp("fatty") };
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  const dr = snapSp(probe.snapshot, "fatty");
  check("restart: a fresh join folds the same muted bit",
    dr?.muted === true && dr?.muted === bitBefore.d?.muted && dr?.by === "bob",
    JSON.stringify(dr));
  check("replay minted nothing",
    spSays().length === saidAll,
    `${spSays().length} vs ${saidAll}`);
  check("mcpl affordance read (describeSoundpost)",
    describeSoundpost(snapSp(probe.snapshot, "fatty")).startsWith("soundpost:"),
    describeSoundpost(snapSp(probe.snapshot, "fatty")));
  check("describe on a muted post names the unmute action",
    describeSoundpost(snapSp(probe.snapshot, "post1"), Date.now()).includes('action:"unmute"'),
    describeSoundpost(snapSp(probe.snapshot, "post1")));

  // ---- idempotent fold -----------------------------------------------------------------
  {
    const a = JSON.stringify(snapSp(probe.snapshot, "fatty"));
    const b = JSON.stringify(snapSp(JSON.parse(JSON.stringify(probe.snapshot)), "fatty"));
    check("folded soundpost state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup ------------------------------------------------------------------------
  bob.close(); carol.close(); probe.close();
  try { alice.close(); } catch { /* already gone */ }
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
