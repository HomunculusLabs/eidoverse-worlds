// fauna72-census-hare.ts — PROPOSAL-TICK grounding probe (READ-ONLY).
// 1. fresh census total; 2. zero-hare/lepus check across ids AND libs
// (magpie fauna-57 proposal law); 3. lagomorph precedent table (hutch
// domestic + wrabbit wild — the distinction the hare completes); 4. open-
// meadow/fallow habitat candidates (co-resident load per zone, the
// one-species-per-habitat instinct); 5. reader-spoke bearings from the
// two best candidate zones (clean-slate bearing law, fauna-61 law a).
// Zero verbs, zero uploads.
const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse((await Bun.file(`${R}/agents/arthur/config.json`).text()));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities;
console.log("census total:", ents.length);

// 2. hare/lepus check: ids and libs.
const hid = ents.filter((e) => /hare|lepus|lagom/i.test(e.id));
const hlib = ents.filter((e) => /hare|lepus|lagom/i.test(String(e.lib ?? "")));
console.log("hare id hits:", hid.length, JSON.stringify(hid.map((e) => e.id)));
console.log("hare lib hits:", hlib.length, JSON.stringify(hlib.map((e) => e.id)));

// related absence checks (stoat/weasel — alternate candidates, for the record)
const mus = ents.filter((e) => /stoat|weasel|ermine/i.test(e.id + " " + String(e.lib ?? "")));
console.log("stoat/weasel hits (for the record):", mus.length);

// 3. lagomorph precedents — scale/distinction table.
console.log("\nlagomorph precedents:");
for (const id of ["nx-dress-hutch", "nx-dress-wrabbit-001"]) {
  const e = ents.find((x) => x.id === id);
  if (!e) { console.log(`  ${id}: ABSENT`); continue; }
  console.log(`  ${id}: @(${e.pos[0].toFixed(2)}, ${e.pos[2].toFixed(2)}) py ${e.pos[1].toFixed(3)} yaw ${e.yaw.toFixed(3)} bbox ${e.bbox ? e.bbox.size.map((n: number) => n.toFixed(2)).join("x") : "-"} lib ${String(e.lib).slice(5, 21)}`);
}

// 4. candidate open-meadow zones — co-resident load within 25m of each center.
const zones: [string, number, number][] = [
  ["N gallery-ring meadow (garden cottage N margin)", -26, 30],
  ["E fallow margin (cow/pig meadow N edge, mosaic-row gap)", 24, 30],
  ["SW meadow S reach (beyond donkey/fold)", -24, -42],
  ["NW hedge-adjacent margin (cultivation edge)", -30, 50],
];
for (const [name, zx, zz] of zones) {
  const near = ents.filter((e) => e.pos && Math.hypot(e.pos[0] - zx, e.pos[2] - zz) < 25)
    .sort((a, b) => Math.hypot(a.pos[0] - zx, a.pos[2] - zz) - Math.hypot(b.pos[0] - zx, b.pos[2] - zz));
  console.log(`\nzone "${name}" center (${zx},${zz}): ${near.length} entities within 25m — nearest 8:`);
  for (const e of near.slice(0, 8)) {
    console.log(`  ${e.id} @(${e.pos[0].toFixed(1)},${e.pos[2].toFixed(1)}) d${Math.hypot(e.pos[0] - zx, e.pos[2] - zz).toFixed(1)} ${e.bbox ? e.bbox.size.map((n: number) => n.toFixed(1)).join("x") : "-"}`);
  }
  const brg = (Math.atan2(-zz, -zx) * 180) / Math.PI;
  console.log(`  seat->plaza bearing ${brg.toFixed(1)} deg; r ${Math.hypot(zx, zz).toFixed(1)}m`);
}
