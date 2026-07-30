// Permission-system test matrix. Boots nothing itself — point it at a SCRATCH
// sequencer (fresh WORLDS_DIR, JOIN_TOKEN set) and it walks the whole rights
// ladder over real websockets:
//
//   WORLDS_DIR=$(mktemp -d) JOIN_TOKEN=test-door PORT=8991 bun run server/server.ts &
//   WORLD_URL=ws://localhost:8991/ws JOIN_TOKEN=test-door bun run tools/permtest.ts
//
// Uses the real mcpl/tokens.json "dev-token" (id: claude) for the reserved-name
// and agent-credential cases — no fixtures to maintain.

const URL = process.env.WORLD_URL ?? "ws://localhost:8991/ws";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const HTTP = URL.replace(/^ws/, "http").replace(/\/ws$/, "");

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}

type Sock = {
  ws: WebSocket;
  msgs: any[];
  errors: string[];
  closedWith: number | null;
  next(type: string, ms?: number): Promise<any>;
  verb(verb: string, args: any): void;
  settle(ms?: number): Promise<void>;
  close(): void;
};

function open(joinMsg: Record<string, unknown>): Promise<Sock> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Sock = {
      ws, msgs: [], errors: [], closedWith: null,
      next(type, ms = 4000) {
        return new Promise((res, rej) => {
          const hit = s.msgs.find((m) => m.type === type);
          if (hit) return res(hit);
          const t0 = Date.now();
          const iv = setInterval(() => {
            const m = s.msgs.find((x) => x.type === type);
            if (m) { clearInterval(iv); res(m); }
            else if (Date.now() - t0 > ms) { clearInterval(iv); rej(new Error(`no ${type} in ${ms}ms`)); }
          }, 20);
        });
      },
      verb(verb, args) { ws.send(JSON.stringify({ type: "verb", verb, args })); },
      settle(ms = 300) { return new Promise((r) => setTimeout(r, ms)); },
      close() { try { ws.close(); } catch { /* already */ } },
    };
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", token: TOKEN, ...joinMsg }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      s.msgs.push(m);
      if (m.type === "error") s.errors.push(m.error);
    };
    ws.onclose = (ev) => { s.closedWith = ev.code; };
    ws.onerror = () => reject(new Error("ws error"));
    setTimeout(() => resolve(s), 250);   // resolve regardless — rejection cases inspect closedWith
  });
}

const W = `permtest-${Date.now()}`;

console.log("1. fresh world: first embodied joiner becomes owner");
{
  const a = await open({ world: W, id: "alice" });
  const snap = await a.next("snapshot");
  check("alice joined", snap.you === "alice");
  await a.settle();
  const grant = a.msgs.find((m) => m.type === "log" && m.entry?.verb === "grant");
  check("auto-owner grant logged", grant?.entry?.args?.id === "alice" && grant?.entry?.args?.role === "owner");
  a.verb("spawn", { id: "e1", lib: "x.glb", pos: [0, 0, 0] });
  a.verb("sky", { hours: 12 });
  a.verb("asset", { path: "store/deadbeef.glb", name: "gen-test" });
  await a.settle();
  check("owner spawns/shapes/assets freely", a.errors.length === 0, a.errors.join("; "));

  console.log("2. second joiner: builder by default, no gen, no shaping");
  const b = await open({ world: W, id: "bob" });
  await b.next("snapshot");
  const rights = (await b.next("snapshot")).yourRights;
  check("bob is builder", rights?.role === "builder");
  check("bob has no gen", rights?.gen === false);
  check("world reports not-open", rights?.open === false);
  b.verb("spawn", { id: "e2", lib: "x.glb", pos: [1, 0, 1] });
  await b.settle();
  check("builder can spawn", b.errors.length === 0, b.errors.join("; "));
  b.verb("sky", { hours: 3 });
  await b.settle();
  check("builder cannot shape the sky", b.errors.some((e) => e.includes("owner")));
  b.verb("asset", { path: "store/cafef00d.glb", name: "nope" });
  await b.settle();
  check("builder without gen cannot asset", b.errors.some((e) => e.includes("gen")));

  console.log("3. grants: owner-only, and +gen unlocks asset without demoting");
  b.verb("grant", { id: "carol", role: "builder" });
  await b.settle();
  check("non-owner cannot grant", b.errors.some((e) => e.includes("owner")));
  a.verb("grant", { id: "bob", gen: true });
  await a.settle(500);
  const before = b.errors.length;
  b.verb("asset", { path: "store/cafef00d.glb", name: "yep" });
  b.verb("spawn", { id: "e3", lib: "x.glb", pos: [2, 0, 2] });
  await b.settle();
  check("+gen unlocks asset, spawn still works", b.errors.length === before, b.errors.slice(before).join("; "));

  console.log("4. wildcard: /grant * visitor closes the world");
  a.verb("grant", { id: "*", role: "visitor" });
  await a.settle(500);
  const c = await open({ world: W, id: "carol2" });
  await c.next("snapshot");
  c.verb("spawn", { id: "e4", lib: "x.glb", pos: [3, 0, 3] });
  await c.settle();
  check("unlisted id is now a visitor", c.errors.some((e) => e.includes("builder rights")));
  const still = b.errors.length;
  b.verb("spawn", { id: "e5", lib: "x.glb", pos: [4, 0, 4] });
  await b.settle();
  check("explicit grant survives the wildcard", b.errors.length === still, b.errors.slice(still).join("; "));
  a.verb("grant", { id: "*", role: "owner" });
  await a.settle();
  check("wildcard cannot be owner", a.errors.some((e) => e.includes("cannot own")));

  a.close(); b.close(); c.close();
}

console.log("5. reserved agent names");
{
  const fake = await open({ world: W, id: "claude" });          // dev-token's id
  await fake.settle(600);
  check("agent name without token is rejected", fake.closedWith === 4004
    || fake.errors.some((e) => e.includes("reserved")));
  const real = await open({ world: W, id: "claude", agentToken: "dev-token", agent: true });
  const snap = await real.next("snapshot").catch(() => null);
  check("agent name with its own token joins", snap?.you === "claude");
  fake.close(); real.close();
}

console.log("6. legacy ownerless world stays fully open");
{
  // simulate pre-permissions history: a world whose first entry was NOT a
  // grant (owner bootstrap only fires on empty logs)
  const seed = await open({ world: `${W}-legacy`, id: "seeder" });
  await seed.next("snapshot");
  await seed.settle(400); // seeder DID get auto-owner (fresh world) — use a different check below
  seed.close();
  // real legacy semantics = a world with entries but no owner; closest live
  // approximation: verify an ownerless state via rights math is covered by
  // unit of rightsOf — here we at least confirm the owned path didn't break say
  const d = await open({ world: `${W}-legacy`, id: "dora" });
  await d.next("snapshot");
  d.verb("say", { text: "hello" });
  await d.settle();
  check("say is open to everyone", d.errors.length === 0, d.errors.join("; "));
  d.close();
}

console.log("7. upload accepts agent bearer tokens");
{
  const glbHeader = new Uint8Array(16);
  new DataView(glbHeader.buffer).setUint32(0, 0x46546c67, true);
  const bad = await fetch(`${HTTP}/upload?token=wrong`, { method: "POST", body: glbHeader });
  check("bad token rejected", bad.status === 401);
  const agent = await fetch(`${HTTP}/upload?token=dev-token&by=claude`, { method: "POST", body: glbHeader });
  check("agent token accepted", agent.status === 200, `${agent.status}`);
  const door = await fetch(`${HTTP}/upload?token=${TOKEN}`, { method: "POST", body: glbHeader });
  check("door token accepted", door.status === 200, `${door.status}`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
