// next-terrain-city13.ts — city-13 potter compression terrain preflight.
// FINAL seat: host az18.0 r25.0 (23.776, 7.725), yaw = TH_OLD + (AZ_OLD-18)°
// = -1.89757 rad (-108.72deg) — TRUE radial-inward (local +z: apron/porch to
// plaza; self-catch: first probe used the wrong sign, -183.8 = tangent).
// Riders at TRUE host-local seats: porch (1.5499, 0.3502), sign (1.4996, 3.1002).
// Probe points = TRUE local OBB corners of each of the 3 GLBs (12 pts).
import{WorldAgent}from"../../mcpl/agent.ts";import{readFileSync}from"node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const PX=23.776,PZ=7.725,AZOLD=57.2836,THOLD=-2.5834592128923776;
const YAW=THOLD+(AZOLD-18.0)*Math.PI/180;
const c=Math.cos(YAW),s=Math.sin(YAW);
const hostC=[[-1.732,-1.147],[1.703,0.853],[1.703,-1.147],[-1.732,0.853]]; // cx-0.007,cz-0.147 included
const porchL=[1.5499,0.3502], porchC=[[-2.275,-2.075],[2.275,2.075],[2.275,-2.075],[-2.275,2.075]];
const signL=[1.4996,3.1002], signC=[[-0.26,-0.562],[0.26,1.168],[0.26,-0.562],[-0.26,1.168]]; // cz+0.303 incl.
const pts:any[]=[];
for(const [lx,lz] of hostC) pts.push({name:"host",lx,lz});
for(const [lx,lz] of porchC) pts.push({name:"porch",lx:porchL[0]+lx,lz:porchL[1]+lz});
for(const [lx,lz] of signC) pts.push({name:"sign",lx:signL[0]+lx,lz:signL[1]+lz});
const a=new WorldAgent({url:cfg.url,name:"arthur-city13-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
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
