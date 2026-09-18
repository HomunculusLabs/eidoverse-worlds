import { test, expect } from 'bun:test';

test('native under-canopy framing changes only pointer-driven pitch and releases its button', async () => {
  const api: any = await import('./live-review.runtime.ts');
  expect(api.frameUnderCanopy).toBeFunction();
  const previous=Object.getOwnPropertyDescriptor(globalThis,'window');
  const controller={camPitch:.32,camDist:4.2}, events:any[]=[];
  let down=false,lastY=0;
  const page={
    evaluate:async(fn:any)=>fn(),
    mouse:{
      move:async(x:number,y:number)=>{events.push(['move',x,y]);if(down)controller.camPitch+=(y-lastY)*.004;lastY=y;},
      down:async(o:any)=>{events.push(['down',o.button]);down=true;},
      up:async(o:any)=>{events.push(['up',o.button]);down=false;},
    },
  };
  try {
    Object.assign(globalThis,{window:{__carouselReview:{controller}}});
    const r=await api.frameUnderCanopy(page);
    expect(controller.camPitch).toBeCloseTo(-.10,10);
    expect(controller.camDist).toBe(4.2);
    expect(down).toBe(false);
    expect(events.filter(e=>e[0]==='down')).toEqual([['down','right']]);
    expect(events.at(-1)).toEqual(['up','right']);
    expect(r.beforePitch).toBe(.32);expect(r.afterPitch).toBeCloseTo(-.10,10);
  } finally { if(previous)Object.defineProperty(globalThis,'window',previous);else delete(globalThis as any).window; }
});
