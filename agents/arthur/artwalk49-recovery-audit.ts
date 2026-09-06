// artwalk-49 recovery audit (this tick): fresh live census →
// 1) every nx-artwalk-* rider: id, lib, pos, yaw, comp
// 2) every rider's host: live lib (census) vs placer-pinned HL (edited or committed)
// 3) b7 reseat question: live rider pos vs exact current-host-derived tuple
import { readFileSync } from "node:fs";

const R = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: Record<string, any> = Object.fromEntries(d.entities.map((e: any) => [e.id, e]));

// riders from census
const riders = Object.keys(ents).filter((id) => id.startsWith("nx-artwalk-")).sort();
console.log(JSON.stringify({ censusTotal: d.entities.length, riders: riders.length, lights: d.entities.filter((e: any) => e.kind === "light").length }));

// placer pin audit: parse HOST/H(L) from every committed next-place-artwalk-b*.ts
import { readdirSync } from "node:fs";
const dir = `${R}/agents/arthur`;
const placers = readdirSync(dir).filter((f) => /^next-place-artwalk-b\d+.*\.ts$/.test(f)).sort();
const pins: Array<{ placer: string; id: string; host: string; hl: string }> = [];
for (const f of placers) {
  const src = readFileSync(`${dir}/${f}`, "utf8");
  const id = src.match(/ID='([^']+)'/)?.[1] ?? src.match(/ID="([^"]+)"/)?.[1];
  const host = src.match(/HOST='([^']+)'/)?.[1] ?? src.match(/HOST="([^"]+)"/)?.[1];
  const hl = src.match(/HL='([^']+)'/)?.[1] ?? src.match(/HL="([^"]+)"/)?.[1];
  if (id && host && hl) pins.push({ placer: f, id, host, hl });
}
let pinOK = 0, pinStale = 0, riderMissing: string[] = [];
for (const p of pins) {
  const liveHost = ents[p.host], liveRider = ents[p.id];
  if (!liveRider) { riderMissing.push(p.id); continue; }
  const hostLib = liveHost?.lib ?? "HOST-ABSENT";
  if (hostLib === p.hl) pinOK++;
  else { pinStale++; console.log(JSON.stringify({ STALE_PIN: p.placer, id: p.id, host: p.host, pinnedHL: p.hl, liveHostLib: hostLib })); }
}
console.log(JSON.stringify({ placers: placers.length, parsedPins: pins.length, pinOK, pinStale, riderMissing }));

// b7 exact-tuple question (current live host)
const h = ents["nx-town-shrine"];
const L = [-0.95, 0.25, -1.16];
const y = h.yaw, c = Math.cos(y), s = Math.sin(y);
const P = [h.pos[0] + L[0] * c + L[2] * s, h.pos[1] + L[1], h.pos[2] - L[0] * s + L[2] * c];
const b7 = ents["nx-artwalk-b7-shrine-stars"];
console.log(JSON.stringify({ b7HostLib: h.lib, hostPos: h.pos, b7LivePos: b7?.pos, b7WantPos: P, dy: b7 ? b7.pos[1] - P[1] : null, b7Lib: b7?.lib, exact: b7 && b7.pos.every((n: number, i: number) => Math.abs(n - P[i]) < 1e-6) && Math.abs(b7.yaw - y) < 1e-6 }));

// any rider whose live lib no longer matches its durable build sha? (rider-side drift)
// rider lib should be store/<sha16>; we don't have all shas here — the idempotent placers gate that on rerun.
// report comp bags on riders (comp-wipe law check)
const compBags = riders.map((id) => ({ id, comp: Object.keys(ents[id].comp ?? {}).length }));
const nonEmpty = compBags.filter((x) => x.comp > 0);
console.log(JSON.stringify({ ridersWithComps: nonEmpty }));
