// Isolated public-client Moon Moth review; no resident credentials or controls.
// Default: bun agents/arthur/moon-moth/live-review.ts --inspect --out /tmp/moonmoth-inspect
// No CDP attachment, persistent browser profile, resident credentials, GUI, uploads, or engine edits.
// Optional --door-config reads ONLY joinToken, injected by the Node-side WS relay, never exposed to the page.
// Every screenshot is the current public client; this script NEVER awards visual PASS.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseArgs } from 'node:util';
import { createHash, randomUUID } from 'node:crypto';

const BASE = 'https://eidoverse.billding.dev';
const WORLD = 'commons-next';
const TARGET = 'nx-moonmoth-001';
export const seatViews=[
  {label:'01-mounted-close',yaw:Math.PI/2},
  {label:'02-mounted-opposite',yaw:-Math.PI/2},
  {label:'02b-mounted-side',yaw:0}
];
export function contextOptions(ride:boolean,out:string) {
  return { viewport:{width:1280,height:900}, deviceScaleFactor:1, permissions:[],
    serviceWorkers:'block' as const, acceptDownloads:false,
    ...(ride ? {recordVideo:{dir:out,size:{width:1280,height:900}}} : {}) };
}
const sha = (b: any) => createHash('sha256').update(b).digest('hex');
const scrub = (s: any) => String(s).replace(/([?&](?:token|key|code|ticket)=)[^&\s"']+/gi, '$1[REDACTED]').replace(/aid1\.[\w.\-]+/g, '[REDACTED]').slice(0, 1400);

export async function run(argv = process.argv.slice(2)) {
  const { values: a } = parseArgs({ args: argv, options: {
    inspect: { type: 'boolean' }, ride: { type: 'boolean' }, out: { type: 'string' },
    slot: { type: 'string' }, action: { type: 'string' }, times: { type: 'string' },
    'expect-lib': { type: 'string' }, channel: { type: 'string', default: 'chrome' },
    'door-config': { type: 'string' },
    help: { type: 'boolean' },
  }});
  if (a.help) { console.log('Default --inspect: isolated guest, no verbs. This host needs --door-config agents/arthur/config.json (ONLY joinToken is used; never agentToken). --ride is parent-operated ONLY after placement approval; requires --slot, --action, --expect-lib. --times is seconds after use (default 2,8,16; select route-appropriate timings). --out defaults to a fresh temp folder. --channel chrome|chromium. Report always says visualVerdict=NOT_JUDGED.'); return 0; }
  if (a.inspect && a.ride) throw new Error('choose --inspect OR --ride');
  const times = a.ride ? validateRideOptions(a) : [];
  const doorKey = a['door-config'] ? JSON.parse(readFileSync(resolve(a['door-config']), 'utf8')).joinToken : '';
  if (typeof doorKey !== 'string' || /^(aid1|eyJ)/.test(doorKey)) throw new Error('door config must supply a shared joinToken, never an identity bearer');
  const cfg: WireConfig = { mode: a.ride ? 'ride' : 'inspect', name: `moonmoth-probe-${randomUUID().slice(0, 8)}`, world: WORLD, target: TARGET, slot: a.slot, action: a.action };
  const out = resolve(a.out ?? join(tmpdir(), `moonmoth-review-${randomUUID().slice(0, 8)}`));
  if (existsSync(join(out, 'report.json'))) throw new Error('refusing to overwrite an existing report; choose a fresh --out');
  mkdirSync(out, { recursive: true });
  const report: any = { version: 1, mode: cfg.mode, startedAt: new Date().toISOString(), base: BASE, world: WORLD, target: TARGET, probe: cfg.name,
    isolation: { headless: true, freshContext: true, residentCredentials: false, sharedDoorKeyInNodeRelay: !!doorKey, userBrowserAttached: false, httpWritesBlocked: true },
    visualVerdict: 'NOT_JUDGED', rideInvoked: false, frames: [], samples: [], errors: [], console: [], requestsFailed: [], blockedHttp: [], modules: {}, client: null, wire: null };
  let browser: any, page: any, mountAttempted = false;
  const responseTasks: Promise<void>[] = [];
  try {
    const { chromium } = await import('playwright');
    if (!['chrome', 'chromium'].includes(a.channel!)) throw new Error('channel must be chrome or chromium');
    browser = await chromium.launch({ headless: true, ...(a.channel === 'chrome' ? { channel: 'chrome' } : {}), args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
    report.browserVersion = browser.version();
    const ctx = await browser.newContext(contextOptions(!!a.ride,out));
    report.relay = { sentTypes: {}, sentVerbs: [], blocked: [], errors: [] };
    await ctx.routeWebSocket('**/*', (ws: any) => {
      if (ws.url() !== BASE.replace('https:', 'wss:') + '/ws') { ws.close(); return; }
      const server = ws.connectToServer();
      ws.onMessage((raw: any) => {
        let m: any; try { m = JSON.parse(String(raw)); } catch { m = null; }
        const key = m?.type === 'verb' ? `verb:${m.verb}` : m?.type ?? 'non-json';
        if (!wireAllowed(m, cfg) || (m.type === 'verb' && report.relay.sentVerbs.some((v: any) => v.verb === m.verb))) {
          report.relay.blocked.push(key); return;
        }
        server.send(JSON.stringify(m.type === 'join' ? { ...m, token: doorKey } : m));
        report.relay.sentTypes[key] = (report.relay.sentTypes[key] ?? 0) + 1;
        if (m.type === 'verb') report.relay.sentVerbs.push({ verb: m.verb, args: m.args, at: Date.now() });
      });
      server.onMessage((raw: any) => {
        let m: any; try { m = JSON.parse(String(raw)); } catch {}
        if (m?.type === 'error') report.relay.errors.push(scrub(m.error));
        ws.send(raw);
      });
    });
    await ctx.route('**/*', async (route: any) => {
      const r = route.request();
      if (!['GET', 'HEAD'].includes(r.method()) || (r.isNavigationRequest() && new URL(r.url()).origin !== BASE)) {
        report.blockedHttp.push({ method: r.method(), url: scrub(r.url()) });
        return route.abort('blockedbyclient');
      }
      return route.continue();
    });
    await ctx.addInitScript({ content: `(${installWireGuard.toString()})(${JSON.stringify(cfg)}, ${wireAllowed.toString()})` });
    page = await ctx.newPage();
    page.on('pageerror', (e: Error) => report.errors.push({ kind: 'pageerror', message: scrub(e.message) }));
    page.on('console', (m: any) => { if (['warning', 'error'].includes(m.type()) && report.console.length < 80) report.console.push({ type: m.type(), message: scrub(m.text()) }); });
    page.on('requestfailed', (r: any) => { if (report.requestsFailed.length < 80) report.requestsFailed.push({ url: scrub(r.url()), message: scrub(r.failure()?.errorText) }); });
    const pins = ['main.js', 'lib/world.js', 'lib/localbody.js', 'lib/net.js', 'lib/core.js', 'lib/controller.js'];
    page.on('response', (r: any) => {
      const url = new URL(r.url()); const path = url.pathname.slice(1);
      if (url.origin === BASE && pins.includes(path)) responseTasks.push((async () => {
        try {
          const bytes = await r.body(); const local = resolve(import.meta.dir, '../../..', 'client', path);
          report.modules[path] = { status: r.status(), sha256: sha(bytes), matchesCheckout: existsSync(local) ? sha(readFileSync(local)) === sha(bytes) : null };
        } catch (e) { report.modules[path] = { error: scrub(e) }; }
      })());
    });
    const url = new URL(BASE); url.search = new URLSearchParams({ world: WORLD, name: cfg.name, avatar: 'claude', prefetch: '0' }).toString();
    await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForFunction(() => (window as any).EW?.net?.status === 'rejected' || !!((window as any).EW?.net?.joined && (window as any).EW?.me()?.root), undefined, { timeout: 120_000 });
    if (await page.evaluate(() => (window as any).EW?.net?.status === 'rejected')) throw new Error('guest join rejected: ' + (report.relay.errors.join('; ') || 'door refused'));
    report.client = await page.evaluate(async () => {
      const w = window as any, e = w.EW; const adapter = await navigator.gpu?.requestAdapter();
      return { joined: e.net.joined, myId: e.net.myId, name: (await import('/lib/core.js')).CONFIG.name, gpuAdapter: !!adapter,
        webgpuBackend: !!e.renderer.backend?.isWebGPUBackend, bodyLoaded: !!e.me()?.vrm, entityCount: e.entities.size, rendererFrames: e.renderer.info.render.frameCalls ?? e.renderer.info.render.calls };
    });
    if (report.client.name !== cfg.name || (report.client.myId && report.client.myId !== cfg.name)) throw new Error('guest identity mismatch — refusing resident identity');
    if (!report.client.webgpuBackend) throw new Error('WebGPU backend unavailable; no visual proof');
    await page.evaluate(async (c: any) => {
      const w = window as any; const [world, stateModule, localbody, controller] = await Promise.all([import('/lib/world.js'), import('/lib/state.js'), import('/lib/localbody.js'), import('/lib/controller.js')]);
      w.__moonmothReview = { world, state: stateModule.state, localbody, controller, cfg: c };
      (await import('/lib/ui.js')).panelFrame().hide(); // native panel API; retain seat HUD
      // Read-only camera yaw; leave the public body/mount controller fully running.
      controller.setCamYaw(Math.PI / 2);
      const ent = stateModule.state.st.entities[c.target];
      if (ent?.pos) w.EW.myState.pos.set(ent.pos[0] + 6, ent.pos[1], ent.pos[2] + 3); // own ephemeral presence only
    }, cfg);
    const contractPath = join(import.meta.dir, 'model-contract.json');
    if (existsSync(contractPath)) {
      report.modelContract = JSON.parse(readFileSync(contractPath, 'utf8'));
      report.modelContractFileSha256 = sha(readFileSync(contractPath));
      await page.evaluate((contract: any) => { (window as any).__moonmothReview.modelContract = contract; }, report.modelContract);
    }
    await page.waitForTimeout(8000);
    report.targetState = await page.evaluate((id: string) => (window as any).__moonmothReview.state.st.entities[id] ?? null, TARGET);
    await capture(page, out, report, '00-inspect');
    report.outcome = 'INSPECTION_CAPTURED';
    if (!report.targetState) report.pending = 'Target absent; no seat or flight validation was possible. Run --ride only after parent authorizes and places it.';
    if (a.ride) {
      if (!report.targetState || report.targetState.lib !== a['expect-lib']) throw new Error('target absent or lib pin differs — no mount/use');
      await page.waitForFunction((id: string) => { const ent = (window as any).EW.entities.get(id); return ent && !ent.userData.placeholder; }, TARGET, { timeout: 45_000 });
      const preflight = await page.evaluate(() => {
        const r = (window as any).__moonmothReview, c = r.cfg;
        const bag = r.world.comps.get(c.target);
        return { slot: bag?.sockets?.[c.slot] ?? null, occupied: Object.values(r.state.st.mounts ?? {}).some((m: any) => m.to === c.target) };
      });
      report.ridePreflight = preflight;
      if (!preflight.slot || preflight.occupied) throw new Error('socket missing or carrier occupied — no mount/use');
      if (report.modelContract && a['expect-lib'] !== `store/${report.modelContract.sha256.slice(0, 16)}.glb`) throw new Error('local model contract differs from pinned live lib');
      mountAttempted = true;
      report.rideInvoked = true;
      await page.evaluate(() => {
        const w = window as any, r = w.__moonmothReview;
        // Call the current public self-seat API, including its immediate local mount install.
        if (!r.localbody.trySitOn(`${r.cfg.target}.${r.cfg.slot}`)) throw new Error('public trySitOn refused target slot');
      });
      await page.waitForFunction(() => {
        const r = (window as any).__moonmothReview, m = r.state.st.mounts?.[r.cfg.name];
        return m?.to === r.cfg.target && m.slot === r.cfg.slot;
      }, undefined, { timeout: 12_000 });
      await page.waitForTimeout(1500);
      for(const view of seatViews) {
        await page.evaluate((yaw:number) => (window as any).__moonmothReview.controller.setCamYaw(yaw),view.yaw);
        await page.waitForTimeout(800);
        await capture(page,out,report,view.label);
      }
      // Native orbit zoom, never a replacement renderer or modified body transform.
      await page.evaluate(() => (window as any).__moonmothReview.controller.setCamYaw(0));
      await page.mouse.move(640, 450); await page.mouse.wheel(0, 2700);
      await page.waitForTimeout(800);
      await capture(page, out, report, '03-mounted-wide');
      const useAt = Date.now();
      await page.evaluate(() => { const w = window as any, c = w.__moonmothReview.cfg; w.EW.sendVerb('use', { id: c.target, action: c.action }); });
      report.useAt = useAt;
      for (const sec of times) {
        await page.waitForTimeout(Math.max(0, useAt + sec * 1000 - Date.now()));
        await capture(page, out, report, `flight-${sec}s`);
      }
      report.attachmentMetrics = attachmentMetrics(report.samples.filter((s: any) => s.label.startsWith('flight-') || s.label === '03-mounted-wide'), cfg);
      await dismountOwn(page, report);
      await page.waitForTimeout(1200);
      await capture(page, out, report, '99-dismounted');
      report.outcome = report.attachmentMetrics.movingAttachment && report.dismount?.verified ? 'RIDE_METRICS_CAPTURED' : 'RIDE_METRICS_FAILED';
      report.pending = 'Native visual review of seat occupancy/contact and flight frames is still required. Numeric evidence is AD-HOC only, not suite green.';
    }
  } catch (e) {
    report.errors.push({ kind: 'harness', message: scrub(e) }); report.outcome = 'BLOCKED';
    if (page && !page.isClosed()) {
      try { report.diagnostics = await page.evaluate(async () => ({ ew: !!(window as any).EW, engineUp: !!(window as any).__ewEngineUp, joined: (window as any).EW?.net?.joined ?? false, gpu: !!navigator.gpu, adapter: !!await navigator.gpu?.requestAdapter(), text: document.body.innerText.slice(0, 1600) })); } catch {}
      try { await page.screenshot({ path: join(out, 'blocked.png'), timeout: 10_000 }); report.blockedScreenshot = join(out, 'blocked.png'); } catch {}
    }
  } finally {
    if (mountAttempted && !report.dismount?.verified && page && !page.isClosed()) {
      try { await dismountOwn(page, report); } catch (e) { report.errors.push({ kind: 'cleanup', message: scrub(e) }); report.outcome = 'BLOCKED'; }
    }
    if (page && !page.isClosed()) { try { report.wire = await page.evaluate(() => (window as any).__moonmothWire); } catch {} }
    await Promise.all(responseTasks);
    await browser?.close();
    if(a.ride && page?.video()) report.video={path:await page.video().path(),scope:'Unedited recording of the isolated public browser, includes loading and setup; no generated flight frames.'};
    report.finishedAt = new Date().toISOString();
    writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ outcome: report.outcome, report: join(out, 'report.json'), frames: report.frames.map((f: any) => f.png), client: report.client, sentVerbs: report.wire?.sentVerbs ?? [], errors: report.errors, visualVerdict: report.visualVerdict }, null, 2));
  }
  return ['BLOCKED', 'RIDE_METRICS_FAILED'].includes(report.outcome) ? 1 : 0;
}

export function installWireGuard(cfg: WireConfig, allowed: typeof wireAllowed) {
  const w = window as any;
  const audit = w.__moonmothWire = { sentTypes: {} as Record<string, number>, sentVerbs: [] as any[], blocked: [] as any[] };
  const original = WebSocket.prototype.send;
  WebSocket.prototype.send = function (data: any) {
    let m: any; try { m = JSON.parse(data); } catch { m = null; }
    const key = m?.type === 'verb' ? `verb:${m.verb}` : m?.type ?? 'non-json';
    if (!allowed(m, cfg) || (m.type === 'verb' && audit.sentVerbs.some((v: any) => v.verb === m.verb))) {
      if (audit.blocked.length < 80) audit.blocked.push({ type: key, at: Date.now() });
      return; // block before network, not just before the harness's own calls
    }
    original.call(this, data);
    audit.sentTypes[key] = (audit.sentTypes[key] ?? 0) + 1;
    if (m.type === 'verb') audit.sentVerbs.push({ verb: m.verb, args: m.args, at: Date.now() });
  };
}

async function capture(page: any, out: string, report: any, label: string) {
  const sample = await page.evaluate(() => {
    const w = window as any, e = w.EW, r = w.__moonmothReview, id = r.cfg.target, name = r.cfg.name;
    const carrier = e.entities.get(id), me = e.me(), p = new e.THREE.Vector3();
    const mount = r.world.mountTransform(name, p);
    const socket = r.cfg.slot ? r.world.socketWorldPos(id, r.cfg.slot, new e.THREE.Vector3()) : null;
    const root = me?.root.getWorldPosition(new e.THREE.Vector3());
    const cp = carrier?.getWorldPosition(new e.THREE.Vector3());
    const bounds = carrier ? new e.THREE.Box3().setFromObject(carrier) : null;
    const seatPan = carrier && r.modelContract?.seat?.center ? new e.THREE.Vector3(...r.modelContract.seat.center).applyMatrix4(carrier.matrixWorld) : null;
    const hips = me?.vrm?.humanoid?.getRawBoneNode?.('hips')?.getWorldPosition(new e.THREE.Vector3());
    return { at: Date.now(), seq: r.state.lastSeq, authoritativeMount: r.state.st.mounts?.[name] ?? null, localMount: r.world.avatarMounts.get(name) ?? null,
      expectedRoot: mount ? p.toArray() : null, mountInfo: mount, socketWorld: socket?.toArray() ?? null, riderRoot: root?.toArray() ?? null,
      rootErrorM: mount && root ? root.distanceTo(p) : null, stateErrorM: mount ? e.myState.pos.distanceTo(p) : null,
      riderClip: e.myState.clip, riderVisible: !!me?.vrm?.scene.visible, carrierWorld: cp?.toArray() ?? null,
      hipsWorld: hips?.toArray() ?? null, authoredSeatPanWorld: seatPan?.toArray() ?? null, hipsAboveSeatM: hips && seatPan ? hips.y - seatPan.y : null,
      carrierPlaceholder: carrier?.userData.placeholder ?? null, carrierBounds: bounds ? { min: bounds.min.toArray(), max: bounds.max.toArray() } : null,
      camera: { position: e.camera.position.toArray(), quaternion: e.camera.quaternion.toArray(), fov: e.camera.fov },
      seatHud: document.body.innerText.includes('hop off'), sockets: r.world.comps.get(id)?.sockets ?? null };
  });
  const png = join(out, `${label}.png`);
  await page.screenshot({ path: png, timeout: 20_000 });
  report.samples.push({ label, ...sample });
  report.frames.push({ label, png, sha256: sha(readFileSync(png)), sampledAt: sample.at, screenshotFinishedAt: Date.now() });
}

if (import.meta.main) run().then(code => { process.exitCode = code; }).catch(e => { console.error(scrub(e)); process.exitCode = 1; });

export function validateRideOptions(a: any): number[] {
  if (!/^[A-Za-z0-9_-]+$/.test(a.slot ?? '') || !/^[A-Za-z0-9_-]+$/.test(a.action ?? '') || !/^store\/[a-f0-9]{16}\.glb$/.test(a['expect-lib'] ?? '')) throw new Error('--ride requires --slot, --action, and an exact --expect-lib store/<16 lowercase hex>.glb');
  const times = String(a.times ?? '2,8,16').split(',').map(Number);
  if (times.length < 2 || times.length > 12 || times.some((v, i) => !Number.isFinite(v) || v <= 0 || v > 180 || (i > 0 && v <= times[i - 1]))) throw new Error('--times requires 2–12 strictly increasing finite seconds in (0,180]');
  return times;
}

export function attachmentMetrics(samples: any[], c: Pick<WireConfig, 'target' | 'slot'>) {
  const finite3 = (v: any) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
  const every = samples.length >= 2 && samples.every(s => s.authoritativeMount?.to === c.target && s.authoritativeMount?.slot === c.slot && s.localMount?.to === c.target && s.localMount?.slot === c.slot && Number.isFinite(s.rootErrorM) && s.rootErrorM < .08 && Number.isFinite(s.stateErrorM) && s.stateErrorM < .08 && s.riderVisible && s.seatHud && finite3(s.carrierWorld) && finite3(s.riderRoot));
  let carrierTravelM = 0, carrierXZTravelM = 0, riderTravelM = 0, carrierYRangeM = 0;
  if (samples.length >= 2 && samples.every(s => finite3(s.carrierWorld) && finite3(s.riderRoot))) {
    const b = samples[0];
    carrierTravelM = Math.max(...samples.map(s => Math.hypot(...s.carrierWorld.map((v: number, i: number) => v - b.carrierWorld[i]))));
    carrierXZTravelM = Math.max(...samples.map(s => Math.hypot(s.carrierWorld[0] - b.carrierWorld[0], s.carrierWorld[2] - b.carrierWorld[2])));
    riderTravelM = Math.max(...samples.map(s => Math.hypot(...s.riderRoot.map((v: number, i: number) => v - b.riderRoot[i]))));
    carrierYRangeM = Math.max(...samples.map(s => s.carrierWorld[1])) - Math.min(...samples.map(s => s.carrierWorld[1]));
  }
  return { sampleCount: samples.length, attachment: !!every, movingAttachment: !!every && carrierXZTravelM > 1 && carrierYRangeM > .5 && riderTravelM > 1, carrierTravelM, carrierXZTravelM, carrierYRangeM, riderTravelM, maxRootErrorM: samples.length ? Math.max(...samples.map(s => s.rootErrorM ?? Infinity)) : null, visualVerdict: 'NOT_JUDGED' };
}

async function dismountOwn(page: any, report: any) {
  const mounted = await page.evaluate(() => { const r = (window as any).__moonmothReview; return !!(r?.state.st.mounts?.[r.cfg.name] || r?.world.avatarMounts.has(r.cfg.name)); });
  if (!mounted) { report.dismount = { verified: true, wasMounted: false }; return; }
  try {
    // Exercise the public WASD-hop-off path; only the isolated probe's key set changes.
    await page.evaluate(() => (window as any).__moonmothReview.controller.keys.add('KeyW'));
    await page.waitForFunction(() => { const r = (window as any).__moonmothReview; return !r.world.avatarMounts.has(r.cfg.name) && !r.state.st.mounts?.[r.cfg.name]; }, undefined, { timeout: 12_000 });
    report.dismount = { verified: true, wasMounted: true, via: 'native KeyW controller', at: Date.now() };
  } finally {
    await page.evaluate(() => (window as any).__moonmothReview.controller.keys.delete('KeyW'));
  }
}
export type WireConfig = { mode: string; name: string; world: string; target: string; slot?: string; action?: string };
export function wireAllowed(m: any, c: WireConfig): boolean {
  if (!m || typeof m !== 'object') return false;
  if (m.type === 'join') return m.id === c.name && m.world === c.world && !m.token && !m.renderer && !m.spectate && Object.keys(m).every(k => ['type', 'id', 'world', 'avatar', 'token', 'renderer', 'spectate'].includes(k));
  if (['pose', 'ping', 'history', 'debug'].includes(m.type)) return true;
  if (c.mode !== 'ride' || m.type !== 'verb' || !m.args) return false;
  const a = m.args;
  if (m.verb === 'mount') return a.id === c.name && a.to === c.target && !!c.slot && a.slot === c.slot && Object.keys(a).every(k => ['id', 'to', 'slot'].includes(k));
  if (m.verb === 'use') return a.id === c.target && !!c.action && a.action === c.action && Object.keys(a).every(k => ['id', 'action'].includes(k));
  if (m.verb === 'dismount') return a.id === c.name && Array.isArray(a.pos) && a.pos.length === 3 && a.pos.every(Number.isFinite) && Number.isFinite(a.yaw) && Object.keys(a).every(k => ['id', 'pos', 'yaw'].includes(k));
  return false;
}
