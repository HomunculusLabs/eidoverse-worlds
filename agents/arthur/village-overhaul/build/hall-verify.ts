// Independent read-only decoded triangle checks of the final emitted hall.
import {loadPlayerMesh,THREE} from '../../cabin-overhaul/verify-player.ts';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base=new URL('../',import.meta.url).pathname;const loaded=await loadPlayerMesh(`${base}build/nx-town-hall.glb`);
loaded.root.traverse((o:any)=>{if(o.isMesh)o.material.side=THREE.DoubleSide;});loaded.root.updateMatrixWorld(true);
const ray=(origin:number[],dir:number[],far:number)=>{const rc=new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...dir),0,far);return rc.intersectObject(loaded.root,true);};
const endChecks:any[]=[];for(const s of [-1,1])for(const z of [-2.90,-2.6,-2.0,-1.7,-1.60,-1.3,-.8,0,.8,1.3,1.60,1.7,2,2.6,2.90]){
 const az=Math.abs(z),top=az<=1.63?6.35-az*(6.35-4.99)/1.91:3.38+(3.40-az)*(.80)/1.83;
 for(let y=3.42;y<top-.09;y+=.085){const hits=ray([s*5.2,y,z],[-s,0,0],1.1);endChecks.push({side:s,z,y,pass:hits.length>0,hit:hits[0]?.point.toArray()??null});}
}
const porchChecks:any[]=[];for(const x of [-1.2,-.6,0,.6,1.2])for(let y=3.60;y<4.28-Math.abs(x)*1.03/2.17-.08;y+=.065){const hits=ray([x,y,2.90],[0,0,1],.30);porchChecks.push({x,y,pass:hits.length>0,hit:hits[0]?.point.toArray()??null});}
const floorChecks:any[]=[];for(const s of [-1,1])for(let x=-.70;x<=.7001;x+=.14)for(let a=2.65;a<=3.161;a+=.051){const z=s*a,hits=ray([x,.4,z],[0,-1,0],.6),y=hits[0]?.point.y;floorChecks.push({x,z,surfaceY:y??null,pass:Number.isFinite(y)&&Math.abs(y-.20)<=.011});}
const failures=[...endChecks,...porchChecks,...floorChecks].filter(x=>!x.pass);
const result={status:failures.length?'FAIL':'PASS',modelSha256:loaded.sha256,evidence:'actual-default-scene-double-sided-triangle-rays',closedEndSamples:endChecks.length,porchRearClosureSamples:porchChecks.length,thresholdSupportSamples:floorChecks.length,failures,endChecks,porchChecks,floorChecks,limitations:['Dense sampled ray evidence, not a manifold/watertight certificate.','Porch front gable remains intentionally open; tested rear closure joins the existing aisle-roof slab.','Geometry support is supplemented by the actual-browser-collider route report.']};
writeFileSync(`${base}build/hall-closure-support-report.json`,JSON.stringify(result,null,2));console.log(JSON.stringify({...result,endChecks:undefined,porchChecks:undefined,floorChecks:undefined}));
const validator=await import('./hall-validator-runtime/node_modules/gltf-validator/index.js');const bytes=readFileSync(`${base}build/nx-town-hall.glb`);const validation=await validator.validateBytes(new Uint8Array(bytes),{uri:'nx-town-hall.glb',maxIssues:1000});writeFileSync(`${base}build/hall-gltf-validation.json`,JSON.stringify({sha256:createHash('sha256').update(bytes).digest('hex'),...validation},null,2));console.log(JSON.stringify({validatorErrors:validation.issues.numErrors,warnings:validation.issues.numWarnings}));if(failures.length||validation.issues.numErrors)process.exitCode=1;
