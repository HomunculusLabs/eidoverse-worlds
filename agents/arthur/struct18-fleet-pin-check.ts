// struct18-fleet-pin-check.ts — struct-18 HOLD TICK: verify every standing
// nx-struct-* entity's live lib matches the local deterministic build
// (content-hash drift check across the whole fleet). Read-only.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const FLEET: Array<[string, string]> = [
    ["nx-struct-observatory", "village_observatory3.glb"],
    ["nx-struct-shelltower", "village_shelltower3.glb"],
    ["nx-struct-hypar", "village_hypar3.glb"],
    ["nx-struct-mobius", "village_mobius3.glb"],
    ["nx-struct-reedpool", "village_reedpool3.glb"],
    ["nx-struct-orrery", "village_orrery3.glb"],
    ["nx-struct-millrace", "village_millrace3.glb"],
    ["nx-struct-pendulum", "village_pendulum3.glb"],
    ["nx-struct-amphi", "village_amphi3.glb"],
    ["nx-struct-beacon", "village_beacon3.glb"],
    ["nx-struct-angler", "village_angler3.glb"],
    ["nx-struct-skene", "village_skene3.glb"],
    ["nx-struct-waterstair", "village_waterstair3.glb"],
];
const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw new Error(`geom ${r.status}`);
const d: any = await r.json();
const live = Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e]));
let ok = 0, bad: string[] = [];
for (const [id, file] of FLEET) {
    const e = live[id];
    if (!e) { bad.push(`${id}: NOT LIVE`); continue; }
    const sha = createHash("sha256").update(new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${file}`))).digest("hex");
    if (e.lib === `store/${sha.slice(0, 16)}.glb`) ok++;
    else bad.push(`${id}: live=${e.lib} local=${sha.slice(0, 16)}`);
}
// companion lights present?
const lights = ["nx-struct-beacon-l", "nx-struct-observatory-l"];
for (const l of lights) {
    const e = live[l];
    if (e?.kind === "light") ok++; else bad.push(`${l}: MISSING/WRONG KIND`);
}
console.log(JSON.stringify({ status: bad.length ? "PIN_FAIL" : "ALL_PINS_OK", checked: FLEET.length + lights.length, ok, bad }, null, 2));
export {};
