import {readOnlyWire} from '../../live-eye.ts';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {effectiveClock} from '../../../../../shared/forecast.js';
const base=resolve(import.meta.dir,'../..');
const cfg=JSON.parse(readFileSync(resolve(base,'../config.json'),'utf8'));
const id=`arthur-village-eye-${randomUUID().slice(0,12)}`;
const counts={join:0,pose:0,verb:0},at=Date.now();let ws:any;
try{
const snap:any=await new Promise((yes,no)=>{
 ws=new WebSocket(cfg.url);const timer=setTimeout(()=>no(Error('snapshot timeout')),15000);
 ws.onopen=()=>{ws.send(readOnlyWire({type:'join',world:'commons-next',id,avatar:cfg.avatar,agent:true,spectate:false,token:cfg.joinToken,agentToken:cfg.agentToken},'body',id));counts.join++;};
 ws.onerror=()=>{clearTimeout(timer);no(Error('WS error'));};
 ws.onmessage=(ev:any)=>{const m=JSON.parse(String(ev.data));if(m.type==='error'){clearTimeout(timer);no(Error('server refused'));}if(m.type==='snapshot'){clearTimeout(timer);yes(m);}};
});
if(snap.you!==id||snap.world!=='commons-next'||snap.restore)throw Error('identity mismatch');
const report={at:new Date(at).toISOString(),world:snap.world,you:snap.you,throughSeq:snap.throughSeq,sky:snap.state.sky,effectiveClock:effectiveClock(snap.state.sky,at),lights:['nx-town-hall-l','nx-town-inn-l'].map(id=>snap.state.entities[id]),wireCounts:counts,uploads:0};
await new Promise<void>(r=>{ws.onclose=()=>r();ws.close();});
writeFileSync(`${import.meta.dir}/sky-snapshot.json`,JSON.stringify({...report,bodyClosed:ws.readyState===WebSocket.CLOSED},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report,null,2));
}finally{ws?.close();}
