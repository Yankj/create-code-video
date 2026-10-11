// Same browser, independent render requests in deliberately scrambled order.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {openBrowser,getCompositions,renderStill} from '@remotion/renderer';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'out','frames');
fs.mkdirSync(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),rspack:true});
const chromiumOptions={gl:'swangle'};
const browser=await openBrowser('chrome',{chromiumOptions,
  browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE});
try{
  const comps=await getCompositions(serveUrl,{puppeteerInstance:browser,chromiumOptions,
    onBrowserLog:log=>console.log(log.text)});
  const composition=comps.find(c=>c.id==='MotionLab');
  const frames=[['a',210],['start',0],['end',539],['b',210],['cut-before',329],['cut',330],['cut-after',331],['gather',120],['closing',480]];
  const hashes={};
  for(const [name,frame] of frames){
    const output=path.join(out,`${name}.png`);
    await renderStill({composition,serveUrl,output,frame,scale:.5,imageFormat:'png',puppeteerInstance:browser,chromiumOptions});
    hashes[name]=crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
  }
  const passed=hashes.a===hashes.b;
  fs.writeFileSync(path.join(out,'check.json'),JSON.stringify({sameFrameAfterScrambledRequests:passed,frames,hashes},null,2));
  if(!passed)throw new Error('Repeated frame differs');
  console.log('Rendered frame checks passed; visually inspect out/frames');
}finally{await browser.close({silent:true});}
