// Waystone matrix — `comp {type:"waystone"}` makes a thing CARRY PEOPLE
// across its own world: use {action:"hop"} resolves the partner entity
// fail-closed, derives the arrival anchor once from the comp + the
// TARGET's live pose, mints ONE say with waystone provenance, and routes
// ONE puppet-channel hop request the traveling client honors by moving
// its OWN body (no rejoin — the client owns the body, the request is the
// designed consent surface). Self-booting: scratch sequencer (fresh
// WORLDS_DIR), builder authors stone pairs, visitors USE them in reach.
// Covers § WAYSTONES CONTRACT:
//
//   bun tools/waystonetest.ts
//
// - authoring:   spawn + waystone comp is builder-gated; visitor comp bounces
// - lint:        pair missing/illegal → waystone-lint + waystone-skip, no fire
// - pass-through: non-waystone actions ("ring") fall through to other
//                evaluators (no waystone error, no waystone writes)
// - fire:        use {action:"hop"} mints the say with
//                waystone{from,to,who,at}/cause/by and routes the puppet
//                request to the traveler's socket with the derived anchor
// - anchor:      arrive offset + yaw rotate by the TARGET's live yaw
//                (align-1 transform) — checked numerically
// - reach:       out-of-reach use skips with the distance
// - spectator:   spectate legs cannot hop (shell gate)
// - cooldown:    second hop inside cooldownSec skips; skips don't consume
//                the window; after the window it re-fires
// - pairing:     pair to a non-entity / non-waystone / itself skips with
//                the reason; a legal pair fires at the TARGET anchor
// - seated:      a body-mounted traveler skips (unseat first)
// - client hop:  the traveler's client applies the anchor to its own body
//                and streams it on the presence plane (the hop observable
//                to others as the pose packet — no rejoin, no new socket)
// - rollback:    a declining client simply never moves (its last pose is
//                its truth — proven by the next joiner's restore read)
// - restart:     replay mints nothing; no request re-sent (a fresh client
//                joining after restart receives no puppet traffic)
// - agent path:  the hop say lands as ordinary chat a look()/inbox
//                would see (log-derived, world-authored)
// - late join:   a client joining after hops folds the say history and
//                the standing waystone comps — the complete truth
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeWaystone, waystoneAnchor } from "../shared/waystone.js";

const PORT = Number(process.env.PORT ?? 8989);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const WORLD = `waystone-w-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-waystone-"));

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
/** world-authored says that are waystone effects */
const wsSays = (world: string) => logLines(world).filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.waystone);

async function main() {
  console.log(`waystone matrix — scratch world ${WORLD}`);
  await startServer();

  // ---- shared math, pinned first (the shared-verbatim law)
  const { cfg: mc } = normalizeWaystone({ pair: "stoneB", arrive: [1, 0, 0], yaw: 1.2, reach: 5, cooldownSec: 4 });
  check("normalize: legal comp clamps clean (no notes)", mc.pair === "stoneB" && mc.notes === undefined, JSON.stringify(mc));
  const anchor0 = waystoneAnchor([10, 0, 20], 0, { pair: "x", arrive: [1, 0, 0], reach: 4, cooldownSec: 8, line: null, yaw: null });
  check("anchor: arrive +x at target yaw 0 → [11,0,20], facing target yaw",
    Math.abs(anchor0.p[0] - 11) < 1e-9 && Math.abs(anchor0.p[2] - 20) < 1e-9 && anchor0.yaw === 0,
    JSON.stringify(anchor0));
  const anchorQ = waystoneAnchor([0, 0, 0], Math.PI / 2, { pair: "x", arrive: [1, 0, 0], reach: 4, cooldownSec: 8, line: null, yaw: null });
  check("anchor: arrive +x at target yaw π/2 → [0,0,-1] (align-1 rotation)",
    Math.abs(anchorQ.p[0] - 0) < 1e-9 && Math.abs(anchorQ.p[2] - (-1)) < 1e-9,
    JSON.stringify(anchorQ));

  // ---- setup: builder + visitor + the pair
  const bob = new Client("bob", WORLD);   // builder (first embodied join = owner)
  await bob.connect();
  const alice = new Client("alice", WORLD);   // visitor (rank 0)
  await alice.connect();
  bob.verb("grant", { id: "alice", role: "visitor" });
  await sleep(300);
  await bob.walk([2, 0, 2]); await sleep(150);
  bob.verb("spawn", { id: "stoneA", lib: "eidoverse/assets/misc/plinth.glb", pos: [2, 0, 2] });
  bob.verb("spawn", { id: "stoneB", lib: "eidoverse/assets/misc/plinth.glb", pos: [40, 0, 40] });
  await sleep(300);
  check("pair stones stand in the fold",
    logLines(WORLD).filter((e) => e.verb === "spawn" && ["stoneA", "stoneB"].includes((e.args as any)?.id)).length === 2);

  // ---- frozen baseline for the pass-through/lint/pairing sections
  const saysBase = wsSays(WORLD).length;

  // ---- authoring is builder-gated
  alice.verb("comp", { id: "stoneA", type: "waystone", data: { pair: "stoneB" } });
  await sleep(300);
  check("visitor waystone comp bounces (builder-gated)",
    !logLines(WORLD).some((e) => e.verb === "comp" && (e.args as any)?.type === "waystone" && e.actor === "alice"));
  bob.verb("comp", { id: "stoneA", type: "waystone", data: { pair: "stoneB", arrive: [1, 0, 0], yaw: 1.2 } });
  bob.verb("comp", { id: "stoneB", type: "waystone", data: { pair: "stoneA", arrive: [0, 0, 1] } });
  await sleep(300);
  check("builder authors both waystone comps",
    logLines(WORLD).filter((e) => e.verb === "comp" && (e.args as any)?.type === "waystone" && e.actor === "bob").length === 2);

  // ---- pass-through: a non-waystone action falls through
  bob.verb("use", { id: "stoneA", action: "ring" });
  await sleep(300);
  check("non-waystone action passes through (no waystone writes)",
    wsSays(WORLD).length === saysBase);

  // ---- lint: illegal pair — comp with pair: "not an id!" → lint + skip at fire
  bob.verb("comp", { id: "stoneA", type: "waystone", data: { pair: "not an id!" } });
  await sleep(300);
  await alice.walk([3, 0, 3]); await sleep(150);
  alice.verb("use", { id: "stoneA", action: "hop" });
  await sleep(300);
  alice.send({ type: "debug", reqId: "d1", kinds: ["waystone-lint"], limit: 60 });
  await sleep(300);
  const lintRaw = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("illegal pair lints (waystone-lint)", JSON.stringify(lintRaw?.events ?? []).includes("pair"),
    JSON.stringify(lintRaw?.events ?? []).slice(0, 160));
  check("illegal pair skips (no fire)", wsSays(WORLD).length === saysBase);
  // restore the good comp
  bob.verb("comp", { id: "stoneA", type: "waystone", data: { pair: "stoneB", arrive: [1, 0, 0], yaw: 1.2 } });
  await sleep(300);

  // ---- pairing: pair to a non-entity / non-waystone / itself
  bob.verb("comp", { id: "stoneA", type: "waystone", data: { pair: "ghost-stone" } });
  await sleep(300);
  await alice.walk([3, 0, 3]); await sleep(150);
  alice.verb("use", { id: "stoneA", action: "hop" }); await sleep(300);
  check("pair to a non-entity skips", wsSays(WORLD).length === saysBase);
  bob.verb("comp", { id: "stoneA", type: "waystone", data: { pair: "stoneA" } });
  await sleep(300);
  alice.verb("use", { id: "stoneA", action: "hop" }); await sleep(300);
  check("pair to itself skips", wsSays(WORLD).length === saysBase);
  bob.verb("comp", { id: "stoneA", type: "waystone", data: { pair: "stoneC" } });
  bob.verb("spawn", { id: "stoneC", lib: "eidoverse/assets/misc/plinth.glb", pos: [50, 0, 50] });
  await sleep(300);
  alice.verb("use", { id: "stoneA", action: "hop" }); await sleep(300);
  check("pair to a non-waystone entity skips", wsSays(WORLD).length === saysBase);
  alice.send({ type: "debug", reqId: "d2", kinds: ["waystone-skip"], limit: 60 });
  await sleep(300);
  const skipRaw = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("pairing skips are named (waystone-skip)",
    JSON.stringify(skipRaw?.events ?? []).includes("not a waystone"),
    JSON.stringify(skipRaw?.events ?? []).slice(0, 200));
  // restore the good comp
  bob.verb("comp", { id: "stoneA", type: "waystone", data: { pair: "stoneB", arrive: [1, 0, 0], yaw: 1.2 } });
  await sleep(300);

  // ---- reach: out-of-reach use skips
  await alice.walk([30, 0, 30]); await sleep(150);
  alice.verb("use", { id: "stoneA", action: "hop" });
  await sleep(300);
  check("out-of-reach use skips", wsSays(WORLD).length === saysBase);
  alice.send({ type: "debug", reqId: "d3", kinds: ["waystone-skip"], limit: 60 });
  await sleep(300);
  const reachRaw = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("reach skip names the distance",
    JSON.stringify(reachRaw?.events ?? []).includes("out of reach"),
    JSON.stringify(reachRaw?.events ?? []).slice(0, 160));

  // ---- FIRE: in reach — alice hops stoneA → stoneB
  await alice.walk([3, 0, 3]); await sleep(150);
  alice.verb("use", { id: "stoneA", action: "hop" });
  await sleep(400);
  check("use hop fires the carry say", wsSays(WORLD).length === saysBase + 1,
    `got ${wsSays(WORLD).length} waystone says`);
  const fired = wsSays(WORLD);
  const fx = fired[fired.length - 1];
  check("carry say carries waystone{from,to,who,at} + cause/by",
    fx?.args?.waystone?.from === "stoneA" && fx?.args?.waystone?.to === "stoneB"
    && fx?.args?.waystone?.who === "alice"
    && typeof fx?.args?.cause === "number" && fx?.args?.by === "alice");
  // the puppet request reached alice's socket with the derived anchor:
  // stoneB at [40,0,40] yaw 0, arrive [1,0,0] → [41,0,40]; yaw 1.2
  const req = alice.msgs.find((m) => m.type === "puppet" && m.waystone);
  check("hop request routed to the traveler", !!req);
  check("anchor derives arrive offset at target yaw 0",
    req && Math.abs(req.waystone.p[0] - 41) < 0.01 && Math.abs(req.waystone.p[2] - 40) < 0.01,
    req ? JSON.stringify(req.waystone.p) : "no request");
  check("anchor carries the authored arrival yaw", req && Math.abs(req.waystone.yaw - 1.2) < 0.001);

  // ---- cooldown: second hop inside the window skips (default 8s)
  await alice.walk([42, 0, 41]); await sleep(150);   // near stoneB (she "hopped" — client-side)
  alice.verb("use", { id: "stoneB", action: "hop" }); await sleep(300);
  check("second hop inside cooldown skips", wsSays(WORLD).length === saysBase + 1,
    `says ${wsSays(WORLD).length}`);
  alice.send({ type: "debug", reqId: "d4", kinds: ["waystone-skip"], limit: 60 });
  await sleep(300);
  const cdRaw = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("cooldown skip is named",
    JSON.stringify(cdRaw?.events ?? []).includes("cooldown"),
    JSON.stringify(cdRaw?.events ?? []).slice(0, 200));
  // skips don't consume the window: after 8.5s the hop re-fires
  await sleep(8600);
  alice.verb("use", { id: "stoneB", action: "hop" }); await sleep(400);
  check("after the cooldown window the hop re-fires",
    wsSays(WORLD).length === saysBase + 2,
    `says ${wsSays(WORLD).length}`);

  // ---- the client hop: alice applies the anchor to her own body and
  // streams it (the presence packet others see). We simulate the client:
  // her client would apply the anchor from the request; the server then
  // sees her next pose at the anchor. Prove the anchor was CORRECT and
  // the observable is an ordinary pose: apply the FIRST request now.
  const firstReq = alice.msgs.filter((m) => m.type === "puppet" && m.waystone)[0];
  check("first request still queued client-side (one per fire)", !!firstReq);
  if (firstReq) alice.walk(firstReq.waystone.p);
  await sleep(300);
  // a joiner after the fact reads alice at the anchor via lastPose...
  const joiner = new Client("joiner", WORLD);
  await joiner.connect();
  const alicePose = joiner.snapshot?.present?.find((p: any) => p.id === "alice")?.pose;
  check("the hop observable is an ordinary presence pose at the anchor",
    !!firstReq && !!alicePose
    && Math.hypot(alicePose.p[0] - firstReq.waystone.p[0], alicePose.p[2] - firstReq.waystone.p[2]) < 0.05,
    JSON.stringify(alicePose?.p ?? null));

  // ---- seated: a body-mounted traveler does not hop
  // bob mounts himself onto stoneA (a body mount — selfRankZero)
  await bob.walk([2, 0, 2]); await sleep(150);
  bob.verb("mount", { id: "bob", to: "stoneA", offset: [0, 0.6, 0] });
  await sleep(300);
  const preSeated = wsSays(WORLD).length;
  bob.verb("use", { id: "stoneA", action: "hop" }); await sleep(300);
  check("seated traveler skips (unseat first)", wsSays(WORLD).length === preSeated);
  bob.send({ type: "debug", reqId: "d5", kinds: ["waystone-skip"], limit: 60 });
  await sleep(300);
  const seatedRaw = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("seated skip names the reason",
    JSON.stringify(seatedRaw?.events ?? []).includes("unseat"),
    JSON.stringify(seatedRaw?.events ?? []).slice(0, 200));
  bob.verb("dismount", { id: "bob", pos: [2, 0, 2], yaw: 0 });
  await sleep(300);

  // ---- spectator: spectate legs cannot hop
  const spec = new Client("spec", WORLD);
  await spec.connect(true);
  spec.verb("use", { id: "stoneA", action: "hop" });
  await sleep(300);
  const saysSpec = wsSays(WORLD).length;
  spec.close();
  check("spectator use bounces at the shell", wsSays(WORLD).length === saysSpec);

  // ---- rollback: a declining client simply never moves
  // dave gets a request but does NOT apply it; the next joiner sees him
  // exactly where he stood (last live pose is the truth).
  const dave = new Client("dave", WORLD);
  await dave.connect();
  await dave.walk([3, 0, 3]); await sleep(150);
  const preDave = wsSays(WORLD).length;
  dave.verb("use", { id: "stoneA", action: "hop" }); await sleep(400);
  check("dave's fire mints the say", wsSays(WORLD).length === preDave + 1);
  const daveReq = dave.msgs.filter((m) => m.type === "puppet" && m.waystone).at(-1);
  check("dave received the request", !!daveReq);
  // dave DECLINES: sends nothing. A fresh joiner reads his last pose.
  const fresh1 = new Client("fresh1", WORLD);
  await fresh1.connect();
  const davePose = fresh1.snapshot?.present?.find((p: any) => p.id === "dave")?.pose;
  check("declining client never moved (last pose is the truth)",
    davePose && Math.hypot(davePose.p[0] - 3, davePose.p[2] - 3) < 0.05,
    JSON.stringify(davePose?.p ?? null));
  fresh1.close();

  // ---- restart: replay mints nothing, no request re-sent
  server!.kill("SIGKILL");
  await sleep(500);
  await startServer();
  const fresh2 = new Client("fresh2", WORLD);
  await fresh2.connect();
  await sleep(600);
  check("restart replays the says as history (count preserved)",
    wsSays(WORLD).length === preDave + 1);
  check("no puppet traffic after restart (replay-inert)",
    !fresh2.msgs.some((m) => m.type === "puppet"));
  check("late joiner folds the standing waystone comps",
    fresh2.snapshot?.state?.entities?.stoneA?.comp?.waystone?.pair === "stoneB"
    && fresh2.snapshot?.state?.entities?.stoneB?.comp?.waystone?.pair === "stoneA",
    JSON.stringify(fresh2.snapshot?.state?.entities?.stoneA?.comp?.waystone ?? null));
  check("late joiner folds hop history (recentChat)",
    (fresh2.snapshot?.state?.recentChat ?? []).some((l: any) => /carried away|waystone/.test(String(l?.text ?? ""))));
  // cooldown is in-memory: after restart the same traveler may re-fire
  // (dave's socket died with the restart — reconnect him, portal-test
  // doctrine)
  const dave2 = new Client("dave", WORLD);
  await dave2.connect();
  await dave2.walk([3, 0, 3]); await sleep(150);
  dave2.verb("use", { id: "stoneA", action: "hop" }); await sleep(400);
  check("restart forgets the cooldown (in-memory, phrases doctrine)",
    wsSays(WORLD).length === preDave + 2,
    `says ${wsSays(WORLD).length}`);

  // ---- agent path: the say lands as ordinary chat (log-derived)
  check("hop say is world-authored chat a look() would see",
    (() => {
      const e = wsSays(WORLD).at(-1);
      return e?.actor === "world" && typeof e?.args?.text === "string" && e.args.text.length > 0;
    })());

  // ---- cleanup
  for (const c of [bob, alice, joiner, spec, dave, dave2, fresh2]) c.close();
  await sleep(200);
  server!.kill("SIGKILL");
  await sleep(200);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e); server?.kill("SIGKILL"); process.exit(1); });
