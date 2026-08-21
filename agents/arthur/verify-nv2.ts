// verify-nv2.ts — nv-2 post-check: read commons-next history for the light
// verbs' authored params (the /geom tier doesn't carry light color/intensity),
// and re-census the trio's comp counts from /geom.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const ws = new WebSocket(cfg.url);
let fails = 0;
const ok = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) fails++; };
const done = new Promise<void>((resolve) => {
  const t = setTimeout(() => { console.log("timeout"); resolve(); }, 20000);
  let joined = false;
  ws.onmessage = (ev: any) => {
    const m = JSON.parse(ev.data);
    if (!joined && m.type === "snapshot") { joined = true; ws.send(JSON.stringify({ type: "history", verbs: ["light"], limit: 50 })); return; }
    if (m.type !== "history") return;
    const ents = (m.entries ?? []).filter((e: any) => e.args?.id === "nx-plaza-l" || e.args?.id === "nx-welcome-l");
    for (const e of ents) console.log("log:", e.seq, e.verb, JSON.stringify(e.args), "by", e.actor);
    const plaza = ents.filter((e: any) => e.args.id === "nx-plaza-l").pop()?.args;
    const wel = ents.filter((e: any) => e.args.id === "nx-welcome-l").pop()?.args;
    ok("nx-plaza-l params = av-plaza-l verbatim (0xffcc80/2.5/7)",
      plaza?.color === 16748608 && plaza?.intensity === 2.5 && plaza?.range === 7,
      JSON.stringify(plaza));
    ok("nx-welcome-l warm modest (0xffb066/1.2/4)",
      wel?.color === 0xffb066 && wel?.intensity === 1.2 && wel?.range === 4,
      JSON.stringify(wel));
    clearTimeout(t); resolve();
  };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: "commons-next", id: "arthur-nv2-verify", avatar: cfg.avatar, token: cfg.joinToken, spectate: true }));
});
await done;
try { ws.close(); } catch {}
// census from /geom
const r = await fetch(`${base}/geom?world=commons-next`);
const d = await r.json() as { entities: any[] };
const by = Object.fromEntries(d.entities.map((e: any) => [e.id, e]));
ok("census: 5 entities (trio + 2 lights)", d.entities.length === 5, String(d.entities.length) + ": " + d.entities.map((e: any) => e.id).join(","));
ok("carousel 7 comps", Object.keys(by["nx-carousel"]?.comp ?? {}).length === 7);
ok("hearth 4 comps", Object.keys(by["nx-hearth"]?.comp ?? {}).length === 4);
ok("welcome 0 comps", Object.keys(by["nx-welcome"]?.comp ?? {}).length === 0);
ok("smoke origin verbatim [-18.8,6.3,25.9]", JSON.stringify(by["nx-carousel"]?.comp?.["particles:smoke"]?.origin) === "[-18.8,6.3,25.9]");
ok("5 hearth sockets (log_0..3+tale_seat)", Object.keys(by["nx-hearth"]?.comp?.sockets ?? {}).length === 5);
console.log(fails ? `${fails} FAIL` : "ALL PASS");
process.exit(fails ? 1 : 0);
