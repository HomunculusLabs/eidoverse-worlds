import { test,expect } from 'bun:test';
import { mkdtemp,readFile,writeFile,rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function build(output:string){
  return spawnSync(process.execPath,[fileURLToPath(new URL('./build.ts',import.meta.url)),output],{encoding:'utf8',timeout:30000});
}
test('standalone builder rejects the canonical name even with mixed case',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'horse-builder-'));
  try{
    const output=join(dir,'VILLAGE_CAROUSEL3.glb');
    expect(build(output).status).not.toBe(0);expect(existsSync(output)).toBe(false);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('standalone builder produces identical new files but cannot overwrite an existing file',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'horse-builder-'));
  try{
    const a=join(dir,'a.glb'),b=join(dir,'b.glb');
    expect(build(a).status).toBe(0);expect(build(b).status).toBe(0);
    expect(await readFile(a)).toEqual(await readFile(b));
    await writeFile(a,'DO NOT OVERWRITE');
    expect(build(a).status).not.toBe(0);expect(await readFile(a,'utf8')).toBe('DO NOT OVERWRITE');
  }finally{await rm(dir,{recursive:true,force:true});}
});
