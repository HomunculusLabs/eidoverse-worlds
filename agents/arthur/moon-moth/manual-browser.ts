// End-to-end manual flight in an isolated COPY of the real client + sequencer.
// No live network writes, resident credentials, user browser, or replacement renderer.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { strict as assert } from 'node:assert';
import { chromium } from 'playwright';
import { launchSandbox } from './manual-sandbox';
const ID = 'nx-moonmoth-001';
const distance = (a: number[], b: number[]) => Math.hypot(...a.map((n, i) => n - b[i]));

export async function run(out: string) {
  mkdirSync(out, { recursive: true });
  const sandbox = await launchSandbox();
  const { stop, ...receipt } = sandbox;
  const report: any = { startedAt: new Date().toISOString(), sandbox: receipt, checks: [], samples: [], errors: [], visualVerdict: 'NOT_JUDGED', outcome: 'RUNNING' };
  writeFileSync(join(out, 'sandbox.json'), JSON.stringify(receipt, null, 2));
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, permissions: [], serviceWorkers: 'block', recordVideo: { dir: out, size: { width: 1280, height: 900 } } });
  const check = (label: string, condition: any, data?: any) => { report.checks.push({ label, pass: !!condition, data }); assert(condition, label + (data ? ': ' + JSON.stringify(data) : '')); };
  await ctx.route('**/*', route => {
    const req = route.request();
    return ['GET', 'HEAD'].includes(req.method()) ? route.continue() : route.abort();
  });
  await ctx.routeWebSocket('**/*', ws => {
    if (ws.url() !== sandbox.origin.replace('http:', 'ws:') + '/ws') return ws.close();
    ws.connectToServer();
  });
  await ctx.addInitScript(() => {
    const w = window as any; w.__wire = { out: [], incoming: [] };
    const Native = window.WebSocket;
    window.WebSocket = class extends Native {
      constructor(...args: any[]) {
        super(...args as [string]);
        this.addEventListener('message', e => { try { const m = JSON.parse(String(e.data)); if (['lease', 'log', 'error'].includes(m.type) && w.__wire.incoming.length < 6000) w.__wire.incoming.push(m); } catch {} });
      }
      send(data: any) { try { const m = JSON.parse(String(data)); if (['lease', 'verb'].includes(m.type) && w.__wire.out.length < 6000) w.__wire.out.push(m); } catch {} super.send(data); }
    };
  });
  async function pageFor(name: string, spectator = false) {
    const page = await ctx.newPage();
    page.on('pageerror', e => report.errors.push(String(e)));
    await page.goto(`${sandbox.origin}/?world=moon-moth-manual&name=${name}&avatar=claude&prefetch=0${spectator ? '&spectate&follow=manual-pilot' : ''}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(({ id, spectator }: any) => { const e = (window as any).EW; return e?.net?.joined && e.entities.get(id) && !e.entities.get(id).userData.placeholder && (spectator || e.me()?.root); }, { id: ID, spectator }, { timeout: 90000 });
    await page.evaluate(async () => {
      const w = window as any;
      w.__manual = { world: await import('/lib/world.js'), state: (await import('/lib/state.js')).state, body: await import('/lib/localbody.js'), controller: await import('/lib/controller.js') };
      (await import('/lib/ui.js')).panelFrame().hide();
    });
    return page;
  }
  async function sample(page: any, label: string, screenshot = false) {
    const s = await page.evaluate((id: string) => {
      const w = window as any, e = w.EW, r = w.__manual;
      const obj = e.entities.get(id); obj.updateMatrixWorld(true);
      const p = new e.THREE.Vector3(), mount = r.world.mountTransform(e.net.myId, p);
      const me = e.me(), root = me?.root.getWorldPosition(new e.THREE.Vector3());
      const hips = me?.vrm?.humanoid?.getRawBoneNode?.('hips')?.getWorldPosition(new e.THREE.Vector3());
      const pan = new e.THREE.Vector3(0, 1.97, 0.18).applyMatrix4(obj.matrixWorld);
      return { at: Date.now(), currentSlot: me?.currentSlot, p: obj.position.toArray(), yaw: obj.rotation.y, riderYaw: e.myState.yaw, rider: root?.toArray(), mount, authoritativeMount: r.state.st.mounts?.[e.net.myId], rootError: mount && root ? root.distanceTo(p) : null, hips: hips?.toArray(), pan: pan.toArray(), bodyVisible: !!me?.vrm?.scene.visible, lastLease: w.__wire.incoming.filter((m: any) => m.type === 'lease').slice(-1)[0], folded: r.state.st.entities[id].pos };
    }, ID);
    report.samples.push({ label, ...s });
    if (screenshot) { const file = join(out, label + '.png'); await page.screenshot({ path: file }); report.samples.at(-1).image = file; }
    return s;
  }
  let pilot: any, observer: any;
  try {
    report.modelResponseSha256 = createHash('sha256').update(new Uint8Array(await (await fetch(sandbox.origin + '/library/store/df959099a243ef27.glb')).arrayBuffer())).digest('hex');
    check('HTTP-served model matches the independently pinned served bytes', report.modelResponseSha256 === sandbox.modelSha256);
    pilot = await pageFor('manual-pilot');
    // Observer is a fully independent browser client, not a second local model.
    observer = await pageFor('manual-observer', true);
    await pilot.bringToFront();
    await pilot.evaluate((id: string) => { const w = window as any; w.EW.myState.pos.set(7, 0, 6); if (!w.__manual.body.trySitOn(id + '.seat')) throw Error('mount refused'); }, ID);
    await pilot.waitForFunction(() => (window as any).__manual.state.st.mounts?.['manual-pilot']?.slot === 'seat');
    await pilot.waitForTimeout(1500);
    for (const [label, yaw] of [['00-contact-front', Math.PI / 2], ['00-contact-rear', -Math.PI / 2], ['00-contact-side', 0]] as const) {
      await pilot.evaluate((yaw: number) => (window as any).__manual.controller.setCamYaw(yaw), yaw);
      await pilot.waitForTimeout(600); await sample(pilot, label, true);
    }
    await pilot.evaluate(() => (window as any).__manual.controller.setCamYaw(0));
    await pilot.mouse.move(640, 450); await pilot.mouse.wheel(0, 1800);
    await pilot.waitForTimeout(1000);
    const mounted = await sample(pilot, '01-mounted', true);
    check('rider starts in the actual seat', mounted.rootError !== null && mounted.rootError < .08 && mounted.bodyVisible, mounted);
    // Hips bones are not the skinned seat-contact surface. Retain their
    // measurements for diagnosis, but leave physical contact to close-view review.
    check('actual seated animation is playing without a fallback', mounted.currentSlot === 'sitchair');
    await pilot.keyboard.press('f', { delay: 150 });
    await pilot.waitForFunction(() => (window as any).__wire.incoming.some((m: any) => m.type === 'lease' && m.op === 'granted' && m.mode === 'pilot'), undefined, { timeout: 8000 });
    await pilot.waitForFunction((id: string) => (window as any).EW.entities.get(id).position.y >= 21.9, ID, { timeout: 25000 });
    const air = await sample(pilot, '02-takeoff', true);
    check('F starts a real lease-backed takeoff', air.p[1] >= 21.9);
    await pilot.keyboard.down('w'); await pilot.waitForTimeout(2400); await pilot.keyboard.up('w');
    const straight = await sample(pilot, '03-forward', true);
    check('W moves horizontally without dismounting', Math.hypot(straight.p[0] - air.p[0], straight.p[2] - air.p[2]) > 2 && straight.authoritativeMount?.to === ID);
    await pilot.keyboard.down('w'); await pilot.keyboard.down('s'); await pilot.waitForTimeout(900);
    const braked = await sample(pilot, '03b-braked');
    await pilot.waitForTimeout(700);
    const heldBrake = await sample(pilot, '03c-brake-held');
    check('S brakes even with W held', distance(braked.p, heldBrake.p) < .15);
    await pilot.keyboard.up('w'); await pilot.keyboard.up('s');
    await pilot.keyboard.down('a'); await pilot.keyboard.down('w'); await pilot.waitForTimeout(1100); await pilot.keyboard.up('a'); await pilot.keyboard.up('w');
    const turn = await sample(pilot, '04-left-turn', true);
    check('A changes heading and rider remains attached through the turn', Math.abs(Math.atan2(Math.sin(turn.yaw - straight.yaw), Math.cos(turn.yaw - straight.yaw))) > .4 && turn.rootError < .08, turn);
    // Turning has inertia: allow the left turn to decelerate and reverse.
    await pilot.keyboard.down('d'); await pilot.waitForTimeout(1400); await pilot.keyboard.up('d');
    const right = await sample(pilot, '05-right-turn');
    check('D turns the opposite way', Math.atan2(Math.sin(right.yaw - turn.yaw), Math.cos(right.yaw - turn.yaw)) < -.4);
    await pilot.keyboard.down('Space'); await pilot.waitForTimeout(1500); await pilot.keyboard.up('Space');
    const up = await sample(pilot, '06-climb', true);
    check('Space climbs', up.p[1] > right.p[1] + 1);
    await pilot.keyboard.down('c'); await pilot.waitForTimeout(1500); await pilot.keyboard.up('c');
    const down = await sample(pilot, '07-descend');
    check('C descends within the flight deck', down.p[1] < up.p[1] - 1 && down.p[1] >= 22 - .001);
    await pilot.waitForTimeout(1800);
    const hover = await sample(pilot, '08-hover', true);
    await pilot.waitForTimeout(1300);
    const still = await sample(pilot, '09-hover-still');
    check('released controls settle into a hover', distance(hover.p, still.p) < .15, { before: hover.p, after: still.p });
    await observer.waitForTimeout(200);
    const remote = await sample(observer, '10-observer', true);
    check('independent spectator agrees with the pilot position', distance(remote.p, still.p) < .2, { remote: remote.p, pilot: still.p });
    await pilot.evaluate(() => { const input = document.createElement('input'); input.id = 'pilot-typing-test'; document.body.append(input); input.focus(); });
    await pilot.keyboard.type('wwaassddffccxx'); await pilot.waitForTimeout(1000);
    const typing = await sample(pilot, '11-typing');
    check('typing does not steer or dismount', distance(typing.p, still.p) < .15 && typing.authoritativeMount?.to === ID);
    await pilot.evaluate(() => document.getElementById('pilot-typing-test')?.remove());
    await pilot.keyboard.down('w'); await pilot.waitForTimeout(1000);
    // Headless Chrome reports BOTH pages focused/visible after bringToFront.
    // Dispatch its actual blur event; do not claim this emulates OS tab visibility.
    report.blurProbe = 'DOM blur event through the actual controller; headless tab visibility is not emulated';
    await pilot.evaluate(() => window.dispatchEvent(new Event('blur')));
    await pilot.waitForTimeout(1100);
    const blurred = await sample(pilot, '11b-blurred');
    await observer.waitForTimeout(1200);
    const blurStill = await sample(pilot, '11c-blur-still');
    check('blur event clears held flight controls', distance(blurred.p, blurStill.p) < .15);
    await pilot.keyboard.up('w'); await pilot.bringToFront();
    await pilot.keyboard.press('x', { delay: 150 });
    await pilot.waitForFunction(() => !(window as any).__manual.state.st.mounts?.['manual-pilot'], undefined, { timeout: 30000 });
    const landed = await sample(pilot, '12-landed-dismounted', true);
    check('X returns to the dock before dismounting', distance(landed.p, [0, 0, 0]) < .05 && distance(landed.folded, [0, 0, 0]) < .05, landed);
    report.wire = await pilot.evaluate(() => (window as any).__wire);
    check('pilot did not emit per-frame place or new motion verbs', report.wire.out.filter((m: any) => m.type === 'verb').every((m: any) => ['mount', 'dismount'].includes(m.verb)));
    // Second flight: kill the actual pilot page and verify durable freeze/read-back.
    await pilot.evaluate((id: string) => { if (!(window as any).__manual.body.trySitOn(id + '.seat')) throw Error('remount refused'); }, ID);
    await pilot.waitForTimeout(600); await pilot.keyboard.press('f', { delay: 150 });
    await pilot.waitForFunction((id: string) => (window as any).EW.entities.get(id).position.y >= 21.9, ID, { timeout: 25000 });
    await pilot.keyboard.down('w'); await pilot.waitForTimeout(1200); await pilot.keyboard.up('w'); await pilot.waitForTimeout(1500);
    const beforeClose = await sample(pilot, '13-before-disconnect');
    await pilot.close(); pilot = null;
    await observer.waitForFunction((id: string) => (window as any).__manual.state.st.entities[id].pos[1] > 20, ID, { timeout: 10000 });
    const frozen = await sample(observer, '14-disconnected-freeze', true);
    check('disconnect commits the last accepted airborne pose', distance(frozen.folded, beforeClose.p) < .2, { frozen: frozen.folded, before: beforeClose.p });
    pilot = await pageFor('manual-pilot'); await pilot.bringToFront();
    await pilot.evaluate((id: string) => { const r = (window as any).__manual; if (!r.world.avatarMounts.has('manual-pilot') && !r.body.trySitOn(id + '.seat')) throw Error('recovery mount refused'); }, ID);
    await pilot.waitForTimeout(800); await pilot.keyboard.press('f', { delay: 150 });
    await pilot.waitForFunction(() => (window as any).__wire.incoming.some((m: any) => m.op === 'granted' && m.mode === 'pilot'), undefined, { timeout: 8000 });
    await pilot.keyboard.press('x', { delay: 150 });
    await pilot.waitForFunction(() => !(window as any).__manual.state.st.mounts?.['manual-pilot'], undefined, { timeout: 30000 });
    const recovered = await sample(pilot, '15-recovered', true);
    check('reconnecting rider can recover and land the moth', distance(recovered.p, [0, 0, 0]) < .05);
    report.outcome = 'FUNCTIONAL_PASS';
  } catch (error) {
    report.outcome = 'FAIL'; report.errors.push(String(error));
    if (pilot && !pilot.isClosed()) { try { await sample(pilot, 'failure', true); report.wire = await pilot.evaluate(() => (window as any).__wire); } catch {} }
  } finally {
    await ctx.close(); await browser.close();
    report.serverLogs = await stop();
    report.log = readFileSync(join(sandbox.root, 'worlds/moon-moth-manual/log.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    report.finishedAt = new Date().toISOString();
    writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify({ outcome: report.outcome, checks: report.checks, errors: report.errors, report: join(out, 'report.json') }, null, 2));
  return report.outcome === 'FUNCTIONAL_PASS' ? 0 : 1;
}
if (import.meta.main) process.exitCode = await run(resolve(process.argv[2] ?? join(import.meta.dir, 'manual-review', String(Date.now()))));
