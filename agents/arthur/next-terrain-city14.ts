// next-terrain-city14.ts — city-14 kiln compression terrain preflight.
// FINAL seat: host az49.5 r29.5 (19.159, 22.432), yaw = TH_OLD + (AZ_OLD-49.5)°
// = -2.44443 rad (-140.0deg) — radial-inward preserved (local +z fire mouth to
// plaza). TRUE local OBB corners of host + b12 + sign (12 pts, centers incl.).
import{WorldAgent}from"../../mcpl/agent.ts";import{readFileSync}from"node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const PX=19.159,PZ=22.432,AZOLD=51.4539,THOLD=-2.4784945651581642;
const YAW=THOLD+(AZOLD-49.5)*Math.PI/180;
const c=Math.cos(YAW),s=Math.sin(YAW);
const hostC=[[-2.228,-1.300],[2.650,1.708],[2.650,-1.300],[-2.228,1.708]]; // cx0.211 cz0.204 incl.
const b12L=[0,1.207], b12C=[[-0.775,1.1445],[0.775,1.2695],[0.775,1.1445],[-0.775,1.2695]];
const signL=[0,0.318], signC=[[-0.888,-0.8885],[0.888,1.5245],[0.888,-0.8885],[-0.888,1.5245]];
const pts:any[]=[];
for(const [lx,lz] of hostC) pts.push({name:"host",lx,lz});
for(const [lx,lz] of b12C) pts.push({name:"b12",lx:b12L[0]+lx,lz:b12L[1]+lz});
for(const [lx,lz] of signC) pts.push({name:"sign",lx:signL[0]+lx,lz:signL[1]+lz});
const a=new WorldAgent({url:cfg.url,name:"arthur-city14-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
const out:any[]=[];
try{
 await a.connect();await Bun.sleep(1700);a.stop();
 for(const p of pts){
   const wx=PX+p.lx*c+p.lz*s, wz=PZ-p.lx*s+p.lz*c;
   const y=await a.heightAt(wx,wz);
   out.push({name:p.name,x:+wx.toFixed(3),z:+wz.toFixed(3),y:+y.toFixed(5)});
 }
 const ys=out.map(o=>o.y);
 console.log(JSON.stringify({status:"TERRAIN",yaw:+YAW.toFixed(6),points:out,min:+Math.min(...ys).toFixed(5),max:+Math.max(...ys).toFixed(5),spreadMM:+((Math.max(...ys)-Math.min(...ys))*1000).toFixed(1)},null,1));
}finally{a.close()}
