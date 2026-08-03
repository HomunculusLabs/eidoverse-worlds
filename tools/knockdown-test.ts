// Headless bodies are pushable: the WorldAgent's knockdown semantics, against
// a real scratch sequencer. A body with no physics in-process cannot tumble,
// but it must (1) CONSENT, (2) land displaced the way the shove was taking
// it, (3) slump visibly (clip ragdoll + DOWNED_POSE), (4) perceive the event,
// and (5) stand up clean when it decides to move.
//
//   WORLDS_DIR=$(mktemp -d) JOIN_TOKEN=test-door PORT=8996 bun run server/server.ts &
//   WORLD_URL=ws://localhost:8996/ws WORLD_TOKEN=test-door JOIN_TOKEN=test-door \
//     bun run tools/knockdown-test.ts
// (WORLD_TOKEN is what WorldAgent presents at the door; JOIN_TOKEN is what the
//  test's bare "human" socket presents. Same value, two doors.)

import { WorldAgent } from "../mcpl/agent.ts";

const URL = process.env.WORLD_URL ?? "ws://localhost:8996/ws";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const W = `kd-${Math.random().toString(36).slice(2, 8)}`;

let passed = 0, failed = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// a "human" — a bare socket that joins, watches, and throws its weight around
function human(name: string): Promise<{ ws: WebSocket; verb: (v: string, a: any) => void; send: (m: any) => void; close: () => void }> {
  return new Promise((res) => {
    const ws = new WebSocket(`${URL}?name=${name}`);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: name, token: TOKEN }));
    ws.onmessage = (e) => {
      const m = JSON.parse(String(e.data));
      if (m.type === "snapshot") res({
        ws,
        verb: (v, a) => ws.send(JSON.stringify({ type: "verb", verb: v, args: a })),
        send: (m2) => ws.send(JSON.stringify(m2)),
        close: () => ws.close(),
      });
    };
  });
}

console.log("knockdown (headless bodies are pushable):\n");

const events: string[] = [];
const ag = new WorldAgent({ url: URL, name: "kd-bot", world: W });
(ag as any).onEvent = (e: any) => { if (e?.text) events.push(String(e.text)); };
await ag.connect();
await sleep(400);
const h = await human("shover");
await sleep(400);

// 1. radial blast: in radius → displaced away + slumped + perceived
const before = { x: ag.pos.x, z: ag.pos.z };
h.verb("force", { at: [ag.pos.x - 2, 0, ag.pos.z], power: 4, radius: 6 });
await sleep(600);
check("a blast knocks the agent down", ag.clip === "ragdoll" && ag.heldPose != null, `clip=${ag.clip}`);
check("...displaced AWAY from the blast", ag.pos.x > before.x + 0.2, `Δx=${(ag.pos.x - before.x).toFixed(2)}`);
check("...and the agent PERCEIVED it", events.some((t) => t.includes("blast")), events.join(" | "));

// 2. walking stands it up clean — no zombie-walk slump
await ag.walkTo(ag.pos.x + 1, ag.pos.z, false, 10_000);
check("walking sheds the slump", ag.clip !== "ragdoll" && ag.heldPose == null, `clip=${ag.clip}`);

// 3. directed shove over the puppet wire: displaced along the lean
const b2 = { x: ag.pos.x, z: ag.pos.z };
h.send({ type: "puppet", target: "kd-bot", ragdoll: { lean: [0, 0, 3] } });
await sleep(600);
check("a directed shove floors it downwind", ag.clip === "ragdoll" && ag.pos.z > b2.z + 0.5,
  `clip=${ag.clip} Δz=${(ag.pos.z - b2.z).toFixed(2)}`);
check("...and named the shover", events.some((t) => t.includes("shover") && t.includes("knocks you over")), events.join(" | "));

// 4. consent: pushable=false refuses everything, silently and completely
ag.pushable = false;
ag.setPose(null);
const b3 = { x: ag.pos.x, z: ag.pos.z };
h.verb("force", { at: [ag.pos.x, 0, ag.pos.z], power: 6, radius: 6 });
h.send({ type: "puppet", target: "kd-bot", ragdoll: { lean: [3, 0, 0] } });
await sleep(600);
check("pushable=false: unmoved and standing",
  ag.clip !== "ragdoll" && Math.hypot(ag.pos.x - b3.x, ag.pos.z - b3.z) < 0.01,
  `clip=${ag.clip}`);

// 5. replay never re-detonates: a fresh agent folding the log stays standing
ag.close?.();
await sleep(200);
const ag2 = new WorldAgent({ url: URL, name: "kd-bot2", world: W });
await ag2.connect();
await sleep(600);
check("a late joiner folding the force history stays on its feet", ag2.clip !== "ragdoll", `clip=${ag2.clip}`);

h.close();
ag2.close?.();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
