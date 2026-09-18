// Identical-camera comparison, including a strict identical-byte renderer control.
import sharp from 'sharp';
import { readFile,writeFile } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { createHash } from 'node:crypto';
const dir=resolve(process.argv[2]);
const frames=['front','right','back','left','gameplay','aerial','top','night','motion-a','motion-b','boarding','horse-side','horse-front','horse-threequarter','horse-rear'];
const evidence:any={label:'LOCAL EXACT-BYTE REVIEW, NOT IN-WORLD',control:{},pairs:{}};
const hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
for(const frame of frames){
  const a=await sharp(join(dir,'before',frame+'.png')).raw().toBuffer();
  const control=await sharp(join(dir,'before-control',frame+'.png')).raw().toBuffer();
  if(!a.equals(control))throw new Error(`Identical-byte renderer control failed: ${frame}`);
  evidence.control[frame]={sha256:hash(a),identical:true};
  const b=await sharp(join(dir,'after',frame+'.png')).raw().toBuffer();
  evidence.pairs[frame]={before:hash(a),after:hash(b),different:!a.equals(b)};
}
async function sheet(name:string,views:[string,string][]) {
  const panels:{input:Buffer,left:number,top:number}[]=[],w=1280,h=90+views.length*510;
  panels.push({input:Buffer.from(`<svg width="1280" height="90"><rect width="1280" height="90" fill="#18232c"/><text x="20" y="30" font-family="sans-serif" font-size="25" fill="#f0e6d3">Carousel horse: one cream-horse prototype</text><text x="20" y="56" font-family="sans-serif" font-size="17" fill="#b7c8d2">LEFT: current served model   /   RIGHT: candidate v2 — only horse_2 replaced</text><text x="20" y="78" font-family="sans-serif" font-size="14" fill="#b7c8d2">Fixed cameras and lighting · local exact-byte review · not in-world · no rider-function claim</text></svg>`),left:0,top:0});
  for(let row=0;row<views.length;row++)for(let col=0;col<2;col++){
    const [frame,label]=views[row],x=col*640,y=90+row*510;
    panels.push({input:Buffer.from(`<svg width="640" height="30"><rect width="640" height="30" fill="#293743"/><text x="14" y="22" font-family="sans-serif" font-size="17" fill="#eee5d7">${label} — ${col?'candidate':'current'}</text></svg>`),left:x,top:y});
    panels.push({input:await sharp(join(dir,col?'after':'before',frame+'.png')).resize(640,480).png().toBuffer(),left:x,top:y+30});
  }
  await sharp({create:{width:w,height:h,channels:4,background:'#18232c'}}).composite(panels).png().toFile(join(dir,name+'.png'));
}
await sheet('horse-comparison',[['horse-side','Profile'],['horse-threequarter','Three-quarter']]);
await sheet('carousel-context',[['boarding','Boarding-range ensemble'],['gameplay','18 m silhouette']]);
await writeFile(join(dir,'render-evidence.json'),JSON.stringify(evidence,null,2));
console.log(JSON.stringify({identicalControls:frames.length,totalPairs:frames.length,differentPairs:Object.values(evidence.pairs).filter((p:any)=>p.different).length,sheets:['horse-comparison.png','carousel-context.png']}));
