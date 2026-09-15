// Region matrix — `comp {type:"region"}` makes a place KNOW WHO IS INSIDE,
// restart-safely: membership is written to the fold itself (world-authored
// comp transition writes), so replay/late-join/fork all fold the same truth.
// Self-booting: scratch sequencer (fresh WORLDS_DIR), builder authors regions,
// visitors WALK (pose messages), the world answers on boundary crossings.
// Covers the contract in VOCABULARY-LOOP.md § REGIONS:
//
//   bun tools/regiontest.ts
//
// - authoring:  spawn + region comp is builder-gated; visitor comp bounces
// - triggering: enter says on crossing the ellipsoid; the exit band
//               (exitScale on normalized distance) does not flap
// - membership: transitions write members into the folded comp bag
//               (the log is the only durable state — no say-ring heuristic)
// - spam:       standing inside emits nothing further (1Hz, transition-only,
//               no redundant comp writes)
// - re-arm:     exit disarms for exitSec — out-and-back does not re-welcome
// - cooldown:   per (region,visitor) pair, an enter says once per cooldownSec
// - shape:      heightScale flattens the ellipsoid — flying over a flat
//               region exits, ground entry enters
// - spectator:  spectate legs never become members
// - lint:       out-of-range numbers clamp with a region-lint note
// - removal:    nulling the comp drops tracking silently (region-skip)
// - restart:    replay mints nothing; folded members survive a >256-say
//               churn (fold-sourced, not ring-sourced); a boot grace window
//               holds them; a member who re-presents inside within grace
//               keeps CONTINUOUS membership (no re-welcome); absent members
//               prune silently after grace
// - fold:       late joiner sees the lines as ordinary chat

import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = Number(process.env.PORT ?? 8997);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const WORLD = `regiontest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-region-"));

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
/** world-authored says that are region effects */
const regionSays = () => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.region != null);
/** world-authored membership writes */
const regionComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "region" && (!id || (e.args as any)?.id === id));
/** folded members of a region, read from a join snapshot */
const snapMembers = (snap: any, id: string) =>
  snap?.state?.entities?.[id]?.comp?.region?.members ?? null;

const SWEEP = 1400;   // > the 1s sweep tick

try {
  console.log(`\nregion matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");
  await alice.connect();                              // first joiner owns
  await sleep(200);
  alice.verb("spawn", { id: "hall1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "hall1", type: "region", data: {
    radius: 5, exitScale: 1.2, exitSec: 15, cooldownSec: 10, graceSec: 12,
    enter: "the hall takes you in",
    exit: "the hall lets you go",
  } });
  alice.verb("spawn", { id: "flat1", lib: "deco/bench.glb", pos: [100, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "flat1", type: "region", data: {
    radius: 6, heightScale: 0.1, enter: "the terrace notices you",
  } });
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [200, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "linty", type: "region", data: { radius: 500, enter: "x" } });
  await sleep(400);
  check("builder authored spawn + region comps", alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  // ---- enter: a visitor walks in -------------------------------------------
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.walk([30, 0, 0]);                                   // far from everything
  await sleep(SWEEP);
  check("standing far away says nothing", regionSays().length === 0,
    `${regionSays().length} region says`);

  bob.walk([2, 0, 0]);                                    // inside radius 5
  await sleep(SWEEP);
  const enters = regionSays().filter((e) => (e.args as any).region?.enter === "hall1");
  check("crossing the boundary says the enter line", enters.length === 1, `${enters.length} enters`);
  const e1 = enters[0];
  check("enter carries provenance {id, by, region{enter,who,at}}",
    (e1?.args as any)?.id === "hall1" && (e1?.args as any)?.by === "bob"
      && (e1?.args as any)?.region?.who === "bob" && typeof (e1?.args as any)?.region?.at === "number",
    JSON.stringify(e1?.args));
  check("enter text is the authored line", (e1?.args as any)?.text === "the hall takes you in",
    JSON.stringify(e1?.args?.text));
  check("the enter broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.region?.who === "bob"));

  // ---- membership is FOLD state, not narration ------------------------------
  const m1 = regionComps("hall1").at(-1);
  check("the enter wrote members into the folded comp",
    JSON.stringify((m1?.args as any)?.data?.members) === JSON.stringify(["bob"]),
    JSON.stringify((m1?.args as any)?.data?.members));

  // ---- no per-frame spam: standing inside is silent -------------------------
  const saidNow = regionSays().length, wroteNow = regionComps().length;
  await sleep(SWEEP * 2);
  check("standing inside emits nothing further (no spam, no redundant writes)",
    regionSays().length === saidNow && regionComps().length === wroteNow,
    `${regionSays().length}/${regionComps().length} vs ${saidNow}/${wroteNow}`);

  // ---- the exit band does not flap ------------------------------------------
  bob.walk([5.4, 0, 0]);                                  // d_norm 1.08 — past 1, inside exitScale 1.2
  await sleep(SWEEP + 400);
  check("the exit band holds membership (no exit at d_norm 1.08)",
    regionSays().filter((e) => (e.args as any).region?.exit != null).length === 0,
    `${regionSays().filter((e) => (e.args as any).region?.exit != null).length} exits`);

  bob.walk([8, 0, 0]);                                    // d_norm 1.6 — past exitScale
  await sleep(SWEEP + 400);
  const exits = regionSays().filter((e) => (e.args as any).region?.exit === "hall1");
  check("past exitScale says the exit line", exits.length === 1, `${exits.length} exits`);
  const x1 = exits[0];
  check("exit carries region{exit,who,causeEnter} chain",
    (x1?.args as any)?.region?.who === "bob"
      && (x1?.args as any)?.region?.causeEnter === e1?.seq,
    JSON.stringify(x1?.args?.region));
  const m2 = regionComps("hall1").at(-1);
  check("the exit wrote members back to []",
    JSON.stringify((m2?.args as any)?.data?.members) === JSON.stringify([]),
    JSON.stringify((m2?.args as any)?.data?.members));

  // ---- re-arm: out-and-back does not re-welcome -----------------------------
  bob.walk([1, 0, 0]);                                    // straight back in (disarmed)
  await sleep(SWEEP);
  check("re-arm: immediate return does not re-welcome",
    regionSays().filter((e) => (e.args as any).region?.enter === "hall1").length === 1,
    `${regionSays().filter((e) => (e.args as any).region?.enter === "hall1").length} enters`);
  const m3 = regionComps("hall1").at(-1);
  check("suppressed enter still folds membership (state is not narration)",
    JSON.stringify((m3?.args as any)?.data?.members) === JSON.stringify(["bob"]),
    JSON.stringify((m3?.args as any)?.data?.members));
  bob.walk([12, 0, 0]);                                   // back out — enter never said
  await sleep(SWEEP + 400);
  check("silent pair discipline: a suppressed enter exits silently",
    regionSays().filter((e) => (e.args as any).region?.exit === "hall1").length === 1,
    `${regionSays().filter((e) => (e.args as any).region?.exit === "hall1").length} exits`);
  const m4 = regionComps("hall1").at(-1);
  check("the silent exit still wrote members []",
    JSON.stringify((m4?.args as any)?.data?.members) === JSON.stringify([]),
    JSON.stringify((m4?.args as any)?.data?.members));

  // ---- shape: a flat region has a vertical axis ------------------------------
  bob.walk([100, 0, 0]);                                  // ground level, flat1 center
  await sleep(SWEEP);
  const fEnter = regionSays().filter((e) => (e.args as any).region?.enter === "flat1");
  check("ground entry into a flat region (heightScale 0.1) says", fEnter.length === 1,
    `${fEnter.length} flat1 enters`);
  bob.walk([100, 3, 0]);                                  // 3m up — dy = 3/0.6 = 5, far outside
  await sleep(SWEEP + 400);
  const fExit = regionComps("flat1").at(-1);
  check("flying over a flat region exits (vertical axis real, membership write)",
    JSON.stringify((fExit?.args as any)?.data?.members) === JSON.stringify([]),
    JSON.stringify((fExit?.args as any)?.data?.members));
  bob.walk([130, 0, 0]);                                  // away from flat1 (re-armed: silent)
  await sleep(SWEEP);

  // ---- after the re-arm window, re-entry is welcomed (both stay) -------------
  await sleep(16_000);                                    // > exitSec 15 since the SAID hall1 exit
  bob.walk([1, 0, 0]);
  const carol = new Client("carol");
  await carol.connect();
  await sleep(200);
  alice.verb("grant", { id: "carol", role: "visitor" });
  await sleep(300);
  carol.walk([2, 0, 0]);
  await sleep(SWEEP);
  const lateEnters = regionSays().filter((e) => (e.args as any).region?.enter === "hall1"
    && (e.args as any).region?.who !== "bob");
  check("after the re-arm window a fresh visitor is welcomed", lateEnters.length === 1,
    `${lateEnters.length} carol enters`);
  const m5 = regionComps("hall1").at(-1);
  check("membership now folds [bob, carol]",
    JSON.stringify((m5?.args as any)?.data?.members) === JSON.stringify(["bob", "carol"]),
    JSON.stringify((m5?.args as any)?.data?.members));

  // ---- late join sees the lines as ordinary chat (BEFORE churn — the 40-line
  // recentChat window would otherwise hold only churn) --------------------------
  const lateEarly = new Client("latejoiner");
  await lateEarly.connect();
  await sleep(300);
  const rcEarly = lateEarly.snapshot?.state?.recentChat ?? [];
  check("late joiner folds the region lines as chat",
    rcEarly.some((m: any) => m.actor === "world"), `${rcEarly.length} recentChat lines`);
  lateEarly.close();

  // ---- churn: push every region say past the 256-entry ring ------------------
  for (let i = 0; i < 300; i++) alice.verb("say", { text: `churn ${i}` });
  await sleep(600);
  check("churn pushed the early says past the recentSays ring",
    logLines().filter((e) => e.verb === "say").length >= 300,
    `${logLines().filter((e) => e.verb === "say").length} say entries`);

  // ---- restart: the FOLD is the state (not the ring) -------------------------
  const saidBefore = regionSays().length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();                                  // immediately — inside grace (12s)
  await sleep(300);
  check("restart: a fresh join folds members [bob, carol] from the log",
    JSON.stringify(snapMembers(probe.snapshot, "hall1")) === JSON.stringify(["bob", "carol"]),
    JSON.stringify(snapMembers(probe.snapshot, "hall1")));
  await sleep(SWEEP * 2);                                 // sweeps run during grace
  check("restart replays history, mints nothing (grace holds, no prune says)",
    regionSays().length === saidBefore, `${regionSays().length} vs ${saidBefore}`);

  // ---- grace: a member who re-presents inside keeps continuous membership -----
  const bobEntersBefore = regionSays().filter((e) => (e.args as any).region?.enter === "hall1"
    && (e.args as any).region?.who === "bob").length;     // == 2 at this point
  const bob2 = new Client("bob");
  await bob2.connect();
  await sleep(300);
  bob2.walk([1, 0, 0]);                                   // re-present INSIDE, within grace
  await sleep(SWEEP + 400);
  const bobEntersAfter = regionSays().filter((e) => (e.args as any).region?.enter === "hall1"
    && (e.args as any).region?.who === "bob").length;
  check("grace return inside does NOT re-welcome (membership continuous)",
    bobEntersAfter === bobEntersBefore, `${bobEntersAfter} vs ${bobEntersBefore}`);
  const probe2 = new Client("probe2");
  await probe2.connect();
  await sleep(300);
  check("continuous membership folds [bob, carol] still (carol held by grace)",
    JSON.stringify(snapMembers(probe2.snapshot, "hall1")) === JSON.stringify(["bob", "carol"]),
    JSON.stringify(snapMembers(probe2.snapshot, "hall1")));

  // ---- grace expiry: absent members prune silently ----------------------------
  await sleep(14_000);                                    // > graceSec 12 since boot
  await sleep(SWEEP);
  const probe3 = new Client("probe3");
  await probe3.connect();
  await sleep(300);
  check("grace expiry: absent carol pruned SILENTLY, members [bob]",
    JSON.stringify(snapMembers(probe3.snapshot, "hall1")) === JSON.stringify(["bob"]),
    JSON.stringify(snapMembers(probe3.snapshot, "hall1")));
  check("the prune minted no exit says",
    regionSays().length === saidBefore, `${regionSays().length} vs ${saidBefore}`);

  // ---- spectator never a member ----------------------------------------------
  const eye = new Client("watcher");
  await eye.connect(true);                                // spectate
  await sleep(200);
  eye.walk([0, 0, 0]);                                    // dead center of hall1
  await sleep(SWEEP * 2);
  const probe4 = new Client("probe4");
  await probe4.connect();
  await sleep(300);
  check("spectator poses never become members",
    JSON.stringify(snapMembers(probe4.snapshot, "hall1")) === JSON.stringify(["bob"]),
    JSON.stringify(snapMembers(probe4.snapshot, "hall1")));

  // ---- authority: visitor cannot author a region ------------------------------
  rejoinerG: {
    const alice2 = new Client("alice");                   // ownership is durable history
    await alice2.connect();
    await sleep(200);
    alice2.verb("grant", { id: "probe3", role: "visitor" });
    await sleep(300);
    probe3.verb("comp", { id: "hall1", type: "region", data: { enter: "nope" } });
    await sleep(300);
    check("visitor comp bounces with rank prose",
      probe3.msgs.some((m) => m.type === "error" && /builder rights/.test(String(m.error))),
      probe3.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "");
    alice2.close();
  }

  // ---- lint: clamp + note ------------------------------------------------------
  alice_debug: {
    const alice2 = new Client("alice2debug");
    await alice2.connect();                               // owner is durable; new id is builder
    await sleep(SWEEP + 300);
    alice2.debug("region-lint");
    await sleep(300);
    const lint = alice2.msgs.filter((m) => m.type === "debug").at(-1);
    check("out-of-range numbers clamp with a region-lint note",
      JSON.stringify(lint?.events ?? []).includes("linty"),
      JSON.stringify(lint?.events ?? []).slice(0, 200));
    alice2.close();
  }

  // ---- comp removal drops tracking silently (hall1 still holds bob) ----------
  const sBefore = regionSays().length;
  const owner2 = new Client("alice");
  await owner2.connect();
  await sleep(200);
  owner2.verb("comp", { id: "hall1", type: "region", data: null });
  await sleep(SWEEP * 2);
  check("nulling the comp drops tracking silently (live member, no exit say)",
    regionSays().length === sBefore, `${regionSays().length} vs ${sBefore}`);

  // ---- cleanup ------------------------------------------------------------------
  bob.close(); bob2.close(); carol.close(); lateEarly.close(); probe.close();
  probe2.close(); probe3.close(); probe4.close(); eye.close(); owner2.close();
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
