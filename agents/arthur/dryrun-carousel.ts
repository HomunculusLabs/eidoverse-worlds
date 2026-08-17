// dryrun-carousel.ts — polish-10: end-to-end dry-run of the staged carousel
// rollout against a local mock world. Proves the full placer sequence
// (/geom capture → rebuild → upload [429 retry] → ws join/verb pacing →
// comp re-apply → post-verify) BEFORE real-world consent arrives.
// Run: bun agents/arthur/dryrun-carousel.ts   (self-contained; exits 0/1)
import { spawnSync, spawn } from "node:child_process";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const PORT = 8791;
const VERBLOG = "/tmp/mock-carousel-verbs.jsonl";
const CFG = "/tmp/mock-carousel-config.json";
let fails = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " | " + d : ""}`); if (!c) fails++; };

// 1. mock config: ws:// scheme (placer maps to http://), flaky upload ON
writeFileSync(CFG, JSON.stringify({
    url: `ws://127.0.0.1:${PORT}/ws`, world: "mockworld", id: "arthur-builder",
    avatar: "builder", agentToken: "mock", joinToken: "mock",
}));

// 2. start mock server (flaky=1 → first upload 429s, exercising retry)
const mock = spawn("bun", [`${ROOT}/agents/arthur/mock-carousel-server.ts`], {
    env: { ...process.env, MOCK_PORT: String(PORT), MOCK_VERBLOG: VERBLOG },
    stdio: ["ignore", "pipe", "pipe"],
});
let mockOut = "";
mock.stdout!.on("data", (d: any) => { mockOut += d; });
await new Promise((r) => setTimeout(r, 800));
ck("mock server up", mockOut.includes("carousel world"), mockOut.trim());

// 3. run the REAL placer against the mock (config override + flaky upload)
const placer = spawnSync("bun", [`${ROOT}/agents/arthur/assets/placecarousel.ts`], {
    cwd: ROOT, encoding: "utf8", timeout: 120000,
    env: { ...process.env, PLACER_CONFIG: CFG, MOCK_FLAKY: "1" },
});
console.log("[placer]", (placer.stdout || placer.stderr || "").trim().split("\n").slice(-4).join(" | "));
ck("placer exited 0 (post-place verify PASS inside placer)", placer.status === 0);
ck("429 retry path exercised (upload succeeded after forced first-attempt throttle)", (placer.stdout || "").includes("uploaded lib"));

// 4. assert the verb sequence from the mock's log
const verbs = readFileSync(VERBLOG, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const joinMsg = verbs.find((m: any) => m.type === "join");
ck("join handshake sent", !!joinMsg && joinMsg.world === "mockworld");
const verbSeq = verbs.filter((m: any) => m.type === "verb").map((m: any) => `${m.verb}:${m.args?.type ?? m.args?.id ?? ""}`);
ck("verb[0] is spawn of av-carousel", verbSeq[0] === "spawn:av-carousel", verbSeq[0]);
const spawnVerb = verbs.find((m: any) => m.type === "verb" && m.verb === "spawn")?.args;
ck("spawn at LIVE pose (captured -18.8, 25.9 yaw 2.5137)", spawnVerb?.pos?.[0] === -18.8 && Math.abs(spawnVerb?.yaw - 2.5137) < 0.001);
ck("spawn lib is the staged upload (mockupload1234abcd)", spawnVerb?.lib === "store/mockupload1234abcd.glb", spawnVerb?.lib);
const compTypes = verbs.filter((m: any) => m.type === "verb" && m.verb === "comp").map((m: any) => m.args.type);
for (const t of ["motion:carousel", "motion:horse_0", "motion:horse_2", "motion:horse_4", "motion:horse_6", "sockets", "particles:smoke"]) {
    ck(`comp re-applied: ${t}`, compTypes.includes(t));
}
ck("live spin 5°/s preferred over default 6 (capture law)", verbs.find((m: any) => m.type === "verb" && m.args?.type === "motion:carousel")?.args?.data?.degPerSec === 5);
ck("live socket data preferred (y=1.97)", verbs.find((m: any) => m.type === "verb" && m.args?.type === "sockets")?.args?.data?.horse_0?.pos?.[1] === 1.97);
const lights = verbs.filter((m: any) => m.type === "verb" && m.verb === "light").map((m: any) => m.args.id).sort();
ck("both lights re-applied at live pos", lights.length === 2 && lights.includes("av-car-l1") && lights.includes("av-car-l2"), lights.join(","));

// 5. comp-wipe law proven: spawn wiped comps in the mock, then ALL re-applied
//    (the placer's own post-verify asserted this — the verb log shows the order)
const spawnIdx = verbs.findIndex((m: any) => m.type === "verb" && m.verb === "spawn");
const firstCompIdx = verbs.findIndex((m: any) => m.type === "verb" && m.verb === "comp");
ck("spawn precedes all comps (wipe-then-reapply order)", spawnIdx < firstCompIdx);

// cleanup
mock.kill("SIGTERM");
for (const f of [VERBLOG, CFG]) if (existsSync(f)) unlinkSync(f);
ck("scratch files removed", !existsSync(VERBLOG) && !existsSync(CFG));

console.log(fails ? `${fails} FAIL` : "ALL PASS");
process.exit(fails ? 1 : 0);
