// Set a world's time of day by logging a sky verb (persists in the world log).
//   bun tools/sky.ts [world] [hours] [clouds]     e.g.  bun tools/sky.ts commons 16.8 clear
// The client maps hours→sun elevation/warmth: 12 = noon, ~17 = golden hour,
// <6 / >18 = night. clouds: clear | cumulus (eidoverse sky_system only).
const [world, hours, clouds] = [Bun.argv[2] ?? "commons", Number(Bun.argv[3] ?? 16.8), Bun.argv[4] ?? "clear"];
// optional key=val tuners appended after clouds: sun, ambient, fill, exposure (multipliers, default 1)
//   bun tools/sky.ts commons 16.8 clear ambient=1.2 exposure=0.9
const tuners: Record<string, number> = {};
for (const kv of Bun.argv.slice(5)) { const [k, v] = kv.split("="); tuners[k] = Number(v); }
const ws = new WebSocket(process.env.EW_URL ?? "ws://localhost:8940/ws");
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
ws.send(JSON.stringify({ type: "join", world, id: "claude", spectate: true }));
await new Promise((r) => setTimeout(r, 300));
ws.send(JSON.stringify({ type: "verb", verb: "sky", args: { hours, clouds, ...tuners } }));
await new Promise((r) => setTimeout(r, 300));
ws.close();
console.log(`sky {hours: ${hours}, clouds: ${clouds}} → ${world}`);
