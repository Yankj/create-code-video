// Actual font-ready DOM geometry and GPU captures, including negative cases.
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
const browser=await openBrowser('chrome',{chromiumOptions,browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE});
try{
  const comps=await getCompositions(serveUrl,{puppeteerInstance:browser,chromiumOptions, onBrowserLog:log=>{if(log.text.includes('__CCV_LAYOUT__'))console.log(log.text);}});
  const composition=comps.find(c=>c.id==='MotionLab');
  if(!composition)throw new Error('MotionLab composition missing');
  const frames=[['a',210],['start',0],['end',539],['b',210],['gather',120],
    ['handoff-before',149],['handoff',150],['handoff-after',151],['moving',315],
    ['occlusion-peak',329],['cut',330],['cut-after',331],['settled',360],
    ['close-before',449],['close',450],['close-after',451],['closing',480]];
  const hashes={}, measurements=[], negative=[];
  const capture=async(name,frame,comp=composition,fault)=>{
    const reports=[];
    const onBrowserLog=log=>{
      const marker='__CCV_LAYOUT__',i=log.text.indexOf(marker);
      if(i>=0)reports.push(JSON.parse(log.text.slice(i+marker.length)));
    };
    const output=path.join(out,`${name}.png`);
    const inputProps={layoutProbe:true,layoutFault:fault};
    // This fixed composition has no calculateMetadata. Update its already
    // resolved props as well as the raw input props passed to the renderer.
    await renderStill({composition:{...comp,props:{...comp.props,...inputProps}},serveUrl,output,frame,scale:.5,imageFormat:'png',
      inputProps,puppeteerInstance:browser,chromiumOptions,onBrowserLog,logLevel:'error'})
      .catch(error=>{error.layoutReports=reports;throw error;});
    const report=reports.findLast(r=>r.frame===frame);
    if(!report||!report.passed)throw new Error(`${name}: no successful measured layout report`);
    measurements.push({name,exportSize:[comp.width,comp.height],...report});
    hashes[name]=crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
  };
  for(const [name,frame] of frames)await capture(name,frame);
  await capture('portrait-720',150,{...composition,width:720,height:1280});
  for(const fault of ['overlap','text']){
    let rejected=false;
    try{await capture(`negative-${fault}`,150,composition,fault);}
    catch(error){
      const report=error.layoutReports?.findLast(r=>r.frame===150);
      const expected=fault==='overlap'?'request/caption: gap':'request-title: text overflow';
      if(!report||report.passed||!report.errors.some(e=>e.includes(expected)))throw error;
      negative.push({fault,rejected:true,errors:report.errors});rejected=true;
    }
    if(!rejected)throw new Error(`Broken ${fault} layout was accepted`);
  }
  const repeat=hashes.a===hashes.b;
  fs.writeFileSync(path.join(out,'check.json'),JSON.stringify({sameFrameAfterScrambledRequests:repeat,
    frames,hashes,measurements,negative},null,2));
  if(!repeat)throw new Error('Repeated frame differs');
  console.log(`${measurements.length} font-ready layout captures passed; ${negative.length} broken layouts rejected. Inspect out/frames.`);
}finally{await browser.close({silent:true});}
