// fauna57-census-inn.ts — live census dump for the fauna-57 magpie build
// tick: inn + companions + every solid/film in the inn-yard apron zone
// (x 24..50, z -14..14), plus the local inn bytes hash check vs live lib.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];
console.log("census total:", ents.length);
const zone = ents.filter((e: any) => 24 <= e.pos[0] && e.pos[0] <= 50 && -14 <= e.pos[2] && e.pos[2] <= 14);
for (const e of zone.sort((a: any, b: any) => a.pos[0] - b.pos[0])) {
  const bb = e.bbox;
  const sz = bb ? bb.size.map((v: number) => +v.toFixed(2)) : null;
  console.log(
    e.id.padEnd(44),
    "pos", e.pos.map((v: number) => +v.toFixed(3)),
    "yaw", +e.yaw.toFixed(3),
    "sz", JSON.stringify(sz),
    "lib", String(e.lib ?? "").slice(0, 22),
  );
}
// local inn bytes
for (const f of ["village_inn3.glb", "village_inn.glb", "village_inndoor3.glb"]) {
  try {
    const b = readFileSync(`/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/${f}`);
    console.log("local", f, createHash("sha256").update(b).digest("hex").slice(0, 16));
  } catch { /* absent */ }
}
// magpie/corvid presence check (domain grounding for the proposal)
const rx = /magpi|corv|rook|jackdaw|raven|\bcrow\b|jay/i;
const hits = ents.filter((e: any) => rx.test(e.id) || rx.test(String(e.lib ?? "")));
console.log("magpie/corvid census hits:", hits.length, hits.map((h: any) => h.id));
