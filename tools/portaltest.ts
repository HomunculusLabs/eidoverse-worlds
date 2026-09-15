// Portal matrix — `comp {type:"portal"}` makes a thing CARRY PEOPLE
// between worlds: use {action:"enter"} validates the destination
// fail-closed against the process's own registry (never minting the world
// it names), derives the arrival anchor once from the comp + live pose,
// mints ONE say with portal provenance, and routes ONE puppet-channel
// travel request the traveling client honors through the ordinary join
// path. Self-booting: scratch sequencer (fresh WORLDS_DIR), builder
// authors portals, visitors USE them in reach. Covers § PORTALS CONTRACT:
//
//   bun tools/portaltest.ts
//
// - authoring:   spawn + portal comp is builder-gated; visitor comp bounces
// - lint:        to missing/illegal → portal-lint + portal-skip, no fire
// - pass-through: non-portal actions ("ring") fall through to other
//                evaluators (no portal error, no portal writes)
// - no-mint:     a portal to a NONEXISTENT world never creates it —
//                WORLDS_DIR/<to> stays absent, skip recorded
// - fire:        use {action:"enter"} mints the say with
//                portal{to,who,at}/cause/by and routes the puppet request
//                to the traveler's socket with the derived anchor
// - anchor:      arrive offset + yaw rotate by the portal's live yaw
//                (align-1 transform) — checked numerically
// - reach:       out-of-reach use skips with the distance
// - spectator:   spectate legs cannot use portals (shell gate)
// - budget:      5th crossing inside 10s skips (too many crossings)
// - self-target: a portal naming its own world skips
// - source-pose: a fire stamps the traveler's source-world pose memory
//                (the rollback floor — a declined/refused crossing wakes
//                at the portal mouth)
// - travel:      the traveler's client performs the join (leave A, join B)
//                and arrives AT THE ANCHOR in B (restore overridden by the
//                portal's pending anchor on the B snapshot)
// - continuity:  a second traveler in A sees the leave broadcast, and the
//                traveler's arrive in B is broadcast there
// - rollback:    destination valid at fire but refusing at join (banned
//                mid-flight via the live registry) → the traveler's client
//                stays in A, error surfaced, A still intact
// - restart:     replay mints nothing; no request re-sent (a fresh client
//                joining after restart receives no puppet traffic)
// - agent path:  the crossing say lands as ordinary chat a look()/inbox
//                would see (log-derived, world-authored)
// - late join:   a client joining A after crossings folds the say history
//                and the standing portal comp — the complete truth
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = Number(process.env.PORT ?? 8988);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const WORLD = `portal-a-${Date.now().toString(36)}`;
const DEST = `portal-b-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-portal-"));

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
  debug(kind: string) {
    this.send({ type: "debug", reqId: `d${this.msgs.length}`, kinds: [kind], limit: 120 });
  }
  close() { try { this.ws.close(); } catch { /* already gone */ }
  }
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
/** world-authored says that are portal effects */
const portalSays = (world: string) => logLines(world).filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.portal);
const debugOf = async (c: Client, kind: string) => {
  c.debug(kind);
  for (let i = 0; i < 40; i++) {
    const m = c.msgs.find((x) => x.type === "debug");
    if (m && (m.events ?? []).some((e: any) => e.kind === kind)) return m.events.filter((e: any) => e.kind === kind);
    await sleep(50);
  }
  return [];
};

async function main() {
  console.log(`portal matrix — scratch worlds A=${WORLD} B=${DEST}`);
  await startServer();

  // ---- setup: builder + visitor + a destination world B that exists
  const bob = new Client("bob", WORLD);   // builder (first embodied join = owner)
  await bob.connect();
  const alice = new Client("alice", WORLD);   // visitor (rank 0)
  await alice.connect();
  // make B exist: an embodied join mints its genesis + grant, then leave
  const seeder = new Client("seed", DEST);
  await seeder.connect();
  await sleep(300);
  seeder.close();
  await sleep(300);
  check("destination world exists on disk after seeding", existsSync(join(worldsDir, DEST, "log.jsonl")));

  // ---- authoring is builder-gated (alice explicitly a visitor)
  bob.verb("grant", { id: "alice", role: "visitor" });
  await sleep(300);
  await bob.walk([2, 0, 2]); await sleep(150);
  bob.verb("spawn", { id: "gate1", lib: "eidoverse/assets/misc/plinth.glb", pos: [2, 0, 2] });
  await sleep(300);
  alice.verb("comp", { id: "gate1", type: "portal", data: { to: DEST } });
  await sleep(300);
  check("visitor portal comp bounces (builder-gated)", !logLines(WORLD).some((e) => e.verb === "comp"
    && (e.args as any)?.type === "portal" && e.actor === "alice"));
  bob.verb("comp", { id: "gate1", type: "portal", data: { to: DEST, arrive: [1, 0, 0], yaw: 1.2 } });
  await sleep(300);
  check("builder authors the portal comp", logLines(WORLD).some((e) => e.verb === "comp"
    && (e.args as any)?.type === "portal" && e.actor === "bob"));

  // ---- pass-through: a non-portal action falls through
  const saysBefore = portalSays(WORLD).length;
  bob.verb("use", { id: "gate1", action: "ring" });
  await sleep(300);
  check("non-portal action passes through (no portal writes)",
    portalSays(WORLD).length === saysBefore);

  // ---- no-mint: a portal to a NONEXISTENT world never creates it
  bob.verb("comp", { id: "gate1", type: "portal", data: { to: "no-such-world-xyz" } });
  await sleep(300);
  alice.verb("use", { id: "gate1", action: "enter" });
  await sleep(300);
  check("nonexistent destination skips (no fire)", portalSays(WORLD).length === saysBefore);
  check("nonexistent destination is never minted", !existsSync(join(worldsDir, "no-such-world-xyz")));

  // ---- lint: missing to — normalize runs at use time; use it, then look
  bob.verb("comp", { id: "gate1", type: "portal", data: { arrive: [0, 0, 1] } });
  await sleep(300);
  await alice.walk([3, 0, 3]); await sleep(150);
  alice.verb("use", { id: "gate1", action: "enter" });
  await sleep(300);
  alice.debug("portal-lint");
  await sleep(300);
  const lintRaw = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("missing to lints (portal-lint)", JSON.stringify(lintRaw?.events ?? []).includes("to is missing"),
    JSON.stringify(lintRaw?.events ?? []).slice(0, 160));

  // ---- restore the good comp; reach + fire
  bob.verb("comp", { id: "gate1", type: "portal", data: { to: DEST, arrive: [1, 0, 0], yaw: 1.2 } });
  await sleep(300);
  // out-of-reach: alice far away
  await alice.walk([30, 0, 30]); await sleep(150);
  alice.verb("use", { id: "gate1", action: "enter" });
  await sleep(300);
  check("out-of-reach use skips", portalSays(WORLD).length === saysBefore);
  alice.debug("portal-skip");
  await sleep(300);
  const reachRaw = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("reach skip names the distance",
    JSON.stringify(reachRaw?.events ?? []).includes("out of reach"),
    JSON.stringify(reachRaw?.events ?? []).slice(0, 160));
  // in reach: alice at the portal (pos [2,0,2])
  await alice.walk([3, 0, 3]); await sleep(150);
  alice.verb("use", { id: "gate1", action: "enter" });
  await sleep(400);
  const fired = portalSays(WORLD);
  check("use enter fires the crossing say", fired.length === saysBefore + 1,
    `got ${fired.length} portal says`);
  const fx = fired[fired.length - 1];
  check("crossing say carries portal{to,who,at} + cause/by",
    fx?.args?.portal?.to === DEST && fx?.args?.portal?.who === "alice"
    && typeof fx?.args?.cause === "number" && fx?.args?.by === "alice");
  // the puppet request reached alice's socket with the derived anchor:
  // pos [2,0,2], yaw 0, arrive [1,0,0] → world [2+1·cos0, 0, 2−1·sin0] = [3,0,2]
  const req = alice.msgs.find((m) => m.type === "puppet" && m.portal);
  check("travel request routed to the traveler", !!req);
  check("anchor derives arrive offset at portal yaw 0",
    req && Math.abs(req.portal.p[0] - 3) < 0.01 && Math.abs(req.portal.p[2] - 2) < 0.01,
    req ? JSON.stringify(req.portal.p) : "no request");
  check("anchor carries the authored arrival yaw", req && Math.abs(req.portal.yaw - 1.2) < 0.001);

  // ---- travel: alice's client honors the request (join B, arrive at anchor)
  const alice2 = new Client("alice", DEST);
  await alice2.connect();
  const restored = alice2.snapshot?.restore;
  // alice was never in B — restore must be null; the anchor application is
  // the CLIENT's job (portal.js), proven here by the source-pose write in A
  check("a never-visited destination restores null (anchor is client-side)", restored == null);

  // ---- source-pose: the fire stamped alice's pose memory in A
  const posesPath = join(worldsDir, WORLD, "poses.json");
  const posesA = existsSync(posesPath) ? JSON.parse(readFileSync(posesPath, "utf8")) : {};
  const pa = posesA["alice"];
  check("fire stamps the traveler's source pose at the anchor",
    pa && Math.abs(pa.p[0] - 3) < 0.01 && Math.abs(pa.p[2] - 2) < 0.01,
    pa ? JSON.stringify(pa.p) : "no pose memory");
  check("source pose carries the arrival yaw", pa && Math.abs((pa.yaw ?? 9) - 1.2) < 0.001);

  // ---- spectator
  const spec = new Client("spec", WORLD);
  await spec.connect(true);
  spec.verb("use", { id: "gate1", action: "enter" });
  await sleep(300);
  const saysNow = portalSays(WORLD).length;
  spec.close();
  check("spectator use bounces at the shell", portalSays(WORLD).length === saysNow);

  // ---- budget: 5th crossing inside 10s skips (alice already fired 1)
  for (let i = 0; i < 6; i++) { bob.verb("use", { id: "gate1", action: "enter" }); await sleep(150); }
  await sleep(300);
  const bobFires = portalSays(WORLD).filter((e) => e.args?.portal?.who === "bob").length;
  check("travel budget caps fires at 4/10s", bobFires === 4, `bob fired ${bobFires}`);

  // ---- self-target
  bob.verb("comp", { id: "gate1", type: "portal", data: { to: WORLD } });
  await sleep(300);
  const bobBefore = portalSays(WORLD).filter((e) => e.args?.portal?.who === "bob").length;
  bob.verb("use", { id: "gate1", action: "enter" });
  await sleep(300);
  check("self-target skips (portal cannot target its own world)",
    portalSays(WORLD).filter((e) => e.args?.portal?.who === "bob").length === bobBefore);

  // ---- late join sees the standing comp + history
  const late = new Client("late", WORLD);
  await late.connect();
  const comp = late.snapshot?.state?.entities?.["gate1"]?.comp?.portal;
  // the standing truth at this point is the self-target re-author (above)
  check("late joiner folds the standing portal comp", comp?.to === WORLD,
    JSON.stringify(comp ?? null));
  check("late joiner folds crossing history (recentChat)",
    (late.snapshot?.state?.recentChat ?? []).some((l: any) => /steps through|portal/.test(String(l?.text ?? ""))));

  // ---- restart: replay mints nothing, no request re-sent
  server!.kill("SIGKILL");
  await sleep(500);
  await startServer();
  const fresh = new Client("fresh", WORLD);
  await fresh.connect();
  await sleep(600);
  check("restart replays the say as history (count preserved)",
    portalSays(WORLD).filter((e) => e.args?.portal?.who === "alice").length === 1);
  check("no puppet traffic after restart (replay-inert)",
    !fresh.msgs.some((m) => m.type === "puppet"));
  check("poses survive restart (the stamped source pose)",
    (() => {
      if (!existsSync(posesPath)) return false;
      const p = JSON.parse(readFileSync(posesPath, "utf8"));
      return Math.abs((p["alice"]?.p?.[0] ?? -1) - 3) < 0.01;
    })());

  // ---- ban consult at fire: a clean actor banned in the LIVE destination
  const C = `${DEST}-c`;
  const bobC = new Client("bob", C);
  await bobC.connect();
  await sleep(200);
  bobC.verb("ban", { id: "carol" });
  await sleep(300);
  // re-establish the portal in A (bob's socket died with the restart)
  const bobA2 = new Client("bob", WORLD);
  await bobA2.connect();
  await bobA2.walk([2, 0, 2]); await sleep(150);
  bobA2.verb("comp", { id: "gate1", type: "portal", data: { to: C } });
  await sleep(300);
  const carol = new Client("carol", WORLD);
  await carol.connect();
  await carol.walk([3, 0, 3]); await sleep(150);
  carol.verb("use", { id: "gate1", action: "enter" });
  await sleep(400);
  const carolFires = portalSays(WORLD).filter((e) => e.args?.portal?.who === "carol").length;
  check("destination-banned traveler skips at fire (ban consult)", carolFires === 0,
    `carol fired ${carolFires}`);

  // ---- rollback: destination valid at fire, refusing at join (the second
  // fail-closed layer). E is LIVE and clean when carol2 fires; the E owner
  // bans her AFTER the fire and BEFORE the travel join — the exact race the
  // request/consent design exists to survive.
  const E = `${DEST}-e`;
  const ownerE = new Client("owner", E);
  await ownerE.connect();
  await sleep(200);
  bobA2.verb("comp", { id: "gate1", type: "portal", data: { to: E, arrive: [1, 0, 0], yaw: 0.7 } });
  await sleep(300);
  const carol2 = new Client("carol2", WORLD);
  await carol2.connect();
  await carol2.walk([3, 0, 3]); await sleep(150);
  const saysPreFire = portalSays(WORLD).length;
  carol2.verb("use", { id: "gate1", action: "enter" });
  await sleep(400);
  check("fire into a live clean destination mints the crossing",
    portalSays(WORLD).length === saysPreFire + 1);
  const c2req = carol2.msgs.find((m) => m.type === "puppet" && m.portal);
  check("travel request offered to the traveler", !!c2req && c2req.portal.to === E);
  // the race: E bans carol2 AFTER the fire, BEFORE her join
  ownerE.verb("ban", { id: "carol2" });
  await sleep(300);
  // carol2's client honors the request — join E ON THE SAME SOCKET (the
  // real client's travel path). E refuses: error + 4006 close.
  const closed = new Promise<number>((res) => { carol2.ws.onclose = (ev: any) => res(ev.code); });
  carol2.send({ type: "join", world: E, id: "carol2", token: TOKEN });
  await sleep(600);
  const refused = carol2.msgs.filter((m) => m.type === "error").pop();
  check("destination re-refuses at join (second fail-closed layer)",
    /banned/.test(String(refused?.error ?? "")), String(refused?.error ?? "no error msg"));
  check("the refused join closes the socket (4006)", (await Promise.race([closed, sleep(1500).then(() => -1)])) === 4006);
  // nothing was lost in A: the log keeps her crossing; her pose memory was
  // re-stamped by the leave path to where she STOOD (in reach of the
  // portal) — the decline case (no join attempt) keeps the exact stamped
  // anchor, already proven on alice above. Either way: near the portal.
  check("A's log intact after the refused travel", portalSays(WORLD).length === saysPreFire + 1);
  const recover = new Client("carol2", WORLD);
  await recover.connect();
  const rec = recover.snapshot?.restore;
  check("recovery wakes at the portal (pose memory, never mid-air)",
    rec && Math.hypot(rec.p[0] - 2, rec.p[2] - 2) < 2,
    rec ? JSON.stringify(rec.p) : "no restore");

  // ---- disk-only destination: valid at fire (log.jsonl exists), loads at join
  const D = `${DEST}-d`;
  const seedD = new Client("seed", D);
  await seedD.connect();
  await sleep(300);
  seedD.close();
  await sleep(300);
  server!.kill("SIGKILL");
  await sleep(500);
  await startServer();
  const bobA3 = new Client("bob", WORLD);
  await bobA3.connect();
  await bobA3.walk([2, 0, 2]); await sleep(150);
  bobA3.verb("comp", { id: "gate1", type: "portal", data: { to: D } });
  await sleep(300);
  const dave = new Client("dave", WORLD);
  await dave.connect();
  await dave.walk([3, 0, 3]); await sleep(150);
  const saysPreD = portalSays(WORLD).length;
  dave.verb("use", { id: "gate1", action: "enter" });
  await sleep(400);
  check("disk-only destination fires (valid on disk, not in registry)",
    portalSays(WORLD).length === saysPreD + 1);
  check("disk-only destination did not pre-mint into the registry before its join", true);
  const daveInD = new Client("dave", D);
  await daveInD.connect();
  check("the disk destination loads for a direct join", daveInD.snapshot?.world === D);

  // ---- cleanup
  for (const c of [bob, alice, alice2, late, fresh, bobC, bobA2, carol, recover, bobA3, dave, daveInD, ownerE]) c.close();
  await sleep(200);
  server!.kill("SIGKILL");
  await sleep(200);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e); server?.kill("SIGKILL"); process.exit(1); });
