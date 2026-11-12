import {test,expect} from 'bun:test';
import {neighborCandidates} from './assembly.ts';
const host={id:'host',pos:[40,0,0],yaw:Math.PI/2,scale:2,bbox:{min:[-2,0,-1],max:[2,3,1]}};
test('neighbor selection uses transformed mesh extents, not center distance, including road networks',()=>{
 const near={id:'near',pos:[44,0,0],yaw:0,scale:1,bbox:{min:[-1,0,-1],max:[1,2,1]}};
 const distant={id:'far',pos:[80,0,0],yaw:0,scale:1,bbox:{min:[-1,0,-1],max:[1,2,1]}};
 const road={id:'roads',pos:[0,0,0],yaw:0,scale:1,bbox:{min:[-50,-.1,-50],max:[50,0,50]}};
 expect(neighborCandidates(host,[host,near,distant,road],3).map((e:any)=>e.id).sort()).toEqual(['near','roads']);
});
test('inverted decoded bounds cannot silently skip an obstacle',()=>{
 const bad={id:'bad',pos:[40,0,0],yaw:0,scale:1,bbox:{min:[2,0,-1],max:[-2,1,1]}};
 expect(()=>neighborCandidates(host,[bad])).toThrow('inverted');
});
