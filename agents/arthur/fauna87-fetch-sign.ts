// fauna87-fetch-sign.ts — read-only: fetch the kiln sign + heat-contour
// served bytes for the extended composite; print their census bbox
// min/max/center (local frame) for exact 3D seat-clearance arithmetic.
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const cfg = JSON.parse(await Bun.file("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json").text());
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw Error("geom " + r.status);
const d: any = await r.json();
for (const id of ["nx-sign-kiln-001", "nx-artwalk-b12-kiln-heat-contours"]) {
  const e = d.entities.find((x: any) => x.id === id);
  if (!e?.lib) throw Error(id + " absent/no lib");
  const rb = await fetch(`${base}/library/${e.lib}`);
  if (!rb.ok) throw Error("lib " + rb.status);
  const buf = new Uint8Array(await rb.arrayBuffer());
  const sha = createHash("sha256").update(buf).digest("hex").slice(0, 16);
  writeFileSync(`/tmp/fauna87-${id}.glb`, buf);
  console.log(id, "lib", e.lib, "served sha16", sha, "pos", JSON.stringify(e.pos), "yaw", e.yaw);
  console.log("  bbox", JSON.stringify(e.bbox));
}
console.log("SIGN_FETCH_DONE");
