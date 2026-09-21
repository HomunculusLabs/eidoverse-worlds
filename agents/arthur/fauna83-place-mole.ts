// fauna83-place-mole.ts — place nx-dress-mole-001 (European mole v7, sha
// 31717975…) at the final swept seat (-24.5, 0.01447, 26.5) yaw
// -0.94119265 (2.2004 - pi: the dig-line axis matches the cottage facing
// but the NOSE faces the N/NW reader approach — the round-3 judge catch).
// Chassis: fauna81-place-rat.ts — upload (?token&name&by, 429 paced),
// WS join-then-verbs-on-first-snapshot, idempotent rerun, tuple verify.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import WebSocket from "ws";

const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const ID = "nx-dress-mole-001";
const FILE = "agents/arthur/assets/village_dress_mole1.glb";
const bytes = new Uint8Array(readFileSync(`${R}/${FILE}`));
const SHA = "31717975fcc5323b2908c903bb64a3dba41c881bb6f4ac98c00bc27b2676638d";
const LIB = "store/" + SHA.slice(0, 16) + ".glb";
const POS = [-24.5, 0.01447, 26.5], YAW = 2.2004 - Math.PI, SCALE = 1;
const W = "commons-next";
const base = cfg.url.replace(/ws(s?):\/\//, "http$1://").replace(/\/ws$/, "");
const die = (s: string): never => { throw Error(s); };
if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("mole bytes drift");

// motion comps — mirrored verbatim in fauna83-render-mole.ts (the same
// payloads drove the engine-true motion pairs + the judge-arc renders).
// Moles are slow: long periods, tiny amps; phases staggered (fauna law).
const T0 = Date.now();
const MOTION = {
  "motion:mole": { type: "bob", amp: 0.002, period: 5.2, phase: 0.0, t0: T0 },          // earth-breath
  "motion:mole_head": { type: "bob", amp: 0.006, period: 8.5, phase: 0.3, t0: T0 },     // slow scan
  "motion:mole_snout": { type: "bob", amp: 0.003, period: 2.8, phase: 0.9, t0: T0 },    // sniff
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  return (await r.json()) as any;
}

const near = (a: number, b: number) => Math.abs(a - b) < 1e-4;
const atWant = (e: any) => e && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && near(e.scale ?? 1, SCALE);
function vec(a: any, b: number[]) { return Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i])); }

const g0 = await geom();
const before = g0.entities as any[];
const e0 = before.find((e: any) => e.id === ID);
const compsOk = (e: any) => e && Object.entries(WANT).every(([k, m]) => {
  const got = (e.comp ?? {})[k];
  const { t0: _g, ...grest } = got ?? {};
  const { t0: _w, ...wrest } = m as any;
  void _g; void _w;
  return eq(grest, wrest) && typeof (got as any)?.t0 === "number" && (got as any).t0 > 0;
});
function eq(a: any, b: any) { return JSON.stringify(a) === JSON.stringify(b); }
const already = e0 && atWant(e0) && e0.lib === LIB && compsOk(e0);
if (already) {
  console.log("PLACED_VERIFIED already live at exact tuple + comps — no verbs");
  process.exit(0);
}
if (e0 && !(e0.lib === LIB)) die(`id collision: lib ${e0.lib} != ${LIB}`);
console.log("census before:", before.length, "| target:", e0 ? "present" : "absent");

let verbs: Array<[string, any]> = [];
{
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next European mole fauna-83");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await Bun.sleep(25_000); continue; }
    die(`upload ${r.status}`);
  }
  if (lib !== LIB) die(`upload path ${lib}`);
  if (e0) verbs.push(["remove", { id: ID }]); // interrupted-batch recovery only
  verbs.push(["spawn", { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: SCALE }]);
  for (const [type, data] of Object.entries(MOTION)) verbs.push(["comp", { id: ID, type, data }]);
}

if (verbs.length) {
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", id: "arthur-fauna83-place", world: W, token: cfg.joinToken, avatar: cfg.avatar })));
    ws.on("error", reject);
    ws.on("message", (m: any) => {
      const d = JSON.parse(m.toString());
      if (!(d.type === "snapshot" || d.state)) return;
      let i = 0;
      for (const v of verbs) {
        setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: v[0], args: v[1] })), 600 * (++i));
      }
      setTimeout(() => { ws.close(); resolve(); }, 600 * (verbs.length + 3));
    });
    setTimeout(() => reject(Error("ws timeout")), 30_000);
  });
}

const g1 = await geom();
const e1 = (g1.entities as any[]).find((e: any) => e.id === ID);
const after = (g1.entities as any[]).length;
console.log("census after:", after, "| target:", e1 ? "live" : "MISSING");
if (!atWant(e1)) die(`tuple mismatch: ${e1?.pos} ${e1?.yaw}`);
if (e1.lib !== LIB) die(`lib mismatch ${e1.lib}`);
if (!compsOk(e1)) die(`comps mismatch: ${JSON.stringify(e1?.comps)}`);
console.log("PLACED_VERIFIED", ID, POS.join(","), "yaw", YAW, "| comps", Object.keys(MOTION).length);
process.exit(0);
