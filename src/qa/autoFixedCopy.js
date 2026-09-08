const {recognizeImage}=require('../ocr/tesseractAdapter');
const {cropRegion,imageSize}=require('../image/cropRegion');
const norm=s=>s.normalize('NFKC').replace(/\s/gu,'');
const mean=words=>words.length?words.reduce((s,w)=>s+w.confidence*100,0)/words.length:0;
async function ocr(source,region,size){const crop=cropRegion(source,region,size);try{return await recognizeImage(crop.imagePath,{upscale:1,lang:'kor+eng',psm:11});}finally{crop.cleanup();}}
async function autoFixedCopy(source, expected) {
 const size=imageSize(source);
 const full=await ocr(source,{x:0,y:0,width:size.width,height:size.height},size);
 const results=[];
 for(const text of expected){
  const target=norm(text),matches=[];
  for(let i=0;i<full.words.length;i++){let s='';for(let j=i;j<full.words.length;j++){s+=norm(full.words[j].text);if(s===target){matches.push(full.words.slice(i,j+1));break;}if(!target.startsWith(s))break;}}
  const candidates=[];
  for(const words of matches){
   const x=Math.floor(Math.min(...words.map(w=>w.bbox.x))/3),y=Math.floor(Math.min(...words.map(w=>w.bbox.y))/3);
   const right=Math.ceil(Math.max(...words.map(w=>w.bbox.x+w.bbox.w))/3),bottom=Math.ceil(Math.max(...words.map(w=>w.bbox.y+w.bbox.h))/3);
   const bbox=padBbox({x,y,width:right-x,height:bottom-y},size);
   const r=await ocr(source,bbox,size);
   candidates.push({fullText:words.map(w=>w.text).join(' '),bbox,reOcrText:r.text,exactMatch:norm(r.text)===target,confidence:mean(r.words)});
  }
  const result={expected:text,found:matches.length>0,bboxGenerated:candidates.length>0,candidates};results.push(result);
 }
 const found=results.filter(r=>r.found).length,success=results.filter(r=>r.candidates.some(c=>c.exactMatch)).length;
 const candidates=results.flatMap(r=>r.candidates);
 const summary={total:expected.length,found,searchSuccessRate:found/expected.length*100,success,overallSuccessRate:success/expected.length*100,candidateCount:candidates.length,candidateExactMatchCount:candidates.filter(c=>c.exactMatch).length};
 return {fullText:full.text,results,summary};
}
function padBbox(bbox, size) {
 const left=Math.max(0,bbox.x-2), top=Math.max(0,bbox.y-2);
 const right=Math.min(size.width,bbox.x+bbox.width+2);
 const bottom=Math.min(size.height,bbox.y+bbox.height+2);
 return {x:left,y:top,width:right-left,height:bottom-top};
}
module.exports={autoFixedCopy,padBbox};
