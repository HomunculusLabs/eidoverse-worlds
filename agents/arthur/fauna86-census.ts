// fauna86-census.ts — READ-ONLY proposal grounding for the next species
// candidate (FAUNA-PLAN queue EMPTY after fauna-85; domain law = propose ONE):
// (a) fresh entity census + multi-family zero-check across ids AND libs for
//     the genuinely-open class/order candidates (magpie fauna-57 proposal
//     law, substring-aware — report hits for classification):
//     REPTILIA (lizard/zootoca/lacert/snake/natrix/slowworm/anguis),
//     ODONATA (dragonfl/anisoptera/anax/sympetrum/libellula/hawker/darter),
//     SORICIDAE (shrew/soric), FRINGILLIDAE (finch/goldfinch/chaffinch/
//     carduelis/fringill);
// (b) stone/sunny host table for a basking-reptile seat (kiln ring, temple,
//     labyrinth, screwwell, well, quarry faces, watchpost, cairns/stones)
//     with live tuple + lib + bbox — the frame-copy-rider vs ground-seat
//     decision source (woodpecker-on-snag fauna-59 class);
// (c) the reedpool host tuple (the dragonfly frame-copy alternative anchor).
// ZERO mutations.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];
console.log(`CENSUS ${ents.length} entities (commons-next)`);

// (a) family zero-checks (substring-aware)
const fams: Record<string, RegExp> = {
  REPTILIA: /lizard|zootoca|lacert|viper|snake|natrix|slowworm|anguis|reptil/i,
  ODONATA: /dragonfl|odonat|anisoptera|anax|sympetrum|libellula|hawker|darter/i,
  SORICIDAE: /shrew|soric|neomys/i,
  FRINGILLIDAE: /finch|fringill|carduelis|chloris/i,
};
for (const [fam, pat] of Object.entries(fams)) {
  const idHits = ents.filter((e: any) => pat.test(e.id || ""));
  const libHits = ents.filter((e: any) => pat.test(e.lib || ""));
  console.log(`\n${fam}: id hits ${idHits.length}, lib hits ${libHits.length} (both must be 0 for an open slot)`);
  for (const e of idHits) console.log(`  id-hit: ${e.id} @ (${e.pos[0]},${e.pos[2]})`);
  for (const e of libHits) console.log(`  lib-hit: ${e.lib}`);
}

// (b) stone/sunny host table (basking-seat candidates)
console.log(`\nSTONE/SUNNY HOST CANDIDATES (basking-seat decision source):`);
const hostPat = /kiln|temple|labyrinth|screwwell|well|quarr|watchpost|stone|cairn|step|plinth|altar|mill/i;
const hosts = ents.filter((e: any) => hostPat.test(e.id || ""));
for (const e of hosts.slice(0, 40)) {
  const bb = e.bbox ? e.bbox.size.map((v: number) => v.toFixed(2)).join("x") : "none";
  console.log(`  ${e.id} @ (${e.pos[0].toFixed(2)},${e.pos[1].toFixed(3)},${e.pos[2].toFixed(2)}) yaw ${(+e.yaw).toFixed(3)} lib ${(e.lib || "").slice(0, 24)} bbox ${bb}`);
}
console.log(`  (${hosts.length} matches shown ${Math.min(hosts.length, 40)})`);

// (c) reedpool host (dragonfly alternative anchor)
const POOL = ents.find((e: any) => /reedpool|fieldpond/.test(e.id || ""));
if (POOL) console.log(`\nPOOL HOST: ${POOL.id} @ (${POOL.pos[0].toFixed(3)},${POOL.pos[1].toFixed(5)},${POOL.pos[2].toFixed(3)}) yaw ${POOL.yaw} lib ${POOL.lib} bbox ${POOL.bbox ? POOL.bbox.size.map((v: number) => v.toFixed(2)).join("x") : "none"}`);
else console.log(`\nPOOL HOST: none found`);

// tick epoch: newest sibling commits touching the world (context only)
const ids = ents.length;
console.log(`\nDONE read-only — ${ids} entities, zero mutations`);
