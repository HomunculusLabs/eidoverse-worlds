// fauna66-census-guinea.ts — PROPOSAL-TICK grounding probe (READ-ONLY).
// 1. fresh census total; 2. zero-guinea/numidid check across ids AND libs
// (magpie fauna-57 proposal law); 3. farmyard geography — the candidate
// zone's hosts + co-residents + plaza-spoke bearing (reader-bearing
// clean-slate law, fauna-61 law a). Zero verbs, zero uploads.
const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse((await Bun.file(`${R}/agents/arthur/config.json`).text()));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities;
console.log("census total:", ents.length);
// zero-guinea check: ids and libs
const gid = ents.filter((e) => /guine|numid|gfowl/i.test(e.id));
const glib = ents.filter((e) => /guine|numid|gfowl/i.test(String(e.lib ?? "")));
console.log("guinea id hits:", gid.length, JSON.stringify(gid.map((e) => e.id)));
console.log("guinea lib hits:", glib.length);
// farmyard seating table — the poultry yard's hosts and co-residents
const ids = ["nx-town-coop", "nx-dress-hens", "nx-dress-rooster-001", "nx-dress-hutch", "nx-dress-turkey-001", "nx-dress-cat-001", "nx-dress-wrabbit-001", "nx-town-stable", "nx-dress-shorse-001", "nx-town-garden-cottage", "nx-roads", "nx-town-roads"];
for (const id of ids) {
  const e = ents.find((x) => x.id === id);
  if (!e) { console.log(`  ${id}: ABSENT`); continue; }
  console.log(`  ${id}: pos [${e.pos.map((n: number) => n.toFixed(3)).join(", ")}] yaw ${e.yaw.toFixed(4)} lib ${String(e.lib).slice(0, 24)} bbox ${e.bbox ? e.bbox.size.map((n: number) => n.toFixed(2)).join("x") : "none"}`);
}
// co-resident collision set within 22m of the yard centroid (~41.5, -8)
const near = ents.filter((e) => {
  if (!e.pos) return false;
  const dx = e.pos[0] - 41.5, dz = e.pos[2] + 8;
  return Math.hypot(dx, dz) < 22 && !ids.includes(e.id);
}).map((e) => `${e.id} @(${e.pos[0].toFixed(1)},${e.pos[2].toFixed(1)})`);
console.log("yard 22m co-residents:", JSON.stringify(near, null, 0));
// plaza bearing from the yard centroid (reader-bearing clean-slate)
const px = 41.5, pz = -8;
const bdeg = (Math.atan2(0 - px, 0 - pz) * 180) / Math.PI;
console.log(`yard->plaza bearing: ${bdeg.toFixed(1)} deg (0=N, +E)`);
