// Pressure scenario 28: WEATHER STROBE UNDER LOAD — rapid weatherzone asks
// during peak presence traffic: the anti-strobe floor holds, one sky governs,
// and clients never see sky thrash.
//
// The weatherzone engine (server/weatherzone.ts + shared/weatherzone.js,
// vocab-14): comp {type:"weatherzone"} publishes a menu; `use {action}` in
// reach mints world-authored weather+comp+say; ONE hold world-wide; a
// state-CHANGING ask mid-hold SKIPS (strobe closure); a SAME-state ask
// EXTENDS (re-anchors); holdSec floors at 30s (HOLD_MIN — the sky's dwell
// doctrine); expiry (fold-derived, 1Hz sweep) reverts via release triple.
//
// Population (pinned before measuring — 176 anchor sockets, peak ~180):
//   24 embodied anchors @15Hz (perf-0 owner; perf-1 builder; 22 posers)
//   + 152 spectators (incl. seer = the measurement witness)
//   + 24 storm legs: 12 hoarder-embodied (pose+ask alternating), 12
//     embodied menu-foggers — joined AFTER anchors, 40 embodied peak.
//
// Timeline (wall t):
//   t+2.0   perf-0 spawns the zone (bench @ [6,0,6]); perf-1 attaches
//           comp weatherzone {states:[rain,clear,fog], holdSec:0.05→clamped
//           30, reach:4, askAt:"the sky answers"} — the authored floor
//           VIOLATION is the point: the engine must clamp to 30s.
//   t+4.05→11.3  HOARDER WAVE: 12 legs × 10 rain asks @700ms (staggered) —
//           all same-state extends, every accept must carry until−at≈30s.
//   t+4.5→9.35   STORM: 12 fresh embodied legs × 55 rain asks @90ms
//           back-to-back (~7.3k asks/min aggregate) — winner takes the hold,
//           every later ask extends or refuses; the sky NEVER leaves rain.
//   t+10.5→12.5  perf-1 burst: 30 rain uses @100ms (12/4s refusals expected).
//   t+14.25→16.65  FOG PHASE: 12 legs × 33 fog asks @70ms — every landed ask
//           is a state-CHANGING ask mid-hold → zone-skip (strobe closure),
//           ZERO fog weather verbs ever.
//   t+14.5/15.5/16.5  3 spectator asks (rain/fog/rain) → EXACT "spectators
//           can't author — join embodied to build", never reach the engine.
//   t+5.5/10.5/15.5  fair says (perf-3) + t+8.5/13.5 probe says — chat must
//           stay green through every phase.
//   t+17.0  flight-recorder pull (kinds zone-skip) on the seer — report-only
//           (ring is 300-bounded; log-derived counts are the gates).
//   t+24.0  teardown anchors; t+25.0 release-witness spectator joins (the
//           hold is still live — join-with-hold must read the same window).
//   ~t+42.5–43.5  expiry (last accepted ask + 30s) → release triple lands
//           (weather clear + comp clear + say released) — witness observes.
//   t+46.0  SIGKILL; restart on the same WORLDS_DIR; probe join: snapshot
//           == fold(log through covered), sky clear, hold cleared, present 0;
//           +2 sweeps mint NOTHING (line drift 0, wx-say drift 0).
//
// Acceptance gates (pinned before measuring — see TH):
//   anchors 176/176 p95<3s · fair says 3/3 + probe says 2/2 p95<500ms ·
//   spectator refusals EXACT 3/3 verbatim, 0 echoes · fog weather verbs 0 ·
//   clear verbs 1 (the release) · rainVerbs == acceptedAsks (log≡echo) ·
//   compWrites == acceptedAsks+1 · wxSays == acceptedAsks+1 · EVERY rain
//   comp: until−at ∈ [29.9,30.1]s (floor on every accept) · holdUntil ==
//   lastRainTs+30s ±150 · release ts ∈ (holdUntil, holdUntil+2500], say
//   released:true · zoneSkips == landed fog asks EXACT · fps p50≥12,
//   lat p95<250ms, 0 gaps · restart boot+fold EXACT-equal+drift 0+present 0 ·
//   RSS peak−postJoin <+60MB · 0 suspicious lines.
//
//   SERVER_DIR=/tmp/pressure28-wt PORT=8973 bun tools/pressure-strobe.ts
//   SELFTEST=1 bun tools/pressure-strobe.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { emptyState, foldEntry } from "../shared/fold.js";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure28-wt";
const PORT = Number(process.env.PORT ?? 8973);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure28-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_SPEC = 152;                      // 176 anchors
const N_HOARD = 12, N_STORM = 12, N_FOG = 12;         // storm legs (40 embodied peak)
const POSE_HZ = 15;
const ZONE_POS = [6, 0, 6];
const HOARD_TICKS = 10, HOARD_GAP = 700;
const STORM_TICKS = 55, STORM_GAP = 90;
const BURST_N = 30, BURST_GAP = 100;
const FOG_TICKS = 33, FOG_GAP = 70;
const DRESS_AT = 2_000;
const HOARD0_AT = 4_050, STORM_AT = 4_500, BURST_AT = 10_500, FOG_AT = 14_250;
const SPEC_ASK_ATS = [14_500, 15_500, 16_500];
const FAIR_SAY_ATS = [5_500, 10_500, 15_500];
const PROBE_SAY_ATS = [8_500, 13_500];
const RECORDER_AT = 17_000;
const TEARDOWN_AT = 24_000, WITNESS_AT = 25_000, KILL_AT = 46_000;
const DURATION = 51_000;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..27
const SELFTEST = process.env.SELFTEST === "1";
const LOG_JSONL = `${WORLDS}/${WORLD}/log.jsonl`;
const SPEC_REFUSAL = "spectators can't author — join embodied to build";

// acceptance thresholds (fail any → exit 1)
const TH = {
  anchorTotal: 176, anchorJoinP95Ms: 3_000,
  fairSays: 3, probeSays: 2, sayP95Ms: 500,
  specRefusals: 3, specEchoes: 0,
  fogVerbs: 0, clearVerbs: 1,
  floorLoMs: 29_900, floorHiMs: 30_100,     // EVERY rain comp until−at
  anchorTolMs: 150,                          // holdUntil vs lastRain+30s
  releaseSweepMs: 2_500,
  fpsP50: 12, latP95Ms: 250, seqGaps: 0,
  rssPeakGrowthMB: 60,
  restartLineDrift: 0, restartWxSayDrift: 0, finalPresent: 0,
  logSuspicious: 0,
};
type Measurements = {
  anchorJoined: number; anchorJoinP95: number;
  fairSays: number; probeSays: number; sayP95: number;
  specRefusals: number; specaskLines: number;
  fogVerbs: number; clearVerbs: number; rainVerbs: number; acceptedAsks: number;
  compWrites: number; wxSays: number; logTotal: number; logExpected: number;
  floorViolations: number; anchorErrMs: number;
  releaseOk: boolean; releaseDetail: string;
  fogLogged: number; fogExpected: number; useDrift: number;
  fpsP50: number; latP95: number; gaps: number;
  restartBoot: number; restartFoldEqual: boolean; restartLineDrift: number;
  restartWxSayDrift: number; finalPresent: number;
  logSuspicious: number; rssPeakGrowthMB: number;
};
function evaluate(m: Measurements): string[] {
  const f: string[] = [];
  if (m.anchorJoined !== TH.anchorTotal) f.push(`anchors ${m.anchorJoined}/${TH.anchorTotal} joined`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) f.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.fairSays !== TH.fairSays) f.push(`fair says ${m.fairSays}/${TH.fairSays} appended+echoed`);
  if (m.probeSays !== TH.probeSays) f.push(`probe says ${m.probeSays}/${TH.probeSays} mid-storm`);
  if (m.sayP95 > TH.sayP95Ms) f.push(`say p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.specRefusals !== TH.specRefusals) f.push(`spectator refusals ${m.specRefusals}/${TH.specRefusals} verbatim`);
  if (m.specaskLines !== 0) f.push(`spectator legs authored ${m.specaskLines} log lines (want 0 — refusal must be pre-engine, pre-log)`);
  if (m.fogVerbs !== TH.fogVerbs) f.push(`fog weather verbs ${m.fogVerbs} (want 0 — strobe closure failed)`);
  if (m.clearVerbs !== TH.clearVerbs) f.push(`clear weather verbs ${m.clearVerbs} (want 1 — the release)`);
  if (m.rainVerbs !== m.acceptedAsks) f.push(`rain verbs ${m.rainVerbs} != accepted asks ${m.acceptedAsks} (log≡echo broken)`);
  if (m.compWrites !== m.acceptedAsks + 2) f.push(`weatherzone comp writes ${m.compWrites} != accepted+2 author+release (${m.acceptedAsks + 2})`);
  if (m.wxSays !== m.acceptedAsks + 1) f.push(`zone says ${m.wxSays} != accepted+1 (${m.acceptedAsks + 1})`);
  if (m.logTotal !== m.logExpected) f.push(`log lines ${m.logTotal} != derived ${m.logExpected}`);
  if (m.floorViolations > 0) f.push(`${m.floorViolations} rain comps violate the 30s floor (until−at outside [${TH.floorLoMs},${TH.floorHiMs}]ms)`);
  if (m.anchorErrMs > TH.anchorTolMs) f.push(`hold anchor err ${m.anchorErrMs}ms > ${TH.anchorTolMs}ms`);
  if (!m.releaseOk) f.push(`release gate: ${m.releaseDetail}`);
  if (m.useDrift !== 0) f.push(`logged fog asks ${m.fogLogged} != expected landed ${m.fogExpected} (drift ${m.useDrift}) — use-plane accounting broken`);
  if (m.fpsP50 < TH.fpsP50) f.push(`fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) f.push(`frame lat p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps !== TH.seqGaps) f.push(`${m.gaps} frame seq gaps`);
  if (m.restartBoot !== 1) f.push(`restart boot failed`);
  if (!m.restartFoldEqual) f.push(`restart fold DIFFERS from fold(log)`);
  if (m.restartLineDrift !== TH.restartLineDrift) f.push(`restart line drift ${m.restartLineDrift} (replay minted lines)`);
  if (m.restartWxSayDrift !== TH.restartWxSayDrift) f.push(`restart wx-say drift ${m.restartWxSayDrift}`);
  if (m.finalPresent !== TH.finalPresent) f.push(`final present ${m.finalPresent} (want 0)`);
  if (m.rssPeakGrowthMB > TH.rssPeakGrowthMB) f.push(`RSS peak growth ${m.rssPeakGrowthMB}MB > ${TH.rssPeakGrowthMB}MB`);
  if (m.logSuspicious !== TH.logSuspicious) f.push(`${m.logSuspicious} suspicious server-log lines`);
  return f;
}

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
const healthy: Measurements = {
  anchorJoined: 176, anchorJoinP95: 120, fairSays: 3, probeSays: 2, sayP95: 12,
  specRefusals: 3, specaskLines: 0, fogVerbs: 0, clearVerbs: 1, rainVerbs: 209,
  acceptedAsks: 209, compWrites: 211, wxSays: 210, logTotal: 639, logExpected: 639,
  floorViolations: 0, anchorErrMs: 20, releaseOk: true, releaseDetail: "",
  fogLogged: 144, fogExpected: 144, useDrift: 0, fpsP50: 14.8, latP95: 40, gaps: 0,
  restartBoot: 1, restartFoldEqual: true, restartLineDrift: 0, restartWxSayDrift: 0,
  finalPresent: 0, logSuspicious: 0, rssPeakGrowthMB: 22,
};
if (SELFTEST) {
  const a = evaluate(healthy);
  const breaches: Measurements[] = [];
  const mk = (patch: Partial<Measurements>) => ({ ...healthy, ...patch });
  breaches.push(mk({ anchorJoined: 175 }));
  breaches.push(mk({ anchorJoinP95: 4_100 }));
  breaches.push(mk({ fairSays: 2 }));
  breaches.push(mk({ probeSays: 1 }));
  breaches.push(mk({ sayP95: 800 }));
  breaches.push(mk({ specRefusals: 2 }));
  breaches.push(mk({ specaskLines: 1 }));
  breaches.push(mk({ fogVerbs: 4 }));                    // the strobe itself
  breaches.push(mk({ clearVerbs: 0 }));                  // release missing
  breaches.push(mk({ rainVerbs: 180, acceptedAsks: 209 })); // log≠echo
  breaches.push(mk({ compWrites: 209 }));
  breaches.push(mk({ wxSays: 211 }));
  breaches.push(mk({ logTotal: 700, logExpected: 639 }));
  breaches.push(mk({ floorViolations: 7 }));             // floor honored only sometimes
  breaches.push(mk({ anchorErrMs: 900 }));
  breaches.push(mk({ releaseOk: false, releaseDetail: "released 8s before expiry" }));
  breaches.push(mk({ useDrift: 12, fogLogged: 156, fogExpected: 144 }));
  breaches.push(mk({ fpsP50: 9.1 }));
  breaches.push(mk({ latP95: 900 }));
  breaches.push(mk({ gaps: 3 }));
  breaches.push(mk({ restartBoot: 0 }));
  breaches.push(mk({ restartFoldEqual: false }));
  breaches.push(mk({ restartLineDrift: 3 }));
  breaches.push(mk({ restartWxSayDrift: 1 }));
  breaches.push(mk({ finalPresent: 2 }));
  breaches.push(mk({ rssPeakGrowthMB: 91 }));
  breaches.push(mk({ logSuspicious: 2 }));
  const names = ["anchors", "joinP95", "fairSays", "probeSays", "sayP95", "specRefusals", "specEchoes",
    "fogVerbs", "clearVerbs", "rain≡asks", "compWrites", "wxSays", "logLines", "floor", "anchor", "release",
    "skipDrift", "fps", "lat", "gaps", "boot", "fold", "lineDrift", "wxDrift", "present", "rss", "suspicious"];
  const b: string[] = [];
  breaches.forEach((x, i) => { const r = evaluate(x); if (!r.length) b.push(names[i]); });
  const ok = a.length === 0 && b.length === 0;
  console.log(ok ? `SELFTEST PASS — healthy gates clean, all ${breaches.length} breached gates fire` : `SELFTEST FAIL — clean:[${a}] missing:[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} embodied anchors @${POSE_HZ}Hz + ${N_SPEC} spec = ${N_PERF + N_SPEC}; zone bench @[${ZONE_POS}] menu [rain,clear,fog] holdSec authored 0.05 (MUST clamp to 30s); hoarder wave ${N_HOARD} legs ×${HOARD_TICKS} rain @${HOARD_GAP}ms; storm ${N_STORM} legs ×${STORM_TICKS} rain @${STORM_GAP}ms; burst ${BURST_N} @${BURST_GAP}ms; fog phase ${N_FOG} legs ×${FOG_TICKS} @${FOG_GAP}ms (state-changing mid-hold → skip); 3 spectator asks (refuse pre-engine); fair+probe says through every phase; teardown t+${TEARDOWN_AT / 1000}s; release ≈ last-accept+30s; SIGKILL t+${KILL_AT / 1000}s → replay mints nothing. ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: anchors=${TH.anchorTotal}@p95<${TH.anchorJoinP95Ms}ms says=${TH.fairSays}+${TH.probeSays}@p95<${TH.sayP95Ms}ms specRefusals=${TH.specRefusals}verbatim fogVerbs=${TH.fogVerbs} clearVerbs=${TH.clearVerbs} rain≡asks comp=asks+1 wxSays=asks+1 floor=[${TH.floorLoMs},${TH.floorHiMs}]ms/every-accept anchor±${TH.anchorTolMs}ms release<${TH.releaseSweepMs}ms-after-expiry skipDrift=0 fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} restart=boot+fold-equal+drift0 present=0 rss<+${TH.rssPeakGrowthMB}MB suspicious=${TH.logSuspicious}`);

// ---- fd budget: ~180 concurrent sockets + server must fit ---------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-strobe.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure28-server-${Date.now()}.log`;
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

// ---- client chassis (midnight-proven) -------------------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number; snapshot: any;
  closed: boolean; closeCode: number; id: string;
  arrives: string[]; leaves: string[];
  sayEcho: Map<string, number>;
  useErrors: string[];        // this socket's own {type:"error"} receipts
  echoKinds: Map<string, number>;   // broadcast log-entry kinds seen (weather/comp/say)
  releaseSays: number;        // world zone says with released:true seen live
  debugPulls: any[];
  errs: string[];
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, snapshot: null, closed: false, closeCode: 0, arrives: [], leaves: [], sayEcho: new Map(), useErrors: [], echoKinds: new Map(), releaseSays: 0, debugPulls: [], errs: [] };
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
        s.echoKinds.set(v, (s.echoKinds.get(v) ?? 0) + 1);
        if (v === "say") {
          s.says.add(m.entry.args?.text);
          if (!s.sayEcho.has(m.entry.args?.text)) s.sayEcho.set(m.entry.args?.text, performance.now());
          if (m.entry.actor === "world" && m.entry.args?.zone?.released === true) s.releaseSays++;
        }
      } else if (m.type === "arrive") {
        s.arrives.push(String(m.id ?? ""));
      } else if (m.type === "leave") {
        s.leaves.push(String(m.id ?? ""));
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

// ---- anchor population (perf-0 FIRST — the fresh world's owner authors sky) ----
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
const anchorIds = new Set([...perfs, ...specs].map((s) => s.id));

// embodied presence @15Hz
let running = true;
const tickers: any[] = [];
for (const s of perfs) {
  const i = Number(s.id.split("-")[1]);
  tickers.push(setInterval(() => {
    if (!running || s.ws.readyState !== 1) return;
    const t = Date.now() / 1000 + i;
    s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  }, 1000 / POSE_HZ));
}

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
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 2_500 && (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak)) rssSamples.peak = r;
}, 500);

// ---- t+2.0s: dress the world — the zone (verb budget: perf-0 1, perf-1 1) ------
at(DRESS_AT, () => {
  if (perf0.ws.readyState === 1) perf0.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "zone", lib: "deco/bench.glb", pos: ZONE_POS, yaw: 0 } }));
  const p1 = perfs[1];
  if (p1?.ws.readyState === 1) p1.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: "zone", type: "weatherzone", data: { states: ["rain", "clear", "fog"], holdSec: 0.05, reach: 4, askAt: "the sky answers" } } }));
});

// ---- t+4.05s→: HOARDER WAVE — 12 embodied legs, pose+ask alternating -----------
const hoards: Spec[] = [];
{
  const legs = await Promise.allSettled(Array.from({ length: N_HOARD }, (_, j) => connect(`hoard-${j}`, false, 200 + j)));
  legs.forEach((r) => { if (r.status === "fulfilled") hoards.push(r.value as Spec); });
  hoards.forEach((s, j) => {
    const startDelay = j * 250;   // stagger 0–2.75s
    tickers.push(setInterval(() => {
      if (!running || s.ws.readyState !== 1) return;
      const k = (Date.now() - t0);
      s.ws.send(JSON.stringify({ type: "pose", pose: { p: [ZONE_POS[0] + 1.5 + Math.sin(k / 900 + j) * 0.4, 0, ZONE_POS[2] + 1.5 + Math.cos(k / 900 + j) * 0.4], yaw: 0, speed: 0.5, clip: "idle" } }));
    }, 140));                       // ~7.1Hz pose
    for (let i = 0; i < HOARD_TICKS; i++) {
      at(HOARD0_AT + startDelay + i * HOARD_GAP, () => {
        if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "zone", action: "rain" } }));
      });
    }
  });
}

// ---- t+4.5s: THE STORM — 12 fresh embodied legs × 55 rain asks @90ms -----------
const stormLegs: Spec[] = [];
{
  const legs = await Promise.allSettled(Array.from({ length: N_STORM }, (_, j) => connect(`storm-${j}`, false, 300 + j)));
  legs.forEach((r) => { if (r.status === "fulfilled") stormLegs.push(r.value as Spec); });
  stormLegs.forEach((s, j) => {
    tickers.push(setInterval(() => {
      if (!running || s.ws.readyState !== 1) return;
      const k = Date.now() / 1000 + j;
      s.ws.send(JSON.stringify({ type: "pose", pose: { p: [ZONE_POS[0] + Math.cos(k + j) * 3, 0, ZONE_POS[2] + Math.sin(k + j) * 3], yaw: 0, speed: 1, clip: "walk" } }));
    }, 1000 / POSE_HZ));
    for (let i = 0; i < STORM_TICKS; i++) {
      at(STORM_AT + i * STORM_GAP, () => {
        if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "zone", action: "rain" } }));
      });
    }
  });
}

// ---- t+10.5s: perf-1 burst — 30 rain uses @100ms (12/4s refusal surface) -------
at(BURST_AT, () => {
  const p1 = perfs[1];
  for (let i = 0; i < BURST_N; i++) {
    setTimeout(() => {
      if (p1?.ws.readyState === 1) p1.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "zone", action: "rain" } }));
    }, i * BURST_GAP);
  }
});

// ---- t+14.25s: FOG PHASE — state-changing asks mid-hold → strobe closure -------
const fogLegs: Spec[] = [];
const specLegs: Spec[] = [];
{
  const legs = await Promise.allSettled(Array.from({ length: N_FOG }, (_, j) => connect(`fogger-${j}`, false, 400 + j)));
  legs.forEach((r) => { if (r.status === "fulfilled") fogLegs.push(r.value as Spec); });
  fogLegs.forEach((s, j) => {
    tickers.push(setInterval(() => {
      if (!running || s.ws.readyState !== 1) return;
      const k = Date.now() / 1000 + j;
      s.ws.send(JSON.stringify({ type: "pose", pose: { p: [ZONE_POS[0] + Math.cos(k * 0.7 + j) * 3, 0, ZONE_POS[2] + Math.sin(k * 0.7 + j) * 3], yaw: 0, speed: 1, clip: "walk" } }));
    }, 1000 / POSE_HZ));
    for (let i = 0; i < FOG_TICKS; i++) {
      at(FOG_AT + i * FOG_GAP, () => {
        if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "zone", action: "fog" } }));
      });
    }
  });
  // 3 spectator legs that try to ask (rain/fog/rain) — refusal is pre-engine
  const slegs = await Promise.allSettled(Array.from({ length: 3 }, (_, j) => connect(`specask-${j}`, true)));
  slegs.forEach((r) => { if (r.status === "fulfilled") specLegs.push(r.value as Spec); });
  specLegs.forEach((s, j) => {
    tickers.push(setInterval(() => {
      if (!running || s.ws.readyState !== 1) return;
      s.ws.send(JSON.stringify({ type: "pose", pose: { p: [2, 0, 2], yaw: 0, speed: 0, clip: "idle" } }));
    }, 200));
  });
}

SPEC_ASK_ATS.forEach((when, j) => {
  at(when, () => {
    const s = specLegs[j];
    if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "zone", action: j === 1 ? "fog" : "rain" } }));
  });
});

// ---- fairness: says before/during/after every phase -----------------------------
const FAIR_TEXTS = [`strobe-a-${Math.floor(t0)}`, `strobe-b-${Math.floor(t0)}`, `strobe-c-${Math.floor(t0)}`];
const PROBE_TEXTS = [`strobe-p1-${Math.floor(t0)}`, `strobe-p2-${Math.floor(t0)}`];
const sayEchoAt = new Map<string, number>();
[...FAIR_SAY_ATS.map((w, i) => ({ w, text: FAIR_TEXTS[i] })), ...PROBE_SAY_ATS.map((w, i) => ({ w, text: PROBE_TEXTS[i] }))].forEach(({ w, text }) => {
  at(w, () => {
    const sentAt = performance.now();
    const S = perfs[3];
    if (S?.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    at(w + 1_500, () => {
      const hit = S?.sayEcho.get(text);
      if (hit !== undefined) sayEchoAt.set(text, hit - sentAt);
    });
  });
});

// ---- t+17.0s: flight-recorder pull on the seer (report-only; ring is bounded) ---
at(RECORDER_AT, () => {
  if (SEER?.ws.readyState === 1) SEER.ws.send(JSON.stringify({ type: "debug", reqId: "rec-1", kinds: ["zone-skip"], limit: 100 }));
});

// ---- t+24.0s teardown; t+25.0s release-witness ---------------------------------
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  teardownAtTs = performance.now();
  anchors.forEach((s) => { try { s.ws.close(); } catch {} });
  hoards.forEach((s) => { try { s.ws.close(); } catch {} });
  stormLegs.forEach((s) => { try { s.ws.close(); } catch {} });
  fogLegs.forEach((s) => { try { s.ws.close(); } catch {} });
  specLegs.forEach((s) => { try { s.ws.close(); } catch {} });
});
const witness = await new Promise<Spec | null>((resolve) => {
  setTimeout(async () => {
    try { resolve(await connect(`release-witness-${Math.floor(t0)}`, true)); }
    catch { resolve(null); }
  }, Math.max(1, WITNESS_AT - (performance.now() - t0)));
});

await sleep(DURATION - (performance.now() - t0));
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
await sleep(300);

// ---- ledger ground truth from log.jsonl (the append-only truth) ----------------
const entries = logEntries();
const logTotalLines = entries.length;
const weatherEntries = entries.filter((e) => e.verb === "weather");
const rainVerbs = weatherEntries.filter((e) => e.args?.weather === "rain").length;
const fogVerbs = weatherEntries.filter((e) => e.args?.weather === "fog").length;
const clearVerbs = weatherEntries.filter((e) => e.args?.weather === "clear").length;
const zoneComps = entries.filter((e) => e.verb === "comp" && e.args?.type === "weatherzone");
const holdComps = zoneComps.filter((e) => e.args?.data?.active === "rain");
const releaseComps = zoneComps.filter((e) => e.args?.data?.active === null);
const wxSays = entries.filter((e) => e.verb === "say" && e.actor === "world" && e.args?.zone != null);
const releaseSays = wxSays.filter((e) => e.args?.zone?.released === true);
// accepted asks, counted from the ASK side: every world-authored weather+comp+say
// triple whose say carries zone.state and cause (the ask grammar)
const askSays = wxSays.filter((e) => e.args?.zone?.released !== true && e.args?.cause != null);
const acceptedAsks = askSays.length;

// the 30s floor on EVERY accepted ask: each hold comp's until−at ≈ 30_000ms
let floorViolations = 0;
let floorWorst = 0;
for (const c of holdComps) {
  const d = Number(c.args?.data?.until) - Number(c.args?.data?.at);
  if (!(d >= TH.floorLoMs && d <= TH.floorHiMs)) floorViolations++;
  floorWorst = Math.max(floorWorst, Math.abs(d - 30_000));
}
// the hold anchor: holdUntil (max until) vs last rain verb ts + 30s
const holdUntil = holdComps.reduce((a, c) => Math.max(a, Number(c.args?.data?.until)), 0);
const lastRainTs = weatherEntries.filter((e) => e.args?.weather === "rain").reduce((a, e) => Math.max(a, Number(e.ts)), 0);
const anchorErrMs = Math.abs(holdUntil - (lastRainTs + 30_000));
// the release: exactly one clear verb + one released say, AFTER expiry, within ~2 sweeps
const releaseWx = weatherEntries.find((e) => e.args?.weather === "clear");
let releaseOk = clearVerbs === 1 && releaseSays.length === 1 && releaseComps.length === 1;
let releaseDetail = `clear=${clearVerbs} relSays=${releaseSays.length} relComps=${releaseComps.length}`;
if (releaseOk && releaseWx && releaseSays.length === 1) {
  const rTs = Number(releaseWx.ts);
  if (!(rTs > holdUntil && rTs <= holdUntil + TH.releaseSweepMs)) {
    releaseOk = false;
    releaseDetail = `release ts ${rTs} outside (holdUntil ${holdUntil}, +${TH.releaseSweepMs}]`;
  } else {
    releaseDetail = `released +${Math.round(rTs - holdUntil)}ms after expiry`;
  }
}
// landed-fog accounting: every logged fog use is either a zone-skip (strobe
// closure — mint-nothing) or, mid-window refusals never reach the log. The
// exact expectation is derived from what each fog leg OBSERVED: logged fog
// asks == fog uses in the log; landed (engine-evaluated) asks == logged (the
// engine evaluates every use that passes shape+rate gates). Refused asks
// never log — the drift gate compares log vs itself-derived expectation.
const fogLogged = entries.filter((e) => e.verb === "use" && e.args?.id === "zone" && e.args?.action === "fog").length;
const fogRefused = fogLegs.reduce((a, s) => a + s.useErrors.filter((e) => e === "slow down — verb rate limit").length, 0);
const fogSent = fogLegs.length * FOG_TICKS;
const fogExpected = fogSent - fogRefused;
const useDrift = fogLogged - fogExpected;

// spectator ask gate: refusals verbatim AND zero use lines authored by the
// spec legs (a refusal is pre-engine, pre-log — fanout they RECEIVE is by design)
const specRefusals = specLegs.reduce((a, s) => a + s.useErrors.filter((e) => e === SPEC_REFUSAL).length, 0);
const specIds = new Set(specLegs.map((s) => s.id));
const specaskLines = entries.filter((e) => e.verb === "use" && specIds.has(String(e.actor))).length;

// derived log expectation: genesis + auto-owner grant + spawn + zone comp
// author + fair/probe says; every ACCEPTED ask logs use+weather+comp+say (4);
// every landed-but-skipped use (fog strobe-skip, out-of-reach rain) logs its
// `use` line alone; the release logs weather+comp+say (3, no use). Landed
// counts derive from observed refusals per socket (refused = never sent on).
const rainRefused = [...hoards, perfs[1]].reduce((a, s) => a + (s ? s.useErrors.filter((e) => e === "slow down — verb rate limit").length : 0), 0);
const rainSent = hoards.length * HOARD_TICKS + BURST_N;
const rainLanded = rainSent - rainRefused;
const rainLogged = entries.filter((e) => e.verb === "use" && e.args?.id === "zone" && e.args?.action === "rain").length;
const BASE_LINES = 1 + 1 + 1 + 1 + FAIR_TEXTS.length + PROBE_TEXTS.length;
const logExpected = BASE_LINES + acceptedAsks * 4 + (fogLogged + rainLogged - acceptedAsks) + 3;

const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const suspicious = (await logFile.text()).split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

// ---- SIGKILL restart: the stormed log must replay to the SAME world ------------
let restartBoot = 0, restartFoldEqual = false, restartLineDrift = 999, restartWxSayDrift = 999;
let restartDiff = ""; let restartPresent = -1;
{
  const pre = foldPrefix(Infinity);
  const preCanon = canon(pre.st);
  const preWxSays = wxSays.length;
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
      const skyWx = probe.snapshot?.state?.sky?.weather;
      restartFoldEqual = v.ok && v.covered === pre.maxSeq && skyWx === "clear";
      if (!restartFoldEqual) {
        const post = probe.snapshot?.state ?? {};
        const keys = new Set([...Object.keys(pre.st), ...Object.keys(post)]);
        const parts: string[] = [`covered=${v.covered} logMaxSeq=${pre.maxSeq} v.ok=${v.ok} sky=${skyWx}`];
        for (const k of keys) if (canon((pre.st as any)[k]) !== canon((post as any)[k])) {
          parts.push(`${k}: pre=${JSON.stringify((pre.st as any)[k])?.slice(0, 160)} post=${JSON.stringify((post as any)[k])?.slice(0, 160)}`);
        }
        restartDiff = v.errs.concat(parts).join(" | ").slice(0, 600);
      }
      await sleep(2_600);   // ≥2 sweeps on the replayed world — boot heal mints nothing
      const post = logEntries();
      restartLineDrift = Math.abs(post.length - preLines);
      const postWx = post.filter((e) => e.verb === "say" && e.actor === "world" && e.args?.zone != null).length;
      restartWxSayDrift = Math.abs(postWx - preWxSays);
      try { probe.ws.close(); } catch {}
    } catch (err) { restartFoldEqual = false; restartLineDrift = 999; restartDiff = String(err).slice(0, 300); }
  }
}

const m: Measurements = {
  anchorJoined: anchors.length, anchorJoinP95: pct(joinTimes, 95),
  fairSays: FAIR_TEXTS.filter((t) => sayEchoAt.has(t)).length,
  probeSays: PROBE_TEXTS.filter((t) => sayEchoAt.has(t)).length,
  sayP95: sayEchoAt.size ? pct([...sayEchoAt.values()], 95) : Infinity,
  specRefusals, specaskLines,
  fogVerbs, clearVerbs, rainVerbs, acceptedAsks,
  compWrites: zoneComps.length, wxSays: wxSays.length,
  logTotal: logTotalLines, logExpected,
  floorViolations, anchorErrMs,
  releaseOk, releaseDetail,
  fogLogged, fogExpected, useDrift,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  restartBoot, restartFoldEqual, restartLineDrift, restartWxSayDrift,
  finalPresent: restartPresent < 0 ? 999 : restartPresent,
  logSuspicious: suspicious.length, rssPeakGrowthMB: rssPeakGrowth,
};
const fail = evaluate(m);

// recorder observation (report-only)
const recPull = SEER?.debugPulls?.find((d) => d.reqId === "rec-1");
const recSkips = recPull ? (recPull.events ?? []).length : -1;

console.log(`
results
  anchors               ${anchors.length}/${1 + rest.length} joined — p95 ${Math.round(m.anchorJoinP95)}ms (${anchorFailed} failed)
  accepted asks         ${acceptedAsks} (rain verbs ${rainVerbs} — log≡echo ${rainVerbs === acceptedAsks ? "EXACT" : "DRIFT"})
  zone comp writes      ${zoneComps.length} (holds ${holdComps.length} + release ${releaseComps.length}) · zone says ${wxSays.length}
  30s floor             ${floorViolations} violations across ${holdComps.length} holds (worst |Δ| ${Math.round(floorWorst)}ms from 30_000)
  hold anchor           holdUntil − (last rain ts + 30s) = ${Math.round(anchorErrMs)}ms (tol ±${TH.anchorTolMs})
  strobe closure        fog weather verbs ${fogVerbs} (must be 0) · logged fog asks ${fogLogged} == landed ${fogExpected} (drift ${useDrift})
  release               ${releaseDetail} · witness observed ${witness ? witness.releaseSays : "n/a"} release say(s) live
  spectator asks        ${specRefusals}/3 verbatim refusals · ${specaskLines} use lines authored (must be 0)
  rain plane            sent ${rainSent} · refused ${rainRefused} · landed ${rainLanded} · logged ${rainLogged} · accepted ${acceptedAsks}
  fair/probe says       fair ${m.fairSays}/3 · probe ${m.probeSays}/2 — p95 ${sayEchoAt.size ? Math.round(m.sayP95) : "MISSED"}ms
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)} (window ${Math.round((teardownAtTs - t0) / 1000)}s connected)
  frame latency ms      p50 ${Math.round(pct(latAll, 50))} p95 ${Math.round(m.latP95)} max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} spectators
  http probe ms         p95 ${Math.round(pct(probeAll, 95))} (n=${probeAll.length}) · errors ${probeErrors.n}
  flight recorder       zone-skip events in 300-ring at t+17s: ${recSkips < 0 ? "pull missed" : recSkips} (report-only)
  world log             ${logTotalLines} lines vs derived ${logExpected} (drift ${Math.abs(logTotalLines - logExpected)})
  SIGKILL restart       boot ${restartBoot}/1 · fold ${restartFoldEqual ? "EXACT-equal (sky clear)" : "DIFFERS"} · line drift ${restartLineDrift} · wx-say drift ${restartWxSayDrift} · present ${restartPresent}
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${suspicious.length} suspicious lines
`);
if (restartDiff) console.log(`  restart diff: ${restartDiff}`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — ${acceptedAsks} accepted asks under storm, every hold floored at 30s, zero sky thrash, replay minted nothing`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
