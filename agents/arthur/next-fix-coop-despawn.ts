// next-fix-coop-despawn.ts — remove the live nx-dress-coop so the placer can re-seat it at (37.5,-6.5).
import {readFileSync}from"node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
await new Promise<void>((resolve,reject)=>{
  const ws=new WebSocket(cfg.url);let sent=false;
  const timer=setTimeout(()=>reject(Error("timeout")),20000);
  ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:"commons-next",id:"arthur-fix-coop",avatar:cfg.avatar,token:cfg.joinToken}));
  ws.onerror=()=>reject(Error("ws error"));
  ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);
    if(x.type==="error"){clearTimeout(timer);reject(Error(x.error))}
    else if(x.type==="snapshot"){if(!sent){sent=true;ws.send(JSON.stringify({type:"verb",verb:"remove",args:{id:"nx-dress-coop"}}));console.log("remove verb sent")}}
    else if(x.type==="log"&&String(x?.entry?.verb)==="remove"){console.log("remove logged:",JSON.stringify(x.entry).slice(0,120));clearTimeout(timer);ws.close();resolve()}};
});
console.log("coop removed");
