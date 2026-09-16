// Pressure scenario 29: VENDOR BURST — 200 clients buying simultaneously:
// stock never goes negative, every buy grants at most once.
//
// The vendor engine (server/vendor.ts + shared/vendor.js, vocab-20): comp
// {type:"vendor"} on a stand; `use {action:"buy", item?}` = rank 0 +
// arm's reach; every grant = ONE world-authored comp transition (full
// stock table) + ONE say with vd {item, who, at}, cause-paired to the use.
// Restock = builder. The grant log (sales) is capped at salesCap (16),
// newest-first. Dispatch is synchronous per verb (pressure-8 law), so the
// burst is the MEASUREMENT: does 200-deep simultaneous buying serialize to
// exactly-capacity grants, a chain-legal shelf, and exactly-once per use?
//
// Population (pinned before measuring — 261 peak sockets):
//   24 embodied anchors @15Hz (perf-0 owner: spawn+author; perf-1 builder:
//   restocker; perf-2..23 buyers) + 24 spectators (seer = witness)
//   + 178 embodied buyer legs (pose ONCE in reach of the stand, quiescent)
//   + 12 far legs (posed ~48m out — reach control) + 3 spectator-ask legs
//   + 20 late embodied joiners. THE BURST = 200 simultaneous buyers
//   (perf-2..23 + 178 buyer legs), exactly as the queue names.
//
// Timeline (wall t):
//   t+2.0   perf-0 spawns the stand @ [6,0,6]; perf-1 attaches comp
//           vendor {wares:{tea:40,bread:25,pie:15}, reach:4, salesCap:16}.
//   t+4.0→  buyer wave joins (178 + 12 far + 3 specask), each buyer poses
//           once at a ring r 2.2–3.4m around the stand (in reach).
//   t+8.0   W1 THE BURST: all 200 fire `use {stand, buy}` (no item →
//           headline tea) in ONE timer drain. Shelf tea 40→0: exactly 40
//           grants, 160 sold-out skips (mint-nothing).
//   t+9.5/15.5  fair says (perf-2); t+19.75 probe say mid-W5.
//   t+12.0  W2: perf-1 restock-full → tea 40, bread 25, pie 15.
//   t+14.0  W3: buyers[0..119] named-item burst rotating tea/bread/pie →
//           exactly 80 grants (40+25+15), 40 sold-out skips.
//   t+16.5  W4 controls: buyers[120..139] garbage item ("unobtainium" —
//           skip, 0 grants, 0 stock change); 12 far legs buy tea (skip out
//           of reach); 3 specask legs buy (pre-engine refusal, never log).
//   t+18.0  late wave: 20 embodied joiners, posed in reach.
//   t+19.0  W5a: perf-1 restock {item:"tea", n:5} → tea 5 (named-item math).
//   t+19.5  W5b: 20 late buyers buy tea → exactly 5 grants, 15 skips.
//   t+21.0  flight-recorder pull (vendor-skip/trigger/lint) — report-only.
//   t+23.0  teardown all anchors.
//   t+35.0  SIGKILL; restart on the same WORLDS_DIR; probe join: snapshot
//           == fold(log through covered), stand shelf EXACT {tea:0,
//           bread:0, pie:0}, present 0, +2 sweeps mint nothing.
//
// Acceptance gates (pinned before measuring — see TH):
//   anchors 48/48 p95<3s · buyers 193/193 p95<3s · late 20/20 p95<3s ·
//   grants per wave EXACT (W1 40, W3 80, W5 5 = 125 total; per-ware
//   85/25/15) · grant comps == grant says == 125, adjacent pairs · every
//   grant say cause DISTINCT (exactly-once per use) · CHAIN-LEGAL shelf:
//   every comp transition legal from its predecessor (grant = single −1,
//   restock = plan), no ware ever <0 or >cap or non-integer · sales ≤16
//   every comp, sales[0] == this grant · vd.at == cause use ts · restocks
//   exactly 2 (full + named) · garbage/far grants 0 · spectator buys
//   refused 3/3 verbatim, 0 use lines authored · fair 2/2 + probe 1/1
//   says p95<500ms · granted buyers witness their own grant echo 125/125
//   p95<500ms · fps p50≥12, lat p95<250ms, 0 gaps · log lines == derived
//   EXACT · restart boot+fold EXACT-equal+shelf exact+drift 0+present 0 ·
//   RSS peak−postJoin <+60MB · 0 suspicious lines.
//
//   SERVER_DIR=/tmp/pressure29-wt PORT=8972 bun tools/pressure-vendorburst.ts
//   SELFTEST=1 bun tools/pressure-vendorburst.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { emptyState, foldEntry } from "../shared/fold.js";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure29-wt";
const PORT = Number(process.env.PORT ?? 8972);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure29-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_SPEC = 24;                     // 48 anchors
const N_BUY = 178, N_FAR = 12, N_SPECASK = 3;       // buyer wave (193)
const N_LATE = 20;                                  // late wave
const BURST_BODIES = 200;                           // perf-2..23 (22) + 178 buyers
const POSE_HZ = 15;
const STAND_POS = [6, 0, 6];
const WARES: Record<string, number> = { tea: 40, bread: 25, pie: 15 };   // authored menu (cap = full shelf)
const SALES_CAP = 16;
const REACH = 4;
const W3_N = 120, W3_ITEMS = ["tea", "bread", "pie"];
const W4_GARBAGE_N = 20, GARBAGE_ITEM = "unobtainium";
const RESTOCK_N = 5;                                // W5a named tea add
const DRESS_AT = 2_000, BUYER0_AT = 4_000;
const W1_AT = 8_000, W2_AT = 12_000, W3_AT = 14_000, W4_AT = 16_500;
const LATE_AT = 18_000, W5A_AT = 19_000, W5B_AT = 19_500;
const FAIR_SAY_ATS = [9_500, 15_500], PROBE_SAY_ATS = [19_750];
const RECORDER_AT = 21_000, TEARDOWN_AT = 23_000, KILL_AT = 35_000;
const DURATION = 35_000;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..28
const SELFTEST = process.env.SELFTEST === "1";
const LOG_JSONL = `${WORLDS}/${WORLD}/log.jsonl`;
const SPEC_REFUSAL = "spectators can't author — join embodied to build";

// expected grant arithmetic (pinned):
//   W1: 200 attempts, tea cap 40 → 40 grants, 160 skips
//   W3: 120 named (40 tea / 40 bread / 40 pie) → 40+25+15 = 80 grants, 40 skips
//   W5: 20 attempts on tea restocked to 5 → 5 grants, 15 skips
const EXP_W1 = 40, EXP_W3 = 80, EXP_W5 = 5;
const EXP_GRANTS = EXP_W1 + EXP_W3 + EXP_W5;                    // 125
const EXP_PER_WARE = { tea: 85, bread: 25, pie: 15 };           // grant counts
const EXP_FINAL = { tea: 0, bread: 0, pie: 0 };
const EXP_REStockS = 2;
// derived log lines: genesis + owner grant + spawn + comp author = 4;
// W1 200 use + 40×2; W2 3; W3 120 use + 80×2; W4 20+12 use (specask 0);
// W5a 3; W5b 20 use + 5×2; fair 2 + probe 1 says.
const EXP_LOG = 4 + (200 + EXP_W1 * 2) + 3 + (120 + EXP_W3 * 2) + (20 + 12) + 3 + (20 + EXP_W5 * 2) + 3;

// acceptance thresholds (fail any → exit 1)
const TH = {
  anchorTotal: 48, anchorJoinP95Ms: 3_000,
  buyerTotal: N_BUY + N_FAR + N_SPECASK, buyerJoinP95Ms: 3_000,
  lateTotal: N_LATE, lateJoinP95Ms: 3_000,
  w1Grants: EXP_W1, w3Grants: EXP_W3, w5Grants: EXP_W5,
  restocks: EXP_REStockS,
  chainErr: 0, stockNeg: 0, dupCause: 0, pairErr: 0, salesCapErr: 0,
  vdAtErr: 0, selfEchoErr: 0,
  garbageGrants: 0, farGrants: 0,
  specRefusals: 3, specLines: 0,
  fairSays: 2, probeSays: 1, sayP95Ms: 500, grantLatP95Ms: 500,
  fpsP50: 12, latP95Ms: 250, seqGaps: 0,
  logExact: true,
  restartBoot: 1, restartFoldEqual: true, restartStockOk: true,
  restartLineDrift: 0, finalPresent: 0,
  rssPeakGrowthMB: 60, logSuspicious: 0,
};
type Measurements = {
  anchorJoined: number; anchorJoinP95: number;
  buyerJoined: number; buyerJoinP95: number;
  lateJoined: number; lateJoinP95: number;
  w1Grants: number; w3Grants: number; w5Grants: number; grantTotal: number;
  grantComps: number; restocks: number; restockComps: number;
  chainErr: number; stockNeg: number; dupCause: number; pairErr: number;
  salesCapErr: number; vdAtErr: number; selfEchoErr: number;
  garbageGrants: number; farGrants: number;
  specRefusals: number; specLines: number;
  fairSays: number; probeSays: number; sayP95: number;
  grantLatP95: number; grantLatN: number;
  fpsP50: number; latP95: number; gaps: number;
  logTotal: number; logExpected: number;
  restartBoot: number; restartFoldEqual: boolean; restartStockOk: boolean;
  restartLineDrift: number; finalPresent: number;
  rssPeakGrowthMB: number; logSuspicious: number;
};
function evaluate(m: Measurements): string[] {
  const f: string[] = [];
  if (m.anchorJoined !== TH.anchorTotal) f.push(`anchors ${m.anchorJoined}/${TH.anchorTotal} joined`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) f.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.buyerJoined !== TH.buyerTotal) f.push(`buyers ${m.buyerJoined}/${TH.buyerTotal} joined`);
  if (m.buyerJoinP95 > TH.buyerJoinP95Ms) f.push(`buyer join p95 ${Math.round(m.buyerJoinP95)}ms > ${TH.buyerJoinP95Ms}ms`);
  if (m.lateJoined !== TH.lateTotal) f.push(`late wave ${m.lateJoined}/${TH.lateTotal} joined`);
  if (m.lateJoinP95 > TH.lateJoinP95Ms) f.push(`late join p95 ${Math.round(m.lateJoinP95)}ms > ${TH.lateJoinP95Ms}ms`);
  if (m.w1Grants !== TH.w1Grants) f.push(`W1 grants ${m.w1Grants} != ${TH.w1Grants} (double-spend or lost grants)`);
  if (m.w3Grants !== TH.w3Grants) f.push(`W3 grants ${m.w3Grants} != ${TH.w3Grants}`);
  if (m.w5Grants !== TH.w5Grants) f.push(`W5 grants ${m.w5Grants} != ${TH.w5Grants}`);
  if (m.grantComps !== m.grantTotal) f.push(`grant comps ${m.grantComps} != grant says ${m.grantTotal} (1:1 pairing broken)`);
  if (m.restocks !== TH.restocks) f.push(`restock says ${m.restocks} != ${TH.restocks}`);
  if (m.restockComps !== TH.restocks) f.push(`restock comps ${m.restockComps} != ${TH.restocks}`);
  if (m.chainErr > TH.chainErr) f.push(`${m.chainErr} chain-illegal comp transitions (grant != single −1 from predecessor, or restock != plan)`);
  if (m.stockNeg > TH.stockNeg) f.push(`${m.stockNeg} comp writes with a ware <0, >cap, or non-integer (STOCK NEVER NEGATIVE violated)`);
  if (m.dupCause > TH.dupCause) f.push(`${m.dupCause} grant says share a cause use seq (exactly-once per use violated)`);
  if (m.pairErr > TH.pairErr) f.push(`${m.pairErr} grant says without their adjacent comp at seq−1`);
  if (m.salesCapErr > TH.salesCapErr) f.push(`${m.salesCapErr} sales-cap/lead violations (len > ${SALES_CAP} or sales[0] != this grant)`);
  if (m.vdAtErr > TH.vdAtErr) f.push(`${m.vdAtErr} vd.at values != the paired use ts`);
  if (m.selfEchoErr > TH.selfEchoErr) f.push(`${m.selfEchoErr} granted buys the buyer never witnessed (echo miss)`);
  if (m.garbageGrants !== TH.garbageGrants) f.push(`garbage-item grants ${m.garbageGrants} (want 0)`);
  if (m.farGrants !== TH.farGrants) f.push(`out-of-reach grants ${m.farGrants} (want 0 — reach gate failed under load)`);
  if (m.specRefusals !== TH.specRefusals) f.push(`spectator buy refusals ${m.specRefusals}/${TH.specRefusals} verbatim`);
  if (m.specLines !== TH.specLines) f.push(`spectator legs authored ${m.specLines} log lines (want 0 — refusal must be pre-engine, pre-log)`);
  if (m.fairSays !== TH.fairSays) f.push(`fair says ${m.fairSays}/${TH.fairSays} appended+echoed`);
  if (m.probeSays !== TH.probeSays) f.push(`probe says ${m.probeSays}/${TH.probeSays} mid-W5`);
  if (m.sayP95 > TH.sayP95Ms) f.push(`say p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.grantLatP95 > TH.grantLatP95Ms) f.push(`grant echo p95 ${Math.round(m.grantLatP95)}ms > ${TH.grantLatP95Ms}ms (n=${m.grantLatN})`);
  if (m.fpsP50 < TH.fpsP50) f.push(`fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) f.push(`frame lat p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps !== TH.seqGaps) f.push(`${m.gaps} frame seq gaps`);
  if (TH.logExact && m.logTotal !== m.logExpected) f.push(`log lines ${m.logTotal} != derived ${m.logExpected} (drift ${Math.abs(m.logTotal - m.logExpected)})`);
  if (m.restartBoot !== TH.restartBoot) f.push(`restart boot failed`);
  if (!m.restartFoldEqual) f.push(`restart fold DIFFERS from fold(log)`);
  if (!m.restartStockOk) f.push(`restart shelf != final folded shelf`);
  if (m.restartLineDrift !== TH.restartLineDrift) f.push(`restart line drift ${m.restartLineDrift} (replay minted lines)`);
  if (m.finalPresent !== TH.finalPresent) f.push(`final present ${m.finalPresent} (want 0)`);
  if (m.rssPeakGrowthMB > TH.rssPeakGrowthMB) f.push(`RSS peak growth ${m.rssPeakGrowthMB}MB > ${TH.rssPeakGrowthMB}MB`);
  if (m.logSuspicious !== TH.logSuspicious) f.push(`${m.logSuspicious} suspicious server-log lines`);
  return f;
}

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
const healthy: Measurements = {
  anchorJoined: 48, anchorJoinP95: 120,
  buyerJoined: 193, buyerJoinP95: 180,
  lateJoined: 20, lateJoinP95: 60,
  w1Grants: 40, w3Grants: 80, w5Grants: 5, grantTotal: 125,
  grantComps: 125, restocks: 2, restockComps: 2,
  chainErr: 0, stockNeg: 0, dupCause: 0, pairErr: 0, salesCapErr: 0,
  vdAtErr: 0, selfEchoErr: 0,
  garbageGrants: 0, farGrants: 0,
  specRefusals: 3, specLines: 0,
  fairSays: 2, probeSays: 1, sayP95: 14,
  grantLatP95: 210, grantLatN: 125,
  fpsP50: 14.9, latP95: 40, gaps: 0,
  logTotal: EXP_LOG, logExpected: EXP_LOG,
  restartBoot: 1, restartFoldEqual: true, restartStockOk: true,
  restartLineDrift: 0, finalPresent: 0,
  rssPeakGrowthMB: 24, logSuspicious: 0,
};
if (SELFTEST) {
  const a = evaluate(healthy);
  const breaches: Measurements[] = [];
  const mk = (patch: Partial<Measurements>) => ({ ...healthy, ...patch });
  breaches.push(mk({ anchorJoined: 47 }));
  breaches.push(mk({ anchorJoinP95: 4_100 }));
  breaches.push(mk({ buyerJoined: 190 }));
  breaches.push(mk({ buyerJoinP95: 3_900 }));
  breaches.push(mk({ lateJoined: 18 }));
  breaches.push(mk({ lateJoinP95: 3_200 }));
  breaches.push(mk({ w1Grants: 41 }));                  // THE double-spend
  breaches.push(mk({ w1Grants: 38 }));                  // lost grants
  breaches.push(mk({ w3Grants: 79 }));
  breaches.push(mk({ w5Grants: 6 }));
  breaches.push(mk({ grantComps: 123, grantTotal: 125 })); // pairing broken
  breaches.push(mk({ restocks: 1 }));
  breaches.push(mk({ restockComps: 3 }));
  breaches.push(mk({ chainErr: 2 }));                   // illegal transition
  breaches.push(mk({ stockNeg: 1 }));                   // NEVER NEGATIVE
  breaches.push(mk({ dupCause: 1 }));                   // one use, two grants
  breaches.push(mk({ pairErr: 4 }));
  breaches.push(mk({ salesCapErr: 2 }));
  breaches.push(mk({ vdAtErr: 1 }));
  breaches.push(mk({ selfEchoErr: 3 }));
  breaches.push(mk({ garbageGrants: 1 }));
  breaches.push(mk({ farGrants: 2 }));
  breaches.push(mk({ specRefusals: 2 }));
  breaches.push(mk({ specLines: 1 }));
  breaches.push(mk({ fairSays: 1 }));
  breaches.push(mk({ probeSays: 0 }));
  breaches.push(mk({ sayP95: 800 }));
  breaches.push(mk({ grantLatP95: 900, grantLatN: 125 }));
  breaches.push(mk({ fpsP50: 9.1 }));
  breaches.push(mk({ latP95: 900 }));
  breaches.push(mk({ gaps: 3 }));
  breaches.push(mk({ logTotal: EXP_LOG + 4 }));
  breaches.push(mk({ restartBoot: 0 }));
  breaches.push(mk({ restartFoldEqual: false }));
  breaches.push(mk({ restartStockOk: false }));
  breaches.push(mk({ restartLineDrift: 3 }));
  breaches.push(mk({ finalPresent: 2 }));
  breaches.push(mk({ rssPeakGrowthMB: 91 }));
  breaches.push(mk({ logSuspicious: 2 }));
  const names = ["anchors", "joinP95", "buyers", "buyerP95", "late", "lateP95",
    "w1-over", "w1-under", "w3", "w5", "pairing", "restocks", "restockComps", "chain",
    "stockNeg", "dupCause", "pairErr", "salesCap", "vdAt", "selfEcho", "garbage", "far",
    "specRefusal", "specLines", "fairSays", "probeSays", "sayP95", "grantLat", "fps", "lat",
    "gaps", "logExact", "boot", "fold", "shelf", "lineDrift", "present", "rss", "suspicious"];
  const b: string[] = [];
  breaches.forEach((x, i) => { const r = evaluate(x); if (!r.length) b.push(names[i]); });
  const ok = a.length === 0 && b.length === 0;
  console.log(ok ? `SELFTEST PASS — healthy gates clean, all ${breaches.length} breached gates fire` : `SELFTEST FAIL — clean:[${a}] missing:[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf @${POSE_HZ}Hz + ${N_SPEC} spec anchors; buyer wave ${N_BUY} embodied (pose-once, in reach) + ${N_FAR} far + ${N_SPECASK} specask; late ${N_LATE}; stand @[${STAND_POS}] wares {tea:40,bread:25,pie:15} reach ${REACH} salesCap ${SALES_CAP}. W1 t+${W1_AT / 1000}s THE BURST: ${BURST_BODIES} simultaneous buys (headline tea) → expect ${EXP_W1} grants/160 skips; W2 restock-full; W3 ${W3_N} named rotating → ${EXP_W3} grants; W4 controls (garbage ${W4_GARBAGE_N}, far ${N_FAR}, specask ${N_SPECASK}); W5a restock tea+${RESTOCK_N}; W5b ${N_LATE} late buys → ${EXP_W5} grants. Total grants ${EXP_GRANTS} (${EXP_PER_WARE.tea}/${EXP_PER_WARE.bread}/${EXP_PER_WARE.pie}); final shelf ${JSON.stringify(EXP_FINAL)}; log ${EXP_LOG} lines; teardown t+${TEARDOWN_AT / 1000}s; SIGKILL t+${KILL_AT / 1000}s → replay shelf exact. ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: joins ${TH.anchorTotal}+${TH.buyerTotal}+${TH.lateTotal}@p95<3s grants W1=${TH.w1Grants} W3=${TH.w3Grants} W5=${TH.w5Grants} EXACT comps≡says pairing=adjacent chainErr=0 stockNeg=0 dupCause=0 salesCap≤${SALES_CAP} garbage/far=0 specRefusals=${TH.specRefusals}verbatim/0-lines says=${TH.fairSays}+${TH.probeSays}@p95<${TH.sayP95Ms}ms grantEcho p95<${TH.grantLatP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} log=${EXP_LOG}EXACT restart=boot+fold-equal+shelf+drift0+present0 rss<+${TH.rssPeakGrowthMB}MB suspicious=${TH.logSuspicious}`);

// ---- fd budget: ~265 concurrent sockets + server must fit ----------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 600) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 600 — launch as: ulimit -n 1024 && bun tools/pressure-vendorburst.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure29-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
function spawnServer() {
  return Bun.spawn({
    cmd: ["bun", "run", "server/server.ts"],
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, EIDOVERSE_DIR: LIBDIR },
    stdout: logFile, stderr: logFile,
  });
}
let server = spawnServer();
const rss = () => {
  try {
    const r = Bun.spawnSync(["ps", "-o", "rss=", "-p", String(server.pid)]);
    return Number(String(r.stdout).trim());
  } catch { return NaN; }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MB = (kb: number) => Math.round(kb / 1024);
const pct = (xs: number[], p: number) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))] : 0;
async function waitReady(): Promise<boolean> {
  for (let i = 0; i < 120; i++) {
    await sleep(250);
    try { const res = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); if (res.status > 0) return true; } catch { /* booting */ }
  }
  return false;
}
if (!(await waitReady())) { console.log("FAIL: scratch sequencer never became ready"); server.kill(); process.exit(1); }
const rssReady = rss();
console.log(`sequencer ready pid=${server.pid} rss=${MB(rssReady)}MB (log: ${logPath})`);

// ---- canonical deep compare + fold-the-log-file (snapjoin-proven) --------------
function canon(v: any): string {
  if (v === undefined) return "undef";
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
}
function logEntries(): any[] {
  if (!existsSync(LOG_JSONL)) return [];
  return readFileSync(LOG_JSONL, "utf8").split("\n").filter((l) => l.trim()).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
function foldPrefix(covered: number): { st: any; maxSeq: number } {
  const st = emptyState();
  let maxSeq = 0;
  for (const e of logEntries()) {
    if (Number(e.seq) > maxSeq) maxSeq = Number(e.seq);
    if (Number(e.seq) <= covered) foldEntry(st, e);
  }
  return { st, maxSeq };
}
function verifySnapshot(m: any): { ok: boolean; errs: string[]; covered: number } {
  const errs: string[] = [];
  const throughSeq = typeof m.throughSeq === "number" ? m.throughSeq : -1;
  const tail: any[] = Array.isArray(m.entries) ? m.entries : [];
  const tailTop = tail.length ? Number(tail[tail.length - 1].seq) : throughSeq;
  const covered = Math.max(throughSeq, tailTop);
  if (tail.length !== tailTop - throughSeq) errs.push(`tail len ${tail.length} != span ${tailTop - throughSeq}`);
  tail.forEach((e, i) => { if (Number(e.seq) !== throughSeq + 1 + i) errs.push(`tail gap at ${i}`); });
  const { st } = foldPrefix(covered);
  if (canon(st) !== canon(m.state)) errs.push(`snapshot state != fold(log through ${covered})`);
  return { ok: errs.length === 0, errs, covered };
}

// ---- client chassis (strobe-proven, + vd grant-echo tracking) ------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number; snapshot: any;
  closed: boolean; closeCode: number; id: string;
  sayEcho: Map<string, number>;
  useErrors: string[];
  grantEchoAt: number | undefined;    // first world say with vd.who === me
  sendStamps: number[];               // every buy-send time (per-wave latency)
  debugPulls: any[];
  errs: string[];
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, snapshot: null, closed: false, closeCode: 0, sayEcho: new Map(), useErrors: [], grantEchoAt: undefined, sendStamps: [], debugPulls: [], errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        s.snapshot = m; s.snapAt = performance.now(); s.joinMs = s.snapAt - s.openAt;
        for (const e of m.entries ?? []) if (e.verb === "say") s.says.add(e.args?.text);
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++;
        s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "log") {
        const v = m.entry?.verb;
        if (v === "say") {
          s.says.add(m.entry.args?.text);
          if (!s.sayEcho.has(m.entry.args?.text)) s.sayEcho.set(m.entry.args?.text, performance.now());
          const vd = m.entry.args?.vd;
          if (m.entry.actor === "world" && vd && vd.who === s.id && s.grantEchoAt === undefined) s.grantEchoAt = performance.now();
        }
      } else if (m.type === "error") {
        s.useErrors.push(String(m.error ?? ""));
      } else if (m.type === "debug") {
        s.debugPulls.push(m);
      }
    };
    ws.onclose = (ev) => { s.closed = true; s.closeCode = Number(ev.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}
/** One in-reach ring slot around the stand (r 2.2–3.4m < reach 4m). */
function ringPos(i: number): number[] {
  const a = i * 2.399963229728653;   // golden angle — even spread, no clumping
  const r = 2.2 + (i % 7) * 0.2;
  return [STAND_POS[0] + r * Math.cos(a), 0, STAND_POS[2] + r * Math.sin(a)];
}
const poseOnce = (s: Spec, p: number[]) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "pose", pose: { p, yaw: 0, speed: 0, clip: "idle" } })); };

// ---- anchor population (perf-0 FIRST — the fresh world's owner) ----------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const perf0 = await connect("perf-0", false, 0);          // owner: spawn + dress
const rest = await Promise.allSettled([
  ...Array.from({ length: N_PERF - 1 }, (_, i) => connect(`perf-${i + 1}`, false, i + 1)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const anchors = [perf0, ...rest.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec)];
const anchorFailed = 1 + rest.length - anchors.length;
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const joinTimes = anchors.map((s) => s.joinMs);
console.log(`t+0: anchors joined ${anchors.length}/${1 + rest.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);
const SEER = specs[0];

// embodied presence @15Hz (the standing crowd's motion — buyers stay quiescent).
// perf-1 (the merchant/restocker) HOLDS THE STAND instead: its lastPose must
// stay in arm's reach for every restock window, so it walks no circle.
let running = true;
const tickers: any[] = [];
for (const s of perfs) {
  const i = Number(s.id.split("-")[1]);
  if (i === 1) continue;   // the merchant keeps the stand
  tickers.push(setInterval(() => {
    if (!running || s.ws.readyState !== 1) return;
    const t = Date.now() / 1000 + i;
    s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  }, 1000 / POSE_HZ));
}
poseOnce(perfs[1], [STAND_POS[0] + 1.5, 0, STAND_POS[2] + 1.5]);   // behind the counter

// HTTP event-loop health probe
const probeAll: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  probeAll.push(performance.now() - t);
}, 500);
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 6_500);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 7_000 && (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak)) rssSamples.peak = r;
}, 500);

// ---- t+2.0s: dress the world — the stand (verb budget: perf-0 1, perf-1 1) -----
at(DRESS_AT, () => {
  if (perf0.ws.readyState === 1) perf0.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "stand", lib: "deco/bench.glb", pos: STAND_POS, yaw: 0 } }));
  const p1 = perfs[1];
  if (p1?.ws.readyState === 1) p1.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: "stand", type: "vendor", data: { wares: WARES, reach: REACH, salesCap: SALES_CAP } } }));
});

// ---- t+4.0s: buyer wave — 178 in-reach + 12 far + 3 specask ---------------------
const buyers: Spec[] = [];
const farLegs: Spec[] = [];
const specAskLegs: Spec[] = [];
{
  const legs = await Promise.allSettled([
    ...Array.from({ length: N_BUY }, (_, j) => connect(`buyer-${j}`, false, 100 + j)),
    ...Array.from({ length: N_FAR }, (_, j) => connect(`far-${j}`, false, 300 + j)),
    ...Array.from({ length: N_SPECASK }, (_, j) => connect(`specask-${j}`, true)),
  ]);
  legs.forEach((r) => {
    if (r.status !== "fulfilled") return;
    const s = r.value as Spec;
    if (s.id.startsWith("buyer-")) buyers.push(s);
    else if (s.id.startsWith("far-")) farLegs.push(s);
    else specAskLegs.push(s);
  });
  buyers.forEach((s, j) => poseOnce(s, ringPos(j)));
  farLegs.forEach((s, j) => poseOnce(s, [40 + j, 0, 40 + j]));
  const buyerTimes = [...buyers, ...farLegs, ...specAskLegs].map((s) => s.joinMs);
  console.log(`t+${((performance.now() - t0) / 1000).toFixed(1)}s: buyer wave joined ${buyers.length + farLegs.length + specAskLegs.length}/${N_BUY + N_FAR + N_SPECASK} — p95 ${Math.round(pct(buyerTimes, 95))}ms`);
}
const burstFleet: Spec[] = [...perfs.slice(2), ...buyers];   // perf-2..23 + all buyers = 200

// ---- t+8.0s: W1 THE BURST — 200 simultaneous buys (headline tea) ---------------
let burstCount = 0;
at(W1_AT, () => {
  for (const s of burstFleet) {
    if (s.ws.readyState !== 1) continue;
    s.sendStamps.push(performance.now());
    burstCount++;
    s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "stand", action: "buy" } }));
  }
  console.log(`t+${((performance.now() - t0) / 1000).toFixed(2)}s: W1 BURST fired — ${burstCount} simultaneous buys`);
});

// ---- t+12.0s: W2 restock-full (perf-1, builder) --------------------------------
at(W2_AT, () => {
  const p1 = perfs[1];
  if (p1?.ws.readyState === 1) p1.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "stand", action: "restock" } }));
});

// ---- t+14.0s: W3 named-item burst — buyers[0..119] rotate tea/bread/pie ---------
at(W3_AT, () => {
  for (let j = 0; j < Math.min(W3_N, buyers.length); j++) {
    const s = buyers[j];
    if (s.ws.readyState !== 1) continue;
    s.sendStamps.push(performance.now());
    s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "stand", action: "buy", item: W3_ITEMS[j % 3] } }));
  }
});

// ---- t+16.5s: W4 controls — garbage / far / specask -----------------------------
at(W4_AT, () => {
  for (let j = 0; j < Math.min(W4_GARBAGE_N, buyers.length - W3_N); j++) {
    const s = buyers[W3_N + j];
    if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "stand", action: "buy", item: GARBAGE_ITEM } }));
  }
  farLegs.forEach((s) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "stand", action: "buy", item: "tea" } })); });
  specAskLegs.forEach((s) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "stand", action: "buy", item: "tea" } })); });
});

// ---- t+18.0s: late wave — 20 fresh embodied joiners, posed in reach -------------
const lateLegs: Spec[] = [];
{
  const legs = await Promise.allSettled(Array.from({ length: N_LATE }, (_, j) => connect(`late-${j}`, false, 500 + j)));
  legs.forEach((r) => { if (r.status === "fulfilled") lateLegs.push(r.value as Spec); });
  lateLegs.forEach((s, j) => poseOnce(s, ringPos(200 + j)));
}

// ---- t+19.0s: W5a named restock (tea +5); t+19.5s W5b late buys -----------------
at(W5A_AT, () => {
  const p1 = perfs[1];
  if (p1?.ws.readyState === 1) p1.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "stand", action: "restock", item: "tea", n: RESTOCK_N } }));
});
at(W5B_AT, () => {
  lateLegs.forEach((s) => { if (s.ws.readyState === 1) { s.sendStamps.push(performance.now()); s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "stand", action: "buy", item: "tea" } })); } });
});

// ---- fairness: says before/during/after the waves -------------------------------
const FAIR_TEXTS = [`vend-a-${Math.floor(t0)}`, `vend-b-${Math.floor(t0)}`];
const PROBE_TEXTS = [`vend-p1-${Math.floor(t0)}`];
const sayEchoAt = new Map<string, number>();
[...FAIR_SAY_ATS.map((w, i) => ({ w, text: FAIR_TEXTS[i] })), ...PROBE_SAY_ATS.map((w, i) => ({ w, text: PROBE_TEXTS[i] }))].forEach(({ w, text }) => {
  at(w, () => {
    const sentAt = performance.now();
    const S = perfs[2];
    if (S?.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    at(w + 1_500, () => {
      const hit = S?.sayEcho.get(text);
      if (hit !== undefined) sayEchoAt.set(text, hit - sentAt);
    });
  });
});

// ---- t+21.0s: flight-recorder pull on the seer (report-only; ring bounded) ------
at(RECORDER_AT, () => {
  if (SEER?.ws.readyState === 1) SEER.ws.send(JSON.stringify({ type: "debug", reqId: "rec-1", kinds: ["vendor-skip", "vendor-trigger", "vendor-lint"], limit: 300 }));
});

// ---- t+23.0s teardown ------------------------------------------------------------
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  teardownAtTs = performance.now();
  [anchors, buyers, farLegs, specAskLegs, lateLegs].flat().forEach((s) => { try { s.ws.close(); } catch {} });
});

await sleep(DURATION - (performance.now() - t0));
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
await sleep(300);

// ---- ledger ground truth from log.jsonl (the append-only truth) -----------------
const entries = logEntries();
const logTotalLines = entries.length;
const bySeq = new Map(entries.map((e) => [Number(e.seq), e]));
const vendorComps = entries.filter((e) => e.verb === "comp" && e.args?.type === "vendor");
const vendorSays = entries.filter((e) => e.verb === "say" && e.actor === "world" && e.args?.vd != null);
const grantSays = vendorSays.filter((e) => e.args.vd.item != null && e.args.vd.restock == null);
const restockSays = vendorSays.filter((e) => e.args.vd.restock != null);

// wave attribution by wall-clock window (entry ts is the server's epoch ms)
const W1_WALL = 8_000, W2_WALL = 12_000, W3_WALL = 14_000, W4_WALL = 16_500, W5A_WALL = 19_000, W5B_WALL = 19_500;
const t0Wall = Date.now() - Math.round(performance.now() - t0);   // wall-clock at harness t0
const useBySeq = new Map(entries.filter((e) => e.verb === "use" && e.args?.id === "stand").map((e) => [Number(e.seq), e]));
function grantsIn(lo: number, hi: number): number {
  return grantSays.filter((e) => { const w = Number(e.ts) - t0Wall; return w >= lo && w < hi; }).length;
}
const w1Grants = grantsIn(W1_WALL - 500, W2_WALL);
const w3Grants = grantsIn(W3_WALL - 500, W4_WALL);
const w5Grants = grantsIn(W5B_WALL - 500, W5B_WALL + 2_500);
const grantTotal = grantSays.length;

// per-ware grant counts
const perWare: Record<string, number> = {};
for (const e of grantSays) perWare[e.args.vd.item] = (perWare[e.args.vd.item] ?? 0) + 1;

// ---- the CHAIN: every vendor comp transition legal from its predecessor ---------
// author comp = full shelf (absent stock rows = capacity); grant comp = exactly
// one ware −1 + sales[0] == this grant; restock comp = full restore or named
// target. Any ware <0, >cap, or non-integer at ANY write = stockNeg.
let chainErr = 0, stockNeg = 0, salesCapErr = 0, pairErr = 0, vdAtErr = 0, dupCause = 0;
{
  const capOf = (k: string) => WARES[k];
  let prev: Record<string, number> | null = null;   // null = shelf not yet authored
  const causesSeen = new Set<number>();
  for (const c of vendorComps) {
    const seq = Number(c.seq);
    const data = c.args?.data ?? {};
    const stock: Record<string, number> = {};
    let malformed = false;
    for (const k of Object.keys(WARES)) {
      const raw = data.stock?.[k];
      // the AUTHORED comp may omit stock rows — absent = full shelf (the
      // soundpost muted-absent doctrine). Engine writes carry FULL tables;
      // an absent row there reads as malformed below.
      const v = (raw === undefined && prev === null) ? capOf(k) : raw;
      if (typeof v !== "number" || !Number.isInteger(v)) { malformed = true; break; }
      stock[k] = v;
      if (v < 0 || v > capOf(k)) stockNeg++;
    }
    if (malformed) { chainErr++; prev = null; continue; }
    if (Array.isArray(data.sales) && data.sales.length > SALES_CAP) salesCapErr++;
    if (prev === null) {
      // the author write (or first after malformed): full shelf
      for (const k of Object.keys(WARES)) if (stock[k] !== capOf(k)) chainErr++;
    } else {
      // find the say this comp pairs with (adjacent seq+1)
      const say = bySeq.get(seq + 1);
      if (!say || say.verb !== "say" || say.actor !== "world" || say.args?.vd == null) { pairErr++; }
      else {
        const vd = say.args.vd;
        if (vd.restock != null) {
          // restock: full restore or named target — exact table match required
          const want = vd.restock === "all"
            ? Object.fromEntries(Object.keys(WARES).map((k) => [k, capOf(k)]))
            : null;
          if (vd.restock === "all") {
            for (const k of Object.keys(WARES)) if (stock[k] !== want![k]) chainErr++;
          } else {
            // named: every other ware unchanged, target = min(cap, prev+n) —
            // chain-legality: others equal, target in (prev, cap]
            for (const k of Object.keys(WARES)) {
              if (k === vd.restock) {
                if (!(stock[k] > prev[k] && stock[k] <= capOf(k))) chainErr++;
              } else if (stock[k] !== prev[k]) chainErr++;
            }
          }
        } else {
          // grant: exactly one ware −1, sales[0] == this grant, cause distinct,
          // vd.at == the paired use's ts
          const item = vd.item;
          if (!(item in WARES)) chainErr++;
          else {
            let changed = 0;
            for (const k of Object.keys(WARES)) {
              if (stock[k] === prev[k] - 1 && k === item) changed++;
              else if (stock[k] !== prev[k]) chainErr++;
            }
            if (changed !== 1) chainErr++;
            const lead = Array.isArray(data.sales) ? data.sales[0] : undefined;
            if (!lead || lead.item !== item || lead.who !== vd.who || Number(lead.at) !== Number(vd.at)) salesCapErr++;
          }
          const causeSeq = Number(say.args?.cause);
          if (Number.isFinite(causeSeq)) {
            if (causesSeen.has(causeSeq)) dupCause++;
            causesSeen.add(causeSeq);
            const use = useBySeq.get(causeSeq);
            if (!use || Number(use.ts) !== Number(vd.at)) vdAtErr++;
          } else vdAtErr++;
        }
      }
    }
    prev = stock;
  }
}

// engine-written vendor comps exclude perf-1's authored comp (actor ≠ world)
const engineComps = vendorComps.filter((e) => e.actor === "world");
const grantComps = engineComps.length - restockSays.length;
const restockComps = engineComps.length - grantSays.length;
const garbageGrants = grantSays.filter((e) => e.args?.vd?.item === GARBAGE_ITEM).length;
const farIds = new Set(farLegs.map((s) => s.id));
const farGrants = grantSays.filter((e) => farIds.has(String(e.args.vd.who))).length;
const specRefusals = specAskLegs.reduce((a, s) => a + s.useErrors.filter((e) => e === SPEC_REFUSAL).length, 0);
const specIds = new Set(specAskLegs.map((s) => s.id));
const specLines = entries.filter((e) => specIds.has(String(e.actor))).length;

// grant echo: every granted buyer witnessed its own grant (latency = latest
// buy-send stamp at-or-before the echo — per-wave correct)
const grantLat: number[] = [];
let selfEchoErr = 0;
{
  const grantedWho = new Set(grantSays.map((e) => String(e.args.vd.who)));
  const fleetById = new Map([...burstFleet, ...lateLegs].map((s) => [s.id, s] as const));
  for (const who of grantedWho) {
    const s = fleetById.get(who);
    if (!s) { selfEchoErr++; continue; }
    if (s.grantEchoAt === undefined) { selfEchoErr++; continue; }
    const stamps = s.sendStamps.filter((st) => st <= s.grantEchoAt!);
    const base = stamps.length ? stamps[stamps.length - 1] : s.grantEchoAt;
    grantLat.push(s.grantEchoAt - base);
  }
  grantLat.sort((a, b) => a - b);
}

// final folded shelf
const finalShelf = (() => {
  const last = vendorComps[vendorComps.length - 1];
  const out: Record<string, number> = {};
  for (const k of Object.keys(WARES)) out[k] = last ? Number(last.args?.data?.stock?.[k] ?? WARES[k]) : WARES[k];
  return out;
})();

const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const suspicious = (await logFile.text()).split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

// ---- SIGKILL restart: the burst log must replay to the SAME shelf ---------------
let restartBoot = 0, restartFoldEqual = false, restartStockOk = false, restartLineDrift = 999;
let restartDiff = ""; let restartPresent = -1;
{
  const pre = foldPrefix(Infinity);
  const preCanon = canon(pre.st);
  const preLines = logTotalLines;
  server.kill("SIGKILL");
  await sleep(600);
  server = spawnServer();
  if (await waitReady()) {
    restartBoot = 1;
    try {
      const probe = await connect(`restart-probe-${Math.floor(t0)}`, true);
      const v = verifySnapshot(probe.snapshot);
      restartPresent = (probe.snapshot?.present ?? []).length;
      const shelf = probe.snapshot?.state?.entities?.stand?.comp?.vendor?.stock ?? null;
      const shelfCanon = shelf ? canon(Object.fromEntries(Object.keys(WARES).sort().map((k) => [k, shelf[k] ?? WARES[k]]))) : "";
      restartStockOk = canon(EXP_FINAL) === shelfCanon;
      restartFoldEqual = v.ok && v.covered === pre.maxSeq && restartStockOk;
      if (!restartFoldEqual) {
        const post = probe.snapshot?.state ?? {};
        const keys = new Set([...Object.keys(pre.st), ...Object.keys(post)]);
        const parts: string[] = [`covered=${v.covered} logMaxSeq=${pre.maxSeq} v.ok=${v.ok} shelf=${JSON.stringify(shelf)}`];
        for (const k of keys) if (canon((pre.st as any)[k]) !== canon((post as any)[k])) {
          parts.push(`${k}: pre=${JSON.stringify((pre.st as any)[k])?.slice(0, 160)} post=${JSON.stringify((post as any)[k])?.slice(0, 160)}`);
        }
        restartDiff = v.errs.concat(parts).join(" | ").slice(0, 600);
      }
      await sleep(2_600);   // ≥2 sweeps on the replayed world — boot heal mints nothing
      const post = logEntries();
      restartLineDrift = Math.abs(post.length - preLines);
      try { probe.ws.close(); } catch {}
    } catch (err) { restartFoldEqual = false; restartLineDrift = 999; restartDiff = String(err).slice(0, 300); }
  }
}

const m: Measurements = {
  anchorJoined: anchors.length, anchorJoinP95: pct(joinTimes, 95),
  buyerJoined: buyers.length + farLegs.length + specAskLegs.length,
  buyerJoinP95: pct([...buyers, ...farLegs, ...specAskLegs].map((s) => s.joinMs), 95),
  lateJoined: lateLegs.length, lateJoinP95: lateLegs.length ? pct(lateLegs.map((s) => s.joinMs), 95) : Infinity,
  w1Grants, w3Grants, w5Grants, grantTotal,
  grantComps, restocks: restockSays.length, restockComps,
  chainErr, stockNeg, dupCause, pairErr, salesCapErr, vdAtErr, selfEchoErr,
  garbageGrants, farGrants,
  specRefusals, specLines,
  fairSays: FAIR_TEXTS.filter((t) => sayEchoAt.has(t)).length,
  probeSays: PROBE_TEXTS.filter((t) => sayEchoAt.has(t)).length,
  sayP95: sayEchoAt.size ? pct([...sayEchoAt.values()], 95) : Infinity,
  grantLatP95: grantLat.length ? pct(grantLat, 95) : Infinity, grantLatN: grantLat.length,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  logTotal: logTotalLines, logExpected: EXP_LOG,
  restartBoot, restartFoldEqual, restartStockOk,
  restartLineDrift, finalPresent: restartPresent < 0 ? 999 : restartPresent,
  rssPeakGrowthMB: rssPeakGrowth, logSuspicious: suspicious.length,
};
const fail = evaluate(m);

// recorder observation (report-only)
const recPull = SEER?.debugPulls?.find((d) => d.reqId === "rec-1");
const recEvents = recPull ? (recPull.events ?? []).length : -1;

console.log(`
results
  anchors               ${anchors.length}/${1 + rest.length} joined — p95 ${Math.round(m.anchorJoinP95)}ms (${anchorFailed} failed)
  buyer wave            ${m.buyerJoined}/${N_BUY + N_FAR + N_SPECASK} joined — p95 ${Math.round(m.buyerJoinP95)}ms · late ${m.lateJoined}/${N_LATE} p95 ${Math.round(m.lateJoinP95)}ms
  THE BURST            ${burstCount} simultaneous buys fired at t+8s
  grants               W1 ${w1Grants} (want ${EXP_W1}) · W3 ${w3Grants} (want ${EXP_W3}) · W5 ${w5Grants} (want ${EXP_W5}) · total ${grantTotal} = ${JSON.stringify(perWare)}
  grant pairing        comps ${m.grantComps} / says ${grantTotal} · adjacency errors ${pairErr} · duplicate-cause ${dupCause} (exactly-once per use)
  shelf chain          ${chainErr} illegal transitions · ${stockNeg} negative/over-cap/non-integer writes · sales-cap/lead violations ${salesCapErr} · vd.at errors ${vdAtErr}
  final shelf          ${JSON.stringify(finalShelf)} (want ${JSON.stringify(EXP_FINAL)}) · restocks ${m.restocks} (comps ${m.restockComps})
  controls             garbage grants ${garbageGrants} · out-of-reach grants ${farGrants} · spectator refusals ${specRefusals}/3 verbatim · ${specLines} spec-authored lines
  grant echo           ${m.grantLatN}/${m.grantLatN + m.selfEchoErr} distinct granted buyers witnessed own grant — p95 ${Math.round(m.grantLatP95)}ms
  fair/probe says      fair ${m.fairSays}/2 · probe ${m.probeSays}/1 — p95 ${sayEchoAt.size ? Math.round(m.sayP95) : "MISSED"}ms
  anchor frame/s       p50 ${m.fpsP50.toFixed(1)} (window ${Math.round((teardownAtTs - t0) / 1000)}s connected)
  frame latency ms     p50 ${Math.round(pct(latAll, 50))} p95 ${Math.round(m.latP95)} max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps       ${gapsTotal} across ${specs.length} spectators
  http probe ms        p95 ${Math.round(pct(probeAll, 95))} (n=${probeAll.length}) · errors ${probeErrors.n}
  flight recorder      vendor events in 300-ring at t+21s: ${recEvents < 0 ? "pull missed" : recEvents} (report-only)
  world log            ${logTotalLines} lines vs derived ${EXP_LOG} (drift ${Math.abs(logTotalLines - EXP_LOG)})
  SIGKILL restart      boot ${restartBoot}/1 · fold ${restartFoldEqual ? "EXACT-equal" : "DIFFERS"} · shelf ${restartStockOk ? "exact" : "WRONG"} · line drift ${restartLineDrift} · present ${restartPresent}
  server rss           ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log           ${suspicious.length} suspicious lines
`);
if (restartDiff) console.log(`  restart diff: ${restartDiff}`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of [anchors, buyers, farLegs, specAskLegs, lateLegs].flat()) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — ${grantTotal} grants under a ${burstCount}-buy burst: shelf never negative, chain-legal at every write, exactly-once per use, replay shelf exact`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
