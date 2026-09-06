// dress7-forest-decode.ts — fetch forest-0044 live lib + census tuple.
// READ-ONLY diagnostic for the source-true exemption decision.
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
const d: any = await r.json();
writeFileSync("/tmp/dress7/census.json", JSON.stringify(d));
for (const e of d.entities ?? []) {
  if (["nx-wild-forest-0044", "nx-wild-forest-0057", "nx-wild-cairn-0043"].includes(e.id)) {
    console.log(e.id, e.lib, JSON.stringify(e.pos), "yaw", e.yaw, "scale", e.scale);
    const glb = await fetch(`${base}/${e.lib}`);
    if (glb.ok) {
      const buf = Buffer.from(await glb.arrayBuffer());
      writeFileSync(`/tmp/dress7/${e.id}.glb`, buf);
      console.log(`  fetched ${e.lib} ${buf.length}B -> /tmp/dress7/${e.id}.glb`);
    } else console.log(`  fetch ${e.lib} HTTP ${glb.status}`);
  }
}
