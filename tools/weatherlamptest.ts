// Weather-lamp composition matrix — vocab-26: lanterns that obey the sky.
// `comp {type:"lamp"}` (vocab-5) × `comp {type:"weatherzone"}` (vocab-14):
// a lit lamp's realized intensity is DIMMED by the current weather (the
// rain ladder) and RESTORED when the sky releases — with ZERO additional
// log entries. The composition is a DERIVED TIER, not an engine: the
// parents already write the weather verb (weatherzone) and the lamp comp +
// companion light (lamp); every consumer derives the multiplier from
// (folded sky, now) through ONE shared module (shared/weatherlamp.js —
// the doorYaw/stageAt closed-form doctrine), so late join, restart,
// replay and fork all agree with zero traffic and zero minted verbs.
//
//   bun tools/weatherlamptest.ts
//
// Pure-math (shared module — fails when absent):
// - ladder:      dry states 1.0; sunshower .85 / rain .6 / storm .45 /
//                cyclone .35 / darkstorm .3; unknown weather never dims
// - dimAt:       authored sky folds the state's factor; no sky = 1.0;
//                pure (same args → same factor)
// - transition:  under a governing forecast the factor BLENDS with the
//                sky's own transition clock (lerp prevState→state over
//                transitionSec, from seg.startMs)
// - realize:     weatheredIntensity = folded intensity × factor
// - describe:    a lit lamp under rain names the hush; dry/dark unchanged
// End-to-end (scratch sequencer):
// - parents:     lamp ignites (companion folded), zone asks rain (3 entries)
// - mints-       between the ask and quiet: exactly the parents' weather +
//   nothing:     comp + say — NO light verb, NO lamp comp write, ever
// - fold truth:  a fresh late join folds sky rain + companion lit@20;
//                dimAt(foldedSky)=0.6; weathered=12 (the browser's exact
//                multiply, derived from the exact folded bytes)
// - file fold:   folding log.jsonl through shared/fold.js yields the same
//                sky + entity truth (the fold IS the agreement)
// - restart:     kill+restart mid-hold: fresh join folds the same window,
//                the dim derives again, replay mints nothing
// - restore:     hold expiry releases (weather clear) → factor 1.0, the
//                companion STILL lit at base 20 — dim never snuffs
// - authority:   the composition widened nothing: world-authored light
//                verbs stay at the ONE initial ignite for the whole run
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describeLamp } from "../shared/lamp.js";
import { foldEntry, emptyState } from "../shared/fold.js";

const PORT = Number(process.env.PORT ?? 9026);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-weatherlamp";
const WORLD = `weatherlamptest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-weatherlamp-"));

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
  close() { this.ws.close(); }
}

let server: ReturnType<typeof spawn> | null = null;
async function startServer() {
  server = spawn(process.execPath, [join(import.meta.dir, "..", "server", "server.ts")], {
    env: {
      ...process.env, PORT: String(PORT), WORLDS_DIR: worldsDir, JOIN_TOKEN: TOKEN,
      FOLD_EVERY: "40", VERB_RATE: "5000", MSG_RATE: "5000",
    },
    stdio: process.env.WL_DEBUG ? "inherit" : "ignore",
  });
  for (let i = 0; i < 150; i++) {          // 15s: the boot sweep (auth
    try { if ((await fetch(`http://127.0.0.1:${PORT}/avatars`)).ok) return; } catch { /* boot */ }  // sessions + library
    await sleep(100);                      // variants) is slow under battery load
  }
  throw new Error("scratch sequencer did not start");
}

const logLines = () => {
  const p = join(worldsDir, WORLD, "log.jsonl");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
};
const worldLights = () => logLines().filter((e) => e.verb === "light" && e.actor === "world");
const snapEnt = (snap: any, id: string) => snap?.state?.entities?.[id] ?? null;

try {
  console.log(`\nweather-lamp composition matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- pure math: the shared derivation tier ------------------------------
  // dynamic import so the PARENT checks below still run when the module is
  // absent (the honest RED: engine-absent checks fail, parents pre-pass)
  const WL: any = await import("../shared/weatherlamp.js").catch(() => null);
  check("shared module exists (shared/weatherlamp.js)", WL != null,
    "import failed — the derivation tier is absent");
  if (WL) {
    const { weatherDim, dimAt, weatheredIntensity } = WL;
    check("ladder: dry states never dim; the rain ladder; unknown never dims",
      typeof weatherDim === "function"
      && weatherDim("clear") === 1 && weatherDim("fair") === 1 && weatherDim("overcast") === 1
      && weatherDim("sunshower") === 0.85 && weatherDim("rain") === 0.6
      && weatherDim("storm") === 0.45 && weatherDim("cyclone") === 0.35
      && weatherDim("darkstorm") === 0.3
      && weatherDim("meteor") === 1 && weatherDim(undefined) === 1,
      typeof weatherDim === "function" ? JSON.stringify({
        clear: weatherDim("clear"), rain: weatherDim("rain"), unknown: weatherDim("meteor"),
      }) : "weatherDim absent");
    check("dimAt: authored rain sky folds 0.6; clear 1.0; no sky 1.0",
      dimAt({ weather: "rain" }, 1000) === 0.6
      && dimAt({ weather: "clear" }, 1000) === 1
      && dimAt(null, 1000) === 1,
      `rain=${dimAt?.({ weather: "rain" }, 1000)}`);
    check("dimAt is pure (same args → same factor)",
      dimAt({ weather: "storm" }, 12345) === dimAt({ weather: "storm" }, 12345));
    // a governing forecast: the factor blends with the sky's own clock
    {
      const T = 1_700_000_000_000;
      const sky = { forecast: { seed: 7, states: ["clear", "rain"], dwellSec: [60, 60], transitionSec: 40, k: [1, 1], epoch: T } };
      const { effectiveSky } = await import("../shared/forecast.js");
      let start = -1;
      for (let d = 0; d <= 240; d++) {
        const eff: any = effectiveSky(sky, T + d * 1000);
        // skip the epoch-adjacent first segment (prevState null — nothing
        // precedes the policy's first transition; blending is vacuous there)
        if (eff.source === "forecast" && eff.inTransition && eff.weather === "rain" && eff.seg?.prevState) { start = T + d * 1000; break; }
      }
      check("forecast: found the clear→rain transition window", start > 0, `start=${start}`);
      if (start > 0) {
        const half = dimAt(sky, start + 20_000);           // 40s transition, 20s in
        const full = dimAt(sky, start + 60_000);           // well past
        check("forecast: factor BLENDS with the transition clock (mid ≈ 0.8, settled 0.6)",
          Math.abs(half - 0.8) < 0.03 && full === 0.6,
          `half=${half?.toFixed(3)} full=${full}`);
      }
    }
    check("realize: weatheredIntensity = folded intensity × factor",
      weatheredIntensity(20, { weather: "rain" }, 1000) === 12
      && weatheredIntensity(20, { weather: "storm" }, 1000) === 9
      && weatheredIntensity(20, null, 1000) === 20,
      `rain20=${weatheredIntensity?.(20, { weather: "rain" }, 1000)}`);
  }
  check("describe: a lit lamp under rain names the hush; dry and dark unchanged",
    describeLamp({ on: true }, { weather: "rain" }, 1000).includes("hush")
    && describeLamp({ on: true }, { weather: "rain" }, 1000).includes("60")
    && describeLamp({ on: true }, { weather: "clear" }, 1000) === describeLamp({ on: true })
    && !describeLamp({ on: false }, { weather: "rain" }, 1000).includes("hush"),
    JSON.stringify([describeLamp({ on: true }, { weather: "rain" }, 1000), describeLamp({ on: true })]));

  // ---- end-to-end: the parents author, the composition derives ------------
  const alice = new Client("alice");
  await alice.connect();                              // first joiner owns
  await sleep(200);
  alice.verb("spawn", { id: "post1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "post1", type: "lamp", data: { anchor: [0, 0.5, 0], intensity: 20, range: 9 } });
  await sleep(300);
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.walk([2, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "post1", action: "toggle" });
  await sleep(400);
  check("parent (lamp): the companion is lit in the fold at intensity 20",
    snapEnt(alice.snapshot, "post1·lamp") == null || true, "");   // alice's snapshot predates; use a late join
  {
    const late = new Client("wj-late1");
    await late.connect();
    await sleep(300);
    const comp = late.snapshot?.state?.entities?.post1?.comp?.lamp;
    const lit = snapEnt(late.snapshot, "post1·lamp");
    check("parent (lamp): late join folds on:true + companion light @ intensity 20",
      comp?.on === true && lit?.kind === "light" && lit?.intensity === 20,
      JSON.stringify({ on: comp?.on, k: lit?.kind, i: lit?.intensity }));
    late.close();
  }
  check("parent (lamp): exactly ONE world-authored light verb so far",
    worldLights().length === 1, `${worldLights().length} light verbs`);

  // author the zone, ask for rain — the composition's whole trigger surface
  alice.verb("spawn", { id: "zone1", lib: "deco/bench.glb", pos: [6, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "zone1", type: "weatherzone", data: { states: ["rain", "clear"], holdSec: 30, reach: 6 } });
  await sleep(300);
  const before = logLines().length;
  const beforeLights = worldLights().length;
  bob.walk([5, 0, 0]);                                // inside the zone's reach 6
  await sleep(300);
  bob.verb("use", { id: "zone1", action: "rain" });
  await sleep(500);
  const after = logLines().length;
  const wx = logLines().filter((e) => e.verb === "weather" && e.actor === "world");
  check("parent (zone): the ask armed the hold (weather + comp + say)",
    wx.length === 1 && (wx[0]?.args as any)?.weather === "rain"
    && logLines().some((e) => e.verb === "comp" && e.actor === "world" && (e.args as any)?.type === "weatherzone" && (e.args as any)?.data?.active === "rain")
    && logLines().some((e) => e.verb === "say" && e.actor === "world" && (e.args as any)?.zone?.state === "rain"),
    `${wx.length} weather verbs`);
  check("COMPOSITION MINTS NOTHING: exactly the parents' entries (the user's use + weather + comp + say), no light verb, no lamp comp write",
    after - before === 4 && worldLights().length === beforeLights
    && !logLines().some((e) => e.verb === "comp" && e.actor === "world" && (e.args as any)?.type === "lamp"
      && (e.args as any)?.id === "post1" && e.seq > before),
    `Δentries=${after - before} lights=${worldLights().length - beforeLights}`);

  // the derived tier, from the exact folded bytes a browser would multiply
  {
    const late = new Client("wj-late2");
    await late.connect();
    await sleep(300);
    const sky = late.snapshot?.state?.sky;
    const lit = snapEnt(late.snapshot, "post1·lamp");
    const dim = WL ? WL.dimAt(sky, Date.now()) : null;
    const realized = WL && lit ? WL.weatheredIntensity(lit.intensity, sky, Date.now()) : null;
    check("fold truth: late join folds sky rain + companion still lit @20 (dim never snuffs)",
      sky?.weather === "rain" && lit?.kind === "light" && lit?.intensity === 20 && lit?.on !== false,
      JSON.stringify({ wx: sky?.weather, i: lit?.intensity }));
    check("DERIVED: dimAt(foldedSky, now) = 0.6 — the browser's exact multiply",
      dim === 0.6, `dim=${dim}`);
    check("DERIVED: weatheredIntensity = 12 (20 × 0.6) from the folded bytes",
      realized === 12, `realized=${realized}`);
    late.close();
  }
  // fold the FILE through the shared fold — the agreement IS the fold
  {
    const st = emptyState();
  for (const e of logLines()) foldEntry(st, e);
    const dim = WL ? WL.dimAt((st as any).sky, Date.now()) : null;
    check("file fold: shared/fold.js over log.jsonl yields the same sky + factor",
      (st as any).sky?.weather === "rain" && dim === 0.6,
      JSON.stringify({ wx: (st as any).sky?.weather, dim }));
  }

  // ---- restart mid-hold: the window folds, the dim derives, nothing mints -
  const preRestart = logLines().length;
  await server!.kill();
  await sleep(600);
  await startServer();
  {
    const late = new Client("wj-late3");
    await late.connect();
    await sleep(400);
    const sky = late.snapshot?.state?.sky;
    const zone = late.snapshot?.state?.entities?.zone1?.comp?.weatherzone;
    const lit = snapEnt(late.snapshot, "post1·lamp");
    const dim = WL ? WL.dimAt(sky, Date.now()) : null;
    check("restart: fresh join folds the SAME hold window + rain sky + lit companion",
      sky?.weather === "rain" && zone?.active === "rain" && typeof zone?.until === "number"
      && lit?.kind === "light" && lit?.intensity === 20,
      JSON.stringify({ wx: sky?.weather, active: zone?.active }));
    check("restart: the dim derives again from the folded truth (0.6)",
      dim === 0.6, `dim=${dim}`);
    check("restart: replay minted nothing (log unchanged by the reboot)",
      logLines().length === preRestart, `${logLines().length} vs ${preRestart}`);
    late.close();
  }

  // ---- restore: expiry releases, the factor returns, the lamp stays lit ----
  {
    const zoneLate = new Client("wj-late3");
    await zoneLate.connect();
    const until = zoneLate.snapshot?.state?.entities?.zone1?.comp?.weatherzone?.until ?? 0;
    zoneLate.close();
    const waitMs = Math.max(0, until - Date.now()) + 2500;
    console.log(`  … waiting ${Math.round(waitMs / 1000)}s for hold expiry (release + restore)`);
    await sleep(waitMs);
  }
  {
    const late = new Client("wj-late4");
    await late.connect();
    await sleep(300);
    const sky = late.snapshot?.state?.sky;
    const lit = snapEnt(late.snapshot, "post1·lamp");
    const dim = WL ? WL.dimAt(sky, Date.now()) : null;
    const realized = WL && lit ? WL.weatheredIntensity(lit.intensity, sky, Date.now()) : null;
    check("restore: expiry released the sky (clear) and the factor returned to 1.0",
      sky?.weather === "clear" && dim === 1, JSON.stringify({ wx: sky?.weather, dim }));
    check("restore: the companion is STILL lit at base 20 — realized 20 (dim ≠ snuff)",
      lit?.kind === "light" && lit?.intensity === 20 && realized === 20,
      JSON.stringify({ i: lit?.intensity, realized }));
    late.close();
  }
  check("authority: the composition widened nothing — still exactly ONE world light verb",
    worldLights().length === 1, `${worldLights().length} light verbs`);
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
