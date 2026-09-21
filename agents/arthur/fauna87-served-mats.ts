// fauna87-served-mats.ts — decisive probe: what materials do the LIVE
// store's served bytes carry for the placed woodpecker (fauna-59) and
// the placed rat (fauna-81)? If the store re-encode MATERIALIZES
// COLOR_0-only GLBs (metal 0), the lizd upload path is safe as-built;
// if it preserves no-material, the whole dress fleet renders
// metalness-1 in every client and the fix belongs in glbwrite.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const die = (m: string): never => { throw Error(m); };

const res = await fetch("https://eidoverse.billding.dev/geom?world=commons-next");
if (!res.ok) die("geom fetch " + res.status);
const j: any = await res.json();
const ents: any[] = Object.values(j.entities ?? j);
const targets = ents.filter((e) => /woodp|rat-|rat1|-rat/.test(String(e.id)) || /woodp|rat/.test(String(e.lib ?? "")));
if (!targets.length) die("no woodp/rat entities in census");
for (const t of targets.slice(0, 6)) {
  console.log("entity", t.id, "lib", t.lib);
  const r2 = await fetch("https://eidoverse.billding.dev/library/" + t.lib);
  if (!r2.ok) { console.log("  lib fetch failed", r2.status); continue; }
  const buf = Buffer.from(await r2.arrayBuffer());
  const sha = createHash("sha256").update(buf).digest("hex").slice(0, 16);
  const jl = buf.readUInt32LE(12);
  const json = JSON.parse(buf.slice(20, 20 + jl).toString("utf8"));
  const mats = (json.materials ?? []).slice(0, 8).map((m: any) => ({ n: m.name, metal: m.pbrMetallicRoughness?.metallicFactor, rough: m.pbrMetallicRoughness?.roughnessFactor }));
  const noMatPrims = (json.meshes ?? []).reduce((n: number, m: any) => n + (m.primitives?.filter((p: any) => p.material === undefined).length ?? 0), 0);
  console.log("  served sha16", sha, "bytes", buf.length, "materials", (json.materials ?? []).length, "no-material prims", noMatPrims, JSON.stringify(mats));
  writeFileSync(`/tmp/fauna87-served-${t.id}.glb`, buf);
}
console.log("SERVED_MATS_DONE");
