import {test,expect} from 'bun:test';
test('temporary renderer targets only the commissioned world and never embeds a key in URL',async()=>{
 const m:any=await import('./temporary-renderer.ts').catch(()=>({}));
 expect(typeof m.rendererURL).toBe('function');
 const u=new URL(m.rendererURL('https://eidoverse.billding.dev'));
 expect(u.searchParams.get('world')).toBe('commons-next');
 expect(u.searchParams.has('renderer')).toBe(true);
 expect(u.searchParams.has('key')).toBe(false);
 expect(()=>m.rendererURL('http://foreign.example')).toThrow();
});
