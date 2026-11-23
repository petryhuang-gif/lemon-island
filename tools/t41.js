const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../index.html')+'#test');await p.click('[data-act="introdone"]');
await p.click('[data-act="parent"]');await p.click('[data-act="skiptrain"]');await p.click('[data-act="unlock"]');await p.click('[data-act="home"]');
async function solveCur(){const t=await p.evaluate(()=>JSON.parse(JSON.stringify(__LI.cur().t)));
  if(t.type==='match'){for(const n of t.names){await p.click(`[data-act="msel"][data-id="${n}"]`);await p.click(`[data-act="mtgt"][data-id="${t.answer[n]}"]`);}}
  if(t.type==='multipick'){for(let k=0;k<t.questions.length;k++)await p.click(`[data-act="mpick"][data-q="${k}"][data-id="${t.questions[k].answer}"]`);}
  if(t.type==='choice'){for(let k=0;k<t.questions.length;k++)await p.click(`[data-act="choose"][data-q="${k}"][data-id="${t.questions[k].answer}"]`);}
  if(t.type==='fields'){for(let k=0;k<t.fields.length;k++)await p.fill(`#${t.id}f${k}`,t.fields[k].accept[0]);}
  if(t.type==='passage'){for(let k=0;k<t.gaps.length;k++)await p.fill(`#${t.id}f${k}`,t.gaps[k].accept[0]);if(t.titleQ)await p.click(`[data-act="choose"][data-q="99"][data-id="${t.titleQ.answer}"]`);}
  if(t.type==='colour'){for(const a of [].concat(t.colourAns||[{part:"win1",col:"pink"}])){await p.click(`[data-act="part"][data-id="${a.part}"]`);await p.click(`[data-act="paint"][data-id="${a.col}"]`);}if(t.write)await p.fill(`#${t.id}w`,t.write.accept[0]);}
  if(t.type==='speak'){for(let k=0;k<t.steps.length;k++){await p.click('[data-act="spoke"]');await p.click('[data-act="rate"]');}return t;}
  await p.click('[data-act="check"]');return t;}
const nT=[10,4,4,4,6,15];let fails=0;
for(const round of [0,1])for(let c=0;c<6;c++){
  await p.click(`.spot[data-c="${c}"]`);await p.click('[data-act="chapgo"]',{timeout:800}).catch(()=>{});
  for(let i=0;i<nT[c];i++){await p.click(`[data-act="task"][data-i="${i}"]`,{force:true});
    if(round===0&&((c===0&&[0,4,7].includes(i))||(c===5&&[1,5,9,13,7].includes(i))))await p.screenshot({path:`s_c1_${i}.png`,fullPage:true});
    const t=await solveCur();await p.waitForTimeout(100);const ok=!!await p.$('.win');if(!ok){fails++;console.log('FAIL',round,t.id,await p.textContent('#fb'));}
    await p.click('[data-act="map"]');}
  await p.click('[data-act="chapters"]');}
console.log('fails',fails,'energy',await p.evaluate(()=>__LI.st().energy),'errors',errs);await b.close();})();
