// next-read-carousel-history.ts — attribution read for nvp-8 evidence.
// Spectator history read (no verbs): last comp/spawn verbs touching nx-carousel.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const ws = new WebSocket(cfg.url);
const t = setTimeout(() => { console.log("timeout"); process.exit(1); }, 25_000);
let joined = false;
const rows: any[] = [];
ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-history-read", avatar: cfg.avatar, token: cfg.joinToken, spectate: true }));
ws.onmessage = (ev: any) => {
  const m = JSON.parse(ev.data);
  if (m.type === "error") { console.log("err", JSON.stringify(m).slice(0, 200)); return; }
  if (!joined && m.type === "snapshot") {
    joined = true;
    ws.send(JSON.stringify({ type: "history", verbs: ["comp", "spawn", "place"], limit: 200 }));
    return;
  }
  if (m.type !== "history") return;
  for (const r of m.entries ?? []) {
    const a = r.args ?? r;
    if (a.id === "nx-carousel" || a.id === "arthur-nvp7-carousel" || a.id === "arthur-nvp8-smokefix") rows.push(r);
  }
  const oldest = m.oldestSeq ?? (m.entries?.[0]?.seq ?? 0);
  if (m.hasMore && oldest > 0 && rows.length < 60) {
    ws.send(JSON.stringify({ type: "history", verbs: ["comp", "spawn", "place"], limit: 200, before: oldest }));
  } else {
    clearTimeout(t);
    for (const r of rows) {
      const a = r.args ?? r;
      const origin = a.type === "particles:smoke" ? ` origin=${JSON.stringify(a.data?.origin)}` : "";
      const pos = a.pos ? ` pos=${JSON.stringify(a.pos)}` : "";
      console.log(`seq=${r.seq} by=${r.by} verb=${r.verb ?? r.type} type=${a.type ?? ""}${origin}${pos} cause=${r.cause ?? "-"}`);
    }
    try { ws.close(); } catch {}
    process.exit(0);
  }
};
ws.onerror = () => { clearTimeout(t); console.log("ws error"); process.exit(1); };
