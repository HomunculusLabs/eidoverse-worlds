// Deterministic contact sheets of REAL render frames, never synthesized scenery.
import sharp from 'sharp';
import {readFileSync,writeFileSync} from 'node:fs';
const args=process.argv.slice(2);const output=args.shift();if(!output||!args.length)throw Error('usage montage.ts output.png image.png ...');
const width=480,height=360,cols=Math.min(3,args.length),rows=Math.ceil(args.length/cols);
const images=[];for(let i=0;i<args.length;i++)images.push({input:await sharp(readFileSync(args[i])).resize(width,height).png().toBuffer(),left:(i%cols)*width,top:Math.floor(i/cols)*height});
await sharp({create:{width:cols*width,height:rows*height,channels:3,background:'#121820'}}).composite(images).png().toFile(output);console.log(JSON.stringify({output,images:args,width:cols*width,height:rows*height}));
