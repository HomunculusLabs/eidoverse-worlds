import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "../../..");
const owned = resolve(import.meta.dir);
const baseline = resolve(owned, "before/nx-town-row-cottage.glb");
const out = resolve(owned, "reviews/before-row");
const expectedViews = ["front", "right", "back", "left", "gameplay", "aerial", "top", "night", "interior"];

test("Draco baseline renders all nine requested local views with exact-byte evidence", () => {
  const run = Bun.spawnSync([process.execPath, resolve(owned, "render.ts"), baseline, out], {
    cwd: root, stdout: "pipe", stderr: "pipe", timeout: 100_000,
  });
  const output = run.stdout.toString() + run.stderr.toString();
  console.log(output);
  expect(run.exitCode, output).toBe(0);
  const manifest = JSON.parse(readFileSync(resolve(out, "render-manifest.json"), "utf8"));
  expect(manifest.evidenceKind).toBe("local-solo-render-not-in-world");
  expect(manifest.modelSha256).toBe(new Bun.CryptoHasher("sha256").update(readFileSync(baseline)).digest("hex"));
  expect(manifest.frames.map((f: any) => f.view)).toEqual(expectedViews);
  expect(manifest.errors).toEqual([]);
  expect(manifest.stats.meshes).toBeGreaterThan(0);
  expect(manifest.stats.triangles).toBeGreaterThan(0);
  for (const frame of manifest.frames) {
    const png = readFileSync(resolve(out, frame.file));
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(960);
    expect(png.readUInt32BE(20)).toBe(720);
    expect(frame.sha256).toBe(new Bun.CryptoHasher("sha256").update(png).digest("hex"));
  }
}, 110_000);

test("a different Draco model preserves the baseline cameras and lighting exactly", () => {
  const next = resolve(owned, "reviews/test-rig-tower-on-row");
  const run = Bun.spawnSync([process.execPath, resolve(owned, "render.ts"),
    resolve(owned, "before/nx-town-tower-house.glb"), next, resolve(out, "camera.json")], {
    cwd: root, stdout: "pipe", stderr: "pipe", timeout: 100_000,
  });
  expect(run.exitCode, run.stdout.toString() + run.stderr.toString()).toBe(0);
  const before = JSON.parse(readFileSync(resolve(out, "render-manifest.json"), "utf8"));
  const after = JSON.parse(readFileSync(resolve(next, "render-manifest.json"), "utf8"));
  expect(after.modelSha256).not.toBe(before.modelSha256);
  expect(after.stats.bounds).not.toEqual(before.stats.bounds);
  expect(after.cameraSha256).toBe(before.cameraSha256);
  expect(readFileSync(resolve(next, "camera.json"), "utf8")).toBe(readFileSync(resolve(out, "camera.json"), "utf8"));
  for (let i = 0; i < expectedViews.length; i++) {
    for (const key of ["eye", "quaternion", "projectionMatrix"]) {
      expect(after.frames[i].camera[key]).toEqual(before.frames[i].camera[key]);
    }
  }
}, 110_000);
