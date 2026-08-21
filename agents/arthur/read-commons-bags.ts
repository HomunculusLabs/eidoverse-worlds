// read-commons-bags.ts — nv-2 prep: dump live comp bags from commons (read-only).
// Law: re-read live bags from commons /geom fresh — never trust prose over the live bag.
// Also dumps av-plaza-l light params verbatim for the nx-plaza-l copy.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons`);
if (!r.ok) { console.log("GEOM FAIL", r.status); process.exit(1); }
const d = await r.json() as { entities: any[] };
const byId = Object.fromEntries(d.entities.map((e: any) => [e.id, e]));
const WANT = ["av-carousel", "av-plaza-hearth", "av-welcome", "av-plaza-l"];
for (const id of WANT) {
  const e = byId[id];
  if (!e) { console.log(`\n=== ${id}: NOT FOUND`); continue; }
  console.log(`\n=== ${id} ===`);
  console.log(JSON.stringify(e, null, 1));
}
// also: any light entities near the plaza in commons-next reference frame (0,0)
console.log("\n=== commons light-type entities (for lamp reference) ===");
for (const e of d.entities) {
  const s = JSON.stringify(e);
  if (/"type"\s*:\s*"light"/.test(s) || /-l\b/.test(e.id)) console.log(e.id, JSON.stringify(e.pos), s.length > 600 ? s.slice(0, 600) + "…" : s);
}
