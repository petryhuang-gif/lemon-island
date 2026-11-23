const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1100,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
if(p.clock)await p.clock.install({time:new Date('2026-11-28T19:00:00+08:00')});
const URL='file://'+require('path').resolve(__dirname,'../index.html')+'#test';
await p.goto(URL);await p.click('[data-act="introdone"]');
console.log('banner:',await p.$('.mockban')?'yes':'no');
await p.screenshot({path:'/tmp/k_home.png'});
async function run(wrongEvery){
  await p.click('.mockban [data-act="mock-start"]').catch(async()=>{await p.click('[data-act="parent"]');await p.click('[data-act="mock-start"]');});
  let n=0;
  for(let g=0;g<60;g++){
    await p.waitForTimeout(150);
    const info=await p.evaluate(()=>{const s=__LI.sp();if(!s)return null;const it=s.items[s.i];if(!it)return null;return {k:it.k,it:JSON.parse(JSON.stringify(it)),busy:s.busy,i:s.i}});
    if(!info)break;if(info.busy){await p.waitForTimeout(400);continue;}
    const it=info.it,bad=(n++%wrongEvery)===0;
    if(g===0||info.k==='read')await p.screenshot({path:'/tmp/k_'+info.k+'.png'});
    if(['word','name'].includes(info.k)){await p.fill('#spin',bad?'zzz':it.a);await p.press('#spin','Enter');await p.waitForTimeout(700);continue;}
    if(info.k==='pos'){const q=it.qs[it.j];const v=bad?q.opts.find(o=>o!==q.ans):q.ans;await p.click(`[data-act="sp-pos"][data-v="${v}"]`);await p.waitForTimeout(300);continue;}
    if(info.k==='read'){const R=await p.evaluate(i=>__LI.READS[i],it.r);for(let k=0;k<3;k++)await p.fill('#sf'+k,bad&&k==0?'zz':R.q[k][2][0]);}
    if(info.k==='def'){for(let k=0;k<3;k++)await p.fill('#sf'+k,bad&&k==0?'zz':it.qs[k][1]);}
    if(info.k==='dialog'){for(let k=0;k<it.d.fields.length;k++)await p.fill('#sf'+k,bad&&k==0?'zz':it.d.fields[k].accept[0]);}
    if(info.k==='pic'){await p.fill('#sf0',bad?'zz':it.p.q1.accept[0]);await p.fill('#sf1',it.p.q2.model);}
    await p.click('.bigform button[type=submit]');await p.waitForTimeout(700);
  }
  await p.screenshot({path:'/tmp/k_end'+wrongEvery+'.png'});
  return (await p.textContent('.end')).replace(/\s+/g,' ').slice(0,200);
}
let e0=await p.evaluate(()=>__LI.st().energy||0);
console.log('mock1:',await run(3),'| +energy',(await p.evaluate(()=>__LI.st().energy||0))-e0);
await p.click('[data-act="home"]');console.log('banner after:',await p.$('.mockban')?'yes':'no');
console.log('mock2:',await run(100));
await p.click('[data-act="home"]');await p.click('[data-act="parent"]');
const panel=await p.$('section.panel:has(h2:text("週末小測驗"))');await panel.screenshot({path:'/tmp/k_parent.png'});
console.log('mocks:',JSON.stringify(await p.evaluate(()=>__LI.st().mocks.map(m=>[m.L,m.RW,m.SP,m.miss.length,m.extra]))));
console.log('errors',errs);await b.close();})();
