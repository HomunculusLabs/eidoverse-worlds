// Ropebridge matrix — `comp {type:"ropebridge", data:{pair, width, impulse}}`
// on a deck entity: a swaying crossing with NO verb (the bell/regions
// lineage — footsteps drive it). A 1Hz sweep watches embodied presence
// against the span capsule [near, far]; an armed entry fires ONE creak
// (say + presence sound) and pumps the deck's pendulum sway THROUGH the
// pendulum family's own impulse arithmetic (mirrored-math law honored by
// construction). The sway state lives in the folded motion comp — late
// join/restart/replay all fold the standing sway.
// Self-booting: scratch sequencer (fresh WORLDS_DIR), builder authors
// deck + anchors, visitors WALK the span (pose messages).
// Covers § ROPEBRIDGES CONTRACT:
//
//   bun tools/ropebridgetest.ts
//
// - shared math: normalize clamps/validates; distToSpan point-to-segment
// - authoring: the comp is builder-gated (visitor comp bounces)
// - lint: absent/illegal pair → ropebridge-lint notes + skip (no fires)
// - pair: missing entity / self-pair → ropebridge-skip, never a fire
// - crossing: walking into the band fires the creak say (rb{who,at}) +
//   the presence sound at the projection point + the pendulum motion write
// - seeded sway: a deck with NO motion comp gets one created (period 3.8,
//   damped — never perpetual)
// - authored sway preserved: an authored pendulum's period/damp/pivot ride
//   the impulse write verbatim
// - non-pendulum deck: a spin/bob deck keeps its motion (creak-only, skip
//   named)
// - cooldown: idling on the deck fires once per window; re-entry after
//   leaving past exitScale·width re-fires after cooldownSec
// - hysteresis: stepping into the band-edge (width..exitScale·width) does
//   not flap
// - spectator: spectate legs never cross (no fires)
// - unposed: a joined-but-unposed client never crosses
// - restart: replay mints nothing; the sway folds from the log; a fresh
//   client joining after restart receives NO creak sounds
// - late join: folds the standing sway (motion comp) + creak chat history
// - cleanup: comp null removes the family (no more fires)
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeRopebridge, distToSpan, describeRopebridge } from "../shared/ropebridge.js";

const PORT = Number(process.env.PORT ?? 9044);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const WORLD = `ropebridge-w-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-ropebridge-"));

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
  walk(p: number[]) { this.send({ type: "pose", pose: { p, yaw: 0, speed: 1, clip: "walk" } }); }
  close() { try { this.ws.close(); } catch { /* already gone */ } }
}

let server: ReturnType<typeof spawn> | null = null;
let serverLog = "";
let spawnErr = "";
async function startServer() {
  let lastErr = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(1200);
    server = spawn(process.execPath, [join(import.meta.dir, "..", "server", "server.ts")], {
      env: {
        ...process.env, PORT: String(PORT), WORLDS_DIR: worldsDir, JOIN_TOKEN: TOKEN,
        FOLD_EVERY: "40", VERB_RATE: "5000", MSG_RATE: "5000",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    serverLog = ""; spawnErr = ""; lastErr = "";
    server.on("error", (e) => { spawnErr = String(e); });
    server.stdout!.on("data", (d) => { serverLog += d; });
    server.stderr!.on("data", (d) => { serverLog += d; });
    for (let i = 0; i < 100; i++) {
      try { if ((await fetch(`http://127.0.0.1:${PORT}/avatars`)).ok) return; } catch (e) { lastErr = String(e); }
      if (server.exitCode != null) break;
      await sleep(100);
    }
  }
  throw new Error(`scratch sequencer did not start (exit=${server!.exitCode}, spawnErr=${spawnErr}, last fetch err=${lastErr})\n--- server output ---\n${serverLog.slice(-2000)}`);
}

const logLines = (world: string) => {
  const p = join(worldsDir, world, "log.jsonl");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
};
const rbSays = (world: string) => logLines(world).filter((e) => e.verb === "say" && e.actor === "world" && (e.args as any)?.rb);
const rbMotions = (world: string) => logLines(world).filter((e) => e.verb === "motion" && e.actor === "world");

async function main() {
  console.log(`ropebridge matrix — scratch world ${WORLD}`);
  await startServer();

  // ---- shared math, pinned first (the shared-verbatim law) --------------------
  const { cfg: mc, notes: mnotes } = normalizeRopebridge({ pair: "farAnchor", width: 3, impulse: 0.12 });
  check("normalize: legal comp clamps clean (no notes)",
    mc.pair === "farAnchor" && mc.width === 3 && mnotes.length === 0, JSON.stringify({ mc, mnotes }));
  const { cfg: bad } = normalizeRopebridge({ pair: "not an id!" });
  check("normalize: illegal pair → null (validated, never clamped)", bad.pair === null);
  const { cfg: absent } = normalizeRopebridge({});
  check("normalize: absent pair → null (required)", absent.pair === null);
  const { cfg: clamped, notes: cnotes } = normalizeRopebridge({ pair: "a", width: 99, impulse: 9, cooldownSec: 1 });
  check("normalize: clamps collected as lint notes (width 99→8, impulse 9→0.6, cooldownSec 1→2)",
    clamped.width === 8 && clamped.impulse === 0.6 && clamped.cooldownSec === 2 && cnotes.length === 3,
    JSON.stringify({ clamped, cnotes }));
  const { cfg: wv } = normalizeRopebridge({ pair: "a", wave: "gasleak" });
  check("normalize: unknown wave → sawtooth (noted)", wv.wave === "sawtooth");
  check("distToSpan: on-span point is 0", distToSpan([5, 0, 0], [0, 0, 0], [10, 0, 0]) === 0);
  check("distToSpan: off-span point is the perpendicular", Math.abs(distToSpan([5, 0, 4], [0, 0, 0], [10, 0, 0]) - 4) < 1e-9);
  check("distToSpan: past-the-end clamps to the endpoint", Math.abs(distToSpan([15, 0, 4], [0, 0, 0], [10, 0, 0]) - Math.hypot(5, 4)) < 1e-9);
  check("distToSpan: diagonal span works", Math.abs(distToSpan([5, 0, 5], [0, 0, 0], [10, 0, 10]) - 0) < 1e-9,
    String(distToSpan([5, 0, 5], [0, 0, 0], [10, 0, 10])));
  check("describe: names the far anchor + no-verb truth",
    describeRopebridge({ pair: "farAnchor", width: 3 }, null).includes("farAnchor")
    && describeRopebridge({ pair: "farAnchor" }, null).includes("walk"), describeRopebridge({ pair: "farAnchor" }, null));
  check("describe: swaying read when a pendulum stands",
    describeRopebridge({ pair: "a" }, { type: "pendulum", amp: 0.3 }).includes("swaying"));
  check("describe: broken bridge reads still", describeRopebridge({}, null).includes("still"));

  // ---- setup: builder + visitor + deck/anchors -------------------------------
  const bob = new Client("bob");
  await bob.connect();
  const alice = new Client("alice");
  await alice.connect();
  bob.verb("grant", { id: "alice", role: "visitor" });
  await sleep(300);
  bob.walk([0, 0, 0]); await sleep(150);
  bob.verb("spawn", { id: "deck1", lib: "eidoverse/assets/misc/plinth.glb", pos: [0, 0, 0] });
  bob.verb("spawn", { id: "farAnchor", lib: "eidoverse/assets/misc/plinth.glb", pos: [20, 0, 0] });
  await sleep(300);
  check("deck + far anchor stand in the fold",
    logLines(WORLD).filter((e) => e.verb === "spawn" && ["deck1", "farAnchor"].includes((e.args as any)?.id)).length === 2);

  // ---- authoring is builder-gated --------------------------------------------
  alice.verb("comp", { id: "deck1", type: "ropebridge", data: { pair: "farAnchor" } });
  await sleep(300);
  check("visitor ropebridge comp bounces (builder-gated)",
    !logLines(WORLD).some((e) => e.verb === "comp" && (e.args as any)?.type === "ropebridge" && e.actor === "alice"));

  // ---- lint: absent pair ------------------------------------------------------
  bob.verb("comp", { id: "deck1", type: "ropebridge", data: {} });
  await sleep(300);
  await sleep(2200);   // sweeps are 1Hz — give the engine two
  bob.send({ type: "debug", reqId: "d0", kinds: ["ropebridge-lint", "ropebridge-skip"], limit: 60 });
  await sleep(300);
  const lintRaw = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("absent pair lints + skips (ropebridge-lint / ropebridge-skip)",
    JSON.stringify(lintRaw?.events ?? []).includes("pair"), JSON.stringify(lintRaw?.events ?? []).slice(0, 200));
  check("absent pair never fires", rbSays(WORLD).length === 0);

  // ---- pair: missing entity / self-pair --------------------------------------
  bob.verb("comp", { id: "deck1", type: "ropebridge", data: { pair: "ghost-tower" } });
  await sleep(2200);
  check("pair to a missing entity skips (no fire)", rbSays(WORLD).length === 0);
  bob.verb("comp", { id: "deck1", type: "ropebridge", data: { pair: "deck1" } });
  await sleep(2200);
  check("self-pair skips (no fire)", rbSays(WORLD).length === 0);
  bob.send({ type: "debug", reqId: "d0b", kinds: ["ropebridge-skip"], limit: 60 });
  await sleep(300);
  const skipRaw = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("pair skips are named (ropebridge-skip)",
    JSON.stringify(skipRaw?.events ?? []).includes("cannot pair with itself")
    || JSON.stringify(skipRaw?.events ?? []).includes("does not exist"),
    JSON.stringify(skipRaw?.events ?? []).slice(0, 240));

  // ---- author the legal bridge (fast cooldown for the re-arm probe) ----------
  await bob.walk([0, 0, 10]); await sleep(150);   // OFF-span (bob stood on the near anchor)
  bob.verb("comp", { id: "deck1", type: "ropebridge", data: { pair: "farAnchor", width: 2, impulse: 0.2, cooldownSec: 2, exitScale: 1.5 } });
  await sleep(2200);
  check("legal bridge authored — still no fire (nobody walked)", rbSays(WORLD).length === 0,
    `says ${rbSays(WORLD).length}`);

  // ---- CROSSING: alice walks onto the span ------------------------------------
  const saysBase = rbSays(WORLD).length;
  await alice.walk([10, 0, 0]); await sleep(150);   // on-span, mid-deck
  await sleep(2200);   // one sweep sees the entry
  check("walking onto the span fires the creak say", rbSays(WORLD).length === saysBase + 1,
    `got ${rbSays(WORLD).length} rb says`);
  const fx = rbSays(WORLD).at(-1);
  check("say carries rb{who,at} + by (no cause: presence caused it)",
    fx?.args?.rb?.who === "alice" && typeof fx?.args?.rb?.at === "number" && fx?.args?.by === "alice"
    && fx?.args?.cause === undefined, JSON.stringify(fx?.args ?? null).slice(0, 200));
  const snd = alice.msgs.find((m) => m.type === "sound" && m.rb);
  check("creak sound broadcast at the crossing point (presence plane)",
    !!snd && Array.isArray(snd.p) && Math.abs(snd.p[0] - 10) < 1 && snd.note?.hz > 0,
    snd ? JSON.stringify({ p: snd.p, note: snd.note }) : "no sound");
  // NOTE: the FIRST sound arrives at alice's FIRST entry; later crossings'
  // sounds also arrive. The projection point is mid-deck (x≈10).
  const motions = rbMotions(WORLD);
  check("the sway write mints ONE pendulum motion entry",
    motions.length === 1 && motions[0].args?.type === "pendulum" && motions[0].args?.id === "deck1",
    JSON.stringify(motions.map((m) => m.args).slice(0, 2)));
  const mo = motions[0]?.args as any;
  check("seeded sway: no-motion deck gets period 3.8 + damp 0.12 (never perpetual)",
    mo?.period === 3.8 && mo?.damp === 0.12 && typeof mo?.amp === "number" && mo.amp > 0,
    JSON.stringify(mo));
  check("seeded sway impulse is capped at maxAmp 0.35", (mo?.maxAmp ?? 0) === 0.35, JSON.stringify(mo?.maxAmp));

  // ---- cooldown: idling on the deck fires once ---------------------------------
  await alice.walk([11, 0, 0]); await sleep(150);
  await sleep(2200);
  check("idling inside the band does not re-fire (cooldown + hysteresis)",
    rbSays(WORLD).length === saysBase + 1, `says ${rbSays(WORLD).length}`);
  // step out past exitScale·width (3m), then back in after the 2s window
  await alice.walk([10, 0, 8]); await sleep(150);   // 8m off-span — well outside 3m
  await sleep(2200);
  await sleep(2500);   // cooldown 2s elapsed since the first fire
  await alice.walk([10, 0, 0]); await sleep(150);
  await sleep(2200);
  check("re-entry after leaving + cooldown re-fires", rbSays(WORLD).length === saysBase + 2,
    `says ${rbSays(WORLD).length}`);

  // ---- hysteresis: band-edge hovering does not flap ----------------------------
  await alice.walk([10, 0, 2.6]); await sleep(150);   // between width 2 and 3 (band edge)
  await sleep(2200);
  check("band-edge hovering does not flap (hysteresis)", rbSays(WORLD).length === saysBase + 2,
    `says ${rbSays(WORLD).length}`);

  // ---- non-pendulum deck: authored bob stays, creak-only -----------------------
  bob.verb("motion", { id: "deck1", type: "bob", amp: 0.4, period: 5 });
  await sleep(300);
  const motionsBefore = rbMotions(WORLD).length;
  await alice.walk([10, 0, 10]); await sleep(150);   // way outside
  await sleep(2200);
  await sleep(2500);
  await alice.walk([10, 0, 0]); await sleep(150);
  await sleep(2200);
  check("a bob deck still creaks (the family composes)", rbSays(WORLD).length === saysBase + 3,
    `says ${rbSays(WORLD).length}`);
  check("a bob deck's authored motion is preserved (no impulse write)",
    rbMotions(WORLD).length === motionsBefore, `motions ${rbMotions(WORLD).length} vs ${motionsBefore}`);
  bob.send({ type: "debug", reqId: "d1", kinds: ["ropebridge-skip"], limit: 60 });
  await sleep(300);
  const npRaw = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("non-pendulum skip is named",
    JSON.stringify(npRaw?.events ?? []).includes("impulses need a pendulum"),
    JSON.stringify(npRaw?.events ?? []).slice(0, 240));

  // ---- authored sway preserved: an authored pendulum rides the impulse ---------
  bob.verb("motion", { id: "deck1", type: "pendulum", amp: 0, period: 2.5, damp: 0.05, axis: [0, 0, 1], pivot: [0, 4, 0], maxAmp: 0.5 });
  await sleep(300);
  await alice.walk([10, 0, 10]); await sleep(150);
  await sleep(2200); await sleep(2500);
  await alice.walk([10, 0, 0]); await sleep(150);
  await sleep(2200);
  const lastMotion = (rbMotions(WORLD).at(-1)?.args ?? {}) as any;
  check("an authored pendulum's period/damp/pivot ride the write",
    lastMotion.period === 2.5 && lastMotion.damp === 0.05 && lastMotion.maxAmp === 0.5
    && JSON.stringify(lastMotion.axis) === JSON.stringify([0, 0, 1])
    && lastMotion.pivot?.[1] === 4, JSON.stringify(lastMotion).slice(0, 240));
  check("the pumped amp stays ≤ maxAmp 0.5", lastMotion.amp <= 0.5, String(lastMotion.amp));

  // ---- spectator: spectate legs never cross ------------------------------------
  const spec = new Client("spec");
  await spec.connect(true);
  spec.walk([10, 0, 0]); await sleep(150);
  await sleep(2200);
  const specFires = rbSays(WORLD).filter((e) => (e.args as any)?.rb?.who === "spec").length;
  check("spectator poses never cross", specFires === 0, `${specFires} spec fires`);
  spec.close();

  // ---- unposed: a joined-but-unposed client never crosses ----------------------
  const unposed = new Client("unposed");
  await unposed.connect();
  await sleep(2200);
  const unposedFires = rbSays(WORLD).filter((e) => (e.args as any)?.rb?.who === "unposed").length;
  check("an unposed client never crosses", unposedFires === 0, `${unposedFires} unposed fires`);
  unposed.close();

  // ---- late join: standing sway + creak history fold ---------------------------
  const joiner = new Client("joiner");
  await joiner.connect();
  const jDeck = joiner.snapshot?.state?.entities?.deck1;
  const jChat = joiner.snapshot?.state?.recentChat ?? [];
  check("late joiner folds the standing sway (motion comp on the deck)",
    jDeck?.comp?.motion?.type === "pendulum" && typeof jDeck?.comp?.motion?.amp === "number",
    JSON.stringify(jDeck?.comp ?? null).slice(0, 160));
  check("late joiner folds the ropebridge comp + creak chat history",
    jDeck?.comp?.ropebridge?.pair === "farAnchor" && jChat.some((m: any) => m.actor === "world" && /creaks/.test(m.text)),
    `chat ${jChat.length} lines`);
  joiner.close();

  // ---- restart: replay mints nothing; fresh joiner hears no creak --------------
  const saysPre = rbSays(WORLD).length;
  const motionsPre = rbMotions(WORLD).length;
  server!.kill();
  await sleep(600);
  await startServer();
  // sockets die with the server — bob rejoins through the ordinary path
  const bob2 = new Client("bob");
  await bob2.connect();
  // sockets die with the server — alice rejoins through the ordinary path
  const alice2 = new Client("alice");
  await alice2.connect();
  const rejoined = new Client("rejoined");
  await rejoined.connect();
  await sleep(2200);   // two sweeps over folded history — must mint nothing
  check("restart: replay mints no creaks, no motions",
    rbSays(WORLD).length === saysPre && rbMotions(WORLD).length === motionsPre,
    `says ${rbSays(WORLD).length}/${saysPre}, motions ${rbMotions(WORLD).length}/${motionsPre}`);
  const rDeck = rejoined.snapshot?.state?.entities?.deck1;
  check("restart: the sway folds from the log (same amp family)",
    rDeck?.comp?.motion?.type === "pendulum", JSON.stringify(rDeck?.comp?.motion ?? null).slice(0, 160));
  check("restart: a fresh joiner receives NO creak sounds",
    !rejoined.msgs.some((m) => m.type === "sound" && m.rb));
  // the bridge still works after restart: walk it again
  await alice2.walk([10, 0, 10]); await sleep(150);
  await sleep(2200); await sleep(2500);
  await alice2.walk([10, 0, 0]); await sleep(150);
  await sleep(2200);
  check("restart: the bridge still fires crossings", rbSays(WORLD).length === saysPre + 1,
    `says ${rbSays(WORLD).length}`);
  rejoined.close();

  // ---- cleanup: comp null removes the family -----------------------------------
  bob2.verb("comp", { id: "deck1", type: "ropebridge", data: null });
  await sleep(300);
  await alice2.walk([10, 0, 10]); await sleep(150);
  await sleep(2200); await sleep(2500);
  await alice2.walk([10, 0, 0]); await sleep(150);
  await sleep(2200);
  check("comp null removes the family (no more fires)",
    rbSays(WORLD).length === saysPre + 1, `says ${rbSays(WORLD).length}`);

  console.log(`\nropebridge matrix: ${pass} pass, ${fail} fail`);
  server!.kill();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e); server?.kill(); process.exit(1); });
