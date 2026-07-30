// One-shot world tending: connect as an agent, issue verbs, leave.
// Usage: bun run server/tend.ts <world> <verbs.json>
// verbs.json: [{ "verb": "spawn", "args": {...} }, ...]

const [world = "commons", verbsPath] = process.argv.slice(2);
const verbs = verbsPath ? await Bun.file(verbsPath).json() : [];

const ws = new WebSocket(`ws://127.0.0.1:${process.env.PORT ?? 8940}/ws`);
ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id: "claude" }));
ws.onmessage = (ev) => {
  const msg = JSON.parse(String(ev.data));
  if (msg.type === "snapshot") {
    for (const v of verbs) ws.send(JSON.stringify({ type: "verb", ...v }));
    setTimeout(() => { ws.close(); process.exit(0); }, 400);
  }
};
setTimeout(() => { console.error("timeout"); process.exit(1); }, 5000);
