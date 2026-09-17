// Wish matrix — `comp {type:"wish"}` makes a water feature a WISHING
// water: use {action:"wish", text?} tosses a coin — ONE world-authored
// comp transition (the wish log, guestbook caps/trim verbatim — the log
// is the only durable state) + ONE say that NARRATES THE TOSS, never the
// words + ONE presence-plane coin sound derived from the water's own
// fold (splash into flowing water, dry clink on stone). Late join,
// restart, replay and fork read the identical wish log.
// Self-booting: scratch sequencer (fresh WORLDS_DIR). Covers
// § WISHES CONTRACT:
//
//   bun tools/wishtest.ts
//
// - unit:      normalizeWish/coinNote/wishLine/describeWish pure math
// - authoring: spawn + wish comp is builder-gated; visitor bounces
// - toss:      use {action:"wish", text} writes log + say (no words in
//              the say) + presence splash
// - silent:    no text is a legal wish (text:"")
// - trim:      at cap the OLDEST evicts (guestbookTrim verbatim)
// - water bit: stilled water → dry clink; re-flowed → splash again
// - fold:      log folds; late joiner reads the same wishes
// - pass-through: non-wish actions ("ring", "flow") fall through, no
//              writes (flow belongs to the water family)
// - reach:     out-of-reach wish mints nothing (skip names distance)
// - spectator: spectate legs cannot wish (shell gate)
// - lint:      cap 0 / cap 99999 clamp to [1,64]
// - 8KB:       oversized carry degrades to entries + lint note
// - restart:   replay mints nothing; the wish log survives restart folded
// - describe:  mcpl affordance reads count + splash/clink + hint
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeWish, coinNote, wishLine, describeWish, guestbookTrim } from "../shared/wish.js";

const PORT = Number(process.env.PORT ?? 9042);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-wish";
const WORLD = `wishtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-wish-"));

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
const wishSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.wish != null && (!id || (e.args as any)?.id === id));
const wishComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "wish" && (!id || (e.args as any)?.id === id));
/** The folded wish log of a feature = the LAST wish comp write in the log. */
const logWish = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "wish"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapWish = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.wish ?? null;
const snapComp = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp ?? null;

try {
  console.log(`\nwish matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, notes } = normalizeWish({ cap: 0, reach: 99, hz: 12, sec: 99, gain: 9 });
    check("unit: cap clamps to 1, reach 12, hz 200, sec 3, gain 1",
      cfg.cap === 1 && cfg.reach === 12 && cfg.hz === 200 && cfg.sec === 3 && cfg.gain === 1,
      JSON.stringify({ cfg, notes }));
    check("unit: lint notes name every clamp",
      notes.some((n) => n.includes("cap")) && notes.some((n) => n.includes("hz")), JSON.stringify(notes));
    const dflt = normalizeWish({});
    check("unit: defaults cap 20 / reach 4 / hz 1568 / sec 0.35 / gain 0.5 / wave sine",
      dflt.cfg.cap === 20 && dflt.cfg.reach === 4 && dflt.cfg.hz === 1568
      && dflt.cfg.sec === 0.35 && dflt.cfg.gain === 0.5 && dflt.cfg.wave === "sine");
    const big = normalizeWish({ cap: 99999 });
    check("unit: cap 99999 clamps to 64", big.cfg.cap === 64 && big.notes.some((n) => n.includes("cap")));
    const wave = normalizeWish({ wave: "thunder" });
    check("unit: unknown wave defaults to sine + lint", wave.cfg.wave === "sine" && wave.notes.some((n) => n.includes("wave")));
    check("unit: malformed entries rows drop, SILENT rows keep (the family's deviation)",
      normalizeWish({ entries: [{ text: "x" }, null, { who: "bob" }, { who: "bob", text: "keep" }] }).entries.length === 2
      && normalizeWish({ entries: "junk" }).entries.length === 0);
    // coinNote derivation
    const c2 = normalizeWish({ hz: 1000, sec: 1, gain: 1 }).cfg;
    const splash = coinNote(c2, { on: true });
    const clink = coinNote(c2, { on: false });
    check("unit: flowing water → splash (authored note verbatim)",
      splash.hz === 1000 && splash.sec === 1 && splash.gain === 1 && splash.wave === "sine",
      JSON.stringify(splash));
    check("unit: stilled water → dry clink (hz×1.5, sec×0.5, gain×0.6)",
      clink.hz === 1500 && Math.abs(clink.sec - 0.5) < 1e-9 && Math.abs(clink.gain - 0.6) < 1e-9,
      JSON.stringify(clink));
    check("unit: no water comp → dry clink too",
      coinNote(c2, undefined).hz === 1500 && coinNote(c2, null).hz === 1500);
    check("unit: clink re-clamps at the bounds (hz 3000 → 4000? no — 3000×1.5=4500 clamps)",
      coinNote(normalizeWish({ hz: 3000 }).cfg, null).hz === 4000);
    check("unit: garbage water comp never throws", (() => { try { coinNote(c2, "junk" as any); return true; } catch { return false; } })());
    // wishLine
    check("unit: wishLine names the water when it stands",
      wishLine(normalizeWish({}).cfg, "bob", true) === "bob tosses a coin into the water");
    check("unit: wishLine dry well omits the water",
      wishLine(normalizeWish({}).cfg, "bob", false) === "bob tosses a coin");
    check("unit: authored wishAt overrides wholesale",
      wishLine(normalizeWish({ wishAt: "a coin for the deep" }).cfg, "bob", true) === "a coin for the deep");
    // describe
    const dw = describeWish({ entries: [{ who: "bob", text: "hush", at: 1 }] }, { on: true });
    check("unit: describeWish names count + splash + hint, never the words",
      dw.startsWith("wishes:") && dw.includes("1 wish kept") && dw.includes("splashes") && dw.includes("wish") && !dw.includes("hush"), dw);
    const dd = describeWish({}, null);
    check("unit: describeWish dry names the clink", dd.includes("clinks"), dd);
    // trim is the guestbook's own
    // trim is the guestbook's own: [next, ...entries].slice(0, cap) — the
    // TAIL (positionally oldest) evicts; fixture [a,b] + c at cap 2 → [c,a]
    const t = guestbookTrim([{ who: "a", text: "1", at: 2 }, { who: "b", text: "2", at: 1 }], { who: "c", text: "3", at: 3 }, 2);
    check("unit: guestbookTrim verbatim — newest first, cap evicts the tail",
      t.length === 2 && t[0].who === "c" && t[1].who === "a", JSON.stringify(t));
  }

  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await alice.walk([0, 0, 0]);
  await sleep(250);
  alice.verb("spawn", { id: "fount1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "fount1", type: "water", data: { on: true } });
  alice.verb("comp", { id: "fount1", type: "wish", data: { cap: 3 } });
  await sleep(400);
  check("builder authored spawn + water + wish comps",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await bob.walk([0, 0, 1]);
  await sleep(250);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  // visitor comp authoring bounces (builder gate)
  bob.verb("spawn", { id: "well2", lib: "deco/bench.glb", pos: [30, 0, 0], yaw: 0 });
  await sleep(250);
  bob.verb("comp", { id: "well2", type: "wish", data: {} });
  await sleep(300);
  check("visitor wish comp authoring bounces (builder gate)",
    bob.msgs.some((m) => m.type === "error"), "no error surfaced for visitor comp authoring");
  bob.walk([1, 0, 0]);
  await sleep(250);

  // ---- toss: words + coin ----------------------------------------------------
  const beforeLog = logLines().length;
  bob.verb("use", { id: "fount1", action: "wish", text: "peace for the goats" });
  await sleep(500);
  {
    const comps = wishComps("fount1");
    const says = wishSays("fount1");
    const last = logWish("fount1");
    check("toss writes exactly ONE comp + ONE say",
      comps.length === 1 && says.length === 1, `comps=${comps.length} says=${says.length}`);
    check("the comp is the wish log: newest-first {who,text,at}",
      last?.entries?.length === 1 && last.entries[0].who === "bob"
      && last.entries[0].text === "peace for the goats" && Number.isFinite(last.entries[0].at),
      JSON.stringify(last));
    check("the say NARRATES THE TOSS, never the words",
      says[0]?.args?.text === "bob tosses a coin into the water"
      && !JSON.stringify(says[0]?.args).includes("peace"), JSON.stringify(says[0]?.args));
    check("the say carries wish{who,at} + cause/by provenance",
      says[0]?.args?.wish?.who === "bob" && Number.isFinite(says[0]?.args?.wish?.at)
      && Number.isFinite(says[0]?.args?.cause) && says[0]?.args?.by === "bob",
      JSON.stringify(says[0]?.args));
    check("the log grew by exactly 3 (use + comp + say)",
      logLines().length === beforeLog + 3, `Δ=${logLines().length - beforeLog}`);
  }

  // ---- silent wish -----------------------------------------------------------
  bob.verb("use", { id: "fount1", action: "wish" });
  await sleep(400);
  {
    const last = logWish("fount1");
    check("no text is a legal wish (text:\"\")",
      last?.entries?.length === 2 && last.entries[0].text === "", JSON.stringify(last?.entries?.[0]));
  }

  // ---- the alias -------------------------------------------------------------
  bob.verb("use", { id: "fount1", action: "toss", text: "again" });
  await sleep(400);
  check("toss is an alias of wish",
    logWish("fount1")?.entries?.[0]?.text === "again" && logWish("fount1")?.entries?.length === 3);

  // ---- trim at cap -----------------------------------------------------------
  bob.verb("use", { id: "fount1", action: "wish", text: "fourth" });
  await sleep(400);
  {
    const last = logWish("fount1");
    check("at cap 3 the OLDEST evicts (guestbookTrim verbatim)",
      last?.entries?.length === 3 && last.entries.map((e) => e.text).join("|") === "fourth|again|",
      JSON.stringify(last?.entries?.map((e) => e.text)));
  }

  // ---- the water bit chooses the timbre ---------------------------------------
  {
    // the comp's own defaults derive the note: hz 1568 → clink 2352,
    // sec 0.35 → 0.175, gain 0.5 → 0.3 (coinNote arithmetic, shared)
    alice.verb("use", { id: "fount1", action: "still" });
    await sleep(400);
    bob.verb("use", { id: "fount1", action: "wish", text: "clink me" });
    await sleep(400);
    const snd = bob.msgs.filter((m) => m.type === "sound" && m.wish != null).at(-1);
    check("stilled water mints the DRY CLINK (presence note, never logged)",
      snd != null && Math.abs(snd.note.hz - 1568 * 1.5) < 1e-9
      && Math.abs(snd.note.sec - 0.175) < 1e-9 && Math.abs(snd.note.gain - 0.3) < 1e-9,
      JSON.stringify(snd?.note));
    check("the splash note NEVER enters the log",
      !logLines().some((e) => JSON.stringify(e).includes('"wish"') && e.verb === "say" && (e.args as any)?.text?.includes("clink")));
    // re-flowed → splash again
    alice.verb("use", { id: "fount1", action: "flow" });
    await sleep(400);
    bob.verb("use", { id: "fount1", action: "wish", text: "splash me" });
    await sleep(400);
    const snd2 = bob.msgs.filter((m) => m.type === "sound" && m.wish != null).at(-1);
    check("re-flowed water mints the SPLASH again",
      snd2 != null && Math.abs(snd2.note.hz - 1568) < 1e-9 && Math.abs(snd2.note.gain - 0.5) < 1e-9, JSON.stringify(snd2?.note));
  }

  // ---- fold + late join --------------------------------------------------------
  {
    const dave = new Client("dave");
    await dave.connect();
    await sleep(300);
    const w = snapWish(dave.snapshot, "fount1");
    check("late joiner folds the SAME wish log (join-time truth)",
      w?.entries?.length === 3 && w.entries.some((e) => e.text === "splash me"),
      JSON.stringify(w));
    dave.close();
  }

  // ---- pass-through ------------------------------------------------------------
  {
    const n = logLines().length;
    bob.verb("use", { id: "fount1", action: "ring" });
    await sleep(400);
    bob.verb("use", { id: "fount1", action: "flow" });
    await sleep(400);
    const grew = logLines().length - n;
    check("non-wish actions pass through (flow belongs to the water family; ring to no one)",
      grew === 2, `Δ=${grew} — the two uses logged, zero world-authored writes`);
    check("no wish writes from the pass-through",
      wishComps("fount1").length === 6 && wishSays("fount1").length === 6,
      `comps=${wishComps("fount1").length} says=${wishSays("fount1").length}`);
  }

  // ---- reach + spectator -------------------------------------------------------
  {
    bob.walk([40, 0, 40]);
    await sleep(300);
    const saidNow = wishSays("fount1").length, wroteNow = wishComps("fount1").length;
    bob.verb("use", { id: "fount1", action: "wish", text: "far" });
    await sleep(400);
    check("out-of-reach wish mints nothing (comp + say counts hold)",
      wishSays("fount1").length === saidNow && wishComps("fount1").length === wroteNow,
      `${wishSays("fount1").length}/${wishComps("fount1").length} vs ${saidNow}/${wroteNow}`);
    bob.debug("wish-skip");
    await sleep(300);
    const skip1 = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the out-of-reach skip names the distance",
      JSON.stringify(skip1?.events ?? []).includes("out of reach"),
      JSON.stringify(skip1?.events ?? []).slice(0, 160));
    bob.walk([1, 0, 0]);
    await sleep(300);
    const spec = new Client("spec1");
    await spec.connect(true);
    await sleep(250);
    spec.verb("use", { id: "fount1", action: "wish", text: "spec" });
    await sleep(400);
    check("spectator wish bounces at the shell (no wish writes, error surfaced)",
      wishSays("fount1").length === saidNow && wishComps("fount1").length === wroteNow
      && spec.msgs.some((m) => m.type === "error"),
      `Δ writes=${wishComps("fount1").length - wroteNow}; err: ${spec.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "none"}`);
    spec.close();
  }

  // ---- lint + 8KB degrade (server path) -----------------------------------------
  {
    alice.verb("comp", { id: "fount1", type: "wish", data: { cap: 3, big: "x".repeat(9000) } });
    await sleep(400);
    alice.verb("use", { id: "fount1", action: "wish", text: "degraded?" });
    await sleep(400);
    const last = logWish("fount1");
    check("8KB degrade keeps the entries (fail closed against bloat, never the wisher)",
      last?.entries?.length >= 1 && last.entries[0].text === "degraded?", JSON.stringify(last?.entries?.[0]));
  }

  // ---- restart: replay mints nothing, the log survives --------------------------
  {
    const preCount = wishComps("fount1").length;
    const preLog = logWish("fount1");
    server!.kill();
    await sleep(600);
    await startServer();
    const alice2 = new Client("alice");
    await alice2.connect();
    await sleep(400);
    check("restart: replay mints NOTHING (no new comp writes)",
      wishComps("fount1").length === preCount, `${preCount} -> ${wishComps("fount1").length}`);
    const post = snapWish(alice2.snapshot, "fount1");
    check("restart: the wish log survives folded, byte-identical truth",
      JSON.stringify(post?.entries) === JSON.stringify(preLog?.entries),
      `${JSON.stringify(post?.entries)} vs ${JSON.stringify(preLog?.entries)}`);
    check("restart: the water bit survives too (comp water on:true in snapshot)",
      snapComp(alice2.snapshot, "fount1")?.water?.on === true,
      JSON.stringify(snapComp(alice2.snapshot, "fount1")?.water));
    alice2.close();
  }

  // ---- describe (shared, as look() reads it) -------------------------------------
  {
    // describeWish(data, waterComp) — the WATER comp data, not the bag
    const dw = describeWish(logWish("fount1"), { on: true });
    check("describeWish on folded bytes: count + splash + hint",
      dw.includes("wish") && dw.includes("splashes"), dw);
  }

  alice.close(); bob.close();
} catch (err) {
  console.error("wishtest crashed:", err);
  process.exitCode = 1;
} finally {
  server?.kill();
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail > 0 ? 1 : 0);
}
