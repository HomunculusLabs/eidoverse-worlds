// fauna74-census-carp.ts — PROPOSAL-TICK grounding probe (READ-ONLY).
// 1. fresh census total; 2. zero-carp/cyprinid/fish check across ids AND
// libs (magpie fauna-57 proposal law); 3. reedpool habitat table — host +
// every resident + angler live tuples (the co-resident SAT context for the
// candidate row); 4. host-local open-water quadrant arithmetic (host yaw 0
// = pure translation, so local = world - host); 5. reader-spoke bearing
// (clean-slate bearing law, fauna-61 law a). Zero verbs, zero uploads.
const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse((await Bun.file(`${R}/agents/arthur/config.json`).text()));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities;
console.log("census total:", ents.length);

// 2. carp/cyprinid/fish absence check: ids and libs.
const fid = ents.filter((e) => /carp|cyprin|fish|perch|tench|roach|rudd|pisc/i.test(e.id));
const flib = ents.filter((e) => /carp|cyprin|fish|perch|tench|roach|rudd|pisc/i.test(String(e.lib ?? "")));
console.log("fish id hits:", fid.length, JSON.stringify(fid.map((e) => e.id)));
console.log("fish lib hits:", flib.length, JSON.stringify(flib.map((e) => e.id)));

// 3. reedpool habitat table — host, residents, angler, nearby readers.
const HOST = "nx-struct-reedpool";
const host = ents.find((e) => e.id === HOST);
if (!host) throw Error("reedpool host ABSENT");
const hx = host.pos[0], hz = host.pos[2];
console.log(`\nhost ${HOST}: @(${hx},${hz}) py ${host.pos[1].toFixed(3)} yaw ${host.yaw.toFixed(3)} lib ${String(host.lib).slice(5, 21)} bbox ${host.bbox ? host.bbox.size.map((n: number) => n.toFixed(1)).join("x") : "-"}`);

const residents = ["nx-dress-ducks-001", "nx-dress-geese-001", "nx-dress-frog-001", "nx-dress-heron-001", "nx-dress-swan-001", "nx-dress-robin-001", "nx-struct-angler"];
console.log("\nresidents (world -> host-local, host yaw 0):");
for (const id of residents) {
  const e = ents.find((x) => x.id === id);
  if (!e) { console.log(`  ${id}: ABSENT`); continue; }
  const lx = e.pos[0] - hx, lz = e.pos[2] - hz;
  console.log(`  ${id}: @(${e.pos[0].toFixed(2)},${e.pos[2].toFixed(2)}) -> local (${lx.toFixed(2)}, ${lz.toFixed(2)}) py ${e.pos[1].toFixed(3)} bbox ${e.bbox ? e.bbox.size.map((n: number) => n.toFixed(2)).join("x") : "-"} lib ${String(e.lib).slice(5, 21)}`);
}

// 4. open-water quadrant occupancy (rim ellipse ~4.55/3.05 per fauna-11/29 decodes).
console.log("\nquadrant occupancy (residents in pool-local quadrants, water ellipse x±4.55 z±3.05):");
const q = (lx: number, lz: number) => `${lx >= 0 ? (lz >= 0 ? "NE" : "SE") : lz >= 0 ? "NW" : "SW"}`;
for (const id of residents.slice(0, 6)) {
  const e = ents.find((x) => x.id === id);
  if (!e) continue;
  console.log(`  ${id}: ${q(e.pos[0] - hx, e.pos[2] - hz)} local (${(e.pos[0] - hx).toFixed(2)}, ${(e.pos[2] - hz).toFixed(2)})`);
}

// 5. plaza spoke bearing from the pool (clean-slate law).
const brg = (Math.atan2(-hz, -hx) * 180) / Math.PI;
console.log(`\npool->plaza bearing ${brg.toFixed(1)} deg; r ${Math.hypot(hx, hz).toFixed(1)}m`);

// 6. any OTHER fauna lane movement since fauna-73 (sibling diff context).
const hares = ents.filter((e) => /nx-dress-hare-001/.test(e.id));
console.log("hare present (fauna-73 pin):", hares.length === 1 ? `@(${hares[0].pos[0]},${hares[0].pos[2]}) yaw ${hares[0].yaw}` : JSON.stringify(hares.length));
