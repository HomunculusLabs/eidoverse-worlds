// Parent-operated live path, adapted from ../moon-moth/live-review.ts.
// Never imported by --check/--help. No world construction, actions, or socket-height edits.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { BASE, WORLD, TARGET, contextOptions, parseOptions, wireAllowed, createWireGate, installWireGuard, assertPreflight, attachmentMetrics, type WireConfig } from './live-review.ts';

const sha = (b: any) => createHash('sha256').update(b).digest('hex');
const REQUIRED_MODULES = ['main.js','lib/core.js','lib/net.js','lib/world.js','lib/state.js','lib/localbody.js','lib/controller.js','lib/motion.js'];
const MODULES = [...REQUIRED_MODULES,'lib/seats.js','lib/seatcore.js','lib/motioneval.js','lib/mybody.js'];
export const seatViews = [{ label:'01-mounted-close',yaw:Math.PI/2 },{ label:'02-mounted-opposite',yaw:-Math.PI/2 },{ label:'02b-mounted-side',yaw:0 }];

// Same scoped loader as the moth chassis. Read only joinToken, never resident identity/bearer.
function loadSharedDoor(path?: string): string {
  let key: unknown = '';
  if (path) {
    try { key = JSON.parse(readFileSync(resolve(path),'utf8')).joinToken; }
    catch { throw new Error('shared-door config unreadable or invalid JSON; contents withheld'); }
  }
  if (typeof key !== 'string' || /^(aid1|eyJ)/.test(key)) throw new Error('door config must contain a shared joinToken, never an identity bearer');
  return key;
}

// Runs in the public client, reads only. socketWorldPos is REST/reach, NOT animated seat proof.
export function readPreflight() {
  const w = window as any, r = w.__carouselReview, c = r.cfg, carrier = w.EW.entities.get(c.target);
  const horse = carrier && r.world.findPart(carrier,c.slot), carousel = carrier && r.world.findPart(carrier,'carousel');
  const bag = r.world.comps.get(c.target);
  const node = (o: any) => o ? { name:o.name,parent:o.parent?.name,motionBase:!!o.userData.mbase } : null;
  return { targetState:r.state.st.entities[c.target] ?? null, sockets:bag?.sockets ?? null, slot:bag?.sockets?.[c.slot] ?? null,
    occupied:Object.values(r.state.st.mounts ?? {}).some((m: any) => m.to === c.target),
    horse:node(horse),carousel:node(carousel),motion:bag?.[`motion:${c.slot}`] ?? null,spin:bag?.['motion:carousel'] ?? null,
    publicSit:typeof r.localbody.trySitOn === 'function',nativeKeys:typeof r.controller.keys?.add === 'function' };
}
export function readSample() {
  const w = window as any, e = w.EW, r = w.__carouselReview, c = r.cfg, T = e.THREE;
  const carrier = e.entities.get(c.target), me = e.me(), p = new T.Vector3();
  const horse = carrier && r.world.findPart(carrier,c.slot), carousel = carrier && r.world.findPart(carrier,'carousel');
  // Use the exact same public call signature as updateMountedMe, no replacement evaluator.
  const mountInfo = r.world.mountTransform(c.name,p);
  const worldPos = (o: any) => o?.getWorldPosition(new T.Vector3());
  const root = worldPos(me?.root), hp = worldPos(horse), cp = worldPos(carrier);
  const hips = worldPos(me?.vrm?.humanoid?.getRawBoneNode?.('hips'));
  const forward = (o: any) => o ? new T.Vector3(0,0,1).applyQuaternion(o.getWorldQuaternion(new T.Quaternion())) : null;
  const riderForward = forward(me?.root), horseForward = forward(horse);
  const headingDelta = riderForward&&horseForward ? Math.atan2(riderForward.x,riderForward.z)-Math.atan2(horseForward.x,horseForward.z) : null;
  // Packaging merges mesh names. Resolve saddle MATERIALS only within the intended horse.
  const saddleMeshes: any[]=[];
  const saddleMaterial = (m: any) => ['prototype_saddle_leather',`${c.slot}_saddle_leather`].includes(m?.name);
  horse?.traverse((o: any) => { if(o.isMesh && (Array.isArray(o.material)?o.material:[o.material]).some(saddleMaterial))saddleMeshes.push(o); });
  const saddleRayOrigin = horse ? horse.localToWorld(new T.Vector3(.075,1.12,0)) : null;
  let saddleContact: any = null;
  if (saddleRayOrigin && saddleMeshes.length) {
    const direction=new T.Vector3(0,-1,0).transformDirection(horse.matrixWorld);
    const hits=new T.Raycaster(saddleRayOrigin,direction).intersectObjects(saddleMeshes,false);
    saddleContact=hits.find((hit: any) => saddleMaterial(Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex??0]:hit.object.material))?.point ?? null;
  }
  const cq = carousel?.getWorldQuaternion(new T.Quaternion());
  const fwd = cq ? new T.Vector3(0,0,1).applyQuaternion(cq) : null;
  const bounds = (o: any) => { if (!o) return null; const b = new T.Box3().setFromObject(o); return {min:b.min.toArray(),max:b.max.toArray()}; };
  const screen = (v: any) => { if (!v) return null; const q=v.clone().project(e.camera); return {x:(q.x+1)*innerWidth/2,y:(1-q.y)*innerHeight/2,inFrustum:Math.abs(q.x)<=1&&Math.abs(q.y)<=1&&Math.abs(q.z)<=1}; };
  return { at:Date.now(), seq:r.state.lastSeq, targetLib:r.state.st.entities[c.target]?.lib ?? null,
    authoritativeMount:r.state.st.mounts?.[c.name] ?? null,localMount:r.world.avatarMounts.get(c.name) ?? null,
    expectedRoot:mountInfo ? p.toArray() : null,mountInfo,rootErrorM:mountInfo&&root ? root.distanceTo(p) : null,
    stateErrorM:mountInfo ? e.myState.pos.distanceTo(p) : null,riderRoot:root?.toArray() ?? null,
    riderClip:e.myState.clip,riderVisible:!!me?.vrm?.scene.visible,hipsWorld:hips?.toArray() ?? null,
    saddleContactWorld:saddleContact?.toArray() ?? null,hipsAboveSaddleM:hips&&saddleContact ? hips.y-saddleContact.y : null,
    riderForwardWorld:riderForward?.toArray() ?? null,horseForwardWorld:horseForward?.toArray() ?? null,
    riderHorseHeadingDeltaRad:headingDelta===null ? null : Math.atan2(Math.sin(headingDelta),Math.cos(headingDelta)),
    saddleRayOriginWorld:saddleRayOrigin?.toArray() ?? null,
    saddleContactSource:saddleContact ? 'raycast loaded saddle material from horse-local [.075,1.12,0]; approved seat plane y=1.015, no invented contact' : 'unavailable; visual review required',
    riderInHorseLocal:horse&&root ? horse.worldToLocal(root.clone()).toArray() : null,
    carrierWorld:cp?.toArray() ?? null,horseWorld:hp?.toArray() ?? null,horseLocal:horse?.position.toArray() ?? null,
    carouselYaw:fwd ? Math.atan2(fwd.x,fwd.z) : null,horseBounds:bounds(horse),carrierBounds:bounds(carrier),
    socketRestWorld:r.world.socketWorldPos(c.target,c.slot,new T.Vector3())?.toArray() ?? null,
    sockets:r.world.comps.get(c.target)?.sockets ?? null,seatHud:document.body.innerText.includes('hop off'),
    rendererFrame:e.renderer.info.frame ?? e.renderer.info.render?.calls ?? null,
    camera:{position:e.camera.position.toArray(),quaternion:e.camera.quaternion.toArray(),fov:e.camera.fov},
    screen:{root:screen(root),hips:screen(hips),horse:screen(hp),saddle:screen(saddleContact)} };
}

export async function frameUnderCanopy(page: any) {
  const beforePitch=await page.evaluate(()=>(window as any).__carouselReview.controller.camPitch);
  if(!Number.isFinite(beforePitch))throw new Error('native camera pitch unavailable');
  // Public controller.js right-drag: camPitch += movementY * .004.
  // Keep the camera below the roof; do not disable collisions or replace rendering.
  await page.mouse.move(1000,400);
  await page.mouse.down({button:'right'});
  try{await page.mouse.move(1000,400+(-.10-beforePitch)/.004);}
  finally{await page.mouse.up({button:'right'});}
  const afterPitch=await page.evaluate(()=>(window as any).__carouselReview.controller.camPitch);
  if(!Number.isFinite(afterPitch)||Math.abs(afterPitch+.10)>.01)throw new Error('native under-canopy pointer framing did not land');
  return {beforePitch,afterPitch,via:'native right-drag; no camera/renderer/collision override'};
}

async function dismountOwn(page: any, report: any) {
  const mounted = await page.evaluate(() => { const r=(window as any).__carouselReview; return !!(r?.state.st.mounts?.[r.cfg.name] || r?.world.avatarMounts.has(r.cfg.name)); });
  if (!mounted) { report.dismount={verified:true,wasMounted:false}; return; }
  try {
    // Native public WASD hop-off path, only our isolated probe's key set.
    await page.evaluate(() => (window as any).__carouselReview.controller.keys.add('KeyW'));
    await page.waitForFunction(() => { const r=(window as any).__carouselReview; return !r.world.avatarMounts.has(r.cfg.name) && !r.state.st.mounts?.[r.cfg.name]; },undefined,{timeout:12_000});
    report.dismount={verified:true,wasMounted:true,via:'native KeyW controller',at:Date.now()};
  } finally {
    await page.evaluate(() => (window as any).__carouselReview.controller.keys.delete('KeyW'));
  }
}

async function reviewSlot(a: ReturnType<typeof parseOptions>, cfg: WireConfig, out: string, doorKey: string) {
  mkdirSync(out,{recursive:true});
  const scrub = (s: any) => {
    let value=String(s); if (doorKey) value=value.split(doorKey).join('[REDACTED]');
    return value.replace(/([?&](?:token|key|code|ticket)=)[^&\s"']+/gi,'$1[REDACTED]').replace(/aid1\.[\w.\-]+/g,'[REDACTED]').slice(0,1400);
  };
  const report: any = { version:1,base:BASE,world:WORLD,target:TARGET,slot:cfg.slot,probe:cfg.name,mode:a.mode,expectedLib:a.expectLib,
    startedAt:new Date().toISOString(),visualVerdict: 'NOT_JUDGED',rideInvoked:false,frames:[],samples:[],modules:{},assets:{},
    errors:[],console:[],requestsFailed:[],blockedHttp:[],relayErrors:[],
    isolation:{headless:true,freshContext:true,residentCredentials:false,userBrowserAttached:false,sharedDoorKeyInNodeRelay:!!doorKey,httpWritesBlocked:true},
    pending:'Native visual review of intended saddle occupancy/contact, rotation/bob attachment and dismount is required; metrics alone cannot PASS.' };
  const gate = createWireGate(cfg,wireAllowed); report.relay=gate.audit;
  let browser: any,ctx: any,page: any,mountAttempted=false;
  const responseTasks: Promise<void>[]=[];
  const sample = async (label: string) => {
    const s=await page.evaluate(readSample);
    report.samples.push({label,...s});
    if (a.expectLib && s.targetLib!==a.expectLib) throw new Error('target lib changed during inspection/ride');
    if (report.originalSockets && JSON.stringify(s.sockets)!==JSON.stringify(report.originalSockets)) throw new Error('socket bag changed during ride — stopping without editing heights');
    return s;
  };
  const capture = async (label: string) => {
    const s=await sample(label),png=join(out,`${label}.png`);
    await page.screenshot({path:png,timeout:20_000});
    report.frames.push({label,png,sha256:sha(readFileSync(png)),sampledAt:s.at,screenshotFinishedAt:Date.now()});
  };
  try {
    const {chromium}=await import('playwright');
    browser=await chromium.launch({ headless: true, ...(a.channel==='chrome'?{channel:'chrome'}:{}),
      args:['--enable-unsafe-webgpu','--ignore-gpu-blocklist','--mute-audio','--disable-background-timer-throttling','--disable-renderer-backgrounding'] });
    report.browserVersion=browser.version();
    ctx=await browser.newContext(contextOptions(a.mode==='ride',out));
    await ctx.routeWebSocket('**/*',(ws: any) => {
      if (ws.url()!==BASE.replace('https:','wss:')+'/ws') { ws.close(); return; }
      const server=ws.connectToServer();
      ws.onMessage((raw: any) => {
        let m: any; try { m=JSON.parse(String(raw)); } catch {m=null;}
        if (!gate.accept(m)) return;
        // Shared door exists ONLY at this Node relay boundary, never in URL/page/config.
        server.send(JSON.stringify(m.type==='join'?{...m,token:doorKey}:m));
      });
      server.onMessage((raw: any) => {
        let m: any; try {m=JSON.parse(String(raw));}catch{}
        if (m?.type==='error') report.relayErrors.push(scrub(m.error));
        ws.send(raw);
      });
    });
    await ctx.route('**/*',async(route: any) => {
      const r=route.request();
      if (!['GET','HEAD'].includes(r.method()) || (r.isNavigationRequest() && new URL(r.url()).origin!==BASE)) {
        if(report.blockedHttp.length<80)report.blockedHttp.push({method:r.method(),url:scrub(r.url())});
        return route.abort('blockedbyclient');
      }
      return route.continue();
    });
    await ctx.addInitScript({content:`(${installWireGuard.toString()})(${JSON.stringify(cfg)},${wireAllowed.toString()},${createWireGate.toString()})`});
    page=await ctx.newPage();
    page.on('pageerror',(e: Error)=>report.errors.push({kind:'pageerror',message:scrub(e.message)}));
    page.on('console',(m: any)=>{if(['warning','error'].includes(m.type())&&report.console.length<80)report.console.push({type:m.type(),message:scrub(m.text())});});
    page.on('requestfailed',(r: any)=>{if(report.requestsFailed.length<80)report.requestsFailed.push({url:scrub(r.url()),message:scrub(r.failure()?.errorText)});});
    page.on('response',(r: any)=>{
      const url=new URL(r.url()),path=url.pathname.slice(1);
      const module=MODULES.includes(path),asset=!!a.expectLib&&url.pathname.endsWith('/'+a.expectLib);
      if(url.origin!==BASE||(!module&&!asset))return;
      responseTasks.push((async()=>{
        const bag=module?report.modules:report.assets;
        try {
          const bytes=await r.body(),local=resolve(import.meta.dir,'../../..','client',path);
          bag[path]={status:r.status(),sha256:sha(bytes),...(module?{matchesCheckout:existsSync(local)?sha(readFileSync(local))===sha(bytes):null}:{})};
        }catch(e){bag[path]={error:scrub(e)};}
      })());
    });
    const url=new URL(BASE);url.search=new URLSearchParams({world:WORLD,name:cfg.name,avatar:'claude',prefetch:'0'}).toString();
    await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:45_000});
    await page.waitForFunction(()=>{const e=(window as any).EW;return e?.net?.status==='rejected'||!!(e?.net?.joined&&e?.me()?.vrm);},undefined,{timeout:120_000});
    if(await page.evaluate(()=>(window as any).EW?.net?.status==='rejected'))throw new Error('guest join rejected: '+(report.relayErrors.join('; ')||'door refused'));
    report.client=await page.evaluate(async()=>{
      const e=(window as any).EW,core=await import('/lib/core.js');
      return {joined:e.net.joined,myId:e.net.myId,name:core.CONFIG.name,bodyLoaded:!!e.me()?.vrm,
        webgpuBackend:!!e.renderer.backend?.isWebGPUBackend,gpuAdapter:!!await navigator.gpu?.requestAdapter(),entityCount:e.entities.size};
    });
    if(report.client.name!==cfg.name||report.client.myId!==cfg.name)throw new Error('guest identity mismatch — refusing any resident identity');
    if(!report.client.webgpuBackend||!report.client.bodyLoaded||!report.client.gpuAdapter)throw new Error('public WebGPU/avatar unavailable — no visual proof');
    await page.evaluate(async(c: any)=>{
      const w=window as any,[world,state,localbody,controller]=await Promise.all([import('/lib/world.js'),import('/lib/state.js'),import('/lib/localbody.js'),import('/lib/controller.js')]);
      w.__carouselReview={world,state:state.state,localbody,controller,cfg:c};
      (await import('/lib/ui.js')).panelFrame().hide(); // public panel API; keep native seat HUD
      controller.setCamYaw(Math.PI/2);
      const ent=state.state.st.entities[c.target];
      if(ent?.pos)w.EW.myState.pos.set(ent.pos[0]+6,ent.pos[1],ent.pos[2]+3); // ONLY own guest presence, before seating
    },cfg);
    await page.waitForFunction((id: string)=>{const ent=(window as any).EW.entities.get(id);return ent&&!ent.userData.placeholder;},TARGET,{timeout:45_000});
    await page.waitForTimeout(4000);
    report.preflight=await page.evaluate(readPreflight);
    report.originalSockets=report.preflight.sockets;
    if(a.expectLib&&report.preflight.targetState?.lib!==a.expectLib)throw new Error('target absent or exact lib pin differs');
    await capture('00-inspect');
    report.outcome='INSPECTION_CAPTURED';
    if(a.mode==='ride') {
      assertPreflight(report.preflight,a.expectLib!,cfg.slot);
      await Promise.all(responseTasks);
      if(REQUIRED_MODULES.some(p=>!report.modules[p]?.sha256||report.modules[p].status!==200))throw new Error('required loaded public module hashes incomplete — no mount');
      // Repeat state/occupancy check immediately before arming either outbound boundary.
      report.preflight=await page.evaluate(readPreflight); assertPreflight(report.preflight,a.expectLib!,cfg.slot);
      if(JSON.stringify(report.originalSockets)!==JSON.stringify(report.preflight.sockets))throw new Error('socket bag drift before mount');
      gate.arm();
      mountAttempted=true;report.rideInvoked=true;
      await page.evaluate(()=>{
        const w=window as any,r=w.__carouselReview;
        w.__carouselGuard.arm();
        if(!r.localbody.trySitOn(`${r.cfg.target}.${r.cfg.slot}`))throw new Error('public trySitOn refused target slot');
      });
      await page.waitForFunction(()=>{const r=(window as any).__carouselReview,m=r.state.st.mounts?.[r.cfg.name];return m?.to===r.cfg.target&&m.slot===r.cfg.slot;},undefined,{timeout:12_000});
      await page.waitForTimeout(1500);
      report.cameraFraming=await frameUnderCanopy(page);
      for(const view of seatViews) {
        // Relative to current horse yaw, keeping opposing and side views meaningful while rotating.
        await page.evaluate((yaw: number)=>{const w=window as any,r=w.__carouselReview,p=new w.EW.THREE.Vector3(),m=r.world.mountTransform(r.cfg.name,p);r.controller.setCamYaw((m?.yaw??0)+yaw);},view.yaw);
        await page.waitForTimeout(650);await capture(view.label);
      }
      await page.mouse.move(640,450);await page.mouse.wheel(0,1800);
      await page.waitForTimeout(700);await capture('03-mounted-wide');
      report.motionStartedAt=Date.now();
      for(const sec of a.times) {
        const due=report.motionStartedAt+sec*1000;
        while(Date.now()<due) {await page.waitForTimeout(Math.min(200,due-Date.now()));await sample('motion-sample');}
        await capture(`motion-${sec}s`);
      }
      report.attachmentMetrics=attachmentMetrics(report.samples.filter((s: any)=>s.label.startsWith('motion-')||s.label==='03-mounted-wide'),cfg);
      await dismountOwn(page,report);await page.waitForTimeout(1200);await capture('99-dismounted');
      report.finalState=await page.evaluate(readPreflight);
      report.socketsUnchanged=JSON.stringify(report.originalSockets)===JSON.stringify(report.finalState.sockets);
      report.outcome=report.attachmentMetrics.movingAttachment&&report.dismount?.verified&&report.dismount.wasMounted&&report.socketsUnchanged?'RIDE_METRICS_CAPTURED':'RIDE_METRICS_FAILED';
    }
  }catch(e){
    report.errors.push({kind:'harness',message:scrub(e)});report.outcome='BLOCKED';
    if(page&&!page.isClosed()){
      try{report.diagnostics=await page.evaluate(()=>({engineUp:!!(window as any).__ewEngineUp,joined:(window as any).EW?.net?.joined??false,ownId:(window as any).EW?.net?.myId??null,gpu:!!navigator.gpu}));}catch{}
      try{const png=join(out,'blocked.png');await page.screenshot({path:png,timeout:10_000});report.blockedScreenshot={png,sha256:sha(readFileSync(png))};}catch{}
    }
  }finally{
    if(mountAttempted&&!report.dismount?.verified&&page&&!page.isClosed()){
      try{await dismountOwn(page,report);}catch(e){report.errors.push({kind:'cleanup',message:scrub(e)});report.outcome='BLOCKED';}
    }
    if(page&&!page.isClosed()){try{report.wire=await page.evaluate(()=>(window as any).__carouselGuard?.audit);}catch{}}
    await Promise.all(responseTasks);
    try{await ctx?.close();await browser?.close();}catch(e){report.errors.push({kind:'browser-close',message:scrub(e)});report.outcome='BLOCKED';}
    if(a.mode==='ride'&&page?.video()){try{const path=await page.video().path();report.video={path,sha256:sha(readFileSync(path)),scope:'unedited isolated public renderer, including loading/setup; not generated motion frames'};}catch(e){report.errors.push({kind:'video',message:scrub(e)});report.outcome='BLOCKED';}}
    if(report.errors.some((e: any)=>e.kind==='pageerror'))report.outcome='BLOCKED';
    report.finishedAt=new Date().toISOString();
    writeFileSync(join(out,'report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify({outcome:report.outcome,slot:cfg.slot,report:join(out,'report.json'),frames:report.frames.length,sentVerbs:gate.audit.sentVerbs.map(v=>v.verb),errors:report.errors,visualVerdict:report.visualVerdict}));
  }
  return {code:['BLOCKED','RIDE_METRICS_FAILED'].includes(report.outcome)?1:0,outcome:report.outcome,slot:cfg.slot,report:join(out,'report.json')};
}

export async function runLive(a: ReturnType<typeof parseOptions>) {
  if(a.check||a.help)throw new Error('offline flags must never enter live runtime');
  const out=resolve(a.out??join(tmpdir(),`carousel-review-${randomUUID().slice(0,8)}`));
  if(existsSync(out))throw new Error('refusing existing output directory; choose a NEW --out');
  const doorKey=loadSharedDoor(a.doorConfig);
  mkdirSync(out,{recursive:true});
  const summary: any={world:WORLD,target:TARGET,requestedSlots:a.slots,results:[],visualVerdict:'NOT_JUDGED',mode:a.mode};
  for(const slot of a.slots){
    const cfg: WireConfig={mode:a.mode,name:`carousel-probe-${randomUUID().slice(0,8)}`,world:WORLD,target:TARGET,slot};
    const result=await reviewSlot(a,cfg,join(out,slot),doorKey);summary.results.push(result);
    if(result.code)break; // no second-slot continuation after an unresolved mount or renderer failure
  }
  summary.completedSlots=summary.results.map((r: any)=>r.slot);
  summary.unattemptedSlots=a.slots.filter(s=>!summary.completedSlots.includes(s));
  summary.code=summary.unattemptedSlots.length||summary.results.some((r: any)=>r.code)?1:0;
  writeFileSync(join(out,'summary.json'),JSON.stringify(summary,null,2));
  return summary.code;
}
