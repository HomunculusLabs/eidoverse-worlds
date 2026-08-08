// Lock matrix — `comp {id, type: "lock", data: true}` nails a thing down.
//
// The lock is an ACCIDENT guard, not a rights system: anyone builder+ can
// toggle it, it refuses everyone identically (locker included), and the
// deliberate unlock is what converts an accident into an intent. While
// locked the server refuses everything that would move, replace or remove
// the entity; everything that doesn't relocate it stays open.
//
// Boots nothing itself — point it at a SCRATCH sequencer:
//
//   WORLDS_DIR=$(mktemp -d) JOIN_TOKEN=test-door PORT=8994 bun run server/server.ts &
//   WORLD_URL=ws://localhost:8994/ws JOIN_TOKEN=test-door bun run tools/locktest.ts

const URL = process.env.WORLD_URL ?? "ws://localhost:8994/ws";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";

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
  next(pred: string | ((m: any) => boolean), ms?: number): Promise<any>;
  verb(verb: string, args: any): void;
  settle(ms?: number): Promise<void>;
  close(): void;
};

function open(joinMsg: Record<string, unknown>): Promise<Sock> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Sock = {
      ws, msgs: [], errors: [],
      next(pred, ms = 4000) {
        const want = typeof pred === "string" ? (m: any) => m.type === pred : pred;
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
      settle(ms = 300) { return new Promise((r) => setTimeout(r, ms)); },
      close() { try { ws.close(); } catch { /* already */ } },
    };
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", token: TOKEN, ...joinMsg }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      s.msgs.push(m);
      if (m.type === "error") s.errors.push(m.error);
    };
    ws.onclose = () => { /* fine */ };
    ws.onerror = (e) => reject(e);
    s.next("snapshot").then(() => resolve(s), reject);
  });
}

const WORLD = `locktest-${Math.random().toString(36).slice(2, 8)}`;

console.log(`\nlock matrix — world "${WORLD}"\n`);

// ---- first joiner owns the fresh world --------------------------------------
const alice = await open({ id: "alice", world: WORLD });
await alice.settle();

alice.verb("spawn", { id: "bench1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
alice.verb("spawn", { id: "truck1", lib: "deco/truck.glb", pos: [5, 0, 5], yaw: 0 });
alice.verb("comp", { id: "bench1", type: "sockets", data: { seat: { pos: [0, 0.5, 0] } } });
await alice.settle();

// ---- lock it ---------------------------------------------------------------
alice.verb("comp", { id: "bench1", type: "lock", data: true });
await alice.settle();
check("locking is an ordinary comp — no error", alice.errors.length === 0, alice.errors.join("; "));

// ---- the refusal matrix: everything that would relocate it ------------------
const refusals = () => alice.errors.length;
let before = refusals();
alice.verb("place", { id: "bench1", pos: [9, 0, 9], yaw: 1, scale: 1 });
await alice.settle();
check("place on a locked thing is refused — even for the locker",
  refusals() === before + 1 && alice.errors.at(-1)!.includes("locked"), alice.errors.at(-1) ?? "no error");

before = refusals();
alice.verb("remove", { id: "bench1" });
await alice.settle();
check("remove is refused", refusals() === before + 1 && alice.errors.at(-1)!.includes("locked"), alice.errors.at(-1) ?? "no error");

before = refusals();
alice.verb("punt", { id: "bench1", dir: [1, 0, 0] });
await alice.settle();
check("punt is refused (physics is still a move)", refusals() === before + 1 && alice.errors.at(-1)!.includes("locked"), alice.errors.at(-1) ?? "no error");

before = refusals();
alice.verb("mount", { id: "bench1", to: "truck1", slot: "bed" });
await alice.settle();
check("cargo-mounting the locked thing is refused", refusals() === before + 1 && alice.errors.at(-1)!.includes("locked"), alice.errors.at(-1) ?? "no error");

before = refusals();
alice.verb("spawn", { id: "bench1", lib: "deco/crate.glb", pos: [0, 0, 0], yaw: 0 });
await alice.settle();
check("spawn onto the locked id (wholesale replace) is refused", refusals() === before + 1 && alice.errors.at(-1)!.includes("locked"), alice.errors.at(-1) ?? "no error");

before = refusals();
alice.verb("light", { id: "bench1", pos: [0, 1, 0] });
await alice.settle();
check("light onto the locked id (wholesale replace) is refused", refusals() === before + 1 && alice.errors.at(-1)!.includes("locked"), alice.errors.at(-1) ?? "no error");

// ---- what stays open: everything that doesn't relocate it -------------------
await alice.settle(4200);   // let the verb rate window (12/4s) reset — refusals count too
before = refusals();
alice.verb("mount", { id: "alice", to: "bench1", slot: "seat" });   // sitting ON it is USING it
alice.verb("use", { id: "bench1", action: "polish" });
alice.verb("motion", { id: "bench1", type: "pendulum", axis: [1, 0, 0], pivot: [0, 2, 0], amp: 0.1, period: 3 });
alice.verb("comp", { id: "bench1", type: "graffiti", data: { text: "still writable" } });
await alice.settle();
check("sit / use / motion / other comps all stay open while locked",
  refusals() === before, alice.errors.slice(before).join("; "));
alice.verb("dismount", { id: "alice" });
await alice.settle();

// ---- moving the truck is untouched (lock is per-entity) ---------------------
before = refusals();
alice.verb("place", { id: "truck1", pos: [6, 0, 6], yaw: 0.5, scale: 1 });
await alice.settle();
check("an unlocked neighbour still moves freely", refusals() === before, alice.errors.slice(before).join("; "));

// ---- the deliberate unlock reopens everything -------------------------------
await alice.settle(4200);   // fresh rate window again
alice.verb("comp", { id: "bench1", type: "lock", data: null });
await alice.settle();
before = refusals();
alice.verb("place", { id: "bench1", pos: [2, 0, 2], yaw: 0.3, scale: 1 });
await alice.settle();
check("unlock (data: null) then place works", refusals() === before, alice.errors.slice(before).join("; "));

// ---- fold + join: the lock survives as folded state -------------------------
alice.verb("comp", { id: "bench1", type: "lock", data: true });
await alice.settle();
const eye = await open({ id: "eye", world: WORLD, spectate: true });
const folded = eye.msgs.find((m) => m.type === "snapshot").state.entities?.bench1;
check("a fresh join folds the lock (comp.lock in snapshot)", folded?.comp?.lock === true, JSON.stringify(folded?.comp));
check("…and the moved position survived alongside it", Array.isArray(folded?.pos) && folded.pos[0] === 2, JSON.stringify(folded?.pos));

// builder (non-owner) can unlock too: an accident guard, not a rights system
const bob = await open({ id: "bob", world: WORLD });   // owned worlds default new joiners to builder
before = bob.errors.length;
bob.verb("comp", { id: "bench1", type: "lock", data: null });
await bob.settle();
check("any builder can unlock — deliberate step, not a permission wall", bob.errors.length === before, bob.errors.slice(before).join("; "));

for (const s of [alice, eye, bob]) s.close();

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
