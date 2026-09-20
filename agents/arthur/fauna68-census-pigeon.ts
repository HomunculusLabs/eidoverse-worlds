// fauna68-census-pigeon.ts — PROPOSAL-TICK grounding probe (READ-ONLY).
// 1. fresh census total; 2. zero-FREE-STANDING-columbid check across ids AND
// libs (magpie fauna-57 proposal law) — the dovecote's baked dove trio
// (fauna-16) is a HOST STRUCTURE, not a free-standing species entity;
// 3. market/plaza geography — candidate zone hosts + co-residents + grain-
// chain anchors (reader-bearing clean-slate law, fauna-61 law a).
// Zero verbs, zero uploads.
const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse((await Bun.file(`${R}/agents/arthur/config.json`).text()));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities;
console.log("census total:", ents.length);
// columbid check: ids and libs (pigeon/dove/columb). The dovecote host is
// EXPECTED to hit — its doves are baked into the structure GLB (fauna-16).
const cid = ents.filter((e) => /columb|pigeon|dovepig|woodpig|stockdov|rockdov/i.test(e.id));
const clib = ents.filter((e) => /columb|pigeon/i.test(String(e.lib ?? "")));
const doveHosts = ents.filter((e) => /dove/i.test(e.id));
console.log("columbid id hits (strict):", cid.length, JSON.stringify(cid.map((e) => e.id)));
console.log("columbid lib hits:", clib.length, JSON.stringify(clib.map((e) => e.id)));
console.log("dove-name hosts (baked-trio class):", JSON.stringify(doveHosts.map((e) => `${e.id} @(${e.pos[0].toFixed(1)},${e.pos[2].toFixed(1)})`)));
// grain-chain anchors (the pigeon's food story)
const grainIds = ["nx-dress-harvestcart", "nx-town-windmill", "nx-dress-mill", "nx-town-granary", "nx-dress-granary", "nx-dress-churn", "nx-dress-milkstand"];
for (const id of grainIds) {
  const e = ents.find((x) => x.id === id);
  if (!e) { console.log(`  ${id}: ABSENT`); continue; }
  console.log(`  ${id}: pos [${e.pos.map((n: number) => n.toFixed(3)).join(", ")}] yaw ${e.yaw.toFixed(4)} lib ${String(e.lib).slice(0, 24)} bbox ${e.bbox ? e.bbox.size.map((n: number) => n.toFixed(2)).join("x") : "none"}`);
}
// market/plaza core: every entity within r<30 of origin, compact table
const core = ents
  .filter((e) => e.pos && Math.hypot(e.pos[0], e.pos[2]) < 30)
  .sort((a, b) => Math.hypot(a.pos[0], a.pos[2]) - Math.hypot(b.pos[0], b.pos[2]));
console.log(`\nplaza core r<30 (${core.length} entities):`);
for (const e of core) {
  console.log(`  ${e.id} @(${e.pos[0].toFixed(1)},${e.pos[2].toFixed(1)}) r${Math.hypot(e.pos[0], e.pos[2]).toFixed(1)} yaw ${e.yaw.toFixed(2)} ${e.bbox ? e.bbox.size.map((n: number) => n.toFixed(1)).join("x") : "-"}`);
}
// market-adjacent co-residents within 25m of the civic-ring centroid (~0,-10 S ring guess → use banner/market pos from output)
// (derived after seeing the table; this probe prints the raw material)
