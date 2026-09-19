// p306-verify-served.ts — polish-306 served-bytes proof (struct-104 law):
// fetch the live lib's served DRACO bytes and verify the crown build's
// structure survived the re-encode (node/mesh census + KEEP anchors).
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
const base = "https://eidoverse.billding.dev";
const SHA = "f9ceea6e82b481e5";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p306-served.glb", buf);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf.buffer, buf.byteOffset + 20, jsonLen)));
const names: string[] = (json.nodes ?? []).map((n: any) => n.name ?? "(unnamed)");
const keep = names.filter((n) => /^(bell|bell_\d|lamp)$/.test(n));
const out = {
  lib: `store/${SHA}.glb`,
  served_sha256: createHash("sha256").update(buf).digest("hex"),
  upload_sha256_prefix: SHA,
  served_is_draco_reencode: JSON.stringify(json).includes("draco"),
  nodes: json.nodes.length, meshes: (json.meshes ?? []).length,
  keepAnchors: keep,
};
console.log(JSON.stringify(out, null, 1));
if (out.nodes !== 13 || out.meshes !== 12 || keep.length !== 5 || !out.served_is_draco_reencode) process.exit(1);
console.log("SERVED_PROOF_PASS");
