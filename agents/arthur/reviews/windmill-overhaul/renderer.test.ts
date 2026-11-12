import { expect, test } from "bun:test";
import { resolve, join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const repo = resolve(import.meta.dir, "../../../..");
const script = join(repo, "agents/arthur/review-windmill-overhaul.ts");
const baseline = join(import.meta.dir, "before/model.glb");
const out = join(import.meta.dir, "baseline-control");
const hash = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");

test("DRACO baseline produces hash-bound local evidence using fixed cameras and real engine sail transforms", async () => {
  const run = Bun.spawn(["bun", script, baseline, out], { cwd: repo, stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([new Response(run.stdout).text(), new Response(run.stderr).text(), run.exited]);
  expect({ code, stderr }).toEqual({ code: 0, stderr: "" });
  const stats = JSON.parse(readFileSync(join(out, "stats.json"), "utf8"));
  expect(stats.status).toBe("complete");
  expect(stats.evidence.kind).toBe("LOCAL_EXACT_BYTE_RENDER_NOT_IN_WORLD");
  expect(stats.comparison.kind).toBe("identical-byte-control");
  expect(stats.inputs.before.sha256).toBe(hash(baseline));
  expect(stats.inputs.candidate.sha256).toBe(hash(baseline));
  expect(stats.inputs.before.extensionsUsed).toContain("KHR_draco_mesh_compression");
  expect(stats.errors).toEqual([]);
  expect(stats.render.models.before.namedNodes).toContain("sails");
  expect(stats.render.models.before.bounds.max[1]).toBeGreaterThan(11);
  expect(stats.render.models.before.rootTransform.position).toEqual([0, 0, 0]);
  expect(stats.motion.source.mode).toBe("actual-engine-tickMotion-with-local-harness");
  expect(stats.motion.componentOrigin).toBe("synthetic-review-contract-not-live-component-proof");
  expect(stats.render.motionChecks.before.rotationChanged).toBe(true);
  expect(stats.render.motionChecks.before.pivotFixed).toBe(true);
  expect(stats.render.motionChecks.before.staticMeshesUnchanged).toBe(true);
  const views = ["front", "right", "left", "back", "gameplay", "aerial", "top", "night", "interior", "motion-a", "motion-b"];
  expect(Object.keys(stats.frames)).toEqual(views);
  for (const view of views) {
    const f = stats.frames[view];
    expect(f.before.camera).toEqual(f.candidate.camera);
    expect(f.before.sha256).toBe(hash(join(out, "before", `${view}.png`)));
    expect(f.candidate.sha256).toBe(hash(join(out, "candidate", `${view}.png`)));
    expect(f.pair.sha256).toBe(hash(join(out, `${view}.png`)));
    // Identical inputs must produce identical unlabeled pixels under the same rig.
    expect(f.before.pixelSha256).toBe(f.candidate.pixelSha256);
  }
  expect(stats.frames["motion-a"].before.pixelSha256).not.toBe(stats.frames["motion-b"].before.pixelSha256);
  expect(stats.frames.front.before.camera.target).toEqual([0, 5.3, 0]);
  expect(stats.frames.gameplay.before.camera.position).toEqual([0, 1.65, 18]);
  expect(existsSync(join(out, "contact-sheet.png"))).toBe(true);
  expect(stdout).toContain("LOCAL_REVIEW_COMPLETE");
}, 180_000);

const candidate = join(repo, "agents/arthur/assets/village_windmill_overhaul.glb");
const census = "/tmp/windmill-overhaul-census.json";
test.skipIf(!existsSync(candidate) || !existsSync(census))("candidate ensemble uses census-relative companions and freshly verifies optimized baseline bytes without world mutation", async () => {
  const ensembleOut = join(import.meta.dir, "candidate-ensemble");
  const run = Bun.spawn(["bun", script, candidate, ensembleOut, "--ensemble", "--census", census,
    "--before-url", "https://eidoverse.billding.dev/library/store/369c572480b0e786.glb"], { cwd: repo, stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([new Response(run.stdout).text(), new Response(run.stderr).text(), run.exited]);
  expect({ code, stderr }).toEqual({ code: 0, stderr: "" });
  const stats = JSON.parse(readFileSync(join(ensembleOut, "stats.json"), "utf8"));
  expect(stats.status).toBe("complete");
  expect(stats.comparison.kind).toBe("before-vs-candidate");
  expect(stats.inputs.candidate.sha256).toBe(hash(candidate));
  expect(stats.evidence.worldMutations).toBe(0);
  expect(stats.inputs.before.liveByteVerification.matches).toBe(true);
  expect(stats.inputs.before.liveByteVerification.sha256).toBe(hash(baseline));
  expect(stats.inputs.before.liveByteVerification.claim).toBe("GET-byte-equality-only-not-live-entity-placement");
  expect(stats.ensemble.census.sha256).toBe(hash(census));
  expect(stats.ensemble.members.length).toBe(2);
  const crown = stats.ensemble.members.find((m: any) => m.entity.id.includes("four-wind-crown"));
  expect(crown.hostLocal.position[0]).toBeCloseTo(0, 9);
  expect(crown.hostLocal.position[1]).toBeCloseTo(2.22, 9);
  expect(crown.hostLocal.position[2]).toBeCloseTo(2.62, 9);
  for (const m of stats.ensemble.members) {
    expect(m.input.sha256).toBe(hash(m.input.path));
    expect(m.download.method).toBe("GET");
    expect(m.download.sha256).toBe(m.input.sha256);
  }
  expect(stats.render.models.before.ensembleMembers.length).toBe(2);
  expect(stats.render.models.candidate.ensembleMembers.length).toBe(2);
  expect(stats.frames.front.before.pixelSha256).not.toBe(stats.frames.front.candidate.pixelSha256);
  expect(stats.frames.front.before.camera).toEqual(stats.frames.front.candidate.camera);
  expect(stats.render.motionChecks.candidate.ensembleUnchanged).toBe(true);
  expect(stats.motion.component.rpm).toBe(1.25);
  expect(stats.motion.component.t0).toBe(Date.parse('2026-09-08T00:26:01Z'));
  expect(stats.motion.millstoneComponent.rpm).toBe(5);
  expect(stats.render.motionChecks.candidate.millstone.rotationChanged).toBe(true);
  expect(stats.render.motionChecks.candidate.millstone.pivotFixed).toBe(true);
  for (const [view, frame] of Object.entries(stats.frames) as [string, any][]) {
    if (view === 'interior') continue;
    expect(frame.before.framing.allVerticesInside).toBe(true);
    expect(frame.candidate.framing.allVerticesInside).toBe(true);
    expect(frame.candidate.framing.max[1]).toBeLessThan(0.985);
  }
  expect(stats.errors).toEqual([]);
  expect(stdout).toContain("LOCAL_REVIEW_COMPLETE");
}, 180_000);
