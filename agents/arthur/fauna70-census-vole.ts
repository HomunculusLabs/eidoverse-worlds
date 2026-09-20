// fauna70-census-vole.ts — PROPOSAL-TICK grounding probe (READ-ONLY).
// 1. fresh census total; 2. zero-vole/arvicoline check across ids AND libs
// (magpie fauna-57 proposal law); 3. kestrel entity + ground furniture
// (the vole grass host — fauna-65's own siting prose names it); 4. SE
// wild-edge co-resident table around the kestrel seat (predator-prey
// theater distances); 5. reader-spoke bearing from the candidate zone
// (clean-slate bearing law, fauna-61 law a). Zero verbs, zero uploads.
const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse((await Bun.file(`${R}/agents/arthur/config.json`).text()));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities;
console.log("census total:", ents.length);

// arvicoline check: ids and libs (vole / arvicola / microtus).
const vid = ents.filter((e) => /vole|arvic|microt/i.test(e.id));
const vlib = ents.filter((e) => /vole|arvic|microt/i.test(String(e.lib ?? "")));
console.log("vole id hits:", vid.length, JSON.stringify(vid.map((e) => e.id)));
console.log("vole lib hits:", vlib.length, JSON.stringify(vlib.map((e) => e.id)));

// kestrel entity — the predator host of the candidate zone
const kestrel = ents.find((e) => e.id === "nx-dress-kestr-001");
if (!kestrel) throw Error("kestrel absent — proposal zone anchor missing");
console.log(`\nKESTREL nx-dress-kestr-001: pos [${kestrel.pos.map((n: number) => n.toFixed(3)).join(", ")}] yaw ${kestrel.yaw.toFixed(4)} lib ${String(kestrel.lib).slice(0, 24)} bbox ${kestrel.bbox ? kestrel.bbox.size.map((n: number) => n.toFixed(2)).join("x") : "none"}`);
const kx = kestrel.pos[0], kz = kestrel.pos[2];

// SE wild-edge co-residents within 35m of the kestrel ground seat
const near = ents
  .filter((e) => e.pos && e.id !== "nx-dress-kestr-001" && Math.hypot(e.pos[0] - kx, e.pos[2] - kz) < 35)
  .sort((a, b) => Math.hypot(a.pos[0] - kx, a.pos[2] - kz) - Math.hypot(b.pos[0] - kx, b.pos[2] - kz));
console.log(`\nco-residents within 35m of the kestrel seat (${near.length}):`);
for (const e of near.slice(0, 22)) {
  const dx = e.pos[0] - kx, dz = e.pos[2] - kz;
  console.log(`  ${e.id} @(${e.pos[0].toFixed(1)},${e.pos[2].toFixed(1)}) d${Math.hypot(dx, dz).toFixed(1)} yaw ${e.yaw.toFixed(2)} ${e.bbox ? e.bbox.size.map((n: number) => n.toFixed(1)).join("x") : "-"}`);
}

// reader-spoke bearing from the kestrel seat to the plaza (0,0) — clean-slate law
const bearing = (Math.atan2(-kz, -kx) * 180) / Math.PI; // direction seat->plaza
console.log(`\nseat->plaza bearing: ${bearing.toFixed(1)} deg (dx ${(-kx).toFixed(1)}, dz ${(-kz).toFixed(1)}); r = ${Math.hypot(kx, kz).toFixed(1)}m`);

// rodent/mouse co-resident scale check (hmou precedent sizes for the bake)
for (const id of ["nx-dress-hmou-001", "nx-dress-dmou-001", "nx-dress-pheas-001", "nx-dress-se-snagdead-001", "nx-dress-woodp-001", "nx-dress-deer-001"]) {
  const e = ents.find((x) => x.id === id);
  if (!e) { console.log(`  ${id}: ABSENT`); continue; }
  console.log(`  ${id}: @(${e.pos[0].toFixed(2)},${e.pos[2].toFixed(2)}) r-from-kestrel ${Math.hypot(e.pos[0] - kx, e.pos[2] - kz).toFixed(2)}m bbox ${e.bbox ? e.bbox.size.map((n: number) => n.toFixed(2)).join("x") : "-"}`);
}
