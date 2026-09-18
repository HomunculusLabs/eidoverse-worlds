// Offline candidate builder. Does not rebuild either canonical carousel writer.
import { resolve, basename } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildHorseGLB } from './sculpture.ts';

const output=process.argv[2];
if (!output || process.argv.length!==3 || !output.endsWith('.glb') ||
    basename(output).toLowerCase()==='village_carousel3.glb' || /^[a-z][a-z\d+.-]*:/i.test(output)) {
  throw new Error('Usage: bun build.ts <NEW-cream-horse.glb>; local new file only, never village_carousel3.glb');
}
const bytes=buildHorseGLB();
await writeFile(resolve(output),bytes,{flag:'wx'});
console.log(JSON.stringify({path:resolve(output),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}));
