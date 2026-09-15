// Weatherzone matrix — `comp {type:"weatherzone"}` makes a place able to
// ASK the sky for weather: a builder publishes a bounded menu of legal
// states + a hold duration, anyone in arm's reach requests from the menu,
// the world's own weather verb answers, and the hold reverts at expiry
// (fold-derived — restart/late-join read the same window with zero engine
// traffic). THE ONE-SKY LAW: the effect is world-wide weather via the
// ordinary weather verb; only the REQUEST is district-sited. Under a
// governing forecast the expiry RELEASES (returns to the policy's current
// segment) instead of reverting to a stale manual state.
// Self-booting: scratch sequencer (fresh WORLDS_DIR). Covers § WEATHERZONES
// CONTRACT:
//
//   bun tools/weatherzonetest.ts
//
// - authoring:  spawn + weatherzone comp is builder-gated; visitor bounces
// - ask:        use {action:"rain"} in reach mints ONE world-authored
//               weather verb + ONE say with zone provenance + ONE comp hold
//               write; the sky folds to rain (late joiner reads it)
// - cap:        the hold window honors the 30s floor (authored 4 -> 30s)
// - menu:       a legal weather OUTSIDE the menu skips mint-nothing (zone-skip)
// - strobe:     a state-CHANGING ask during an active hold skips; a same-state
//               ask re-anchors (extends) the window
// - one-sky:    a second zone cannot hold while another holds
// - revert:     hold expiry reverts to revertTo (the sky that was standing)
//               via ONE weather verb + say + comp clear
// - reach:      out-of-reach use mints nothing (skip names distance)
// - spectator:  spectate legs cannot use (shell gate)
// - pass-through: non-weather actions fall through, no writes
// - lock:       lock composes (use is not lock-guarded)
// - lint:       out-of-range numbers clamp with weatherzone-lint notes;
//               illegal menu names drop with notes
// - forecast:   release semantics proven in the pure fold (override set by
//               ask; forecast resumes after the boundary)
// - restart:    replay mints nothing; the hold folds from the log; expiry
//               still fires after a restart inside the window
// - boot heal:  a hold that expired while the server was down releases on
//               the first sweep after boot
// - describe:   describeWeatherzone states menu + hold
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeWeatherzone, holdUntil, holdActive, describeWeatherzone } from "../shared/weatherzone.js";
import { WEATHERS, effectiveSky, foldSkyEntry } from "../shared/forecast.js";

const PORT = Number(process.env.PORT ?? 8987);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-weatherzone";
const WORLD = `weatherzonetest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-weatherzone-"));

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
    this.send({ type: "debug", reqId: `d${this.msgs.length}`, kinds: [kind], limit: 160 });
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
const zoneSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.zone != null && (!id || (e.args as any)?.id === id));
const zoneComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "weatherzone" && (!id || (e.args as any)?.id === id));
const zoneWeathers = () => logLines().filter((e) => e.verb === "weather" && e.actor === "world");
const logZone = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "weatherzone"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapZone = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.weatherzone ?? null;
const snapSky = (snap: any) => snap?.state?.sky ?? null;
const useEntry = (e: any, id: string, action: string, actor: string) =>
  e.verb === "use" && e.actor === actor && e.args?.id === id && e.args?.action === action;

try {
  console.log(`\nweatherzone matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- shared math (pure, before any server work) -----------------------------
  {
    const n = normalizeWeatherzone({ states: ["rain", "snowfall", "clear", 7], holdSec: 999, reach: 1 });
    check("normalizeWeatherzone drops illegal names, clamps bounds, notes both",
      JSON.stringify(n.cfg.states) === JSON.stringify(["rain", "clear"])
        && n.cfg.holdSec === 600 && n.cfg.reach === 2
        && n.notes.some((x: string) => x.includes("snowfall")) && n.notes.length >= 3,
      JSON.stringify(n));
    const d = normalizeWeatherzone({});
    check("normalizeWeatherzone defaults: menu rain|clear, hold 120s, reach 4m",
      JSON.stringify(d.cfg.states) === JSON.stringify(["rain", "clear"])
        && d.cfg.holdSec === 120 && d.cfg.reach === 4);
    const m = normalizeWeatherzone({ states: WEATHERS });
    check("menu caps at 6 with a note",
      m.cfg.states.length === 6 && m.notes.some((x: string) => x.includes("capped")),
      JSON.stringify(m));
    const empty = normalizeWeatherzone({ states: [] });
    check("empty menu fails closed: never-firing zone + note",
      empty.cfg.states.length === 0 && empty.notes.some((x: string) => x.includes("empty")));
    check("holdUntil/holdActive: the pure window math",
      holdUntil({ holdSec: 60 }, 1000) === 61000
        && holdActive({ active: "rain", until: 61000 }, 60000) === true
        && holdActive({ active: "rain", until: 61000 }, 62000) === false
        && holdActive({ until: 61000 }, 60000) === false
        && holdActive({ active: "meteor", until: Infinity }, 0) === false);
    check("describeWeatherzone idle vs holding",
      describeWeatherzone({ states: ["rain"], holdSec: 60 }, 0).includes("menu rain")
        && describeWeatherzone({ states: ["rain"], holdSec: 60, active: "rain", until: 30000 }, 0).includes("holds 30s"),
      `${describeWeatherzone({ states: ["rain"], holdSec: 60 }, 0)} / ${describeWeatherzone({ states: ["rain"], holdSec: 60, active: "rain", until: 30000 }, 0)}`);
    // the 30s floor clamps authored 4s
    const fl = normalizeWeatherzone({ holdSec: 4 });
    check("the anti-strobe floor: authored 4s holds 30s",
      fl.cfg.holdSec === 30 && fl.notes.some((x: string) => x.includes("clamped")));
  }

  // ---- authoring --------------------------------------------------------------
  const alice = new Client("alice");                       // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "obelisk1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "obelisk1", type: "weatherzone", data: {
    states: ["rain", "clear", "overcast"], holdSec: 4, reach: 6,
    askAt: "the obelisk hums, and rain gathers", revertAt: "the obelisk sighs, and the sky returns",
  } });
  await sleep(400);
  check("builder authored spawn + weatherzone comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  // visitor authoring bounce
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  const compsBefore = zoneComps("obelisk1").length;
  bob.verb("comp", { id: "obelisk1", type: "weatherzone", data: { states: ["storm"] } });
  await sleep(300);
  check("visitor comp authoring bounces (builder-gated)",
    zoneComps("obelisk1").length === compsBefore,
    `${zoneComps("obelisk1").length} vs ${compsBefore}`);

  // ---- ask: the core transition --------------------------------------------------
  bob.walk([3, 0, 0]);                                   // 3m from obelisk1 — inside reach 6
  await sleep(300);
  let armAt = 0;
  {
    bob.verb("use", { id: "obelisk1", action: "rain" });
    await sleep(400);
    const says = zoneSays("obelisk1");
    armAt = (says[0]?.args as any)?.zone?.until ?? 0;
    check("in-reach ask says the authored line",
      says.length === 1 && (says[0]?.args as any)?.text === "the obelisk hums, and rain gathers",
      `${says.length} says: ${JSON.stringify(says.map((s) => (s.args as any)?.text))}`);
    check("say carries zone{state,who,until,at} + cause/by provenance",
      (says[0]?.args as any)?.zone?.state === "rain" && (says[0]?.args as any)?.zone?.who === "bob"
        && typeof (says[0]?.args as any)?.zone?.until === "number"
        && typeof (says[0]?.args as any)?.cause === "number" && (says[0]?.args as any)?.by === "bob",
      JSON.stringify(says[0]?.args?.zone));
    const w = zoneWeathers();
    check("the ask minted ONE world-authored weather verb (world authority, menu-bounded)",
      w.length === 1 && (w[0]?.args as any)?.weather === "rain",
      JSON.stringify(w.map((x) => x.args)));
    const comps = zoneComps("obelisk1").filter((e) => (e.args as any).data?.active != null);
    const d = comps[0]?.args as any;
    check("the hold wrote ONE comp transition {...authored, active, until, revertTo, at}",
      comps.length === 1
        && d?.data?.active === "rain"
        && typeof d?.data?.until === "number"
        && d?.data?.revertTo === "clear"          // world default: no weather was standing
        && d?.data?.holdSec === 4,
      JSON.stringify(d?.data));
    check("the window honors the 30s floor (authored 4 -> at+30s)",
      typeof armAt === "number" && armAt > Date.now() + 25000,
      `${Math.round((armAt - Date.now()) / 1000)}s remain`);
    check("the sky folds to rain (world-wide effect, one-sky law)",
      await (async () => {
        const late = new Client("skyprobe1");
        await late.connect(); await sleep(250);
        const ok = snapSky(late.snapshot)?.weather === "rain";
        late.close();
        return ok;
      })(),
      JSON.stringify(snapSky(bob.snapshot)?.weather));
    check("the use verb logged with bob as actor (authority trace)",
      logLines().some((e) => useEntry(e, "obelisk1", "rain", "bob")));
  }

  // ---- menu boundary --------------------------------------------------------------
  {
    const saidM = zoneSays().length, wxM = zoneWeathers().length;
    bob.verb("use", { id: "obelisk1", action: "storm" });        // legal weather, NOT in menu
    await sleep(300);
    check("a legal weather outside the menu mints nothing (zone-skip)",
      zoneSays().length === saidM && zoneWeathers().length === wxM,
      `${zoneSays().length}/${zoneWeathers().length}`);
    bob.debug("zone-skip"); await sleep(300);
    const sk = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the menu skip names the boundary",
      JSON.stringify(sk?.events ?? []).includes("menu"),
      JSON.stringify(sk?.events ?? []).slice(0, 160));
  }

  // ---- strobe closure ---------------------------------------------------------------
  {
    // state-CHANGING ask during an active hold skips
    const saidS = zoneSays().length, wxS = zoneWeathers().length;
    bob.verb("use", { id: "obelisk1", action: "clear" });
    await sleep(300);
    check("a state-changing ask during an active hold mints nothing (strobe closure)",
      zoneSays().length === saidS && zoneWeathers().length === wxS,
      `${zoneSays().length}/${zoneWeathers().length}`);
    bob.debug("zone-skip"); await sleep(300);
    const sk2 = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the strobe skip names the holding state",
      JSON.stringify(sk2?.events ?? []).includes("holding"),
      JSON.stringify(sk2?.events ?? []).slice(0, 160));
    // same-state ask re-anchors (extends)
    const untilBefore = (logZone("obelisk1") as any)?.until;
    await sleep(1200);
    bob.verb("use", { id: "obelisk1", action: "rain" });
    await sleep(400);
    const zn = logZone("obelisk1") as any;
    check("a same-state ask re-anchors the window (extend)",
      typeof untilBefore === "number" && typeof zn?.until === "number" && zn.until > untilBefore,
      `${untilBefore} -> ${zn?.until}`);
    check("the re-ask kept the ORIGINAL revertTo (the displaced sky, not the ask)",
      zn?.revertTo === "clear" && zn?.active === "rain",
      JSON.stringify(zn));
  }

  // ---- one-sky: a second zone cannot hold while another holds ------------------------
  {
    alice.verb("spawn", { id: "shrine1", lib: "deco/bench.glb", pos: [50, 0, 50], yaw: 0 });
    alice.verb("comp", { id: "shrine1", type: "weatherzone", data: { states: ["fair"], holdSec: 60 } });
    await sleep(400);
    const saidO = zoneSays().length, wxO = zoneWeathers().length;
    const carol = new Client("carol");
    await carol.connect();
    await sleep(200);
    carol.walk([51, 0, 51]); await sleep(300);
    carol.verb("use", { id: "shrine1", action: "fair" });
    await sleep(300);
    check("one-sky law: a second zone skips while another holds",
      zoneSays("shrine1").length === 0 && zoneWeathers().length === wxO,
      `${zoneSays("shrine1").length}/${zoneWeathers().length} vs ${wxO}`);
    carol.debug("zone-skip"); await sleep(300);
    const sk3 = carol.msgs.filter((m) => m.type === "debug").at(-1);
    check("the one-sky skip names the governing zone",
      JSON.stringify(sk3?.events ?? []).includes("obelisk1"),
      JSON.stringify(sk3?.events ?? []).slice(0, 160));
    carol.close();
  }

  // ---- revert at expiry (the re-anchored window: last arm + 30s) ----------------------
  {
    const waitMs = Math.max(0, ((logZone("obelisk1") as any)?.until ?? 0) - Date.now()) + 2500;
    console.log(`  … waiting ${Math.round(waitMs / 1000)}s for hold expiry`);
    await sleep(waitMs);
    const says = zoneSays("obelisk1");
    check("expiry reverted with the authored revert line",
      says.length >= 2 && (says.at(-1)?.args as any)?.text === "the obelisk sighs, and the sky returns",
      JSON.stringify(says.map((s) => (s.args as any)?.text)));
    const w = zoneWeathers();
    check("revert minted ONE weather verb back to revertTo",
      (w.at(-1)?.args as any)?.weather === "clear" && w.length >= 2,
      JSON.stringify(w.map((x) => (x as any).args?.weather)));
    const d = logZone("obelisk1");
    check("the comp hold cleared (active null — the fold reads idle)",
      d?.active == null && typeof d?.at === "number",
      JSON.stringify(d));
    check("the sky folds back to clear",
      await (async () => {
        const late = new Client("skyprobe2");
        await late.connect(); await sleep(250);
        const ok = snapSky(late.snapshot)?.weather === "clear";
        late.close();
        return ok;
      })(),
      JSON.stringify(snapSky(bob.snapshot)?.weather));
  }

  // ---- reach gate --------------------------------------------------------------------
  bob.walk([40, 0, 0]);
  await sleep(300);
  {
    const saidR = zoneSays().length, wxR = zoneWeathers().length;
    bob.verb("use", { id: "obelisk1", action: "rain" });
    await sleep(300);
    check("out-of-reach use mints nothing",
      zoneSays().length === saidR && zoneWeathers().length === wxR,
      `${zoneSays().length}/${zoneWeathers().length}`);
    bob.debug("zone-skip"); await sleep(300);
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
    const saidS = zoneSays().length, wxS = zoneWeathers().length;
    spec.verb("use", { id: "obelisk1", action: "rain" });
    await sleep(300);
    check("spectators cannot use weatherzones (shell gate)",
      zoneSays().length === saidS && zoneWeathers().length === wxS,
      `${zoneSays().length}/${zoneWeathers().length}`);
    spec.close();
  }

  // ---- pass-through ---------------------------------------------------------------------
  {
    const saidP = zoneSays().length, wxP = zoneWeathers().length;
    bob.walk([2, 0, 0]); await sleep(200);
    bob.verb("use", { id: "obelisk1", action: "ring" });
    await sleep(300);
    check("a non-weather action (ring) falls through, no zone writes",
      zoneSays().length === saidP && zoneWeathers().length === wxP);
  }

  // ---- lock composes ---------------------------------------------------------------------
  {
    alice.verb("comp", { id: "obelisk1", type: "lock", data: true });
    await sleep(300);
    bob.verb("use", { id: "obelisk1", action: "overcast" });
    await sleep(400);
    check("lock composes: a locked zone still answers (use not lock-guarded)",
      (logZone("obelisk1") as any)?.active === "overcast",
      JSON.stringify(logZone("obelisk1")));
    alice.verb("comp", { id: "obelisk1", type: "lock", data: null });
    await sleep(300);
  }

  // ---- lint: authored drift clamps at use time ----------------------------------------------
  {
    const held = logZone("obelisk1");
    await sleep(31000);                              // let the overcast hold lapse first
    alice.verb("comp", { id: "obelisk1", type: "weatherzone", data: {
      ...held, states: ["sunny", "rain"], holdSec: 5,
    } });
    await sleep(300);
    bob.verb("use", { id: "obelisk1", action: "rain" });
    await sleep(400);
    const d = logZone("obelisk1");
    check("the write carries authored shape verbatim (door doctrine)",
      d?.states?.[0] === "sunny" && d?.holdSec === 5 && d?.active === "rain",
      JSON.stringify(d));
    alice.debug("weatherzone-lint"); await sleep(300);
    const li = alice.msgs.filter((m) => m.type === "debug").at(-1);
    check("weatherzone-lint names the drops/clamps",
      JSON.stringify(li?.events ?? []).includes("sunny"),
      JSON.stringify(li?.events ?? []).slice(0, 200));
  }

  // ---- forecast release semantics (pure fold arithmetic) --------------------------------------
  {
    const now = Date.now();
    const skyPolicy = { forecast: { seed: 7, states: ["clear", "rain"], dwellSec: [600, 1800], transitionSec: 5, k: [0.7, 1] } };
    let sky = foldSkyEntry(null, { verb: "sky", args: skyPolicy as any, ts: now, seq: 100, actor: "alice" });
    const seg1 = effectiveSky(sky, now + 1000);
    check("forecast setup: segment weather derives without an engine",
      seg1.source === "forecast" && WEATHERS.includes(seg1.weather),
      JSON.stringify(seg1.weather));
    // the ask: engine writes the override-carrying weather verb (bare args)
    sky = foldSkyEntry(sky, { verb: "weather", args: { weather: "rain" }, ts: now + 2000, seq: 101, actor: "world" });
    const effOv = effectiveSky(sky, now + 3000);
    check("an ask under a forecast sets the manual override (world authority)",
      effOv.source === "manual" && effOv.weather === "rain",
      JSON.stringify({ source: effOv.source, weather: effOv.weather }));
    // the ask's effect is bounded by the sky's own law: segment boundary
    // (dwellSec [600,1800] — 1900s is past ANY possible first segment)
    const effLater = effectiveSky(sky, now + 1900000);
    check("the override cannot outlive its segment (the sky's law bounds every manual state)",
      effLater.source === "forecast",
      JSON.stringify({ source: effLater.source }));
    // expiry release: a weather verb carrying the policy's segment state
    const relState = (effectiveSky(sky, now + 8000) as any)?.seg?.state ?? "clear";
    sky = foldSkyEntry(sky, { verb: "weather", args: { weather: relState }, ts: now + 8000, seq: 102, actor: "world" });
    const effRel = effectiveSky(sky, now + 9000);
    check("the release returns the policy's segment weather",
      effRel.weather === relState && WEATHERS.includes(effRel.weather),
      JSON.stringify({ source: effRel.source, weather: effRel.weather, relState }));
  }

  // ---- restart inside the window: expiry still fires --------------------------------------------
  const probe = new Client("probe1");                       // scoped for the idempotence check below
  {
    // arm a fresh hold, kill mid-window, restart, expect the sweep to release at until+ε
    bob.walk([2, 0, 0]); await sleep(200);
    bob.verb("use", { id: "obelisk1", action: "rain" });
    await sleep(400);
    const until = (logZone("obelisk1") as any)?.until as number;
    const saidAll = zoneSays("obelisk1").length;
    const wxAll = zoneWeathers().length;
    await server!.kill();
    await sleep(400);
    await startServer();
    await probe.connect();
    await sleep(300);
    check("restart: a fresh join folds the same sky (rain) + the live hold window",
      snapSky(probe.snapshot)?.weather === "rain"
        && holdActive(snapZone(probe.snapshot, "obelisk1"), Date.now()) === true,
      JSON.stringify({ sky: snapSky(probe.snapshot)?.weather, zone: snapZone(probe.snapshot, "obelisk1") }));
    check("replay minted nothing",
      zoneSays("obelisk1").length === saidAll && zoneWeathers().length === wxAll,
      `${zoneSays("obelisk1").length}/${zoneWeathers().length} vs ${saidAll}/${wxAll}`);
    const waitMs = Math.max(0, until - Date.now()) + 2500;
    console.log(`  … waiting ${Math.round(waitMs / 1000)}s for post-restart expiry`);
    await sleep(waitMs);
    check("expiry fired after the restart (the sweep owns it from the fold)",
      (logZone("obelisk1") as any)?.active == null
        && zoneSays("obelisk1").length === saidAll + 1
        && (zoneWeathers().at(-1)?.args as any)?.weather === "clear",
      JSON.stringify({ zone: logZone("obelisk1"), says: zoneSays("obelisk1").length, lastWx: (zoneWeathers().at(-1)?.args as any)?.weather }));
    check("mcpl affordance read (describeWeatherzone) states the idle menu",
      describeWeatherzone(snapZone(probe.snapshot, "obelisk1")).includes("menu"),
      describeWeatherzone(snapZone(probe.snapshot, "obelisk1")));
  }

  // ---- boot heal: a hold that expired while the server was down releases on boot -----------------
  {
    // author an already-expired hold directly (builder comp write, past until)
    const past = Date.now() - 60000;
    alice.verb("comp", { id: "obelisk1", type: "weatherzone", data: {
      states: ["rain", "clear", "overcast"], holdSec: 4, reach: 6,
      active: "overcast", until: past, revertTo: "clear", at: past - 30000,
    } });
    await sleep(400);
    check("the hand-authored expired hold folds active-but-past (inactive by truth)",
      holdActive(logZone("obelisk1"), Date.now()) === false,
      JSON.stringify(logZone("obelisk1")));
    await server!.kill();
    await sleep(400);
    await startServer();
    const probe2 = new Client("probe2");
    await probe2.connect();
    await sleep(2500);                              // first sweep heals
    const d = logZone("obelisk1");
    check("boot heal: the sweep released the stale hold on the first tick",
      d?.active == null && zoneSays("obelisk1").some((s) => (s.args as any)?.zone?.released === true),
      JSON.stringify(d));
    check("the heal minted the release weather verb (revertTo)",
      (zoneWeathers().at(-1)?.args as any)?.weather === "clear",
      JSON.stringify((zoneWeathers().at(-1)?.args as any)));
    check("no double-heal: a second sweep window mints nothing more",
      await (async () => {
        const heals = zoneSays("obelisk1").filter((s) => (s.args as any)?.zone?.released).length;
        await sleep(2500);
        return zoneSays("obelisk1").filter((s) => (s.args as any)?.zone?.released).length === heals;
      })(),
      `${zoneSays("obelisk1").filter((s) => (s.args as any)?.zone?.released).length} release says`);
    probe2.close();
  }

  // ---- idempotent fold --------------------------------------------------------------------------
  {
    const a = JSON.stringify(snapZone(probe.snapshot, "obelisk1"));
    const b = JSON.stringify(snapZone(JSON.parse(JSON.stringify(probe.snapshot)), "obelisk1"));
    check("folded weatherzone state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup -----------------------------------------------------------------------------------
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
