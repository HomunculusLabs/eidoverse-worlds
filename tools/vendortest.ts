// Vendor matrix — `comp {type:"vendor"}` makes an entity a VENDING STAND:
// a use-action item grant with stock counts and a builder-gated restock.
// The live shelf (stock table) + a capped grant log are the fold; every
// buy/restock is one world-authored comp transition + say with vd
// provenance. Covers § VENDORS CONTRACT:
//
//   bun tools/vendortest.ts
//
// - unit:       normalizeVendor clamps/defaults; itemName sanitize;
//               stockOf absent=full; buyPlan/restockPlan math; grant-log
//               sanitize; describe; VENDOR action disjointness (buy/restock
//               vs the 14 prior families)
// - authoring:  spawn + vendor comp is builder-gated; visitor comp bounces
// - buy:        use {action:"buy"} in reach grants item 1, writes stock
//               table + sales log + say with vd{item,who,at} + cause/by
// - named:      use {action:"buy", item:"tea"} names its ware
// - stock-down: second buy reads stock-1; sales log grows
// - log-cap:    salesCap:N caps the grant log (oldest evicted)
// - empty:      buy on 0-stock skips fail-closed ("sold out")
// - visitor-restock-bounce: a visitor's restock skips naming the boundary
// - builder-restock: full restore to capacity; say + comp write
// - named-restock: restock {item, n} adds n to one ware
// - restock-noop: full shelf restock mints nothing
// - fold:       shelf folds from the log; late joiner reads the same
// - restart:    replay mints nothing; shelf + log survive folded
// - pass-through: non-vendor actions ("ring", "sign", "post") fall through
// - lint:       wares 12-entry cap; reach 99 clamps at read; engine write
//               verbatim
// - 8KB degrade: an oversized carry keeps the truth, drops the carry
// - spectator:  spectate legs cannot buy (shell gate, mint-nothing)
// - reach:      out-of-reach buy mints nothing (skip names distance)
// - describe:   describeVendor reads the shelf + buy action hint
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  VENDOR_ACTIONS, buyPlan, describeVendor, itemName,
  normalizeVendor, restockPlan, sanitizeVendorSales, stockOf,
} from "../shared/vendor.js";

const PORT = Number(process.env.PORT ?? 9006);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-vendor";
const WORLD = `vendortest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-vendor-"));

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
const vdSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.vd != null && (!id || (e.args as any)?.id === id));
const vdComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "vendor" && (!id || (e.args as any)?.id === id));
/** The folded vendor = the LAST vendor comp write in the log. */
const logVd = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "vendor"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapVd = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.vendor ?? null;

try {
  console.log(`\nvendor matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, notes, stock } = normalizeVendor({ wares: { bread: 3, tea: 2 }, reach: 99, salesCap: 999 } as any);
    check("unit: reach 99 clamps to 12 + note", cfg.reach === 12 && notes.some((n) => n.includes("reach")), JSON.stringify(notes));
    check("unit: salesCap 999 clamps to 128", cfg.salesCap === 128);
    check("unit: absent stock = FULL shelf (soundpost doctrine)", stockOf(cfg, stock, "bread") === 3, `${stockOf(cfg, stock, "bread")}`);
    check("unit: itemName trims/collapses/caps", itemName("  hot   soup ") === "hot soup" && itemName(42 as any) === "" && itemName("x".repeat(60)).length === 24);
    check("unit: buyPlan defaults to the headline ware",
      buyPlan(cfg, {}, undefined).item === "bread" && buyPlan(cfg, {}, undefined).next === 2);
    check("unit: buyPlan names its ware", buyPlan(cfg, {}, "tea").item === "tea" && buyPlan(cfg, {}, "tea").next === 1);
    check("unit: buyPlan on unknown item fails closed", buyPlan(cfg, {}, "pizza").ok === false);
    check("unit: buyPlan on zero stock = sold out", buyPlan(cfg, { bread: 0 }, undefined).ok === false);
    check("unit: restockPlan full restores every ware",
      JSON.stringify(restockPlan(cfg, { bread: 0, tea: 0 }, undefined, undefined).stock) === JSON.stringify({ bread: 3, tea: 2 }));
    check("unit: restockPlan named+n adds", restockPlan(cfg, { bread: 1 }, "bread", 2).stock?.bread === 3);
    check("unit: restockPlan named no-n fills to capacity", restockPlan(cfg, { bread: 0 }, "bread", undefined).stock?.bread === 3);
    check("unit: restockPlan unknown item fails closed", restockPlan(cfg, {}, "pizza", 1).ok === false);
    check("unit: grant log sanitize drops malformed rows", (() => {
      const s = sanitizeVendorSales([{ item: "tea", who: "bob", at: 1 }, { item: "", who: "bob" }, { who: "x" }, "junk"]);
      return s.length === 1 && s[0].item === "tea";
    })());
    const dflt = normalizeVendor({});
    check("unit: defaults reach 4 / salesCap 16 / empty wares", dflt.cfg.reach === 4 && dflt.cfg.salesCap === 16 && Object.keys(dflt.cfg.wares).length === 0);
    check("unit: describe names shelf + buy action", (() => {
      const s = describeVendor({ wares: { bread: 3 } });
      return s.startsWith("vendor:") && s.includes("bread ×3") && s.includes('action:"buy"');
    })());
    const PRIOR = ["open", "close", "toggle", "light", "snuff", "sign", "erase", "write", "enter", "travel", "step", "through", "hop", "teleport", "blink", "reserve", "hold", "release", "mute", "quiet", "unmute", "resume", "flow", "still", "advance", "tend", "beacon", "befriend", "tame", "heel", "stay", "come", "dismiss", "free", "play", "note", "ring", "post", "unpost"];
    check("unit: VENDOR action vocabulary buy/restock is DISJOINT from all 14 prior families",
      VENDOR_ACTIONS.has("buy") && VENDOR_ACTIONS.has("restock") && !PRIOR.includes("buy") && !PRIOR.includes("restock"));
  }

  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "stand1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "stand1", type: "vendor", data: {
    wares: { bread: 3, tea: 2 }, salesCap: 3, buyAt: "hands over the goods",
  } });
  await sleep(400);
  check("builder authored spawn + vendor comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  const carol = new Client("carol");
  await carol.connect();
  await sleep(200);
  alice.verb("grant", { id: "carol", role: "visitor" });
  await sleep(300);
  carol.verb("comp", { id: "stand1", type: "vendor", data: { wares: {} } });
  await sleep(300);
  check("visitor comp authoring bounces",
    carol.msgs.some((m) => m.type === "error"),
    "no error seen for visitor comp");
  check("no visitor-authored vendor comp in the log",
    !logLines().some((e) => e.verb === "comp" && (e.args as any)?.type === "vendor" && e.actor === "carol"));

  // ---- buy: visitor in reach, shelf full -------------------------------------
  bob.walk([3, 0, 0]);                                  // 3m — inside reach 4
  await sleep(300);
  bob.verb("use", { id: "stand1", action: "buy" });
  await sleep(400);
  const says1 = vdSays("stand1");
  check("rank-0 buy in reach grants the headline ware",
    says1.length === 1 && (says1[0]?.args as any)?.text === "hands over the goods",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  check("say carries vd{item,who,at} + cause/by provenance",
    (says1[0]?.args as any)?.vd?.item === "bread" && (says1[0]?.args as any)?.vd?.who === "bob"
      && typeof (says1[0]?.args as any)?.vd?.at === "number"
      && typeof (says1[0]?.args as any)?.cause === "number" && (says1[0]?.args as any)?.by === "bob",
    JSON.stringify(says1[0]?.args?.vd));
  const comps1 = vdComps("stand1");
  check("the buy wrote ONE world-authored comp transition", comps1.length === 1,
    `${comps1.length} vendor comp writes`);
  {
    const d = comps1[0]?.args as any;
    check("the write carries authored shape + stock/sales engine keys",
      d?.data?.wares?.bread === 3 && d?.data?.salesCap === 3
        && d?.data?.stock?.bread === 2 && d?.data?.stock?.tea === 2
        && Array.isArray(d?.data?.sales) && d?.data?.sales.length === 1 && d?.data?.sales[0]?.item === "bread",
      JSON.stringify(d?.data)?.slice(0, 240));
    check("the use verb logged with bob as actor (authority trace)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob"
        && (e.args as any)?.id === "stand1" && (e.args as any)?.action === "buy"));
  }
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.vd?.who === "bob"));

  // ---- named buy -------------------------------------------------------------
  bob.verb("use", { id: "stand1", action: "buy", item: "tea" });
  await sleep(400);
  {
    const d = logVd("stand1");
    check("named buy grants the named ware (tea ×1, log 2)",
      d?.stock?.tea === 1 && d?.stock?.bread === 2 && d?.sales?.length === 2 && d?.sales[0]?.item === "tea",
      JSON.stringify(d?.stock));
  }

  // ---- log cap: salesCap 3 caps the grant log --------------------------------
  bob.verb("use", { id: "stand1", action: "buy" });     // bread 2→1
  await sleep(400);
  bob.verb("use", { id: "stand1", action: "buy" });     // bread 1→0 — log at cap now 3
  await sleep(400);
  {
    const d = logVd("stand1");
    check("grant log holds AT cap 3 (4th grant evicted the oldest)",
      d?.stock?.bread === 0 && d?.sales?.length === 3 && d?.sales[2]?.item === "tea" && d?.sales[0]?.item === "bread",
      JSON.stringify(d?.sales));
  }

  // ---- empty: buy on 0-stock skips --------------------------------------------
  bob.verb("use", { id: "stand1", action: "buy" });
  await sleep(400);
  {
    const before = vdSays("stand1").length;
    check("buy on a sold-out ware mints nothing",
      vdSays("stand1").length === before && logVd("stand1")?.stock?.bread === 0,
      `${vdSays("stand1").length} vs ${before}`);
    bob.debug("vendor-skip");
    await sleep(300);
    const s = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the sold-out skip names the ware",
      JSON.stringify(s?.events ?? []).includes("sold out"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- visitor restock bounce --------------------------------------------------
  carol.walk([3, 0, 2]);
  await sleep(300);
  const stockBefore = JSON.stringify(logVd("stand1")?.stock);
  carol.verb("use", { id: "stand1", action: "restock" });
  await sleep(400);
  check("visitor restock skips (builder boundary)",
    JSON.stringify(logVd("stand1")?.stock) === stockBefore,
    `${stockBefore} -> ${JSON.stringify(logVd("stand1")?.stock)}`);
  carol.debug("vendor-skip");
  await sleep(300);
  {
    const s = carol.msgs.filter((m) => m.type === "debug").at(-1);
    check("the restock skip names the rights boundary",
      JSON.stringify(s?.events ?? []).includes("builder"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- builder restock: full restore -------------------------------------------
  alice.walk([0, 0, 2]);
  await sleep(300);
  alice.verb("use", { id: "stand1", action: "restock" });
  await sleep(400);
  {
    const d = logVd("stand1");
    check("builder restock restores every ware to capacity",
      d?.stock?.bread === 3 && d?.stock?.tea === 2,
      JSON.stringify(d?.stock));
    check("restock said its default line",
      (vdSays("stand1").at(-1)?.args as any)?.vd?.restock === "all",
      JSON.stringify((vdSays("stand1").at(-1)?.args as any)?.vd));
  }

  // ---- named restock -------------------------------------------------------------
  alice.verb("use", { id: "stand1", action: "restock", item: "tea", n: 1 });
  await sleep(400);
  check("named restock {item, n} clamps at capacity (no-op)",
    logVd("stand1")?.stock?.tea === 2,
    JSON.stringify(logVd("stand1")?.stock));

  // ---- restock no-op --------------------------------------------------------------
  {
    const before = vdSays("stand1").length;
    alice.verb("use", { id: "stand1", action: "restock" });
    await sleep(400);
    check("full-shelf restock mints nothing",
      vdSays("stand1").length === before,
      `${vdSays("stand1").length} vs ${before}`);
    alice.debug("vendor-skip");
    await sleep(300);
    const s = alice.msgs.filter((m) => m.type === "debug").at(-1);
    check("the no-op skip names the state",
      JSON.stringify(s?.events ?? []).includes("already full"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- fold: late joiner reads the same shelf --------------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapVd(late.snapshot, "stand1");
    check("late joiner folds stock + sales from the log",
      d?.stock?.bread === 3 && d?.stock?.tea === 2 && Array.isArray(d?.sales) && d?.sales.length === 3,
      JSON.stringify(d)?.slice(0, 200));
    late.close();
  }

  // ---- drain to empty via tea, then restock tea by name -----------------------------
  bob.verb("use", { id: "stand1", action: "buy", item: "tea" });
  await sleep(300);
  bob.verb("use", { id: "stand1", action: "buy", item: "tea" });
  await sleep(400);
  check("tea drains to 0",
    logVd("stand1")?.stock?.tea === 0,
    JSON.stringify(logVd("stand1")?.stock));
  alice.verb("use", { id: "stand1", action: "restock", item: "tea", n: 1 });
  await sleep(400);
  check("named restock adds exactly n",
    logVd("stand1")?.stock?.tea === 1,
    JSON.stringify(logVd("stand1")?.stock));

  // ---- pass-through -----------------------------------------------------------------
  {
    const compsB = vdComps("stand1").length;
    bob.verb("use", { id: "stand1", action: "ring" });
    await sleep(400);
    check("\"ring\" passes through untouched (logged, no comp writes)",
      vdComps("stand1").length === compsB
        && logLines().some((e) => e.verb === "use" && (e.args as any)?.id === "stand1" && (e.args as any)?.action === "ring"),
      `comps ${compsB} → ${vdComps("stand1").length}`);
    bob.verb("use", { id: "stand1", action: "post" });
    await sleep(400);
    check("board's \"post\" is not vendor vocabulary (no writes)",
      vdComps("stand1").length === compsB);
  }

  // ---- lint: clamps at read, engine write verbatim ---------------------------------
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [40, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "linty", type: "vendor", data: {
    wares: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`w${i}`, 5])),
    reach: 99,
  } });
  await sleep(300);
  bob.walk([41, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "linty", action: "buy" });
  await sleep(400);
  {
    const d = logVd("linty");
    check("engine write carries the authored shape VERBATIM + engine keys (regions doctrine)",
      d?.reach === 99 && Object.keys(d?.wares ?? {}).length === 12 && d?.stock?.w0 === 4,
      JSON.stringify(d)?.slice(0, 200));
    const n = normalizeVendor(d);
    check("a late reader CLAMPS the carry at read time (normalizeVendor)",
      n.cfg.reach === 12 && Object.keys(n.cfg.wares).length === 8 && n.notes.some((x) => x.includes("wares capped")));
    bob.debug("vendor-lint");
    await sleep(300);
    const l = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the clamps left vendor-lint notes",
      JSON.stringify(l?.events ?? []).includes("linty") && JSON.stringify(l?.events ?? []).includes("capped"),
      JSON.stringify(l?.events ?? []).slice(0, 200));
  }

  // ---- 8KB degrade -------------------------------------------------------------------
  alice.verb("spawn", { id: "fatty", lib: "deco/bench.glb", pos: [50, 0, 0], yaw: 0 });
  await sleep(300);
  const pad = "x".repeat(8100);
  alice.verb("comp", { id: "fatty", type: "vendor", data: { wares: { bread: 2 }, padding: pad } });
  await sleep(300);
  bob.walk([52, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "fatty", action: "buy" });
  await sleep(400);
  {
    const d = logVd("fatty");
    check("8KB degrade keeps the truth (carry dropped)",
      d?.stock?.bread === 1 && d?.padding === undefined,
      JSON.stringify(d)?.slice(0, 160));
  }

  // ---- reach: out-of-reach buy mints nothing (pre-restart: bob's socket) ------------
  {
    const before = vdSays().length;
    bob.walk([100, 0, 0]);                              // far from stand1 at [0,0,0]
    await sleep(300);
    bob.verb("use", { id: "stand1", action: "buy" });
    await sleep(400);
    check("out-of-reach buy mints nothing",
      vdSays().length === before,
      `${vdSays().length} vs ${before}`);
    bob.debug("vendor-skip");
    await sleep(300);
    const s = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("out-of-reach skip names the distance",
      JSON.stringify(s?.events ?? []).includes("out of reach"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- spectator (pre-restart: watcher's socket) --------------------------------------
  {
    const spec = new Client("watcher1");
    await spec.connect(true);
    await sleep(300);
    const before = vdSays().length;
    spec.verb("use", { id: "stand1", action: "buy" });
    await sleep(400);
    check("spectator use mints nothing (shell gate)",
      vdSays().length === before,
      `${vdSays().length} vs ${before}`);
    spec.close();
  }

  // ---- restart: replay mints nothing; shelf + log survive folded ---------------------
  const saidAll = vdSays().length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  {
    const d1 = snapVd(probe.snapshot, "stand1");
    check("restart: a fresh join folds the same shelf + grant log",
      d1?.stock?.bread === 3 && d1?.stock?.tea === 1 && d1?.sales?.length === 3,
      JSON.stringify(d1)?.slice(0, 200));
    const d2 = snapVd(probe.snapshot, "fatty");
    check("restart: fatty folds its degraded-but-true shelf",
      d2?.stock?.bread === 1 && d2?.wares === undefined,
      JSON.stringify(d2)?.slice(0, 120));
  }
  check("replay minted nothing",
    vdSays().length === saidAll,
    `${vdSays().length} vs ${saidAll}`);
  check("mcpl affordance read (describeVendor)",
    describeVendor(snapVd(probe.snapshot, "stand1")).startsWith("vendor:"),
    describeVendor(snapVd(probe.snapshot, "stand1")).slice(0, 80));
  check("describe on a live stand names the buy action",
    describeVendor(snapVd(probe.snapshot, "stand1")).includes('action:"buy"'),
    describeVendor(snapVd(probe.snapshot, "stand1")));

  // ---- spectator ----------------------------------------------------------------------

  // ---- idempotent fold -------------------------------------------------------------------
  {
    const a = JSON.stringify(snapVd(probe.snapshot, "stand1"));
    const b = JSON.stringify(snapVd(JSON.parse(JSON.stringify(probe.snapshot)), "stand1"));
    check("folded vendor state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup ----------------------------------------------------------------------------
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
