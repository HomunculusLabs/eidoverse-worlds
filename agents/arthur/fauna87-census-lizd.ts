// fauna87-census-lizd.ts — READ-ONLY grounding for the fauna-87 build tick:
// (1) census total + ZERO-reptile re-verify (fauna-86 proposal law, re-run
// fresh per magpi law); (2) the LIVE kiln host tuple + lib (artwalk-39
// hard-gate source); (3) fetch the SERVED kiln bytes to /tmp for the
// render rig (struct-104 served-bytes law — served is a DRACO re-encode,
// structure-preserving; the render composite MUST use the served bytes so
// the decode/seat derive from the geometry actually standing); (4) the
// kiln co-resident table (light companion, sign rider, heat-contours
// rider, neighbors) for the SAT set. NO mutation of any kind.
import { readFileSync, writeFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const die = (s: string): never => { throw Error(s); };

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(25_000) });
if (!r.ok) die(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];
console.log("census total:", ents.length);

// (1) zero-reptile re-verify
const pat = /lizd|lizard|zootoca|lacert|snake|natrix|slowworm|reptil/i;
const idHits = ents.filter((e) => pat.test(e.id));
const libHits = ents.filter((e) => pat.test(String(e.lib ?? "")));
if (idHits.length || libHits.length) die(`reptile slot no longer open: ids ${JSON.stringify(idHits.map((e) => e.id))} libs ${JSON.stringify(libHits.map((e) => e.id))}`);
console.log("reptile slot: OPEN (zero ids + libs, regex /lizd|lizard|zootoca|lacert|snake|natrix|slowworm|reptil/i)");

// (2) live kiln host
const kiln = ents.find((e) => e.id === "nx-town-kiln");
if (!kiln) die("kiln absent from census");
console.log("kiln:", JSON.stringify({ pos: kiln.pos, yaw: kiln.yaw, lib: kiln.lib, scale: kiln.scale, bbox: kiln.bbox }));
if (!String(kiln.lib).includes("3e96c8b0")) console.log("NOTE: live kiln lib is NOT 3e96c8b0 — proposal pin stale, live value above is LAW");

// (3) served bytes fetch
{
  const rb = await fetch(`${base}/library/${kiln.lib}`, { signal: AbortSignal.timeout(30_000) });
  if (!rb.ok) die(`library ${rb.status}`);
  const bytes = new Uint8Array(await rb.arrayBuffer());
  writeFileSync("/tmp/fauna87-kiln-served.glb", bytes);
  const { createHash } = await import("node:crypto");
  const sha = createHash("sha256").update(bytes).digest("hex");
  console.log("served kiln bytes:", sha.slice(0, 16), "(" + bytes.length + "B) -> /tmp/fauna87-kiln-served.glb");
}

// (4) co-resident table: everything within 12m of the kiln center
const kx = kiln.pos[0], kz = kiln.pos[2];
const near = ents
  .filter((e) => e.id !== "nx-town-kiln")
  .map((e) => ({ id: e.id, d: Math.hypot(e.pos[0] - kx, e.pos[2] - kz), pos: e.pos, yaw: e.yaw, lib: e.lib, bbox: e.bbox?.size }))
  .filter((e) => e.d < 12)
  .sort((a, b) => a.d - b.d);
console.log("co-residents (<12m):");
const yawStr = (y: any) => (typeof y === "number" ? y.toFixed(3) : String(y));
for (const e of near) console.log("  " + e.id + " @ " + e.d.toFixed(2) + "m pos " + JSON.stringify(e.pos) + " yaw " + yawStr(e.yaw) + " lib " + e.lib + " bbox " + JSON.stringify(e.bbox));
