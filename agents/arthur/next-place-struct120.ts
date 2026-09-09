// next-place-struct120.ts — struct-120: THE BRACHISTOCHRONE (cycloid/
// tautochrone family debut) placement — the deferred contract from
// struct-119 executed.
// Judged ZAI FALLBACK this tick (native 1210 x2 + paced retry — hard down,
// disclosed; native re-judge debt rides a future tick per flap law):
// front 4/4 PASS (lens silhouette immediate, closed teardrop void against
// sky, beads deliberate on both rails, pier strut attached, no floats),
// gameplay 18m 4/4 PASS (plinth+drum exhibit read, two rails never
// confusable, 8-10 brass markers, contact seam + cast shadow), night 4/4
// PASS (exactly 7 warm points — crest release + 5 cycloid time-beads +
// basin finish — chord beads dark, zero bloom/stray warmth, silhouette
// faintly readable). Decode ALL PASS 16/16 re-verified fresh this tick
// (cycloid law from bytes via independent replica; night judge's
// "fourth/fifth chord bead" count resolved decode-side: all 5 dark beads
// at exact law positions <=3mm — probe law 11).
// NEW entity nx-struct-brachistochrone (scan verified absent, fresh 315).
// Seat: az184 r200, CAND_A yaw -pi/2 (struct-104 face-on law: lens plane
// faces the S-axis approach; crest post village-side, race runs outward to
// the basin). Form-CENTER seats on the axis point (center-corrected,
// CX +3.70 — pitfall-10): entity POS (-13.951295, PY, 195.812810).
// The S mathematics axis extends past borromean r190: dial r71 -> koch
// r90 -> hilbert r100 -> dodeca r110 -> wall r120 -> tesseract r130 ->
// lorenz r140 -> chladni r150 -> voronoi r160 -> zeno r180 -> borromean
// r190 -> BRACHISTOCHRONE r200: the race past the rings that cannot come
// apart.
// TRUE decoded envelope local x[-0.67..8.07] z[-1.07..1.07] y[0..4.018]
// (8.74x4.02x2.14, NOT origin-centered). Scan SAT worst nx-struct-borromean
// +3.30 (law 1.4, fresh 315-entity census, center-corrected, film-guarded),
// film +102.17 (kochgarden), walk +124.34 (ne-lane-002), rim 200.0.
// Terrain 9pt spread 5.0mm, lowest -0.0065773; PY = lowest (base on grade).
// Folly class: no entry advertised — no walk owed (zeno/voronoi/chladni/
// borromean precedent). Comps: NONE (glow is KEEP glow_brr material inside
// the GLB, struct-82 lineage; comp bag {}).
// Two-pass chassis (struct-88..119 proven); fresh-only placer — rerun
// dies zero-verbs (struct-107/108/115/118 idempotency form).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-13.951295423741772, -0.006577305005303291, 195.81280982728102] as const;
const YAW = -Math.PI / 2;
const m = {
    id: "nx-struct-brachistochrone",
    file: "village_brachistochrone3.glb",
    sha: "f678c069e84e51a2a6c1a980f46105f3330f0d3a8aa740237074bacca2130312",
    bbox: { min: [-0.67, 0, -1.07], max: [8.07, 4.018, 1.07] },
    comp: {} as Record<string, never>,
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
async function geom(world = WORLD) {
    const r = await fetch(`${base}/geom?world=${world}`);
    if (!r.ok) die(`geom ${world} ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== m.sha) die(`${m.id} reviewed hash drift ${h}`);
const wantLib = `store/${m.sha.slice(0, 16)}.glb`;
// ---- SAT preflight vs FRESH live set (films exempt by height + film-guard id) ----
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
const FILM = /nx-struct-(kochgarden|penrose|hydro|hygro|pyth|ptolemy|hypoth|crossing|penrose2|sierpinski|geodesic|apollon|tensegrity|sundial|watershed)/;
const LAW = 1.4;
const CX = (m.bbox.min[0] + m.bbox.max[0]) / 2, CZ = (m.bbox.min[2] + m.bbox.max[2]) / 2;
const HX = (m.bbox.max[0] - m.bbox.min[0]) / 2, HZ = (m.bbox.max[2] - m.bbox.min[2]) / 2;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const WCX = POS[0] + CX * cs + CZ * sn;
const WCZ = POS[2] - CX * sn + CZ * cs;
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
console.log(`center-corrected SAT basis: world center (${WCX.toFixed(3)}, ${WCZ.toFixed(3)}) grown half ${EW.toFixed(3)}x${ED.toFixed(3)}`);
const before = await geom();
if (before[m.id]) die(`${m.id} already live — this placer places fresh only`);
let worstGap = Infinity, worstId = "";
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (e.id === m.id) continue;
    const bb = e.bbox;
    if (!bb) continue;                       // lights carry no bbox
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue; // ground films
    if (GROUND.test(e.id) || FILM.test(e.id)) continue;
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const ey = e.yaw ?? 0;
    const cy = Math.cos(ey), sy = Math.sin(ey);
    const ecxW = e.pos[0] + ecx * cy + ecz * sy;
    const eczW = e.pos[2] - ecx * sy + ecz * cy;
    const ew = hx * Math.abs(cy) + hz * Math.abs(sy), ed = hx * Math.abs(sy) + hz * Math.abs(cy);
    const dx = Math.abs(WCX - ecxW), dz = Math.abs(WCZ - eczW);
    const g = Math.max(dx - (EW + ew), dz - (ED + ed));   // max separating axis
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions.join(", ")}`);
console.log(`SAT preflight worst: ${worstId} ${worstGap.toFixed(2)} (fresh ${Object.keys(before).length}-entity set, center-corrected)`);
const verbs: Array<[string, any]> = [];
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-120`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = ((await r.json()) as any).path; break; }
        if (r.status === 429 && a < 5) { console.log(`429 upload, backoff ${a * 30}s`); await sleep(a * 30000); continue; }
        die(`upload ${r.status}`);
    }
    if (lib !== wantLib) die(`upload path ${lib}`);
    console.log(`upload OK ${lib}`);
    verbs.push(["spawn", { id: m.id, lib: wantLib, pos: [...POS], yaw: YAW, scale: 1, comp: m.comp }]);
}
if (verbs.length) await new Promise<void>((resolve, reject) => {
    const { WebSocket } = require("ws") as typeof import("ws");
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        console.log(`verb: ${verb}`);
    }, 600);
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct120-brachistochrone", avatar: cfg.avatar, token: cfg.joinToken })));
    ws.on("message", (raw: any) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "snapshot" && !joined) { joined = true; console.log(`joined ${WORLD} (${Object.keys(msg.entities ?? {}).length} entities)`); }
    });
    ws.on("error", reject);
    const closer = setInterval(() => {
        if (i >= verbs.length) { clearInterval(paced); clearInterval(closer); clearTimeout(timer); ws.close(); resolve(); }
    }, 500);
});
await sleep(1500);
const after = await geom();
const live = after[m.id] ?? die(`${m.id} absent after verbs`);
if (!(live.pos.every((n: number, i2: number) => near(n, POS[i2])) && near(live.yaw, YAW) && live.scale === 1 && live.lib === wantLib)) die(`tuple verify failed: ${JSON.stringify({ pos: live.pos, yaw: live.yaw, lib: live.lib })}`);
console.log(`PLACED_VERIFIED ${m.id} pos [${live.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${live.yaw.toFixed(4)} lib ${live.lib} comp ${JSON.stringify(live.comp ?? {})} (census ${Object.keys(after).length})`);
process.exit(0);
