// verify-polish-staged.ts — PERSISTENT lane verifier for the polish lane's
// staged rollout package (does NOT self-delete; committed as durable,
// runnable evidence — the tex-lane pattern, applied to polish).
// Verifies every staged artifact in one command, offline only (no network,
// no mock — the consent-blocked dry-run is NOT attempted here):
//   A. Staged builds (byte-exact, ×2 deterministic):
//      carousel  38fbbc26dcdfcc1a  (roof lift + paint widening + stair fix)
//      mapboard  b77ef40aae3a9dae → 44eeba91 (plaza-palette warm)  (distance skeleton + tower chip)
//      welcome   62746d1af698eacc → 83bced0a (plaza-palette warm)  (night lamp, emissive glow2)
//   B. GLB decodes: welcome glow2 emissiveFactor [1.5,*,*]; mapboard 24
//      nodes; welcome 5 nodes; mapboard COLOR_0 census (1502 verts).
//   C. Placers present + contract-bearing (carousel/mapboard/welcome):
//      capture law, stall watchdog, PLACER_CONFIG, staged-law guards.
//   D. Gate + hygiene: verify-repairs.ts ALL PASS; control idle.
// Run: bun agents/arthur/verify-polish-staged.ts
import { execSync } from "node:child_process";
import { readFileSync, existsSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { createHash } from "node:crypto";

const W = "/Users/t3rpz/projects/eidoverse-worlds";
const A = `${W}/agents/arthur/assets`;
const fails: string[] = [];
let checks = 0; // polish-70: live check counter (runbook-sync reads it)
const ck = (n: string, c: boolean, d = "") => {
    console.log((c ? "PASS " : "FAIL ") + n + (d ? " | " + d : ""));
    checks++;
    if (!c) fails.push(n);
};
const sh = (cmd: string) => { try { return execSync(cmd, { cwd: W, encoding: "utf8" }); } catch (e: any) { return (e.stdout ?? "") + (e.stderr ?? ""); } };
const sha16 = (f: string) => createHash("sha256").update(readFileSync(f)).digest("hex").slice(0, 16);

// ---- roof decoder (polish-44; offline-testable) ----
// Answers the sentinel's UNKNOWN branch from bytes: walk the GLB JSON for
// the canopy hub node and classify by world Y. LIFTED = hub >= 5.0 (the
// polish-1 lift, hub 5.15); LOW = <= 4.8 (old roof, hub 4.7). Works on a
// local path (offline) or a URL (caller's choice — the sentinel itself
// never auto-downloads; it stays strictly /geom-class).
export async function decodeRoof(srcPathOrUrl: string): Promise<string> {
    const buf: Uint8Array = srcPathOrUrl.startsWith("http")
        ? new Uint8Array(await (await fetch(srcPathOrUrl)).arrayBuffer())
        : new Uint8Array(await Bun.file(srcPathOrUrl).arrayBuffer());
    const jlen = buf[12] | (buf[13] << 8) | (buf[14] << 16) | (buf[15] << 24);
    const j = JSON.parse(new TextDecoder().decode(buf.subarray(20, 20 + jlen)));
    // world Y of the canopy hub: node translation (+ parent chain; the
    // carousel keeps the hub near root, translation-only is faithful)
    const hub = j.nodes.find((n: any) => n.name === "cr_canopy_hub");
    if (!hub) return "NO-HUB-NODE (not a carousel build?)";
    const y = hub.translation?.[1] ?? 0;
    return y >= 5.0 ? `LIFTED (hub y=${y})` : y <= 4.8 ? `LOW (hub y=${y}) — OLD ROOF` : `AMBIGUOUS (hub y=${y})`;
}

// ---- lamp decoder (polish-48; offline-testable) ----
// Answers the sentinel's welcome branch from bytes. DECODE LAW (learned this
// tick): mergeByMaterial RENAMES nodes (staged build carries wb3_0..wb3_4,
// NOT wb_lamp) — the node-name signature I first shipped read NO-LAMP on the
// lamp build. The truthful, merge-proof signature is the glow2 EMISSIVE
// MATERIAL itself ([1.5, ~.48, ~.10]) — unique to the lamp. LAMP = that
// material present; NO-LAMP = absent. Local path or URL; the sentinel never
// auto-downloads (stays /geom-class) — it prints the command.
export async function decodeLamp(srcPathOrUrl: string): Promise<string> {
    const buf: Uint8Array = srcPathOrUrl.startsWith("http")
        ? new Uint8Array(await (await fetch(srcPathOrUrl)).arrayBuffer())
        : new Uint8Array(await Bun.file(srcPathOrUrl).arrayBuffer());
    const jlen = buf[12] | (buf[13] << 8) | (buf[14] << 16) | (buf[15] << 24);
    const j = JSON.parse(new TextDecoder().decode(buf.subarray(20, 20 + jlen)));
    const glow = j.materials?.find((m: any) => Array.isArray(m.emissiveFactor)
        && Math.abs(m.emissiveFactor[0] - 1.5) < 0.05
        && Math.abs(m.emissiveFactor[1] - 0.48) < 0.05
        && Math.abs(m.emissiveFactor[2] - 0.10) < 0.05);
    return glow ? `LAMP (glow2 emissive ${JSON.stringify(glow.emissiveFactor)})` : "NO-LAMP (no lamp emissive)";
}

// ---- chip decoder (polish-56; offline-testable) ----
// Completes the decoder family: the mapboard UNKNOWN branch was the last
// blind one ("investigate" only). The polish-20 chip added 24 verts to the
// COLOR_0 pipeline (1478 -> 1502) — a merge-proof byte signature.
export async function decodeChip(srcPathOrUrl: string): Promise<string> {
    const buf: Uint8Array = srcPathOrUrl.startsWith("http")
        ? new Uint8Array(await (await fetch(srcPathOrUrl)).arrayBuffer())
        : new Uint8Array(await Bun.file(srcPathOrUrl).arrayBuffer());
    const jlen = buf[12] | (buf[13] << 8) | (buf[14] << 16) | (buf[15] << 24);
    const j = JSON.parse(new TextDecoder().decode(buf.subarray(20, 20 + jlen)));
    const total = (j.meshes ?? []).flatMap((m: any) => (m.primitives ?? [])
        .flatMap((p: any) => Object.entries(p.attributes ?? {})
            .filter(([k]) => k === "COLOR_0")
            .map(([, i]) => j.accessors[i]?.count ?? 0)))
        .reduce((a: number, b: number) => a + b, 0);
    if (total >= 1490) return `CHIP (COLOR_0 total ${total} >= chip-era 1502)`;
    if (total > 0 && total <= 1480) return `NO-CHIP (COLOR_0 total ${total} <= pre-chip 1478)`;
    return `AMBIGUOUS (COLOR_0 total ${total})`;
}

if (import.meta.main) {
    // ---- A. staged builds: byte-exact + deterministic ----
    const BUILDS: Array<[string, string]> = [
        ["village_carousel3.glb", "38fbbc26dcdfcc1a"],
        ["village_mapboard3.glb", "1f1a10f4dce71a0e"], // plaza-palette: warm structure, lamp emissives exempted
        ["village_welcome3.glb", "6cd75bbbbf379df5"], // plaza-palette: warm structure, lamp emissives exempted
    ];
    for (const [f, want] of BUILDS) {
        const h = sha16(`${A}/${f}`);
        ck(`staged ${f} at ${want}`, h === want, h);
    }
    // determinism: rebuild mapboard + welcome (cheap) ×1 and re-hash.
    // polish-63: the CAROUSEL rebuild joined — the placer rebuilds from
    // source at rollout, so source->bytes drift would ship unverified. The
    // rebuild is heavy (~6s) but the verifier's job is to catch exactly this.
    // polish-64 REBUILD SAFETY: the rebuilds OVERWRITE the staged GLBs
    // (gitignored — no git recovery). If source drifts, the check must FAIL
    // without destroying the pinned artifact: hash-swap to a temp copy,
    // rebuild in place, compare, and RESTORE the original on mismatch.
    // (Success path leaves the rebuilt byte-identical file in place.)
    const REBUILDS: Array<[string, string, string]> = [
        ["mkv3-mapboard.ts", "village_mapboard3.glb", "1f1a10f4dce71a0e"],
        ["mkv3-welcome59.ts", "village_welcome3.glb", "6cd75bbbbf379df5"],
        ["mkcarousel.ts", "village_carousel3.glb", "38fbbc26dcdfcc1a"],
    ];
    for (const [mk, glb, want] of REBUILDS) {
        const glbPath = `${A}/${glb}`;
        const bak = `${A}/.bak-${glb}`;
        copyFileSync(glbPath, bak);
        sh(`bun ${A}/${mk}`);
        const got = sha16(glbPath);
        if (got !== want) {
            // drift: FAIL clean and restore the pinned artifact
            copyFileSync(bak, glbPath);
            rmSync(bak, { force: true });
            ck(`rebuild ${glb} deterministic`, false, `got ${got} want ${want} — PINNED ARTIFACT RESTORED`);
            continue;
        }
        rmSync(bak, { force: true });
        ck(`rebuild ${glb} deterministic (hash re-equal after rebuild)`, true, got);
    }

    // ---- B. GLB decodes (JSON chunk only — no network) ----
    const decode = (f: string) => {
        const b = readFileSync(`${A}/${f}`);
        const jlen = b.readUInt32LE(12);
        return JSON.parse(b.subarray(20, 20 + jlen).toString());
    };
    const mj = decode("village_mapboard3.glb");
    ck("mapboard 24 nodes (distance skeleton + tower chip era)", mj.nodes.length === 24, String(mj.nodes.length));
    const wj = decode("village_welcome3.glb");
    ck("welcome 5 nodes (lamp era)", wj.nodes.length === 5, String(wj.nodes.length));
    const glow = wj.materials.find((m: any) => m.emissiveFactor);
    ck("welcome glow2 emissive factor 1.5 present", !!glow && Math.abs(glow.emissiveFactor[0] - 1.5) < 0.01,
        glow ? JSON.stringify(glow.emissiveFactor) : "none");

    // ---- C. placers present + contract-bearing ----
    const PLACERS: Array<[string, string]> = [
        ["placecarousel.ts", "polish-14 STALL WATCHDOG|STALL"],
        ["placemapboard.ts", "stall watchdog|STALLED"],
        ["placewelcome.ts", "geometry-level emissive|STALLED"],
    ];
    for (const [p, marker] of PLACERS) {
        const ok = existsSync(`${A}/${p}`);
        ck(`placer ${p} present`, ok);
        if (ok) {
            const src = readFileSync(`${A}/${p}`, "utf8");
            ck(`placer ${p} carries contract markers (watchdog etc.)`, marker.split("|").some((m) => src.includes(m))
                && src.includes("PLACER_CONFIG"), "");
        }
    }
    // welcome placer pure helpers behavioral (import side-effect-free — guarded)
    const r = sh(`bun -e 'const m = await import("${A}/placewelcome.ts"); const v = m.planVerbs({pos:[1,0,-4], yaw:2}, "store/z.glb"); console.log("V=" + v[0][1].id + "@" + JSON.stringify(v[0][1].pos) + "y" + v[0][1].yaw);'`);
    ck("placewelcome helpers pure (spawn at captured pose)", r.includes("V=av-welcome@[1,0,-4]y2"), r.trim().slice(0, 60));
    // polish-66 MAPBOARD PLACER BEHAVIORAL (parity with welcome: marker checks
    // alone can't prove the verb shape; a moved capture must carry through):
    const mp = sh(`bun -e 'const m = await import("${A}/placemapboard.ts"); const v = m.planVerbs({pos:[9,0,-7], yaw:1.2}, "store/m.glb"); const a = m.planVerbs(null, "store/d.glb"); console.log("M=" + v[0][1].id + "@" + JSON.stringify(v[0][1].pos) + "y" + v[0][1].yaw + "s" + v[0][1].scale + "|D=" + JSON.stringify(a[0][1].pos) + "y" + a[0][1].yaw);'`);
    ck("placemapboard helpers pure (captured pose carries; defaults verbatim)", mp.includes("M=av-mapboard@[9,0,-7]y1.2s1") && mp.includes("D=[1.6,0,8.5]y0"), mp.trim().slice(0, 70));
    // polish-47 HEAL BEHAVIORAL (the KNOWN_BAG is the package's subtlest
    // piece — a wrong-shape restore would ship silently; re-prove each run).
    // Probe written to a temp file (multi-line bun -e breaks sh -c quoting);
    // probe self-deletes — the verifier leaves no residue.
    const probe = `${W}/agents/arthur/.heal-probe-${process.pid}.ts`;
    writeFileSync(probe, `import * as P from "${A}/placecarousel.ts";
const capA = P.captureFromGeom({ entities: [ { id: "av-carousel", pos: [-18.8,0,25.9], yaw: 2.5137, comp: {
  "motion:carousel": {data:{degPerSec:5}}, "motion:horse_0": {data:{}}, "motion:horse_2": {data:{}}, "motion:horse_4": {data:{}}, "motion:horse_6": {data:{}}, sockets: {data:{}} } },
  { id: "av-car-l1", pos: [-18.8,3.2,25.9] }, { id: "av-car-l2", pos: [-18.8,1.6,25.9] } ] });
const va = P.planVerbs(capA, "store/new.glb");
const sa = va.filter(v => v[0]==="comp" && v[1].type==="particles:smoke");
const d = (sa[0]?.[1] as any)?.data ?? {};
const idiom = d.preset==="smoke" && JSON.stringify(d.origin)==="[-18.8,6.3,25.9]" && d.count===50 && d.size===0.4 && d.speed===0.35;
console.log("H1=" + (sa.length===1 && idiom) + " N=" + va.filter(v=>v[0]==="comp").length);
const capB = P.captureFromGeom({ entities: [ { id: "av-carousel", pos: [-18.8,0,25.9], yaw: 2.5137, comp: { "motion:carousel": {data:{}}, sockets: {data:{}},
  "particles:smoke": {data:{preset:"smoke",origin:[0,9,0],count:3,size:0.1,speed:0.2}} } } ] });
const sb = P.planVerbs(capB, "store/x.glb").filter(v => v[0]==="comp" && v[1].type==="particles:smoke");
console.log("H2=" + (sb.length===1 && (sb[0][1] as any).data.origin[1]===9));
// polish-53 H3: pose-relative heal — a MOVED pose carries the heal, no leak
const capC = P.captureFromGeom({ entities: [ { id: "av-carousel", pos: [5,0,-10], yaw: 0.7, comp: { "motion:carousel": {data:{}}, sockets: {data:{}} } } ] });
const sc = P.planVerbs(capC, "store/m.glb").find(v => v[0]==="comp" && v[1].type==="particles:smoke");
const dc = (sc?.[1] as any)?.data ?? {};
console.log("H3=" + (JSON.stringify(dc.origin)==="[5,6.3,-10]" && !("originLocal" in dc)));
// polish-69 H4: light re-anchor (p55, verified once — now standing)
const L = (pos: number[]) => P.captureFromGeom({ entities: [
  { id: "av-carousel", pos: [-18.8,0,25.9], yaw: 2.5137, comp: { "motion:carousel": {data:{}}, sockets: {data:{}} } },
  { id: "av-car-l1", pos } ] });
const lp = (pos: number[]) => P.planVerbs(L(pos), "store/x.glb").find((v: any) => v[0]==="light")[1].pos;
const consistent = JSON.stringify(lp([-18.8,3.2,25.9]))==="[-18.8,3.2,25.9]";
const reanchored = JSON.stringify(lp([-18.8,3.2,25.9+31]))==="[-18.8,3.2,25.9]"; // drifted 31m away
const jitterKept = JSON.stringify(lp([-18.6,3.2,26.0]))==="[-18.6,3.2,26]"; // benign <0.5m
console.log("H4=" + (consistent && reanchored && jitterKept));
`);
    const h = sh(`bun ${probe}`);
    rmSync(probe, { force: true });
    ck("heal behavioral: smoke-less capture heals in village idiom (7 planned)", h.includes("H1=true") && h.includes("N=7"), h.trim().split("\n")[0]?.slice(0, 60) ?? "");
    ck("heal behavioral: no double-apply, live data wins", h.includes("H2=true"), h.trim().split("\n")[1]?.slice(0, 40) ?? "");
    ck("heal behavioral: pose-relative (moved pose carries the heal, no leak)", h.includes("H3=true"), h.trim().split("\n")[2]?.slice(0, 40) ?? "");
    ck("light re-anchor behavioral: consistent verbatim / drifted re-anchored / jitter kept", h.includes("H4=true"), h.trim().split("\n")[3]?.slice(0, 40) ?? "");
    // polish-58 DECODER BEHAVIORALS (the three byte-decoders were one-shot
    // verified at p44/p48/p56 — a regression would pass silently; re-prove
    // each run against the staged builds + in-domain negatives):
    const dr = await decodeRoof(`${A}/village_carousel3.glb`);
    ck("decoder roof: staged carousel -> LIFTED (hub y=5.15)", dr.includes("LIFTED (hub y=5.15)"), dr);
    const dl = await decodeLamp(`${A}/village_welcome3.glb`);
    const dln = await decodeLamp(`${A}/village_mapboard3.glb`);
    ck("decoder lamp: staged welcome -> LAMP; mapboard hearth -> NO-LAMP (green-channel separation)", dl.includes("LAMP (glow2") && dln.startsWith("NO-LAMP"), dl + " / " + dln);
    const dc = await decodeChip(`${A}/village_mapboard3.glb`);
    const dcn = await decodeChip(`${A}/village_welcome3.glb`);
    ck("decoder chip: staged mapboard -> CHIP @1502; welcome -> NO-CHIP @371", dc.includes("1502") && dcn.startsWith("NO-CHIP"), dc + " / " + dcn);
    ck("heal probe residue clean (self-deleted)", !existsSync(probe));

    // ---- D. gate + hygiene ----
    const gate = sh(`bun ${W}/agents/arthur/verify-repairs.ts`);
    ck("standing gate verify-repairs.ts ALL PASS", !/\nFAIL /.test("\n" + gate) && gate.includes("PASS"), (gate.match(/FAIL .*/g) ?? []).slice(0, 2).join(";"));
    ck("control.json absent (channel idle; existsSync)", !existsSync(`${W}/agents/arthur/control.json`));


    // ---- E. ROLLOUT SENTINEL (polish-39; env-gated live read) ----
    // Default runs stay OFFLINE (this section skips). With POLISH_LIVE=1 the
    // verifier performs the same read-only /geom GET the standing gate does,
    // reads the LIVE carousel + welcome + mapboard libs, and reports rollout
    // state against the register items:
    //   carousel: cd22d0b0 = defect (old low roof) still LIVE → register OPEN
    //             38fbbc26 = staged build ROLLED → close the register item
    //   welcome:  != 83bced0a = lamp not yet rolled; == → close that item
    //   mapboard: e732ce10 = live pin; 44eeba91 = tower chip rolled (plaza-palette warm)
    // The sentinel only READS; it never places.
    if (process.env.POLISH_LIVE === "1") {
        try {
            const cfg = JSON.parse(readFileSync(`${W}/agents/arthur/config.json`, "utf8"));
            const httpBase = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
            const res = await fetch(`${httpBase}/geom?world=${cfg.world}&boxes=0`);
            if (!res.ok) throw new Error(`geom ${res.status}`);
            const d: any = await res.json();
            const ents: any[] = Array.isArray(d?.entities) ? d.entities : Object.values(d?.entities ?? {});
            const libOf = (id: string) => ents.find((e: any) => e?.id === id)?.lib ?? "(absent)";
            const car = libOf("av-carousel");
            const wel = libOf("av-welcome");
            const map = libOf("av-mapboard");
            console.log(`SENTINEL live libs: carousel=${car} welcome=${wel} mapboard=${map}`);
            if (car === "store/cd22d0b09e70bebc.glb") {
                // polish-67: the defect branch now censuses the live comp bag
                // too — a re-place dropping MORE comps (below the known 6)
                // must surface here, and the smoke item's close condition
                // ("bag reads 7") is visible every sweep.
                const carEnt0 = ents.find((e: any) => e?.id === "av-carousel");
                const bag = Object.keys(carEnt0?.comp ?? {});
                const smoke0 = bag.includes("particles:smoke");
                console.log(`SENTINEL carousel: defect still LIVE (old low roof) — register OPEN correct; live bag ${bag.length} comps${bag.length < 6 ? " — COMP LOSS vs the known 6, investigate" : ""}, smoke ${smoke0 ? "present" : "still lost (heal rides rollout)"}`);
            }
            else if (car === "store/38fbbc26dcdfcc1a.glb") {
                // polish-54: split advice — the smoke item is COMP-level with
                // its own close condition (bag reads 7); a lane banking our
                // build via their own placer could skip the KNOWN_BAG heal.
                const carEnt = ents.find((e: any) => e?.id === "av-carousel");
                const nComps = Object.keys(carEnt?.comp ?? {}).length;
                const smoke = Object.keys(carEnt?.comp ?? {}).some(k => k === "particles:smoke");
                console.log(`SENTINEL carousel: staged build ROLLED — CLOSE the roof+paint register items; smoke item: live bag ${nComps} comps${smoke ? ", smoke PRESENT — close it too" : ", smoke STILL LOST — the heal was skipped (re-apply particles:smoke or run the heal), keep the item OPEN"}`);
            }
            else console.log(`SENTINEL carousel: UNKNOWN build ${car} — decode before touching the register: bun -e 'const m = await import("${W}/agents/arthur/verify-polish-staged.ts"); console.log(await m.decodeRoof("<store-url-or-local-path>"))' (LIFTED = close items; LOW = old roof still live)`);
            if (wel === "store/6cd75bbbbf379df5.glb") console.log("SENTINEL welcome: lamp ROLLED — register item should be CLOSED");
            else console.log(`SENTINEL welcome: UNKNOWN build ${wel} — decode before touching the register: bun -e 'const m = await import("${W}/agents/arthur/verify-polish-staged.ts"); console.log(await m.decodeLamp("<store-url-or-local-path>"))' (LAMP = close item; NO-LAMP = open)`);
            if (map === "store/1f1a10f4dce71a0e.glb") console.log("SENTINEL mapboard: tower chip ROLLED live — register cosmetic item CLOSED");
            else if (map === "store/e732ce10400c1979.glb") console.log("SENTINEL mapboard: live pin e732ce10 stands (chip staged)");
            else console.log(`SENTINEL mapboard: UNKNOWN build ${map} — decode before touching the register: bun -e 'const m = await import("${W}/agents/arthur/verify-polish-staged.ts"); console.log(await m.decodeChip("<store-url-or-local-path>"))' (CHIP = chip live; NO-CHIP = pre-chip)`);
        } catch (e: any) {
            console.log(`SENTINEL live read failed (non-fatal): ${e?.message ?? e}`);
        }
    } else {
        console.log("SENTINEL skipped (offline default; set POLISH_LIVE=1 for the live rollout check)");
    }

    // polish-70 RUNBOOK SYNC (records standing guard — drift landed twice:
    // the p59 runbook cited 24 while the verifier ran 27): read the plan's
    // cited "offline N checks" and compare to the ACTUAL count (self-included).
    {
        const plan = readFileSync(`${W}/agents/arthur/VISUAL-POLISH-PLAN.md`, "utf8");
        // polish-79: guard EVERY cited count, not just the runbook's — the
        // p77 status block cites "28 checks" in a different phrasing and the
        // p70 guard missed it (my own addition violated my own law).
        const m = plan.match(/offline (\d+) checks/);
        const s = plan.match(/\*\*Standing verifier\*\*: (\d+) checks/);
        const cited = m ? Number(m[1]) : -1;
        const statusCited = s ? Number(s[1]) : -1;
        const actual = checks + 2; // BOTH sync guards included (p79: +1 broke when the second guard landed — self-referential counts must count every future check)
        ck(`runbook sync (plan cites ${cited} = verifier actual ${actual})`, cited === actual, cited === actual ? `${actual}` : `plan says ${cited}, verifier runs ${actual} — refresh the runbook`);
        ck(`status-block sync (lane status cites ${statusCited} = verifier actual ${actual})`, statusCited === actual, statusCited === actual ? `${actual}` : `status block says ${statusCited} — refresh it`);
    }

    console.log(fails.length ? `${fails.length} FAIL` : "ALL PASS");
    process.exit(fails.length ? 1 : 0);

}
