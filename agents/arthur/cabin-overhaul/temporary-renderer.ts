// Temporary READ-ONLY headless public-client renderer. No service installation.
// Starts in a fresh incognito context; secrets never enter URL or console output.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
export function rendererURL(base:string){
 const u=new URL(base);if(u.origin!=='https://eidoverse.billding.dev'||u.pathname!=='/')throw Error('unapproved renderer origin');
 u.search='world=commons-next&renderer&name=arthur-cabin-eye';return u.href;
}
if(import.meta.main){
 const root=import.meta.dir,cfg=JSON.parse(readFileSync(`${root}/../config.json`,'utf8'));
 const base=cfg.url.replace(/^wss:/,'https:').replace(/^ws:/,'http:').replace(/\/ws$/,'');const url=rendererURL(base);
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-webgpu','--enable-gpu','--disable-background-timer-throttling','--disable-renderer-backgrounding'],timeout:60000});
 const ctx=await browser.newContext({viewport:{width:1280,height:960}});
 await ctx.addInitScript(({token})=>{
  if(location.origin==='https://eidoverse.billding.dev')localStorage.setItem('ew-key',token);
  const send=WebSocket.prototype.send;WebSocket.prototype.send=function(data:any){
   if(typeof data==='string'){let m;try{m=JSON.parse(data)}catch{}if(m?.type==='verb')throw Error('READ_ONLY_RENDERER_REFUSED_VERB');}
   return send.call(this,data);
  };
 },{token:cfg.joinToken});
 const page=await ctx.newPage();const errors:string[]=[];
 const safe=(s:string)=>s.replaceAll(cfg.joinToken??'NEVER_MATCH','[redacted]').replaceAll(cfg.agentToken??'NEVER_MATCH','[redacted]');
 page.on('pageerror',e=>errors.push(safe(String(e)).slice(0,600)));
 let stopping=false;async function stop(){if(stopping)return;stopping=true;await browser.close();console.log('TEMPORARY_RENDERER_CLOSED');process.exit(0);}
 process.on('SIGTERM',stop);process.on('SIGINT',stop);
 mkdirSync(`${root}/reviews/live`,{recursive:true});
 try{
  const r=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});if(!r?.ok())throw Error(`public client HTTP ${r?.status()}`);
  await page.waitForFunction(()=>!!(window as any).EW?.net?.joined,undefined,{timeout:120000});
  const health=await page.evaluate(()=>({joined:!!(window as any).EW?.net?.joined,hud:document.getElementById('hud')?.textContent?.slice(0,250)}));
  writeFileSync(`${root}/reviews/live/renderer-health.json`,JSON.stringify({time:new Date().toISOString(),...health,errors,evidence:'temporary headless actual PUBLIC client, read-only WebSocket guard'},null,2));
  console.log(JSON.stringify({status:'TEMPORARY_RENDERER_READY',...health,errors}));
  setTimeout(stop,15*60*1000);
 }catch(e){console.error(JSON.stringify({status:'TEMPORARY_RENDERER_FAILED',error:safe(String(e)),errors}));await browser.close();process.exitCode=1;}
}
