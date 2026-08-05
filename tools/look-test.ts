import { WorldAgent } from "../mcpl/agent.ts";

let passed = 0;
function ok(cond: unknown, name: string) {
  if (!cond) throw new Error(`FAIL: ${name}`);
  console.log(`  PASS ${name}`); passed++;
}

const ag = new WorldAgent({ name: "look-test" });
ag.people.set("apricot", {
  id: "apricot", avatar: "", agent: false,
  pose: { p: [null as unknown as number, 0, null as unknown as number], yaw: 0, speed: 0, clip: "idle" },
});
let out = "";
try { out = ag.look(); } catch (e) { throw new Error(`look threw on null coordinates: ${e}`); }
ok(out.includes("apricot (just arrived, position unknown)"), "null-coordinate arrival is rostered as position unknown");
ok(!out.includes("NaN") && !out.includes("null"), "invalid coordinates do not leak into spatial prose");

ag.people.set("apricot", {
  id: "apricot", avatar: "", agent: false,
  pose: { p: [3, 0, -4], yaw: 0, speed: 0, clip: "idle" },
});
out = ag.look();
ok(out.includes("apricot: 5.0m"), "later finite pose restores ordinary spatial perception");
ok(out.includes("at (3.0, -4.0)"), "finite coordinates render normally");

console.log(`\n${passed} passed, 0 failed`);
