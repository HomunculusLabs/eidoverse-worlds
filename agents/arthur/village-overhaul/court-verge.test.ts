import {test,expect} from 'bun:test';
import {decode,inBox,nearest,read,base} from './build/forge-followup-geometry.ts';
const d=await decode(`${base}/build/court.glb`),parts=read(`${base}/build/court.json`).parts.filter((p:any)=>p.name==='outer_verge_cap');
for(const p of parts)test(`court verge cap at X=${p.min[0]} connects to real structure`,()=>{const cap=d.triangles.filter((t:any)=>inBox(t,p));expect(cap.length).toBe(12);const q=nearest(cap,d.triangles.filter((t:any)=>!cap.includes(t)));expect(q.gap).toBeLessThanOrEqual(.001);});
