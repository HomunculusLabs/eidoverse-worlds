// fauna87-kiln-id.ts — read-only: resolve the true kiln entity id + tuple.
const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse((await Bun.file(`${R}/agents/arthur/config.json`).text()));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw Error("geom " + r.status);
const d: any = await r.json();
const hits = d.entities.filter((e: any) => /kiln/i.test(String(e.id)) || /kiln/i.test(String(e.lib ?? "")));
for (const e of hits) console.log(JSON.stringify({ id: e.id, lib: e.lib, pos: e.pos, yaw: e.yaw, bbox: e.bbox?.size }));
console.log("KILN_ID_DONE");
