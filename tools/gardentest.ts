// Garden matrix — `comp {type:"garden"}` makes an entity a PLANTABLE
// PLOT: a tile grid with per-tile crop state, time-derived ripeness
// (the growth family's own stageAt, per tile), a harvest interaction,
// and a capped season log. Every plant/harvest/weed is ONE
// world-authored comp transition + say with gd provenance. Covers
// § GARDENS CONTRACT:
//
//   bun tools/gardentest.ts
//
// - unit:       normalizeGarden clamps/defaults; cropName sanitize;
//               harvest-log sanitize; tileCenter math; nearestTile
//               derivation; tileArg fail-closed; describe; GARDEN
//               action disjointness; unknown keys ride; malformed
//               tiles drop
// - authoring:  spawn + garden comp is builder-gated; visitor comp bounces
// - plant:      use {action:"plant"} in reach plants the NEAREST EMPTY
//               tile to the user's pose; writes tiles + say with
//               gd{tile, crop, who, at} + cause/by
// - named-crop: use {action:"plant", crop, tile} names crop + tile
// - off-menu:   plant of an unknown crop skips fail-closed
// - off-grid:   explicit tile off the grid skips fail-closed
// - occupied:   plant on an occupied tile skips
// - ripeness:   time derivation advances the tile to crown (no tween)
// - harvest:    use {action:"harvest"} on the NEAREST RIPE tile; tile
//               cleared, season log grows; say with gd{harvest:…}
// - unripe:     harvest with nothing ripe skips (mint-nothing)
// - log cap:    logCap caps the season log (oldest evicted)
// - weed:       builder weeds one tile / the whole bed; log preserved
// - visitor-weed-bounce: a visitor's weed skips naming the boundary
// - no-ops:     weed on an empty bed / plant on a full bed mint nothing
// - fold:       bed folds from the log; late joiner reads the same
// - restart:    replay mints nothing; bed + log survive folded; a tile
//               planted pre-restart derives FURTHER GROWN post-restart
// - pass-through: non-garden actions ("ring", "buy", "sign") fall through
// - lint:       cols 12 clamps at read; engine write verbatim
// - 8KB degrade: an oversized carry keeps the truth, drops the carry
// - spectator:  spectate legs cannot plant (shell gate, mint-nothing)
// - reach:      out-of-reach plant mints nothing (skip names distance)
// - describe:   describeGarden reads the bed + plant action hint
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  GARDEN_ACTIONS, describeGarden, nearestTile, normalizeGarden,
  sanitizeGardenHarvests, stageIndexOf, tileArg, tileCenter, tileRipe,
  worldToLocal,
} from "../shared/garden.js";

const PORT = Number(process.env.PORT ?? 9010);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-garden";
const WORLD = `gardentest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-garden-"));

// fast live crops: radish crowns 1.2s→31.2s, pumpkin 0.5s→30.5s (long
// crown windows so the matrix never races a wilt)
const RADISH = [{ name: "sprout", dwell: 1.2 }, { name: "plump", dwell: 30 }];
const PUMPKIN = [{ name: "vine", dwell: 0.5 }, { name: "orb", dwell: 30 }];

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
const gdSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.gd != null && (!id || (e.args as any)?.id === id));
const gdComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "garden" && (!id || (e.args as any)?.id === id));
/** The folded garden = the LAST garden comp write in the log. */
const logGd = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "garden"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapGd = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.garden ?? null;
const lastDebug = (c: Client) => c.msgs.filter((m) => m.type === "debug").at(-1);

try {
  console.log(`\ngarden matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, notes } = normalizeGarden({ cols: 12, rows: 0, pitch: 9, crops: { radish: RADISH } });
    check("unit: cols 12 / rows 0 / pitch 9 clamp to 8/1/4 with notes",
      cfg.cols === 8 && cfg.rows === 1 && cfg.pitch === 4
        && notes.some((n) => n.includes("cols")) && notes.some((n) => n.includes("rows")) && notes.some((n) => n.includes("pitch")),
      JSON.stringify(notes));
    check("unit: ladder carries crop stages", cfg.crops.radish?.length === 2 && cfg.crops.radish[0].dwell === 1.2);
    const dflt = normalizeGarden({});
    check("unit: bare defaults 3×3, pitch 1.2, logCap 12, reach 4, no crops",
      dflt.cfg.cols === 3 && dflt.cfg.rows === 3 && dflt.cfg.pitch === 1.2
        && dflt.cfg.logCap === 12 && dflt.cfg.reach === 4 && Object.keys(dflt.cfg.crops).length === 0);
    check("unit: harvest-log sanitize drops malformed rows", (() => {
      const s = sanitizeGardenHarvests([{ tile: 0, crop: "radish", who: "bob", at: 1 }, { crop: "", who: "bob" }, { who: "x" }, "junk", { tile: -1, crop: "radish", who: "bob" }]);
      return s.length === 1 && s[0].tile === 0;
    })());
    check("unit: tileCenter centers the grid (3×3 pitch 1.2)",
      JSON.stringify(tileCenter(dflt.cfg, 0)) === JSON.stringify([-1.2, -1.2])
        && JSON.stringify(tileCenter(dflt.cfg, 4)) === JSON.stringify([0, 0])
        && JSON.stringify(tileCenter(dflt.cfg, 8)) === JSON.stringify([1.2, 1.2]));
    check("unit: stageIndexOf derives crown in the window, wilt past it",
      stageIndexOf(RADISH, 0, 500) === 0 && stageIndexOf(RADISH, 0, 2000) === 1 && stageIndexOf(RADISH, 0, 40000) === 2);
    check("unit: tileRipe at crown only (not sprout, not wilt)",
      tileRipe(RADISH, 0, 2000) === true && tileRipe(RADISH, 0, 500) === false && tileRipe(RADISH, 0, 40000) === false);
    check("unit: tileArg integer-on-grid else null",
      tileArg(4, dflt.cfg) === 4 && tileArg(9, dflt.cfg) === null && tileArg(2.5 as any, dflt.cfg) === null);
    check("unit: nearestTile picks nearest qualifying tile (ties → lower index)",
      nearestTile(dflt.cfg, { 4: { c: "r", at: 0 } }, [0, 0], (t: unknown) => t == null, 0)?.i === 1
        && nearestTile(dflt.cfg, {}, [0.9, 0.9], (t: unknown) => t == null, 0)?.i === 8);
    check("unit: worldToLocal inverts at yaw π/2",
      (() => { const l = worldToLocal([2, 0, -1], [0, 0, 0], Math.PI / 2); return Math.abs(l[0] - 1) < 1e-9 && Math.abs(l[1] - 2) < 1e-9; })());
    check("unit: describe on a cropless bed names the builder path",
      (() => { const s = describeGarden({ cols: 2, rows: 2 }); return s.startsWith("garden:") && s.includes("no crops authored"); })());
    check("unit: describe on a live bed names counts + season + actions",
      (() => {
        const s = describeGarden({ cols: 2, rows: 2, crops: { radish: RADISH }, tiles: { "0": { c: "radish", at: Date.now() - 2000, by: "bob" } }, harvests: [{ tile: 0, crop: "radish", who: "carol", at: 1 }] });
        return s.includes("1 planted (1 ripe)") && s.includes("1 harvested") && s.includes('action:"plant"') && s.includes('action:"weed"');
      })());
    const PRIOR_ACTIONS = ["open", "close", "toggle", "light", "snuff", "sign", "erase", "write", "enter", "travel", "step", "through", "hop", "teleport", "blink", "reserve", "hold", "release", "mute", "quiet", "unmute", "resume", "flow", "still", "advance", "tend", "beacon", "befriend", "tame", "heel", "stay", "come", "dismiss", "free", "play", "note", "ring", "post", "unpost", "buy", "restock", "dedicate", "retract", "begin", "halt"];
    check("unit: GARDEN actions plant/harvest/weed DISJOINT from all 18 prior families",
      GARDEN_ACTIONS.has("plant") && GARDEN_ACTIONS.has("harvest") && GARDEN_ACTIONS.has("weed")
        && !PRIOR_ACTIONS.includes("plant") && !PRIOR_ACTIONS.includes("harvest") && !PRIOR_ACTIONS.includes("weed"));
    check("unit: normalize carries unknown keys verbatim (bag is public)",
      (() => { const { cfg } = normalizeGarden({ cols: 2, rows: 2, custom: "rides" }); return (cfg.authored as any).custom === "rides"; })());
    check("unit: off-grid / off-menu / anchorless tiles drop with notes",
      (() => {
        const { tiles, notes } = normalizeGarden({ cols: 2, rows: 2, crops: { r: RADISH }, tiles: { "7": { c: "r", at: 1 }, "0": { c: "pizza", at: 1 }, "1": { c: "r" } } });
        return Object.keys(tiles).length === 0 && notes.some((n) => n.includes("off the 2×2")) && notes.some((n) => n.includes("off-menu")) && notes.some((n) => n.includes("no plant time"));
      })());
  }

  await startServer();

  // ---- authoring ---------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "bed1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "bed1", type: "garden", data: {
    cols: 3, rows: 3, pitch: 1.2, crops: { radish: RADISH, pumpkin: PUMPKIN },
    logCap: 3, plantAt: "puts a seed in the earth",
  } });
  await sleep(400);
  check("builder authored spawn + garden comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  bob.walk([0, 0, 0.4]);                                // local pose ≈ [0, 0.4]
  await sleep(300);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  const carol = new Client("carol");
  await carol.connect();
  await sleep(200);
  alice.verb("grant", { id: "carol", role: "visitor" });
  await sleep(300);
  carol.verb("comp", { id: "bed1", type: "garden", data: { cols: 2 } });
  await sleep(300);
  check("visitor comp authoring bounces",
    carol.msgs.some((m) => m.type === "error"),
    "no error seen for visitor comp");
  check("no visitor-authored garden comp in the log",
    !logLines().some((e) => e.verb === "comp" && (e.args as any)?.type === "garden" && e.actor === "carol"));

  // ---- plant: visitor near the bed center, nearest EMPTY tile -------------------
  bob.verb("use", { id: "bed1", action: "plant" });     // nearest empty from [0,0.4] = tile 4
  await sleep(400);
  const says1 = gdSays("bed1");
  check("rank-0 plant in reach plants the nearest EMPTY tile (default crop)",
    says1.length === 1 && (says1[0]?.args as any)?.text === "puts a seed in the earth",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  check("say carries gd{tile, crop, who, at} + cause/by provenance",
    (says1[0]?.args as any)?.gd?.tile === 4 && (says1[0]?.args as any)?.gd?.crop === "radish"
      && (says1[0]?.args as any)?.gd?.who === "bob"
      && typeof (says1[0]?.args as any)?.gd?.at === "number"
      && typeof (says1[0]?.args as any)?.cause === "number" && (says1[0]?.args as any)?.by === "bob",
    JSON.stringify(says1[0]?.args?.gd));
  const comps1 = gdComps("bed1");
  check("the plant wrote ONE world-authored comp transition", comps1.length === 1,
    `${comps1.length} garden comp writes`);
  {
    const d = comps1[0]?.args as any;
    check("the write carries authored shape + tiles/harvests engine keys",
      d?.data?.cols === 3 && d?.data?.crops?.radish?.length === 2 && d?.data?.logCap === 3
        && d?.data?.tiles?.["4"]?.c === "radish" && typeof d?.data?.tiles?.["4"]?.at === "number"
        && d?.data?.tiles?.["4"]?.by === "bob"
        && Array.isArray(d?.data?.harvests) && d?.data?.harvests.length === 0,
      JSON.stringify(d?.data)?.slice(0, 240));
    check("the use verb logged with bob as actor (authority trace)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob"
        && (e.args as any)?.id === "bed1" && (e.args as any)?.action === "plant"));
  }
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.gd?.who === "bob"));

  // ---- named crop + explicit tile --------------------------------------------------
  bob.verb("use", { id: "bed1", action: "plant", crop: "pumpkin", tile: 0 });
  await sleep(400);
  {
    const d = logGd("bed1");
    check("named crop + explicit tile plants tile 0 pumpkin",
      d?.tiles?.["0"]?.c === "pumpkin" && d?.tiles?.["4"]?.c === "radish",
      JSON.stringify(d?.tiles));
  }

  // ---- off-menu crop skips ---------------------------------------------------------
  {
    const before = gdSays().length;
    bob.verb("use", { id: "bed1", action: "plant", crop: "pizza" });
    await sleep(400);
    check("off-menu crop plant skips (mint-nothing)",
      gdSays().length === before,
      `${gdSays().length} vs ${before}`);
    bob.debug("garden-skip");
    await sleep(300);
    const s = lastDebug(bob);
    check("the off-menu skip names the crop",
      JSON.stringify(s?.events ?? []).includes("pizza"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- off-grid explicit tile skips --------------------------------------------------
  {
    const before = gdSays().length;
    bob.verb("use", { id: "bed1", action: "plant", tile: 9 });
    await sleep(400);
    check("off-grid explicit tile skips (mint-nothing)",
      gdSays().length === before,
      `${gdSays().length} vs ${before}`);
    bob.debug("garden-skip");
    await sleep(300);
    const s = lastDebug(bob);
    check("the off-grid skip names the tile",
      JSON.stringify(s?.events ?? []).includes("9"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- occupied explicit tile skips ----------------------------------------------------
  {
    const before = JSON.stringify(logGd("bed1")?.tiles);
    bob.verb("use", { id: "bed1", action: "plant", tile: 4 });
    await sleep(400);
    check("plant on an occupied tile skips (mint-nothing)",
      JSON.stringify(logGd("bed1")?.tiles) === before,
      `${before} -> ${JSON.stringify(logGd("bed1")?.tiles)}`);
    bob.debug("garden-skip");
    await sleep(300);
    const s = lastDebug(bob);
    check("the occupied skip names the state",
      JSON.stringify(s?.events ?? []).includes("already planted"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- ripeness: time advances the tiles to crown ---------------------------------------
  await sleep(1400);                                    // radish crowns at 1.2s, pumpkin at 0.5s
  {
    const d = logGd("bed1");
    const now = Date.now();
    check("planted tiles derive RIPE after their dwell (time, not tween)",
      tileRipe(RADISH, d?.tiles?.["4"]?.at, now) && tileRipe(PUMPKIN, d?.tiles?.["0"]?.at, now),
      JSON.stringify(d?.tiles));
  }

  // ---- harvest: nearest RIPE tile ---------------------------------------------------------
  bob.verb("use", { id: "bed1", action: "harvest" });   // nearest ripe from [0,0.4] = tile 4
  await sleep(400);
  {
    const h = gdSays("bed1").filter((s) => (s.args as any)?.gd?.harvest != null);
    check("rank-0 harvest on the nearest RIPE tile clears it + logs the season",
      h.length === 1 && (h[0]?.args as any)?.gd?.harvest?.crop === "radish",
      JSON.stringify(h.map((s) => (s.args as any)?.gd)));
    check("harvest say carries harvest{tile, crop, who, at} + cause/by",
      (h[0]?.args as any)?.gd?.harvest?.tile === 4 && (h[0]?.args as any)?.gd?.harvest?.who === "bob"
        && typeof (h[0]?.args as any)?.gd?.harvest?.at === "number"
        && typeof (h[0]?.args as any)?.cause === "number" && (h[0]?.args as any)?.by === "bob",
      JSON.stringify(h[0]?.args?.gd));
    const d = logGd("bed1");
    check("the harvest wrote ONE comp: tile 4 gone, season log 1",
      d?.tiles?.["4"] === undefined && d?.tiles?.["0"]?.c === "pumpkin"
        && d?.harvests?.length === 1 && d?.harvests[0]?.crop === "radish" && d?.harvests[0]?.tile === 4,
      JSON.stringify(d?.harvests));
  }

  // ---- harvest log cap: logCap 3 ------------------------------------------------------------
  bob.verb("use", { id: "bed1", action: "plant", crop: "radish", tile: 7 });
  await sleep(80);
  bob.verb("use", { id: "bed1", action: "plant", crop: "radish", tile: 5 });
  await sleep(80);
  bob.verb("use", { id: "bed1", action: "plant", crop: "radish", tile: 6 });
  await sleep(1400);                                    // all three crown
  bob.verb("use", { id: "bed1", action: "harvest" });   // nearest from [0,0.4]: 7 (0.8m), then 5 (1.26m), then 6 (1.47m)
  await sleep(300);
  bob.verb("use", { id: "bed1", action: "harvest" });
  await sleep(300);
  bob.verb("use", { id: "bed1", action: "harvest" });
  await sleep(400);
  {
    const d = logGd("bed1");
    check("three nearest-ripe harvests cleared 7, 5, 6 in distance order",
      d?.tiles?.["7"] === undefined && d?.tiles?.["5"] === undefined && d?.tiles?.["6"] === undefined
        && d?.harvests?.length === 3,
      JSON.stringify(d?.harvests));
  }
  bob.verb("use", { id: "bed1", action: "plant", crop: "radish", tile: 4 });
  await sleep(1400);
  bob.verb("use", { id: "bed1", action: "harvest" });   // 4th harvest: log at cap
  await sleep(400);
  {
    const d = logGd("bed1");
    check("season log holds AT cap 3 (4th harvest evicted the oldest)",
      d?.harvests?.length === 3 && d?.harvests[0]?.tile === 4 && !d?.harvests?.some((r: any) => r.tile === 7),
      JSON.stringify(d?.harvests));
  }

  // ---- weed: the gardener's act (builder) -----------------------------------------------------
  bob.verb("use", { id: "bed1", action: "plant", crop: "pumpkin", tile: 2 });
  await sleep(400);
  alice.walk([0, 0, 0]);
  await sleep(300);
  {
    const before = Object.keys(logGd("bed1")?.tiles ?? {}).length;
    alice.verb("use", { id: "bed1", action: "weed" });
    await sleep(400);
    const d = logGd("bed1");
    check("builder weed (bare) empties the bed, keeps the season log",
      Object.keys(d?.tiles ?? {}).length === 0 && before >= 1 && (d?.harvests?.length ?? 0) === 3,
      `tiles ${before} → ${Object.keys(d?.tiles ?? {}).length}, log ${d?.harvests?.length}`);
    const w = gdSays("bed1").filter((s) => (s.args as any)?.gd?.weed != null);
    check("weed say carries weed{cleared, who, at} + cause/by",
      w.length === 1 && (w[0]?.args as any)?.gd?.weed?.cleared === before
        && (w[0]?.args as any)?.gd?.weed?.who === "alice" && (w[0]?.args as any)?.by === "alice",
      JSON.stringify(w.map((s) => (s.args as any)?.gd)));
  }

  // ---- one-tile weed ----------------------------------------------------------------------------
  bob.verb("use", { id: "bed1", action: "plant", crop: "radish", tile: 1 });
  await sleep(80);
  bob.verb("use", { id: "bed1", action: "plant", crop: "radish", tile: 3 });
  await sleep(400);
  alice.verb("use", { id: "bed1", action: "weed", tile: 1 });
  await sleep(400);
  {
    const d = logGd("bed1");
    check("named weed clears exactly that tile",
      d?.tiles?.["1"] === undefined && d?.tiles?.["3"]?.c === "radish",
      JSON.stringify(d?.tiles));
  }

  // ---- visitor weed bounce -------------------------------------------------------------------------
  carol.walk([0, 0, 0.4]);
  await sleep(300);
  {
    const before = JSON.stringify(logGd("bed1")?.tiles);
    carol.verb("use", { id: "bed1", action: "weed" });
    await sleep(400);
    check("visitor weed skips (builder boundary)",
      JSON.stringify(logGd("bed1")?.tiles) === before,
      `${before} -> ${JSON.stringify(logGd("bed1")?.tiles)}`);
    carol.debug("garden-skip");
    await sleep(300);
    const s = lastDebug(carol);
    check("the weed skip names the rights boundary",
      JSON.stringify(s?.events ?? []).includes("builder"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- no-ops ----------------------------------------------------------------------------------------
  {
    const weedsBefore = gdSays().filter((s) => (s.args as any)?.gd?.weed != null).length;
    alice.verb("use", { id: "bed1", action: "weed" });  // bed has tile 3 — clears it (a mint)
    await sleep(400);
    alice.verb("use", { id: "bed1", action: "weed" });  // now empty — no-op
    await sleep(400);
    check("weed on an empty bed mints nothing",
      gdSays().filter((s) => (s.args as any)?.gd?.weed != null).length === weedsBefore + 1,
      `${gdSays().filter((s) => (s.args as any)?.gd?.weed != null).length} vs ${weedsBefore + 1}`);
    alice.debug("garden-skip");
    await sleep(300);
    const s = lastDebug(alice);
    check("the empty-weed skip names the state",
      JSON.stringify(s?.events ?? []).includes("empty"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- full bed -----------------------------------------------------------------------------------------
  {
    for (let i = 0; i < 9; i++) {
      bob.verb("use", { id: "bed1", action: "plant", crop: "radish", tile: i });
      await sleep(70);
    }
    await sleep(500);
    const saysBefore = gdSays().length;
    bob.verb("use", { id: "bed1", action: "plant" });
    await sleep(400);
    check("plant on a FULL bed mints nothing",
      gdSays().length === saysBefore,
      `${gdSays().length} vs ${saysBefore}`);
    bob.debug("garden-skip");
    await sleep(300);
    const s = lastDebug(bob);
    check("the full-bed skip names the state",
      JSON.stringify(s?.events ?? []).includes("full"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
    check("nine tiles standing after the fill",
      Object.keys(logGd("bed1")?.tiles ?? {}).length === 9,
      JSON.stringify(Object.keys(logGd("bed1")?.tiles ?? {})));
  }

  // ---- unripe harvest ----------------------------------------------------------------------------------------
  {
    alice.verb("use", { id: "bed1", action: "weed" });  // builder clears (9 tiles)
    await sleep(400);
    bob.verb("use", { id: "bed1", action: "plant", crop: "radish", tile: 3 });
    await sleep(350);                                  // radish crowns at 1.2s — still sprout
    const before = gdSays().length;
    const at3 = logGd("bed1")?.tiles?.["3"]?.at;
    check("the fresh tile is genuinely unripe (stage 0)",
      stageIndexOf(RADISH, at3, Date.now()) === 0,
      `at=${at3}`);
    bob.verb("use", { id: "bed1", action: "harvest" });
    await sleep(400);
    check("harvest with nothing ripe mints nothing",
      gdSays().length === before,
      `${gdSays().length} vs ${before}`);
    bob.debug("garden-skip");
    await sleep(300);
    const s = lastDebug(bob);
    check("the unripe skip names the state",
      JSON.stringify(s?.events ?? []).includes("ripe"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- fold: late joiner reads the same bed ---------------------------------------------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapGd(late.snapshot, "bed1");
    check("late joiner folds tiles + season log from the log",
      d?.tiles?.["3"]?.c === "radish" && Array.isArray(d?.harvests) && d?.harvests?.length === 3,
      JSON.stringify(d)?.slice(0, 200));
    late.close();
  }

  // ---- pass-through -----------------------------------------------------------------------------------------------
  {
    const compsB = gdComps("bed1").length;
    bob.verb("use", { id: "bed1", action: "ring" });
    await sleep(400);
    check("\"ring\" passes through untouched (logged, no comp writes)",
      gdComps("bed1").length === compsB
        && logLines().some((e) => e.verb === "use" && (e.args as any)?.id === "bed1" && (e.args as any)?.action === "ring"),
      `comps ${compsB} → ${gdComps("bed1").length}`);
    bob.verb("use", { id: "bed1", action: "buy" });
    await sleep(400);
    check("vendor's \"buy\" is not garden vocabulary (no writes)",
      gdComps("bed1").length === compsB);
  }

  // ---- lint: clamps at read, engine write verbatim ------------------------------------------------------------------
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [40, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "linty", type: "garden", data: { cols: 12, rows: 12, pitch: 9, crops: { r: RADISH } } });
  await sleep(300);
  bob.walk([41, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "linty", action: "plant" });
  await sleep(400);
  {
    const d = logGd("linty");
    check("engine write carries the authored shape VERBATIM + engine keys (regions doctrine)",
      d?.cols === 12 && d?.rows === 12 && d?.pitch === 9 && Object.keys(d?.crops ?? {}).length === 1
        && d?.tiles && Object.keys(d.tiles).length === 1,
      JSON.stringify(d)?.slice(0, 200));
    const n = normalizeGarden(d);
    check("a late reader CLAMPS the carry at read time (normalizeGarden)",
      n.cfg.cols === 8 && n.cfg.rows === 8 && n.cfg.pitch === 4 && n.notes.some((x) => x.includes("cols")),
      JSON.stringify(n.notes));
    bob.debug("garden-lint");
    await sleep(300);
    const l = lastDebug(bob);
    check("the clamps left garden-lint notes",
      JSON.stringify(l?.events ?? []).includes("linty") && JSON.stringify(l?.events ?? []).includes("clamped"),
      JSON.stringify(l?.events ?? []).slice(0, 200));
  }

  // ---- 8KB degrade -----------------------------------------------------------------------------------------------------
  alice.verb("spawn", { id: "fatty", lib: "deco/bench.glb", pos: [50, 0, 0], yaw: 0 });
  await sleep(300);
  const pad = "x".repeat(8100);
  alice.verb("comp", { id: "fatty", type: "garden", data: { crops: { r: RADISH }, padding: pad } });
  await sleep(300);
  bob.walk([52, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "fatty", action: "plant" });
  await sleep(400);
  {
    const d = logGd("fatty");
    check("8KB degrade keeps the truth (carry dropped)",
      d?.tiles && Object.keys(d.tiles).length === 1 && d?.padding === undefined,
      JSON.stringify(d)?.slice(0, 160));
  }

  // ---- reach: out-of-reach plant mints nothing (pre-restart: bob's socket) -----------------------------------------------
  {
    const before = gdSays().length;
    bob.walk([100, 0, 0]);                              // far from bed1 at [0,0,0]
    await sleep(300);
    bob.verb("use", { id: "bed1", action: "plant" });
    await sleep(400);
    check("out-of-reach plant mints nothing",
      gdSays().length === before,
      `says ${gdSays().length} vs ${before}`);
    bob.debug("garden-skip");
    await sleep(300);
    const s = lastDebug(bob);
    check("out-of-reach skip names the distance",
      JSON.stringify(s?.events ?? []).includes("out of reach"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- spectator (pre-restart: watcher's socket) ---------------------------------------------------------------------------
  {
    const spec = new Client("watcher1");
    await spec.connect(true);
    await sleep(300);
    const before = gdSays().length;
    spec.verb("use", { id: "bed1", action: "plant" });
    await sleep(400);
    check("spectator use mints nothing (shell gate)",
      gdSays().length === before,
      `${gdSays().length} vs ${before}`);
    spec.close();
  }

  // ---- restart: replay mints nothing; bed + log survive folded; TIME kept growing --------------------------------------------
  const saidAll = gdSays().length;
  const preAt = logGd("bed1")?.tiles?.["3"]?.at;
  const preStage = stageIndexOf(RADISH, preAt, Date.now());
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  {
    const d1 = snapGd(probe.snapshot, "bed1");
    check("restart: a fresh join folds the same bed + season log",
      d1?.tiles?.["3"]?.c === "radish" && d1?.harvests?.length === 3,
      JSON.stringify(d1)?.slice(0, 200));
    check("restart: the pre-restart anchor is UNCHANGED (no re-plant)",
      d1?.tiles?.["3"]?.at === preAt,
      `${preAt} -> ${d1?.tiles?.["3"]?.at}`);
    const postStage = stageIndexOf(RADISH, d1?.tiles?.["3"]?.at, Date.now());
    check("restart: the tile derives FURTHER GROWN post-restart (time held the truth)",
      postStage >= preStage && postStage === 1,
      `pre=${preStage} post=${postStage}`);
  }
  check("replay minted nothing",
    gdSays().length === saidAll,
    `${gdSays().length} vs ${saidAll}`);
  check("mcpl affordance read (describeGarden)",
    describeGarden(snapGd(probe.snapshot, "bed1")).startsWith("garden:"),
    describeGarden(snapGd(probe.snapshot, "bed1")).slice(0, 80));
  check("describe on a live bed names the plant action",
    describeGarden(snapGd(probe.snapshot, "bed1")).includes('action:"plant"'),
    describeGarden(snapGd(probe.snapshot, "bed1")));

  // ---- idempotent fold ---------------------------------------------------------------------------------------------------------
  {
    const a = JSON.stringify(snapGd(probe.snapshot, "bed1"));
    const b = JSON.stringify(snapGd(JSON.parse(JSON.stringify(probe.snapshot)), "bed1"));
    check("folded garden state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup -------------------------------------------------------------------------------------------------------------------
  bob.close(); carol.close(); probe.close();
  try { alice.close(); } catch { /* already gone */ }
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
