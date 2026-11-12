import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {assertCensus} from '../../live-eye.ts';
import * as THREE from 'three';
import sharp from 'sharp';
const base=resolve(import.meta.dir,'../..'),sha=(b:any)=>createHash('sha256').update(b).digest('hex');
const read=(p:string)=>JSON.parse(readFileSync(join(base,p),'utf8'));const checks:any[]=[];
const original=read('reviews/live-recapture-diagnostics/original-evidence-hashes.json');
for(const [p,h]of Object.entries(original))if(sha(readFileSync(join(base,p)))!==h)throw Error('ORIGINAL EVIDENCE MODIFIED '+p);
checks.push({check:'all pre-existing live evidence files and original live-views.json byte-unchanged',pass:true,files:Object.keys(original).length});
const expected=read('reviews/live-hall-inn-expected.json'),http:any[]=[];
const at=new Date().toISOString(),url='https://eidoverse.billding.dev/geom?world=commons-next';
const response=await fetch(url,{method:'GET',redirect:'error',signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('final census HTTP '+response.status);const bytes=Buffer.from(await response.arrayBuffer()),census=JSON.parse(bytes.toString());
assertCensus(census,expected);writeFileSync(join(import.meta.dir,'geom-final.json'),bytes,{flag:'wx'});http.push({at,url,method:'GET',status:response.status,sha256:sha(bytes)});
checks.push({check:'both exact deployed tuples in fresh final census',pass:true});
const summary:any={status:'VERIFIED_SUPPLEMENTAL_LIVE_WITH_LIMITATIONS',verifiedAt:new Date().toISOString(),checks,liveFrames:[],localFrames:[],manifests:[],diagnosticHTTP:http,counts:{body:{join:0,pose:0,verb:0},renderer:{join:0,snapResult:0,unknownRefused:0,browserRead:0,httpWriteRefused:0},directHTTPRead:0,uploads:0},limitations:['Physical walking/clearance is not proved by assigned camera poses.','Capture darkness is not established as nighttime: live rig dayness=1, sky null / effectiveClock fixed noon.','No world light/sky/exposure correction was made.','Native review notes partial projected occlusions and inn window-bottom slivers needing separate interface inspection.']};
for(const run of ['live-recapture-01-renderer','live-recapture-02-renderer']){
 const m=read(`reviews/${run}/manifest.json`),tele=read(`reviews/${run}/supplement-telemetry.json`),close=read(`reviews/${run}/renderer-close.json`);
 if(m.status!=='CAPTURED'||!m.bodyClosed||!close.closed||close.browserConnected||m.wireCounts.verb||m.uploads)throw Error('capture/cleanup not verified');
 if(m.sourceSha256!==sha(readFileSync(join(base,'live-eye.ts'))))throw Error('shared capture tool source changed');
 summary.manifests.push({path:`reviews/${run}/manifest.json`,sha256:sha(readFileSync(join(base,`reviews/${run}/manifest.json`))),status:m.status,captured:m.captured,bodyClosed:m.bodyClosed,rendererClosed:close.closed,protectedChangesDuringCapture:m.protectedChangesDuringCapture});
 for(const k of ['join','pose','verb'])summary.counts.body[k]+=m.wireCounts[k];
 const r=summary.counts.renderer,p=m.rendererPost;r.join+=p.sent.join??0;r.snapResult+=p.sent['snap-result']??0;r.unknownRefused+=p.refused.unknown??0;r.browserRead+=p.httpCounts.read;r.httpWriteRefused+=p.httpCounts.writeRefused;
 summary.counts.directHTTPRead+=tele.requests.length;
 if(m.captured!==m.frames.length||tele.frames.length!==m.frames.length)throw Error('frame count mismatch');
 for(const [i,f] of m.frames.entries()){
 const png=readFileSync(join(base,`reviews/${run}/${f.file}`));if(sha(png)!==f.pngSha256||f.httpStatus!==200||!f.rendererModels?.every((x:any)=>x.loaded)||JSON.stringify(f.companionsBefore)!==JSON.stringify(f.companionsAfter))throw Error('frame proof failed');
 const image=await sharp(png).metadata();if(image.width!==f.width||image.height!==f.height)throw Error('PNG dimensions mismatch');
 const t=tele.frames[i],h=f.targetBefore,cam=new THREE.PerspectiveCamera(t.camera.fov,t.camera.aspect,t.camera.near,100);cam.position.fromArray(t.camera.pos);cam.quaternion.fromArray(t.camera.quaternion);cam.updateMatrixWorld();
 const center=new THREE.Vector3(...t.camera.pos).sub(new THREE.Vector3(...h.pos)).applyAxisAngle(new THREE.Vector3(0,1,0),-h.yaw).divideScalar(h.scale);
 const l=t.lightEntities.find((l:any)=>l.id===`${f.id}-l`);const point=new THREE.Vector3(...l.pos);const projected=point.clone().project(cam);
 const dir=point.clone().sub(cam.position).applyQuaternion(cam.quaternion.clone().invert());
 const bodyLightDistance=new THREE.Vector3(...f.bodyPose.p).distanceTo(point);
 const dx=point.clone().sub(cam.position).length();
 let projectedBounds=null;if(l.bounds){const min=l.bounds.min,max=l.bounds.max;const corners=[];for(const x of [min[0],max[0]])for(const y of [min[1],max[1]])for(const z of [min[2],max[2]])corners.push(new THREE.Vector3(x,y,z).project(cam));projectedBounds={minX:Math.min(...corners.map(c=>c.x)),maxX:Math.max(...corners.map(c=>c.x)),minY:Math.min(...corners.map(c=>c.y)),maxY:Math.max(...corners.map(c=>c.y))};}
 summary.liveFrames.push({path:`reviews/${run}/${f.file}`,sha256:f.pngSha256,status:'CAPTURED',id:f.id,view:f.view,bodyLocal:f.requestedBodyLocal,lookLocal:f.requestedLookLocal,cameraLocal:center.toArray(),camera:t.camera,assignedBodyToAuthoredLightDistance:bodyLightDistance,cameraToAuthoredLightDistance:dx,authoredLightCenterNDC:projected.toArray(),authoredLightBoundsNDC:projectedBounds,authoredLightBearingFromCameraAxisDegrees:THREE.MathUtils.radToDeg(Math.atan2(dir.x,-dir.z)),horizontalHalfFovDegrees:THREE.MathUtils.radToDeg(Math.atan(Math.tan(THREE.MathUtils.degToRad(t.camera.fov/2))*t.camera.aspect)),runtimeDayness:t.rig.dayness,runtimeExposure:t.exposure,pointLightIntensities:t.pointLights.map((p:any)=>p.intensity)});
 }
}
const sky=read('reviews/live-recapture-diagnostics/sky-snapshot.json');if(!sky.bodyClosed||sky.wireCounts.verb)throw Error('sky probe not closed/read-only');summary.counts.body.join+=sky.wireCounts.join;summary.sky={sky:sky.sky,effectiveClock:sky.effectiveClock,wireCounts:sky.wireCounts,bodyClosed:sky.bodyClosed};
summary.counts.directHTTPRead+=read('reviews/live-recapture-diagnostics/discovery.json').traffic.length+1+http.length; // +1 preserved urllib 403, not transmitted writes.
summary.counts.allCaptureHTTPReadIncludingBrowser=summary.counts.directHTTPRead+summary.counts.renderer.browserRead;
summary.counts.note='Direct read count includes one failed urllib GET (403), both 503 /snap availability attempts, and both 404 pre-body probes. Browser read count includes all renderer asset origins. CLI package install and native model review API traffic are not world capture traffic.';
const local=read('reviews/live-recapture-local-daylight/manifest.json');if(local.status!=='RENDERED'||local.errors.length||!local.browserClosed||!local.serverClosed)throw Error('offline renderer failed');
for(const f of local.frames){const p=`reviews/live-recapture-local-daylight/${f.file}`;if(sha(readFileSync(join(base,p)))!==f.sha256||!f.identicalRawPixelControl)throw Error('local evidence drift');summary.localFrames.push({path:p,sha256:f.sha256,evidenceKind:local.evidenceKind,sourceLib:f.sourceLib,sourceServedSha256:f.sourceServedSha256,sourceLiveFile:f.sourceLiveFile,identicalRawPixelControl:true});}
summary.local={manifest:'reviews/live-recapture-local-daylight/manifest.json',worldRequests:local.worldRequests,localReads:local.localReads,browserClosed:local.browserClosed,serverClosed:local.serverClosed};
summary.nativeReviews=['reviews/live-recapture-native-review/review-v2.md','reviews/live-recapture-native-review/final-review.md'].map(p=>({path:p,sha256:sha(readFileSync(join(base,p))),reviewer:'independent native gpt-6-astra / Codex CLI 0.153.4, ephemeral read-only; not coordinator native sight'}));
summary.preferred={hallDoorwayInterior:summary.liveFrames.find((f:any)=>f.id==='nx-town-hall'&&f.view==='interior').path,innPorch:'reviews/live-recapture-02-renderer/nx-town-inn-approach.png',innInterior:'reviews/live-recapture-02-renderer/nx-town-inn-interior.png',innDoorwayFill:'reviews/live-recapture-local-daylight/nx-town-inn-detail-LOCAL-DAYLIGHT.png'};
writeFileSync(join(import.meta.dir,'snapmanifest.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:summary.status,live:summary.liveFrames.length,local:summary.localFrames.length,originals:Object.keys(original).length,counts:summary.counts,preferred:summary.preferred},null,2));
