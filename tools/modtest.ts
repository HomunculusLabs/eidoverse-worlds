// Moderation test matrix (kick / ban / unban, per-world and global). Boots
// nothing itself — point it at a SCRATCH sequencer (fresh WORLDS_DIR,
// JOIN_TOKEN set, WORLD_ADMIN=admin) and it exercises the whole surface over
// real websockets:
//
//   WORLDS_DIR=$(mktemp -d) JOIN_TOKEN=test-door WORLD_ADMIN=admin PORT=8992 bun run server/server.ts &
//   WORLD_URL=ws://localhost:8992/ws JOIN_TOKEN=test-door bun run tools/modtest.ts

const URL = process.env.WORLD_URL ?? "ws://localhost:8992/ws";
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
  closedWith: number | null;
  next(type: string, ms?: number): Promise<any>;
  verb(verb: string, args: any): void;
  send(obj: Record<string, unknown>): void;
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
      send(obj) { ws.send(JSON.stringify(obj)); },
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

const W = `modtest-${Date.now()}`;

console.log("1. kick: owner-only, lands now, and is not a ban");
{
  const alice = await open({ world: W, id: "alice" });          // first joiner = owner
  await alice.next("snapshot");
  const bob = await open({ world: W, id: "bob" });
  await bob.next("snapshot");

  bob.verb("kick", { id: "alice" });
  await bob.settle();
  check("builder cannot kick", bob.errors.some((e) => e.includes("owner")), bob.errors.join("; "));

  alice.verb("kick", { id: "bob", reason: "testing" });
  await alice.settle(600);
  check("kicked client closes with 4006", bob.closedWith === 4006, String(bob.closedWith));
  check("kicked client was told why", bob.errors.some((e) => e.includes("removed") && e.includes("testing")), bob.errors.join("; "));
  check("kick is a log entry", alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "kick" && m.entry?.args?.id === "bob"));
  check("room saw bob leave", alice.msgs.some((m) => m.type === "leave" && m.id === "bob"));

  const bob2 = await open({ world: W, id: "bob" });
  const snap = await bob2.next("snapshot").catch(() => null);
  check("a kick does not bar rejoining", snap?.you === "bob");
  bob2.close();

  console.log("2. moderation verbs refuse bad targets");
  alice.verb("ban", { id: "alice" });
  await alice.settle();
  check("no self-moderation", alice.errors.some((e) => e.includes("yourself")));
  alice.verb("ban", { id: "*" });
  await alice.settle();
  check("no wildcard bans", alice.errors.some((e) => e.includes("specific participant")));
  alice.verb("grant", { id: "carol", role: "owner" });
  await alice.settle();
  alice.verb("ban", { id: "carol" });
  await alice.settle();
  check("owner cannot ban a fellow owner", alice.errors.some((e) => e.includes("owners cannot")));
  alice.verb("ban", { id: "admin" });
  await alice.settle();
  check("operators cannot be banned", alice.errors.some((e) => e.includes("operator")));

  console.log("3. ban: disconnects now, bars rejoin (and spectating), listed, liftable");
  const bob3 = await open({ world: W, id: "bob" });
  await bob3.next("snapshot");
  alice.verb("ban", { id: "bob", reason: "grief" });
  await alice.settle(600);
  check("banned client closes with 4006", bob3.closedWith === 4006, String(bob3.closedWith));
  check("banned client was told why", bob3.errors.some((e) => e.includes("banned") && e.includes("grief")), bob3.errors.join("; "));

  const bob4 = await open({ world: W, id: "bob" });
  await bob4.settle(600);
  check("banned id cannot rejoin", bob4.closedWith === 4006 && bob4.errors.some((e) => e.includes("banned")), `${bob4.closedWith} ${bob4.errors.join("; ")}`);
  const bobEyes = await open({ world: W, id: "bob", spectate: true });
  await bobEyes.settle(600);
  check("banned id cannot even spectate", bobEyes.closedWith === 4006, String(bobEyes.closedWith));

  alice.send({ type: "world-bans" });
  const list = await alice.next("mod").catch(() => null);
  check("world-bans lists the ban", !!list?.text?.includes("bob") && !!list?.text?.includes("grief"), list?.text);

  alice.verb("unban", { id: "bob" });
  await alice.settle(400);
  const bob5 = await open({ world: W, id: "bob" });
  const snap5 = await bob5.next("snapshot").catch(() => null);
  check("unban reopens the door", snap5?.you === "bob");
  bob5.close();

  console.log("4. global bans: WORLD_ADMIN only, everywhere at once");
  alice.send({ type: "global-ban", id: "carol" });
  await alice.settle();
  check("non-admin cannot global-ban", alice.errors.some((e) => e.includes("WORLD_ADMIN")));

  const bob6 = await open({ world: W, id: "bob" });
  await bob6.next("snapshot");
  const admin = await open({ world: `${W}-hq`, id: "admin" });
  await admin.next("snapshot");
  admin.send({ type: "global-ban", id: "bob", reason: "everywhere" });
  const gmod = await admin.next("mod").catch(() => null);
  check("global-ban confirms", !!gmod?.text?.includes("banned from all worlds"), gmod?.text);
  await bob6.settle(600);
  check("global ban expels from other worlds", bob6.closedWith === 4006, String(bob6.closedWith));
  const bob7 = await open({ world: `${W}-elsewhere`, id: "bob" });
  await bob7.settle(600);
  check("globally banned id is barred from every world", bob7.closedWith === 4006 && bob7.errors.some((e) => e.includes("these worlds")), `${bob7.closedWith} ${bob7.errors.join("; ")}`);

  admin.send({ type: "global-bans" });
  await admin.settle(400);
  const glist = admin.msgs.filter((m) => m.type === "mod").pop();
  check("global-bans lists it", !!glist?.text?.includes("bob"), glist?.text);

  admin.send({ type: "global-unban", id: "bob" });
  await admin.settle(400);
  const bob8 = await open({ world: `${W}-elsewhere`, id: "bob" });
  const snap8 = await bob8.next("snapshot").catch(() => null);
  check("global-unban reopens every door", snap8?.you === "bob");

  console.log("5. per-world ban stays per-world");
  alice.verb("ban", { id: "dave" });
  await alice.settle(400);
  const dave = await open({ world: `${W}-elsewhere`, id: "dave" });
  const snapD = await dave.next("snapshot").catch(() => null);
  check("banned in one world, welcome in another", snapD?.you === "dave");

  alice.close(); admin.close(); bob8.close(); dave.close();
  bob3.close(); bob4.close(); bobEyes.close(); bob6.close(); bob7.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
