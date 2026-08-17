// verify-polish2.ts — persistent verifier for polish-2 (contract-safe carousel placer).
// Unit-tests the placer's pure capture/plan functions OFFLINE (no network,
// no verbs, no world writes) against synthetic /geom shapes, plus GLB
// determinism for the staged polish-1 build. Run: bun agents/arthur/verify-polish2.ts
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { captureFromGeom, DEFAULTS, planVerbs } from "./assets/placecarousel.ts";

let pass = 0, fail = 0;
const ck = (n: string, c: boolean, d = "") => { if (c) pass++; else { fail++; console.log("FAIL:", n, d); } };

// 1. capture: list-form entities (live shape)
const snapList = { entities: [
    { id: "av-carousel", lib: "store/livehash.glb", pos: [-18.8, 0, 25.9], yaw: 2.51, comp: {
        "motion:carousel": { data: { type: "spin", degPerSec: 5 } },
        "motion:horse_0": { data: { type: "bob", amp: 0.18, period: 2.4, phase: 0 } },
        "sockets": { data: { horse_0: { pos: [2, 1.97, 0] } } },
        "particles:smoke": { data: { x: 1 } },
    } },
    { id: "av-car-l1", pos: [-18.8, 3.2, 25.9], color: 0xffb066, intensity: 2.8, range: 7 },
] };
const c1 = captureFromGeom(snapList);
ck("capture list-form: pose/yaw/lib", c1.car.pos[0] === -18.8 && Math.abs(c1.car.yaw - 2.51) < 1e-9 && c1.car.lib === "store/livehash.glb");
ck("capture: motion split", "motion:carousel" in c1.motion && "motion:horse_0" in c1.motion && !("sockets" in c1.motion));
ck("capture: sockets extracted", c1.sockets?.data?.horse_0?.pos[1] === 1.97);
ck("capture: other comps carried", "particles:smoke" in c1.others);
ck("capture: 1 light found", c1.lights.length === 1 && c1.lights[0].id === "av-car-l1");

// 2. capture: dict-form entities + empty world (defaults path)
const c2 = captureFromGeom({ entities: {} });
ck("capture empty: no car, no lights", !c2.car && c2.lights.length === 0 && c2.sockets === null);
const c3 = captureFromGeom({ entities: { "av-carousel": snapList.entities[0] } });
ck("capture dict-form: car found", c3.car?.id === "av-carousel");

// 3. plan: live-preferred — snapshot spin 5°/s wins over default 6
const v1 = planVerbs(c1, "store/new.glb");
ck("plan: spawn first at LIVE pose", v1[0][0] === "spawn" && v1[0][1].pos[0] === -18.8 && Math.abs(v1[0][1].yaw - 2.51) < 1e-9);
const spin = v1.find((x) => x[1]?.type === "motion:carousel");
ck("plan: live spin data preferred (5 not 6)", spin?.[1].data.degPerSec === 5);
ck("plan: comp census spin+4horses+sockets", ["motion:carousel", "motion:horse_0", "motion:horse_2", "motion:horse_4", "motion:horse_6", "sockets"].every(t => v1.some((x) => x[0] === "comp" && x[1].type === t)));
ck("plan: live socket data preferred (1.97)", v1.find((x) => x[1]?.type === "sockets")?.[1].data.horse_0.pos[1] === 1.97);
ck("plan: other comps re-applied", v1.some((x) => x[0] === "comp" && x[1].type === "particles:smoke"));
ck("plan: live light re-applied at live pos", v1.some((x) => x[0] === "light" && x[1].id === "av-car-l1" && x[1].pos?.[1] === 3.2));

// 4. plan: defaults path — empty capture falls back correctly
const v2 = planVerbs(c2, "store/new.glb");
ck("plan defaults: 2 lights at pose+offset", v2.filter((x) => x[0] === "light").length === 2 && v2.every((x) => x[0] !== "light" || Math.abs(x[1].pos[1] - (DEFAULTS.lights.find((l: any) => l.id === x[1].id)?.dy ?? -99)) < 1e-9));
ck("plan defaults: socket fallback y=1.97 saddle plane", v2.find((x) => x[1]?.type === "sockets")?.[1].data.horse_0.pos[1] === 1.97);
ck("plan defaults: spin fallback 6°/s", v2.find((x) => x[1]?.type === "motion:carousel")?.[1].data.degPerSec === 6);

// 5. 8-station rollback law: no horse_1/3/5/7 anywhere in defaults or plans
const blob = JSON.stringify(DEFAULTS) + JSON.stringify(v1) + JSON.stringify(v2);
ck("no 8-station residue (no horse_1/3/5/7)", !/horse_[1357]\b/.test(blob));
ck("no stale socket y=2.47 anywhere", !blob.includes("2.47"));

// 6. staged build unchanged (placer rebuilds it before upload)
// (pin refreshed polish-3: paint widening joined the staged rollout)
const h = createHash("sha256").update(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/village_carousel3.glb")).digest("hex").slice(0, 16);
ck("staged GLB is polish-3 build 7a2faa19dfde62cb", h === "7a2faa19dfde62cb", h);

console.log(`polish-2 placer unit tests: ${pass} PASS ${fail} FAIL`);
process.exit(fail ? 1 : 0);
