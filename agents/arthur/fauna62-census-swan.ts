// fauna62-census-swan.ts — PROPOSAL-TICK grounding probe (READ-ONLY).
// 1. fresh census total; 2. zero-swan/cygnid check across ids AND libs
// (magpie fauna-57 proposal law); 3. reedpool geography — the candidate
// zone's host + co-residents + plaza-spoke bearing (reader-bearing
// clean-slate law, fauna-61 law a). Zero verbs, zero uploads.
const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse((await Bun.file(`${R}/agents/arthur/config.json`).text()));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities;
console.log("census total:", ents.length);
// zero-swan check: ids and libs
const swanId = ents.filter((e) => /swan|cygn/i.test(e.id));
const swanLib = ents.filter((e) => /swan|cygn/i.test(String(e.lib ?? "")));
console.log("swan id hits:", swanId.length, JSON.stringify(swanId.map((e) => e.id)));
console.log("swan lib hits:", swanLib.length);
// existing waterbird fauna ids (pool residents — the seating table)
const ids = ["nx-dress-reedpool-001", "nx-dress-ducks-001", "nx-dress-geese-001", "nx-dress-robin-001", "nx-dress-frog-001", "nx-dress-heron-001", "nx-dress-kfish-001", "nx-struct-millrace", "nx-struct-screwwell"];
for (const id of ids) {
  const e = ents.find((x) => x.id === id);
  if (!e) { console.log(`  ${id}: ABSENT`); continue; }
  console.log(`  ${id}: pos [${e.pos.map((n: number) => n.toFixed(3)).join(", ")}] yaw ${e.yaw.toFixed(4)} lib ${String(e.lib).slice(0, 24)} bbox ${e.bbox ? e.bbox.size.map((n: number) => n.toFixed(2)).join("x") : "none"}`);
}
// bridge/angler neighbors near the pool (co-resident collision set)
const near = ents.filter((e) => {
  if (!e.pos) return false;
  const dx = e.pos[0] - 8, dz = e.pos[2] + 91;
  return Math.hypot(dx, dz) < 22 && !ids.includes(e.id);
}).map((e) => `${e.id} @(${e.pos[0].toFixed(1)},${e.pos[2].toFixed(1)})`);
console.log("pool 22m co-residents:", JSON.stringify(near, null, 0));
// plaza bearing from the pool center (reader-bearing clean-slate)
const px = 8, pz = -91;
const bdeg = (Math.atan2(0 - px, 0 - pz) * 180) / Math.PI;
console.log(`pool->plaza bearing: ${bdeg.toFixed(1)} deg (0=N, +E)`);
