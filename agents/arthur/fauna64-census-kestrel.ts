// fauna64-census-kestrel.ts — PROPOSAL-TICK grounding probe (READ-ONLY).
// 1. fresh census total; 2. zero-kestrel/falcon/diurnal-raptor check across
// ids AND libs (magpie fauna-57 proposal law); 3. SE wild-edge geography —
// the candidate hover zone's neighbors + plaza-spoke bearing (reader-bearing
// clean-slate law, fauna-61 law a). Zero verbs, zero uploads.
const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse((await Bun.file(`${R}/agents/arthur/config.json`).text()));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities;
console.log("census total:", ents.length);
// zero-kestrel/falcon check: ids and libs (raptor-day class)
const kestId = ents.filter((e) => /kestrel|kest|falcon|falconid|hobby|merlin/i.test(e.id));
const kestLib = ents.filter((e) => /kestrel|kest|falcon|falconid|hobby|merlin/i.test(String(e.lib ?? "")));
console.log("kestrel/falcon id hits:", kestId.length, JSON.stringify(kestId.map((e) => e.id)));
console.log("kestrel/falcon lib hits:", kestLib.length);
// standing raptor/air fauna (the guild table)
const ids = ["nx-dress-owl-001", "nx-dress-towl-001", "nx-dress-swallows-001", "nx-dress-bees-001", "nx-dress-se-fox-001", "nx-dress-pheas-001", "nx-dress-deer-001", "nx-dress-se-snagdead-001", "nx-dress-woodp-001"];
for (const id of ids) {
  const e = ents.find((x) => x.id === id);
  if (!e) { console.log(`  ${id}: ABSENT`); continue; }
  console.log(`  ${id}: pos [${e.pos.map((n: number) => n.toFixed(3)).join(", ")}] yaw ${e.yaw.toFixed(4)} lib ${String(e.lib).slice(0, 24)} bbox ${e.bbox ? e.bbox.size.map((n: number) => n.toFixed(2)).join("x") : "none"}`);
}
// SE wild-edge co-residents near the candidate hover zone (55,-30 ±20m)
const near = ents.filter((e) => {
  if (!e.pos) return false;
  const dx = e.pos[0] - 55, dz = e.pos[2] + 30;
  return Math.hypot(dx, dz) < 20 && !ids.includes(e.id);
}).map((e) => `${e.id} @(${e.pos[0].toFixed(1)},${e.pos[2].toFixed(1)}) h${e.pos[1].toFixed(2)}`);
console.log("SE-edge 20m co-residents:", JSON.stringify(near, null, 0));
// plaza bearing from the candidate zone (reader-bearing clean-slate)
const px = 55, pz = -30;
const bdeg = (Math.atan2(0 - px, 0 - pz) * 180) / Math.PI;
console.log(`zone->plaza bearing: ${bdeg.toFixed(1)} deg (0=N, +E)`);
