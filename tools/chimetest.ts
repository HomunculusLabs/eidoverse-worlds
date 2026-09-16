// Chime matrix — `comp {type:"chime"}` on a DOOR: the door's own transition
// rings ONE presence-plane sound (music/force doctrine — never logged),
// pitch authored per direction, rate-capped by minGap. No actions of its
// own (bell doctrine); the door's rank-0 + arm's-reach gate IS the trigger
// gate. Self-booting: scratch sequencer (fresh WORLDS_DIR), owner authors
// doors + chimes. Covers § CHIMES CONTRACT:
//
//   bun tools/chimetest.ts
//
// - unit:       normalizeChime clamps/drops; ringNote per direction;
//               describeChime (with + without door)
// - authoring:  spawn + chime comp is builder-gated; visitor bounces
// - ring:       an in-reach toggle rings exactly ONE sound with
//               chime{open,by} + the authored open pitch; the door's own
//               comp+say entries land UNCHANGED (door engine untouched)
// - direction:  close rings the close pitch; open-on-open is a no-op that
//               mints nothing and rings nothing
// - minGap:     a second transition inside the gap rings nothing (the door
//               still moves — the cap is on the SOUND, never the door);
//               after the gap it rings again
// - reach:      an out-of-reach transition moves nothing and rings nothing
// - spectator:  spectators bounce at the shell (existing gate)
// - pass-through: use {action:"ring"} on a chiming door logs and mints
//               nothing (not chime vocabulary)
// - door-less:  a chime on an entity with no door comp never fires
// - lint-once:  garbage pitches lint (named) — once per boot per entity
// - restart:    replay mints nothing; door state + chime table fold
// - describe:   the mcpl affordance line reads folded truth
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeChime, ringNote, describeChime } from "../shared/chime.js";

const PORT = Number(process.env.PORT ?? 9023);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-chime";
const WORLD = `chimetest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-chime-"));

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
const chimeSounds = (c: Client, id?: string) => c.msgs.filter((m) => m.type === "sound"
  && m.chime != null && (!id || m.id === id));
const doorSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.door != null && (!id || (e.args as any)?.id === id));

try {
  console.log(`\nchime matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, notes } = normalizeChime({ openHz: "A5", closeHz: 260, sec: 9, gain: 5, minGap: 0.5, wave: "zap" });
    const e5 = 659.25, c5 = 523.25, a5 = 880;
    check("unit: defaults are the E5/C5 rising pair",
      Math.abs(normalizeChime({}).cfg.openHz - e5) < 0.5 && Math.abs(normalizeChime({}).cfg.closeHz - c5) < 0.5,
      JSON.stringify(normalizeChime({}).cfg));
    check("unit: authored note name + absolute hz both resolve",
      Math.abs(cfg.openHz - a5) < 0.5 && Math.abs(cfg.closeHz - 260) < 0.5,
      JSON.stringify(cfg));
    check("unit: sec clamps 3, gain clamps 1, minGap floors 2, bad wave → sine",
      cfg.sec === 3 && cfg.gain === 1 && cfg.minGap === 2 && cfg.wave === "sine",
      JSON.stringify(cfg));
    check("unit: every clamp is linted by name",
      notes.some((x) => x.includes("sec")) && notes.some((x) => x.includes("gain"))
        && notes.some((x) => x.includes("minGap")) && notes.some((x) => x.includes("wave")),
      JSON.stringify(notes));
    check("unit: garbage pitches fall to defaults + lint",
      (() => { const r = normalizeChime({ openHz: "zz", closeHz: 3 }); return Math.abs(r.cfg.openHz - e5) < 0.5 && Math.abs(r.cfg.closeHz - c5) < 0.5 && r.notes.length >= 2; })(),
      JSON.stringify(normalizeChime({ openHz: "zz", closeHz: 3 }).notes));
    check("unit: ringNote is the whole per-direction payload",
      JSON.stringify(ringNote(normalizeChime({ openHz: "A5" }).cfg, true))
        === JSON.stringify({ hz: 880, sec: 0.5, gain: 0.5, wave: "sine" })
        && Math.abs(ringNote(normalizeChime({}).cfg, false).hz - c5) < 0.5,
      "");
    check("unit: hz clamps to the piano (hzClamp path)",
      normalizeChime({ openHz: 20000 }).cfg.openHz <= 4186.01 && normalizeChime({ openHz: 20000 }).notes.length > 0,
      JSON.stringify(normalizeChime({ openHz: 20000 }).cfg));
    const d1 = describeChime({ openHz: "A5", closeHz: 260 });
    const d0 = describeChime({ openHz: "A5" }, false);
    check("unit: describeChime names both pitches + gap; door-less names silent",
      d1.includes("A5") && d1.includes("C4") && d1.includes("gap 4s") && d0.startsWith("chime: silent"),
      `${d1} | ${d0}`);
  }

  await startServer();

  // ---- authoring: owner authors; visitor bounces -------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "shopdoor", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "shopdoor", type: "door", data: { deg: 90, swingSec: 1, reach: 6 } });
  alice.verb("comp", { id: "shopdoor", type: "chime", data: { openHz: "A5", closeHz: 260, minGap: 4 } });
  await sleep(400);
  check("builder authored spawn + door + chime comps",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.verb("comp", { id: "shopdoor", type: "chime", data: { openHz: "C3" } });
  await sleep(300);
  check("visitor chime comp authoring bounces",
    bob.msgs.some((m) => m.type === "error"), "no error seen for visitor comp");
  check("the visitor authored no chime comp in the log",
    !logLines().some((e) => e.verb === "comp" && (e.args as any)?.type === "chime" && e.actor === "bob"));

  // ---- the ring: an in-reach transition rings ONE sound ------------------------
  bob.walk([3, 0, 0]);                                   // 3m — inside reach 6
  await sleep(300);
  bob.verb("use", { id: "shopdoor", action: "toggle" });
  await sleep(500);
  {
    const rings = chimeSounds(bob, "shopdoor");
    check("an in-reach open rings exactly ONE chime sound",
      rings.length === 1, `${rings.length} rings`);
    const r = rings[0];
    check("the ring carries chime{open} + top-level by + the authored open pitch",
      r?.chime?.open === true && r?.by === "bob"
        && Math.abs(r?.note?.hz - 880) < 0.5 && r?.note?.sec === 0.5,
      JSON.stringify(r?.chime) + " by=" + r?.by + " " + JSON.stringify(r?.note));
    check("the ring rides the presence plane at the door's position (never logged)",
      Array.isArray(r?.p) && !logLines().some((e) => e.verb === "sound"),
      JSON.stringify(r?.p));
    const ds = doorSays("shopdoor");
    check("the door's own comp+say entries land UNCHANGED (door engine untouched)",
      ds.length === 1 && (ds[0]?.args as any)?.door?.open === true
        && logLines().filter((e) => e.verb === "comp" && e.actor === "world" && (e.args as any)?.type === "door").length === 1,
      `${ds.length} door says`);
  }

  // ---- direction: close rings the close pitch; no-op mints nothing -------------
  bob.verb("use", { id: "shopdoor", action: "close" });
  await sleep(500);
  {
    const rings = chimeSounds(bob, "shopdoor");
    check("an immediate close inside minGap still MOVES the door",
      doorSays("shopdoor").length === 2 && (doorSays("shopdoor")[1]?.args as any)?.door?.open === false,
      `${doorSays("shopdoor").length} door says`);
    check("but rings nothing (minGap caps the SOUND, never the door)",
      rings.length === 1, `${rings.length} rings`);
  }
  // ---- minGap: after the gap it rings again ------------------------------------
  bob.verb("use", { id: "shopdoor", action: "toggle" });  // open (inside gap) — silent
  await sleep(500);
  check("a third transition inside the gap rings nothing",
    chimeSounds(bob, "shopdoor").length === 1);
  await sleep(4000);                                      // minGap 4s elapses
  bob.verb("use", { id: "shopdoor", action: "toggle" });  // close — rings
  await sleep(500);
  {
    const rings = chimeSounds(bob, "shopdoor");
    check("after the gap the next transition rings (close pitch)",
      rings.length === 2 && rings[1]?.chime?.open === false
        && Math.abs(rings[1]?.note?.hz - 260) < 0.5,
      `${rings.length} rings`);
  }

  // ---- reach: an out-of-reach transition rings nothing --------------------------
  bob.walk([30, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "shopdoor", action: "toggle" });
  await sleep(500);
  check("an out-of-reach transition moves nothing and rings nothing",
    chimeSounds(bob, "shopdoor").length === 2 && doorSays("shopdoor").length === 4,
    `${chimeSounds(bob, "shopdoor").length} rings / ${doorSays("shopdoor").length} says`);

  // ---- spectator: the shell gate (existing) ------------------------------------
  const spec = new Client("spec1");
  await spec.connect(true);
  await sleep(200);
  bob.walk([3, 0, 0]);
  await sleep(300);
  spec.verb("use", { id: "shopdoor", action: "toggle" });
  await sleep(400);
  check("spectator use bounces at the shell (no ring, no door say)",
    chimeSounds(bob, "shopdoor").length === 2 && doorSays("shopdoor").length === 4
      && spec.msgs.some((m) => m.type === "error"),
    "");
  bob.verb("use", { id: "gate1", action: "toggle" });     // no such entity
  await sleep(300);
  check("use on a missing entity mints nothing (existing skip)",
    chimeSounds(bob).length === 2, "");

  // ---- pass-through: ring is not chime vocabulary -------------------------------
  {
    const beforeRings = chimeSounds(bob, "shopdoor").length;
    const beforeSays = doorSays("shopdoor").length;
    bob.verb("use", { id: "shopdoor", action: "ring" });
    await sleep(400);
    check("use {action:\"ring\"} passes through (logged, mints nothing)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob" && (e.args as any)?.id === "shopdoor"
        && (e.args as any)?.action === "ring") && chimeSounds(bob, "shopdoor").length === beforeRings,
      "");
    check("...and the door engine passes it through too (no door say)",
      doorSays("shopdoor").length === beforeSays, "");
  }

  // ---- door-less: a chime on an entity with no door never fires -----------------
  alice.verb("spawn", { id: "orphan", lib: "deco/bench.glb", pos: [5, 0, 5], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "orphan", type: "chime", data: { openHz: "C4" } });
  await sleep(300);
  bob.verb("use", { id: "orphan", action: "toggle" });
  await sleep(400);
  check("a door-less chime never fires (toggle passes through as unknown)",
    chimeSounds(bob).length === 2 && !doorSays().some((s: any) => s.args?.id === "orphan"),
    "");

  // ---- lint-once: garbage pitches lint (named) — once per boot ------------------
  alice.verb("comp", { id: "shopdoor", type: "chime", data: { openHz: "zz", closeHz: 3 } });
  await sleep(300);
  bob.verb("use", { id: "shopdoor", action: "toggle" });  // door open now
  await sleep(500);
  bob.debug("chime-lint");
  await sleep(300);
  const lint = bob.msgs.filter((m) => m.gate || m.type === "debug").at(-1);
  const lintEvents = JSON.stringify(lint?.events ?? []);
  check("malformed pitches lint (named) on the next transition",
    lintEvents.includes("shopdoor") && (lintEvents.includes("zz") || lintEvents.includes("openHz")),
    lintEvents.slice(0, 240));

  // ---- restart: replay mints nothing; the fold carries both tables --------------
  const saidAll = doorSays().length;
  const ringsAll = chimeSounds(bob).length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(1000);
  check("restart: replay minted nothing",
    doorSays().length === saidAll, `${doorSays().length} vs ${saidAll}`);
  const folded = probe.snapshot?.state?.entities?.shopdoor?.comp;
  check("the fold carries door state + the VERBATIM chime table (late-join truth)",
    folded?.door?.open === true && folded?.chime?.openHz === "zz" && folded?.chime?.closeHz === 3,
    JSON.stringify(folded?.chime));
  check("no sound rides the fold or the snapshot (presence-plane doctrine)",
    !logLines().some((e) => e.verb === "sound") && chimeSounds(probe).length === 0);
  const descLive = describeChime(folded?.chime);
  check("mcpl affordance read (describeChime on folded truth)",
    descLive.startsWith("chime:") && descLive.includes("gap"), descLive);

  // ---- cleanup -------------------------------------------------------------------
  bob.close(); spec.close(); probe.close();
  try { alice.close(); } catch { /* already gone */ }
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
