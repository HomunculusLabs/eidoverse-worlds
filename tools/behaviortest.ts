// Runtime-scripting test matrix. Point it at a SCRATCH sequencer:
//
//   WORLDS_DIR=$(mktemp -d) JOIN_TOKEN=test-door PORT=8994 BHV_TIMER_MIN=1 \
//     bun run server/server.ts &
//   WORLD_URL=ws://localhost:8994/ws JOIN_TOKEN=test-door bun run tools/behaviortest.ts
//
// The whole script lifecycle over real websockets + HTTP: upload → bind →
// event dispatch → emits (gated) → kv persistence via bstate fold → timers →
// the author's log ring → budgets (an infinite loop is interrupted, a
// failing script pauses) → capability mask → unbind. BHV_TIMER_MIN=1 keeps
// the timer check fast; production floor is 5s.

const URL = process.env.WORLD_URL ?? "ws://localhost:8994/ws";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const HTTP = URL.replace(/^ws/, "http").replace(/\/ws$/, "");

let passed = 0, failed = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}

type Sock = {
  ws: WebSocket; msgs: any[]; errors: string[];
  next(pred: (m: any) => boolean, ms?: number): Promise<any>;
  verb(verb: string, args: any): void;
  req(msg: Record<string, unknown>, reqId: string): Promise<any>;
  settle(ms?: number): Promise<void>;
  close(): void;
};
function open(joinMsg: Record<string, unknown>): Promise<Sock> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Sock = {
      ws, msgs: [], errors: [],
      next(want, ms = 5000) {
        return new Promise((res, rej) => {
          const hit = s.msgs.find(want);
          if (hit) return res(hit);
          const t0 = Date.now();
          const iv = setInterval(() => {
            const m = s.msgs.find(want);
            if (m) { clearInterval(iv); res(m); }
            else if (Date.now() - t0 > ms) { clearInterval(iv); rej(new Error(`no match in ${ms}ms`)); }
          }, 20);
        });
      },
      verb(verb, args) { ws.send(JSON.stringify({ type: "verb", verb, args })); },
      req(msg, reqId) { ws.send(JSON.stringify({ ...msg, reqId })); return s.next((m) => m.reqId === reqId); },
      settle(ms = 300) { return new Promise((r) => setTimeout(r, ms)); },
      close() { try { ws.close(); } catch { /* fine */ } },
    };
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", token: TOKEN, ...joinMsg }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      s.msgs.push(m);
      if (m.type === "error") s.errors.push(m.error);
    };
    ws.onerror = (e) => reject(e);
    s.next((m) => m.type === "snapshot").then(() => resolve(s), reject);
  });
}
async function uploadScript(src: string): Promise<string> {
  const r = await fetch(`${HTTP}/upload?as=script&token=${TOKEN}&by=behaviortest`, { method: "POST", body: src });
  if (!r.ok) throw new Error(`upload ${r.status}: ${await r.text()}`);
  return (await r.json()).path;
}
const sayFrom = (m: any, actor: string) =>
  m.type === "log" && m.entry?.verb === "say" && m.entry.actor === actor ? m.entry : null;

const WORLD = `bhvtest-${Math.random().toString(36).slice(2, 8)}`;
console.log(`\nruntime scripting matrix — world "${WORLD}"\n`);

// ---- upload ------------------------------------------------------------------
const bellSrc = `
world.on('use', (e) => {
  if (e.action !== 'ring') return;
  const n = (world.kv.get('rings') ?? 0) + 1;
  world.kv.set('rings', n);
  world.emit('say', { text: 'dong ' + n + ' for ' + e.by });
  world.log('rung by', e.by);
});
world.on('say', (e) => {
  if (e.text === 'boom') throw new Error('deliberate failure');
  if (e.text === 'spin forever') { while (true) {} }
  if (e.text === 'overreach') world.emit('terrain', { seed: 1 });
  if (e.text === 'trespass') world.emit('motion', { id: 'other1', type: 'spin' });
});
`;
const path = await uploadScript(bellSrc);
check("script uploads content-addressed", /^store\/scripts\/[a-f0-9]{16}\.js$/.test(path), path);
check("re-upload is idempotent", (await uploadScript(bellSrc)) === path);
const nonUtf = await fetch(`${HTTP}/upload?as=script&token=${TOKEN}`, { method: "POST", body: new Uint8Array([0xff, 0xfe, 0x00, 0xff]) });
check("binary is refused as a script", nonUtf.status === 415);

// ---- bind + dispatch -----------------------------------------------------------
const alice = await open({ id: "alice", world: WORLD });
await alice.settle();   // first joiner owns
alice.verb("spawn", { id: "bell1", lib: "x/bell.glb", pos: [0, 0, 0] });
alice.verb("spawn", { id: "other1", lib: "x/other.glb", pos: [5, 0, 0] });
await alice.settle();
alice.verb("behavior", { id: "keeper", src: "store/scripts/deadbeefdeadbeef.js", attach: "bell1" });
await alice.settle();
check("binding a missing script is refused", alice.errors.length === 1, alice.errors.join("; "));
alice.verb("behavior", { id: "keeper", src: path, attach: "bell1" });
await alice.settle(600);   // sandbox load is async

alice.verb("use", { id: "bell1", action: "ring" });
const dong1 = (await alice.next((m) => !!sayFrom(m, "bhv:keeper"))).entry;
check("script hears use and emits say", /dong 1 for alice/.test(dong1.args.text), dong1.args.text);
check("script emits carry the author", dong1.args.by === "alice");

alice.verb("use", { id: "bell1", action: "ring" });
await alice.next((m) => sayFrom(m, "bhv:keeper") && /dong 2/.test(m.entry.args.text));
check("kv persists across activations", true);

// ---- kv survives a REPLAY (bstate folded) --------------------------------------
const eye = await open({ id: "eye1", world: WORLD, spectate: true });
const st = eye.msgs.find((m) => m.type === "snapshot").state;
check("fold: behavior binding is world state", st.behaviors?.keeper?.src === path && st.behaviors.keeper.attach === "bell1");
check("fold: script kv rides bstate entries", st.behaviors?.keeper?.state?.rings === 2, JSON.stringify(st.behaviors?.keeper?.state));

// ---- the author's console -------------------------------------------------------
const ring = await alice.req({ type: "debug", behavior: "keeper" }, "dbg-ring");
check("per-behavior log ring readable in-world",
  ring.status === "running" && ring.events.some((e: any) => /rung by alice/.test(e.line)),
  JSON.stringify({ status: ring.status, n: ring.events?.length }));
const roster = await alice.req({ type: "debug", behaviors: true }, "dbg-roster");
check("behavior roster lists it alive",
  roster.events.some((e: any) => e.kind === "behavior" && e.id === "keeper" && e.status === "running"));

// ---- budgets and the mask -------------------------------------------------------
alice.verb("say", { text: "overreach" });          // terrain: not in default caps
await alice.settle(400);
alice.verb("say", { text: "trespass" });           // touches an entity that isn't its own
await alice.settle(400);
const dbg1 = await alice.req({ type: "debug", kinds: ["script-error"], limit: 50 }, "dbg-caps");
check("capability mask blocks un-capped verbs",
  dbg1.events.some((e: any) => /capability mask/.test(String(e.error))), JSON.stringify(dbg1.events));
check("selfOnly keeps a behavior on its own entity",
  dbg1.events.some((e: any) => /selfOnly/.test(String(e.error))));
check("no trespass entry reached the log",
  !alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "motion" && m.entry?.args?.id === "other1"));

alice.verb("say", { text: "spin forever" });       // 25ms gas → interrupted
await alice.settle(600);
const dbg2 = await alice.req({ type: "debug", kinds: ["script-error"], limit: 50 }, "dbg-gas");
check("infinite loop is interrupted, server lives",
  dbg2.events.some((e: any) => /interrupted|InternalError/i.test(String(e.error))), JSON.stringify(dbg2.events.slice(-2)));
alice.verb("use", { id: "bell1", action: "ring" });
await alice.next((m) => sayFrom(m, "bhv:keeper") && /dong 3/.test(m.entry.args.text));
check("script still works after being interrupted (strikes healed by success)", true);

// repeated failures pause it. (Let the verb-rate window roll over first —
// the first run of this test rate-limited its own booms, which is the
// recorder working as intended, but not what THIS check is about.)
await alice.settle(4200);
for (let i = 0; i < 6; i++) { alice.verb("say", { text: "boom" }); await alice.settle(250); }
const paused = await alice.req({ type: "debug", behavior: "keeper" }, "dbg-paused");
check("five consecutive errors pause the script, loudly",
  /paused after/.test(String(paused.status)), String(paused.status));
alice.verb("use", { id: "bell1", action: "ring" });
await alice.settle(500);
check("a paused script no longer reacts",
  !alice.msgs.some((m) => sayFrom(m, "bhv:keeper") && /dong 4/.test(m.entry.args.text)));

// rebinding (same id, fresh bind) revives it
alice.verb("behavior", { id: "keeper", src: path, attach: "bell1", knobs: { fresh: 1 } });
await alice.settle(600);
alice.verb("use", { id: "bell1", action: "ring" });
const revived = (await alice.next((m) => !!sayFrom(m, "bhv:keeper") && /dong/.test(m.entry.args.text))).entry;
check("rebind revives with a fresh sandbox (fresh kv)", /dong 1 /.test(revived.args.text), revived.args.text);

// ---- timers ---------------------------------------------------------------------
const tickSrc = `world.every(1, () => {
  const n = (world.kv.get('n') ?? 0) + 1; world.kv.set('n', n);
  world.emit('say', { text: 'tick ' + n });
});`;
const tickPath = await uploadScript(tickSrc);
alice.verb("behavior", { id: "clock", src: tickPath });
const tick = (await alice.next((m) => !!sayFrom(m, "bhv:clock"), 8000)).entry;
check("timers fire with the world's own clock", /tick \d/.test(tick.args.text), tick.args.text);

// ---- rights + unbind --------------------------------------------------------------
alice.verb("grant", { id: "mallory", role: "visitor" });
await alice.settle();
const mallory = await open({ id: "mallory", world: WORLD });
mallory.verb("behavior", { id: "evil", src: path });
await mallory.settle();
check("a visitor cannot bind scripts", mallory.errors.length === 1, mallory.errors.join("; "));

alice.verb("behavior", { id: "clock", remove: true });
alice.verb("behavior", { id: "keeper", remove: true });
await alice.settle(1600);
const nSays = alice.msgs.filter((m) => sayFrom(m, "bhv:clock")).length;
await alice.settle(1600);
check("unbind stops the clock",
  alice.msgs.filter((m) => sayFrom(m, "bhv:clock")).length === nSays);
const eye2 = await open({ id: "eye2", world: WORLD, spectate: true });
const st2 = eye2.msgs.find((m) => m.type === "snapshot").state;
check("fold: unbound behaviors leave the state", !st2.behaviors);

// ---- client-runtime mods: offers, not residents --------------------------------
// runtime:"client" = code visitors may CHOOSE to run in their own browsers.
// Owner-only to publish; the server stores and rosters it but NEVER executes.
const nErr = mallory.errors.length;
mallory.verb("behavior", { id: "modx", src: path, runtime: "client" });
await mallory.settle(400);
check("a non-owner cannot offer client mods", mallory.errors.length > nErr,
  mallory.errors.join("; "));
alice.verb("behavior", { id: "modx", src: path, runtime: "weird" });
await alice.settle(400);
check("unknown runtimes are refused", alice.errors.some((e) => e.includes("runtime")));
alice.verb("behavior", { id: "modx", src: path, runtime: "client" });
await alice.settle(600);
const eye3 = await open({ id: "eye3", world: WORLD, spectate: true });
const st3 = eye3.msgs.find((m) => m.type === "snapshot").state;
check("fold: a client-mod offer is world state with its runtime",
  st3.behaviors?.modx?.src === path && st3.behaviors?.modx?.runtime === "client",
  JSON.stringify(st3.behaviors?.modx));
const roster3 = await alice.req({ type: "debug", behaviors: true }, "dbg-mods");
check("...and the server never runs it (rostered as client-mod, no sandbox)",
  roster3.events.some((e: any) => e.id === "modx" && e.status === "client-mod" && e.timers === 0),
  JSON.stringify(roster3.events?.filter((e: any) => e.id === "modx")));
eye3.close();

for (const s of [alice, mallory, eye, eye2]) s.close();
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
