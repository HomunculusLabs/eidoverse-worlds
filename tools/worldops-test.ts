// World-ops test matrix: /fork (copy a world) and /reset (erase to zero).
// Boots nothing itself — point it at a SCRATCH sequencer, same recipe as
// permtest.ts:
//
//   WORLDS_DIR=$(mktemp -d) JOIN_TOKEN=test-door PORT=8992 bun run server/server.ts &
//   WORLD_URL=ws://localhost:8992/ws JOIN_TOKEN=test-door WORLDS_DIR=<same dir> bun run tools/worldops-test.ts
//
// WORLDS_DIR is optional for the test; when given, the on-disk claims
// (copied files, archived history) are checked too.

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.WORLD_URL ?? "ws://localhost:8992/ws";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const WORLDS_DIR = process.env.WORLDS_DIR ?? "";

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
  send(msg: Record<string, unknown>): void;
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
      send(msg) { ws.send(JSON.stringify(msg)); },
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
    setTimeout(() => resolve(s), 250);
  });
}

const W = `wops-${Date.now()}`;
const COPY = `${W}-copy`;

console.log("1. fork: owner copies the world, history and roles included");
{
  const a = await open({ world: W, id: "alice" });          // fresh world → alice auto-owns
  await a.next("snapshot");
  a.verb("spawn", { id: "e1", lib: "x.glb", pos: [1, 0, 1] });
  a.verb("say", { text: "before the fork" });
  a.verb("grant", { id: "bob", gen: true });
  await a.settle(500);

  const b = await open({ world: W, id: "bob" });            // builder — must NOT be able to fork
  await b.next("snapshot");
  b.send({ type: "world-fork", to: COPY });
  await b.settle();
  check("non-owner cannot fork", b.errors.some((e) => e.includes("owner")));

  a.send({ type: "world-fork", to: COPY });
  const forked = await a.next("world-forked").catch(() => null);
  check("owner fork acknowledged", forked?.to === COPY && forked?.from === W);
  if (WORLDS_DIR) {
    check("copied log exists on disk", existsSync(join(WORLDS_DIR, COPY, "log.jsonl")));
  }

  const c = await open({ world: COPY, id: "carol" });
  const snap = await c.next("snapshot").catch(() => null);
  check("copy is joinable", Boolean(snap));
  const ents = { ...(snap?.state?.entities ?? {}) };
  for (const e of snap?.entries ?? []) if (e.verb === "spawn" && e.args?.id) ents[e.args.id] = e.args;
  check("copy carries the entities", Boolean(ents["e1"]));
  check("copy carries ownership (carol is builder, world not open)",
    snap?.yourRights?.role === "builder" && snap?.yourRights?.open === false);
  const chatText = JSON.stringify([snap?.state?.recentChat ?? [], snap?.entries ?? []]);
  check("copy carries the chat", chatText.includes("before the fork"));
  c.close();

  console.log("2. fork refusals: bad names, collisions, self-copy");
  a.send({ type: "world-fork", to: COPY });
  await a.settle();
  check("fork onto an existing world refused", a.errors.some((e) => e.includes("already exists")));
  a.send({ type: "world-fork", to: W });
  await a.settle();
  check("fork onto itself refused", a.errors.some((e) => e.includes("itself")));
  a.send({ type: "world-fork", to: "no/slashes" });
  await a.settle();
  check("bad target name refused", a.errors.some((e) => e.includes("bad world name")));

  console.log("3. reset: owner-only, name-confirmed, archived, ownership kept");
  b.send({ type: "world-reset", name: W });
  await b.settle();
  check("non-owner cannot reset", b.errors.some((e) => e.includes("owner") && e.includes("erasing")));
  a.send({ type: "world-reset", name: "wrong-name" });
  await a.settle();
  check("wrong confirmation refused", a.errors.some((e) => e.includes("confirmation mismatch")));

  a.send({ type: "world-reset", name: W });
  const reset = await a.next("world-reset").catch(() => null);
  check("reset broadcast reaches the room", reset?.world === W && reset?.by === "alice");
  const bReset = await b.next("world-reset").catch(() => null);
  check("everyone standing in the world is told", bReset?.world === W);
  if (WORLDS_DIR) {
    const arch = existsSync(join(WORLDS_DIR, W))
      ? readdirSync(join(WORLDS_DIR, W)).filter((f) => f.startsWith("erased-")) : [];
    check("history archived on disk", arch.length === 1, `found: ${arch.join(", ") || "nothing"}`);
    check("archived log present", arch.length === 1 && existsSync(join(WORLDS_DIR, W, arch[0], "log.jsonl")));
  }
  a.close(); b.close();

  const d = await open({ world: W, id: "dora" });
  const snap2 = await d.next("snapshot").catch(() => null);
  const ents2 = Object.keys(snap2?.state?.entities ?? {})
    .concat((snap2?.entries ?? []).filter((e: any) => e.verb === "spawn").map((e: any) => e.args?.id));
  check("world is empty after reset", ents2.length === 0, `still holds: ${ents2.join(", ")}`);
  check("previous owner survives the reset (dora is NOT owner)",
    snap2?.yourRights?.role === "builder" && snap2?.yourRights?.open === false);
  d.close();

  const a2 = await open({ world: W, id: "alice" });
  const snap3 = await a2.next("snapshot").catch(() => null);
  check("alice still owns the fresh world", snap3?.yourRights?.role === "owner");
  a2.close();

  console.log("4. the copy is untouched by the source's reset");
  const c2 = await open({ world: COPY, id: "carol" });
  const snap4 = await c2.next("snapshot").catch(() => null);
  const ents4 = { ...(snap4?.state?.entities ?? {}) };
  for (const e of snap4?.entries ?? []) if (e.verb === "spawn" && e.args?.id) ents4[e.args.id] = e.args;
  check("copy still has its entities", Boolean(ents4["e1"]));
  c2.close();

  console.log("5. spectators can do neither");
  const s = await open({ world: W, id: "peeper", spectate: true });
  await s.next("snapshot");
  s.send({ type: "world-fork", to: `${W}-nope` });
  s.send({ type: "world-reset", name: W });
  await s.settle();
  check("spectator fork/reset refused", s.errors.filter((e) => e.includes("spectators")).length === 2,
    s.errors.join("; "));
  s.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
