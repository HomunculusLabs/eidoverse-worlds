import { test, expect } from 'bun:test';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { bindReviewModels } from './model-review';

const here = import.meta.dir;
const sourceSha = 'df959099a243ef27945380da52591cc3a7a0f34cc5ecc378abb0cc461498e519';
const servedSha = '727de2063cde20d194f83959d72337c13ac18d4b3b4f5a1a10531455dd0c677c';
const run = (args: string[]) => spawnSync(process.execPath, [join(here, 'model-review.ts'), '--no-video', ...args], { encoding: 'utf8', timeout: 180_000 });

let servedReport: any;
function reviewServed() {
  if (!servedReport) {
    const result = run(['--served', '--expected-served-sha', servedSha]);
    expect(result.status, result.stderr).toBe(0);
    servedReport = JSON.parse(result.stdout);
  }
  return servedReport;
}
test('--served renders the pinned DRACO bytes through actual browser engine motion and standalone file opening', () => {
  const report = reviewServed();
  expect(report.sha256, '--served must not silently review source bytes').toBe(servedSha);
  const stats = JSON.parse(readFileSync(join(report.out, 'stats.json'), 'utf8'));
  expect(stats.sha256).toBe(servedSha);
  expect(stats.binding).toMatchObject({ mode: 'served', sourceSha256: sourceSha, servedSha256: servedSha, expectedServedSha256: servedSha, sourceContractVerified: true, nodeContractVerified: true });
  expect(stats.binding.sourceBytes).toBe(readFileSync(join(here, 'moon-moth.glb')).length);
  expect(stats.binding.renderedBytes).toBe(readFileSync(join(here, 'served.glb')).length);
  expect(stats.wings.map((w: any) => w.name)).toEqual(['moon_wing_left', 'moon_wing_right']);
  for (const wing of stats.wings) {
    expect(wing.excursionRadians).toBeGreaterThan(.43);
    expect(wing.continuousClearanceLowerBound).toBeGreaterThan(0);
  }
  expect(stats.staticMaxMatrixDelta).toBe(0);
  expect(stats.rootMaxMatrixDelta).toBe(0);
  expect(stats.seat).toMatchObject({ anchorName: 'moon_seat', cushionName: 'moon_seat_cushion_0', anchorMaxMatrixDelta: 0, cushionMaxMatrixDelta: 0, engineLookupVerified: true });
  expect(stats.seat.cushionTop).toBeCloseTo(1.97, 2);
  expect(stats.seat.cushionCenterXZ[0]).toBeCloseTo(0, 2);
  expect(stats.seat.cushionCenterXZ[1]).toBeCloseTo(.18, 2);
  expect(stats.geometryContract.boundsMaxDelta).toBeLessThanOrEqual(.005);
  expect(stats.geometryContract.drawMeshes).toBe(14);
  expect(stats.restoreMaxDelta).toBe(0);
  expect(stats.negativeControls).toEqual({ missingWingRejected: true, frozenWingRejected: true, movingCabinRejected: true });
  expect(stats.browserErrors).toEqual([]);
  expect(existsSync(join(report.out, 'FAILED.json')), 'a successful rerun must clear its stale failure marker').toBe(false);
  expect(stats.interactiveChecks).toContain('standalone file URL');
  expect(readFileSync(join(report.out, 'motion-a.png')).equals(readFileSync(join(report.out, 'motion-b.png')))).toBe(false);
}, 200_000);

const sourceBytes = readFileSync(join(here, 'moon-moth.glb'));
const servedBytes = readFileSync(join(here, 'served.glb'));
const contractBytes = readFileSync(join(here, 'model-contract.json'));
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
function editGLB(edit: (doc: any) => void) {
  const doc = JSON.parse(servedBytes.subarray(20, 20 + servedBytes.readUInt32LE(12)).toString());edit(doc);
  const json = Buffer.from(JSON.stringify(doc)), padding = Buffer.alloc((4-json.length%4)%4, 32);
  const result = Buffer.concat([servedBytes.subarray(0,20), json, padding, servedBytes.subarray(20+servedBytes.readUInt32LE(12))]);
  result.writeUInt32LE(result.length,8);result.writeUInt32LE(json.length+padding.length,12);return result;
}

test('portable served viewer rejects a mismatched source binding in the actual browser', async () => {
  const report = reviewServed();
  const html = readFileSync(join(report.out, 'demo.html'), 'utf8').replace(/(<script type="application\/json" id="review-meta">)([\s\S]*?)(<\/script>)/, (_,before,data,after) => {
    const meta = JSON.parse(data);meta.binding.sourceSha256 = servedSha;return before+JSON.stringify(meta)+after;
  });
  const fixture = mkdtempSync(join(tmpdir(), 'moon-served-review-'));
  const browser = await chromium.launch({ headless: true, timeout: 30_000 });
  try {
    const target = join(fixture, 'demo.html');writeFileSync(target, html);
    const page = await browser.newPage();
    await page.route('**/*', route => route.request().url() === pathToFileURL(target).href || /^(blob:|data:)/.test(route.request().url()) ? route.continue() : route.abort());
    await page.goto(pathToFileURL(target).href, { timeout: 30_000 });
    await page.waitForFunction(() => (window as any).reviewReady === true || document.querySelector('#error pre')?.textContent, undefined, { timeout: 60_000 });
    expect(await page.evaluate(() => (window as any).reviewReady)).toBe(false);
    expect(await page.locator('#error').innerText()).toContain('Source contract binding mismatch');
  } finally { await browser.close();rmSync(fixture, { recursive: true, force: true }); }
}, 240_000);

test('portable viewer blocks network before request dispatch without needing its capture server', async () => {
  const report = reviewServed();
  const target = pathToFileURL(join(report.out, 'demo.html')).href;
  const browser = await chromium.launch({ headless: true, timeout: 30_000 });
  try {
    const page = await browser.newPage();const escaped: string[] = [];
    await page.route('**/*', route => {
      const url = route.request().url();
      if (url === target || /^(blob:|data:)/.test(url)) return route.continue();
      escaped.push(url);return route.abort(); // Never send even the failing-test request.
    });
    await page.goto(target, { timeout: 30_000 });
    await page.waitForFunction(() => (window as any).reviewReady === true, undefined, { timeout: 60_000 });
    const blocked = await page.evaluate(async () => {
      try { await fetch('http://127.0.0.1:9/forbidden', { signal: AbortSignal.timeout(1000) });return false; } catch { return true; }
    });
    expect(blocked).toBe(true);expect(escaped, 'portable CSP must deny network before the Playwright safety net').toEqual([]);
  } finally { await browser.close(); }
}, 240_000);

test('source contract is independently required even when the served hash matches', () => {
  const drift = Buffer.from(sourceBytes);drift[drift.length-1] ^= 1;
  expect(() => bindReviewModels(drift, contractBytes, servedBytes, servedSha)).toThrow('source model-contract and GLB disagree');
  const contract = JSON.parse(contractBytes.toString());contract.bytes++;
  expect(() => bindReviewModels(sourceBytes, Buffer.from(JSON.stringify(contract)), servedBytes, servedSha)).toThrow('source model-contract byte count mismatch');
});

test('wrong served pin rejects otherwise-valid optimized bytes', () => {
  expect(() => bindReviewModels(sourceBytes, contractBytes, servedBytes, sourceSha)).toThrow('served GLB SHA mismatch');
});

for (const name of ['moon_wing_left','moon_wing_right','moon_seat','moon_seat_cushion_0']) {
  test('source binding rejects a renamed '+name+' even with a matching new served pin', () => {
    const changed = editGLB(doc => { doc.nodes.find((n: any) => n.name === name).name = 'renamed'; });
    expect(() => bindReviewModels(sourceBytes, contractBytes, changed, digest(changed))).toThrow('exactly one '+name);
  });
}
test('source binding rejects changed anchor transforms', () => {
  const changed = editGLB(doc => { doc.nodes.find((n: any) => n.name === 'moon_seat').translation = [0,.1,0]; });
  expect(() => bindReviewModels(sourceBytes, contractBytes, changed, digest(changed))).toThrow('served/source node contract mismatch');
});
test('source binding rejects external resources before any browser is launched', () => {
  const changed = editGLB(doc => { doc.images[0].uri = 'https://example.invalid/not-allowed.webp'; });
  expect(() => bindReviewModels(sourceBytes, contractBytes, changed, digest(changed))).toThrow('GLB may not fetch external assets');
});
test('served binding must actually require DRACO, not relabel the source', () => {
  expect(() => bindReviewModels(sourceBytes, contractBytes, sourceBytes, sourceSha)).toThrow('served review requires DRACO-compressed geometry');
});
test('rejects ambiguous repeated served pin arguments instead of choosing one', () => {
  const result = run(['--served','--expected-served-sha',servedSha,'--expected-served-sha',sourceSha]);
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('duplicate review argument');
}, 200_000);

