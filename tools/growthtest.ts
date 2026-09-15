// Growth matrix — `comp {type:"growth"}` makes a thing ALIVE: its stage
// derives from TIME (motion.js doctrine), every hand interaction (advance/
// tend) is ONE world-authored back-dated comp transition ({...authored,
// stage, plantedAt, at}), late join/restart fold identical truth, and the
// derivation runs on every client from the same folded numbers. Self-
// booting: scratch sequencer (fresh WORLDS_DIR). Covers § GROWTH CONTRACT:
//
//   bun tools/growthtest.ts
//
// - shared math: normalize clamps every bound; stageAt/growthK are pure;
//   cumMs back-dates; seedOf is stable per id
// - authoring:  spawn + growth comp is builder-gated; visitor comp bounces
// - advance:    use {action:"advance"} writes stage+1 back-dated; say line
//               carries growth{stage,who,at} + cause/by; the use logs
// - tend:       derived-1 (nurture); at crown/wilt edge cases; no-ops mint
//               nothing; anyone present may tend (rank 0)
// - time:       TIME advances the stage with zero writes (the derivation,
//               not the fold, is truth); wilt holds; tend from wilt
//               returns the crown; cyclic wraps
// - fold truth: folded literal == derived at the write instant; late join
//               folds it; restart replay mints nothing
// - reach/spectator/pass-through/lint/describe/idempotence
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  normalizeGrowth, stageAt, growthK, cumMs, stageName, describeGrowth, seedOf,
} from "../shared/growth.js";

const PORT = Number(process.env.PORT ?? 8983);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-growth";
const WORLD = `growthtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-growth-"));

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
const growthSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.growth != null && (!id || (e.args as any)?.id === id));
const growthComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "growth" && (!id || (e.args as any)?.id === id));
const logGrowth = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "growth"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapGrowth = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.growth ?? null;

try {
  console.log(`\ngrowth matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- shared math (pure, before any server work) -----------------------------
  {
    const n = normalizeGrowth({ stages: [{ name: "seed", dwell: -5 }, { dwell: "x" }], reach: 99 } as any);
    check("normalizeGrowth clamps every bound and notes it",
      n.cfg.stages[0].dwell === 0 && n.cfg.stages[1].dwell === 3600 && n.cfg.reach === 12 && n.notes.length >= 3,
      JSON.stringify(n));
    const d = normalizeGrowth({});
    check("normalizeGrowth defaults are legal (one-stage ladder)",
      d.cfg.stages.length === 1 && d.cfg.stages[0].name === "grown" && d.cfg.stages[0].dwell === 3600,
      JSON.stringify(d.cfg.stages));
    check("default ladder derives stage 0 (fail closed)",
      stageAt(d.cfg, undefined, undefined, Date.now()) === 0);

    const cfg3 = normalizeGrowth({ stages: [
      { name: "seed", dwell: 10 }, { name: "sprout", dwell: 10 }, { name: "bloom", dwell: 10 },
    ] }).cfg;
    const t0 = 1_000_000;
    check("stageAt walks the ladder as time passes (seed→sprout→bloom)",
      stageAt(cfg3, t0, undefined, t0) === 0
        && stageAt(cfg3, t0, undefined, t0 + 5_000) === 0
        && stageAt(cfg3, t0, undefined, t0 + 15_000) === 1
        && stageAt(cfg3, t0, t0, t0 + 25_000) === 2
        && stageAt(cfg3, t0, undefined, t0 + 35_000) === 3,
      [0, 5, 15, 25, 35].map((s) => stageAt(cfg3, t0, undefined, t0 + s * 1000)).join(" "));
    check("past the last dwell a non-cyclic plant wilts (index === length)",
      stageAt(cfg3, t0, undefined, t0 + 41_000) === 3);
    const cyc = normalizeGrowth({ cycle: true, stages: [
      { name: "seed", dwell: 10 }, { name: "sprout", dwell: 10 }, { name: "bloom", dwell: 10 },
    ] }).cfg;
    check("a cyclic plant wraps within the ladder",
      stageAt(cyc, t0, undefined, t0 + 35_000) === 0
        && stageAt(cyc, t0, undefined, t0 + 45_000) === 1
        && stageAt(cyc, t0, undefined, t0 + 50_000) === 2
        && stageAt(cyc, t0, undefined, t0 + 60_000) === 0,
      [35, 45, 50, 60].map((s) => stageAt(cyc, t0, undefined, t0 + s * 1000)).join(" "));
    check("growthK: 0 at a stage's start, 1 at the crown's end, smoothstep between",
      growthK(cfg3, t0, undefined, t0) === 0
        && growthK(cfg3, t0, undefined, t0 + 10_000) === 0
        && growthK(cfg3, t0, undefined, t0 + 5_000) > 0 && growthK(cfg3, t0, undefined, t0 + 5_000) < 1
        && growthK(cfg3, t0, undefined, t0 + 30_000) === 1
        && growthK(cfg3, t0, undefined, t0 + 40_000) === 1,
      `k5=${growthK(cfg3, t0, undefined, t0 + 5_000).toFixed(3)}`);
    check("cumMs back-dates: stage 2 earned at base+20s",
      cumMs(cfg3, 2) === 20_000 && cumMs(cfg3, 0) === 0);
    check("stageName names the wilt hold",
      stageName(cfg3, 3) === "wilt" && stageName(cfg3, 0) === "seed");
    check("seedOf is stable per id and authored seeds win",
      seedOf("plant1", undefined) === seedOf("plant1", undefined)
        && seedOf("plant1", undefined) !== seedOf("plant2", undefined)
        && seedOf("plant1", 7) === 7);
    const zcfg = normalizeGrowth({ stages: [{ name: "seed", dwell: 0 }, { name: "sprout", dwell: 10 }] }).cfg;
    check("a zero-dwell stage is instant (the ladder skips past it at t=0)",
      stageAt(zcfg, t0, undefined, t0) === 1 && stageAt(zcfg, t0, undefined, t0 + 5_000) === 1,
      `${stageAt(zcfg, t0, undefined, t0)}`);
  }

  // ---- authoring --------------------------------------------------------------
  const alice = new Client("alice");                        // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "plant1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "plant1", type: "growth", data: {
    stages: [{ name: "seed", dwell: 600 }, { name: "sprout", dwell: 600 }, { name: "bloom", dwell: 600 }],
    growAt: "the seedling grows", tendAt: "the seedling is tended",
  } });
  await sleep(400);
  check("builder authored spawn + growth comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  // visitor authoring bounce
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  const compsBefore = growthComps("plant1").length;
  bob.verb("comp", { id: "plant1", type: "growth", data: { stage: 2 } });
  await sleep(300);
  check("visitor comp authoring bounces (builder-gated)",
    growthComps("plant1").length === compsBefore && logGrowth("plant1")?.stage === undefined,
    JSON.stringify(logGrowth("plant1"))?.slice(0, 120));

  // ---- advance: the hand hurries growth ----------------------------------------
  bob.walk([3, 0, 0]);                                  // 3m from plant1 — inside reach 4
  await sleep(300);
  bob.verb("use", { id: "plant1", action: "advance" });
  await sleep(400);
  {
    const says = growthSays("plant1");
    check("advance says the authored line",
      says.length === 1 && (says[0]?.args as any)?.text === "the seedling grows",
      `${says.length} says: ${JSON.stringify(says.map((s) => (s.args as any)?.text))}`);
    check("say carries growth{stage,who,at} + cause/by provenance",
      (says[0]?.args as any)?.growth?.stage === 1 && (says[0]?.args as any)?.growth?.who === "bob"
        && typeof (says[0]?.args as any)?.growth?.at === "number"
        && typeof (says[0]?.args as any)?.cause === "number" && (says[0]?.args as any)?.by === "bob",
      JSON.stringify(says[0]?.args?.growth));
    const comps = growthComps("plant1");
    check("the advance wrote ONE world-authored comp transition", comps.length === 1,
      `${comps.length} growth comp writes`);
    const d = comps[0]?.args as any;
    check("the write is back-dated: plantedAt = at − cumMs(stage) (600s dwell)",
      d?.data?.stage === 1 && d?.data?.plantedAt === d?.data?.at - 600_000
        && typeof d?.data?.at === "number",
      JSON.stringify({ stage: d?.data?.stage, plantedAt: d?.data?.plantedAt, at: d?.data?.at }));
    const d2 = logGrowth("plant1");
    check("stageAt(folded comp, write instant) === folded literal (always consistent)",
      stageAt(normalizeGrowth(d2).cfg, d2?.plantedAt, d2?.at, d2?.at) === d2?.stage,
      `derived ${stageAt(normalizeGrowth(d2).cfg, d2?.plantedAt, d2?.at, d2?.at)} vs folded ${d2?.stage}`);
    check("the use verb logged with bob as actor (authority trace)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob"
        && (e.args as any)?.id === "plant1" && (e.args as any)?.action === "advance"));
    check("the effect broadcast to the room",
      alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
        && m.entry?.actor === "world" && (m.entry?.args as any)?.growth?.who === "bob"));
  }

  // ---- tend: the hand nurtures back ---------------------------------------------
  bob.verb("use", { id: "plant1", action: "tend" });
  await sleep(400);
  {
    const d = logGrowth("plant1");
    check("tend writes derived−1 (back to seed, plantedAt = at)",
      d?.stage === 0 && d?.plantedAt === d?.at,
      JSON.stringify({ stage: d?.stage, plantedAt: d?.plantedAt, at: d?.at }));
    check("tend says the authored line",
      (growthSays("plant1").at(-1)?.args as any)?.text === "the seedling is tended");
  }

  // ---- no-ops: tend at seed, advance at crown ------------------------------------
  bob.verb("use", { id: "plant1", action: "tend" });
  await sleep(300);
  {
    const saidN = growthSays("plant1").length, wroteN = growthComps("plant1").length;
    check("tend at seed is a no-op (nothing smaller to tend)",
      growthSays("plant1").length === saidN && growthComps("plant1").length === wroteN,
      `${growthSays("plant1").length}/${growthComps("plant1").length}`);
    bob.debug("growth-skip"); await sleep(300);
    const sk = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the no-op skip names the boundary",
      JSON.stringify(sk?.events ?? []).includes("seed"),
      JSON.stringify(sk?.events ?? []).slice(0, 160));
  }

  // ---- anyone present may tend (rank 0) -------------------------------------------
  {
    const carol = new Client("carol");
    await carol.connect();
    await sleep(200);
    carol.walk([2, 0, 0]); await sleep(200);
    bob.verb("use", { id: "plant1", action: "advance" });   // back to sprout (by bob)
    await sleep(400);
    carol.verb("use", { id: "plant1", action: "tend" });    // carol tends bob's plant
    await sleep(400);
    check("anyone present may tend (nurture is rank 0)",
      logGrowth("plant1")?.stage === 0 && growthSays("plant1").length === 4,
      `stage=${logGrowth("plant1")?.stage} says=${growthSays("plant1").length}`);
    carol.close();
  }

  // ---- late join folds the written truth -------------------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapGrowth(late.snapshot, "plant1");
    check("late joiner folds stage 0 + plantedAt from the log",
      d?.stage === 0 && typeof d?.plantedAt === "number" && d?.growAt === "the seedling grows",
      JSON.stringify(d)?.slice(0, 140));
    late.close();
  }

  // ---- time is the truth: wilt holds, tend returns the crown ------------------------
  {
    alice.verb("spawn", { id: "plant2", lib: "deco/bench.glb", pos: [6, 0, 0], yaw: 0 });
    alice.verb("comp", { id: "plant2", type: "growth", data: {
      stages: [{ name: "seed", dwell: 1 }, { name: "sprout", dwell: 1 }, { name: "bloom", dwell: 1 }],
    } });
    await sleep(300);
    bob.walk([5, 0, 0]); await sleep(200);                 // 1m from plant2
    bob.verb("use", { id: "plant2", action: "advance" }); await sleep(400);
    bob.verb("use", { id: "plant2", action: "advance" }); await sleep(400);
    let d = logGrowth("plant2");
    check("short-ladder advance reaches the crown (stage 2)",
      d?.stage === 2 && growthSays("plant2").length === 2,
      `stage=${d?.stage} says=${growthSays("plant2").length}`);
    const saidW = growthSays("plant2").length, wroteW = growthComps("plant2").length;
    bob.verb("use", { id: "plant2", action: "advance" }); await sleep(300);
    check("advance at the crown is a no-op (you cannot hurry it past its prime)",
      growthSays("plant2").length === saidW && growthComps("plant2").length === wroteW);
    await sleep(1500);                                     // let TIME pass the last dwell
    d = logGrowth("plant2");
    check("TIME wilts the plant with ZERO writes (derived, not folded)",
      growthComps("plant2").length === wroteW
        && stageAt(normalizeGrowth(d).cfg, d?.plantedAt, d?.at, Date.now()) === 3,
      `derived=${stageAt(normalizeGrowth(d).cfg, d?.plantedAt, d?.at, Date.now())}`);
    bob.verb("use", { id: "plant2", action: "tend" }); await sleep(400);
    d = logGrowth("plant2");
    check("tend from wilt returns the crown (one more season at bloom)",
      d?.stage === 2 && stageAt(normalizeGrowth(d).cfg, d?.plantedAt, d?.at, d?.at) === 2,
      JSON.stringify({ stage: d?.stage }));
    check("tend from wilt says the default tend line",
      (growthSays("plant2").at(-1)?.args as any)?.text === "the plant is tended",
      (growthSays("plant2").at(-1)?.args as any)?.text);
  }

  // ---- cycle wraps -------------------------------------------------------------------
  {
    alice.verb("spawn", { id: "plant3", lib: "deco/bench.glb", pos: [12, 0, 0], yaw: 0 });
    alice.verb("comp", { id: "plant3", type: "growth", data: {
      cycle: true,
      stages: [{ name: "seed", dwell: 1 }, { name: "sprout", dwell: 1 }, { name: "bloom", dwell: 1 }],
    } });
    await sleep(300);
    bob.walk([11, 0, 0]); await sleep(200);                // 1m from plant3
    bob.verb("use", { id: "plant3", action: "advance" }); await sleep(400);
    bob.verb("use", { id: "plant3", action: "advance" }); await sleep(400);
    bob.verb("use", { id: "plant3", action: "advance" }); await sleep(400);
    const d = logGrowth("plant3");
    check("cyclic advance at the crown WRAPS to seed (the seasonal loop)",
      d?.stage === 0 && stageAt(normalizeGrowth(d).cfg, d?.plantedAt, d?.at, d?.at) === 0,
      JSON.stringify({ stage: d?.stage }));
    check("cyclic wrap says the default grow line",
      (growthSays("plant3").at(-1)?.args as any)?.text === "the plant grows",
      (growthSays("plant3").at(-1)?.args as any)?.text);
  }

  // ---- reach gate --------------------------------------------------------------------
  bob.walk([30, 0, 0]);                                   // far from plant1
  await sleep(300);
  {
    const saidR = growthSays("plant1").length, wroteR = growthComps("plant1").length;
    bob.verb("use", { id: "plant1", action: "advance" });
    await sleep(300);
    check("out-of-reach use mints nothing",
      growthSays("plant1").length === saidR && growthComps("plant1").length === wroteR,
      `${growthSays("plant1").length}/${growthComps("plant1").length}`);
    bob.debug("growth-skip"); await sleep(300);
    const sk = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the reach skip names the distance",
      JSON.stringify(sk?.events ?? []).includes("reach"),
      JSON.stringify(sk?.events ?? []).slice(0, 160));
  }

  // ---- spectator bounce ----------------------------------------------------------------
  {
    const spec = new Client("spec1");
    await spec.connect(true);
    await sleep(200);
    spec.walk([1, 0, 1]); await sleep(200);
    const saidS = growthSays("plant1").length, wroteS = growthComps("plant1").length;
    spec.verb("use", { id: "plant1", action: "advance" });
    await sleep(300);
    check("spectators cannot use growth (shell gate)",
      growthSays("plant1").length === saidS && growthComps("plant1").length === wroteS,
      `${growthSays("plant1").length}/${growthComps("plant1").length}`);
    spec.close();
  }

  // ---- pass-through: a non-growth action falls through ------------------------------------
  {
    const saidP = growthSays("plant1").length, wroteP = growthComps("plant1").length;
    bob.verb("use", { id: "plant1", action: "ring" });
    await sleep(300);
    check("a non-growth action (ring) falls through, no growth writes",
      growthSays("plant1").length === saidP && growthComps("plant1").length === wroteP);
  }

  // ---- lint: out-of-range numbers clamp (and a fresh author resets the ladder) ------------
  {
    // 9999999s clamps to 86400 at CONSUME time, but the write carries the
    // authored number VERBATIM (door doctrine) — and the ladder stays legal
    // (stage 0 has real dwell), so the hand still writes.
    alice.verb("comp", { id: "plant1", type: "growth", data: {
      stages: [{ name: "seed", dwell: 9999999 }, { name: "sprout", dwell: 600 }],
      reach: 99,
    } });
    await sleep(300);
    bob.walk([2, 0, 0]); await sleep(200);
    bob.verb("use", { id: "plant1", action: "advance" });
    await sleep(400);
    const d = logGrowth("plant1");
    // the back-date uses the CLAMPED ladder (cumMs over the normalized cfg) —
    // exactly what every consumer derives from the folded comp, so the folded
    // literal and the derivation agree at the write instant even for a
    // clamped dwell.
    const expectBase = (d?.at ?? 0) - cumMs(normalizeGrowth(d).cfg, 1);
    check("the write carries the authored shape verbatim (consumers clamp — door doctrine)",
      d?.stages?.[0]?.dwell === 9999999 && d?.stage === 1 && d?.plantedAt === expectBase,
      JSON.stringify({ dwell: d?.stages?.[0]?.dwell, stage: d?.stage, plantedAt: d?.plantedAt, expectBase }));
    alice.debug("growth-lint"); await sleep(300);
    const li = alice.msgs.filter((m) => m.type === "debug").at(-1);
    check("growth-lint names the clamps",
      JSON.stringify(li?.events ?? []).includes("dwell") || JSON.stringify(li?.events ?? []).includes("reach"),
      JSON.stringify(li?.events ?? []).slice(0, 200));
  }

  // ---- restart: replay mints nothing; the lifecycle clock survives --------------------------
  const saidAll = growthSays("plant1").length;
  const compsAll = growthComps("plant1").length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  check("restart: a fresh join folds the same growth comp",
    snapGrowth(probe.snapshot, "plant1")?.stages?.[0]?.dwell === 9999999,
    JSON.stringify(snapGrowth(probe.snapshot, "plant1"))?.slice(0, 140));
  check("replay minted nothing",
    growthSays("plant1").length === saidAll && growthComps("plant1").length === compsAll,
    `${growthSays("plant1").length}/${growthComps("plant1").length} vs ${saidAll}/${compsAll}`);
  check("mcpl affordance read (describeGrowth)",
    /growth: .+ \(stage \d+\/\d+/.test(describeGrowth(snapGrowth(probe.snapshot, "plant1"))),
    describeGrowth(snapGrowth(probe.snapshot, "plant1")));

  // ---- idempotent fold -----------------------------------------------------------------------
  {
    const a = JSON.stringify(snapGrowth(probe.snapshot, "plant1"));
    const b = JSON.stringify(snapGrowth(JSON.parse(JSON.stringify(probe.snapshot)), "plant1"));
    check("folded growth state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup ---------------------------------------------------------------------------------
  bob.close(); probe.close();
  try { alice.close(); } catch { /* already gone */ }
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
