const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1100,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const URL='file://'+require('path').resolve(__dirname,'../index.html')+'#test';
await p.goto(URL);await p.click('[data-act="introdone"]');
const energy=()=>p.evaluate(()=>__LI.st().energy||0);
console.log('mission list:',await p.$$eval('.mlist .mi b',e=>e.map(x=>x.textContent)));
await p.screenshot({path:__dirname+'/m_home.png',fullPage:true});
async function doTraining(tag){
  await p.click('[data-act="go"]');await p.click('[data-act="sp-start"]');
  for(let guard=0;guard<80;guard++){
    await p.waitForTimeout(120);
    const info=await p.evaluate(()=>{const s=__LI.sp();if(!s)return null;const it=s.items[s.i];if(!it)return null;return {k:it.k,it:JSON.parse(JSON.stringify(it)),mode:s.mode,stage:s.stage,busy:s.busy,n:s.items.length,i:s.i}});
    if(!info){break;}
    if(info.busy){await p.waitForTimeout(400);continue;}
    const it=info.it;
    if(['letter','word','name'].includes(info.k)){await p.fill('#spin',info.k==='letter'?it.a:it.a);await p.press('#spin','Enter');await p.waitForTimeout(500);continue;}
    if(info.k==='rec'){const q=it.list[it.j];if(tag==='shot'&&it.j===0)await p.screenshot({path:__dirname+'/m_rec.png'});await p.click(`[data-act="sp-rec"][data-v="${q[1]}"]`);await p.waitForTimeout(550);continue;}
    if(info.k==='pos'){const q=it.qs[it.j];if(it.j===0)await p.screenshot({path:__dirname+'/m_pos_'+tag+'.png'});await p.click(`[data-act="sp-pos"][data-v="${q.ans}"]`);await p.waitForTimeout(800);continue;}
    if(info.k==='read'){const R=await p.evaluate(i=>__LI.READS[i],it.r);await p.screenshot({path:__dirname+'/m_read_'+tag+'.png'});for(let k=0;k<3;k++)await p.fill('#sf'+k,R.q[k][2][0]);await p.click('.bigform button[type=submit]');await p.waitForTimeout(500);continue;}
    if(info.k==='def'){await p.screenshot({path:__dirname+'/m_def_'+tag+'.png'});for(let k=0;k<3;k++)await p.fill('#sf'+k,it.qs[k][1]);await p.click('.bigform button[type=submit]');await p.waitForTimeout(500);continue;}
    if(info.k==='dialog'){for(let k=0;k<it.d.fields.length;k++)await p.fill('#sf'+k,it.d.fields[k].accept[0]);await p.click('.bigform button[type=submit]');await p.waitForTimeout(500);continue;}
    if(info.k==='pic'){if(info.stage==='own'){await p.fill('#sown','The boy is happy.');await p.click('.bigform button[type=submit]');continue;}if(info.stage==='rate'){await p.screenshot({path:__dirname+'/m_picrate.png'});await p.click('[data-act="sp-rate"]');await p.waitForTimeout(500);continue;}
      await p.fill('#sf0',it.p.q1.accept[0]);await p.fill('#sf1',it.p.q2.model);await p.click('.bigform button[type=submit]');await p.waitForTimeout(300);continue;}
  }
  const t=await p.textContent('.end');return t.replace(/\s+/g,' ').slice(0,160);
}
let e0=await energy();console.log('train:',await doTraining('shot'),'| energy',await energy());
await p.screenshot({path:__dirname+'/m_trainend.png',fullPage:true});
async function solveCur(){const t=await p.evaluate(()=>JSON.parse(JSON.stringify(__LI.cur().t)));
  if(t.type==='match'){for(const n of t.names){await p.click(`[data-act="msel"][data-id="${n}"]`);await p.click(`[data-act="mtgt"][data-id="${t.answer[n]}"]`);}}
  if(t.type==='multipick'){for(let k=0;k<t.questions.length;k++)await p.click(`[data-act="mpick"][data-q="${k}"][data-id="${t.questions[k].answer}"]`);}
  if(t.type==='choice'){for(let k=0;k<t.questions.length;k++)await p.click(`[data-act="choose"][data-q="${k}"][data-id="${t.questions[k].answer}"]`);}
  if(t.type==='fields'){for(let k=0;k<t.fields.length;k++)await p.fill(`#${t.id}f${k}`,t.fields[k].accept[0]);}
  if(t.type==='passage'){for(let k=0;k<t.gaps.length;k++)await p.fill(`#${t.id}f${k}`,t.gaps[k].accept[0]);if(t.titleQ)await p.click(`[data-act="choose"][data-q="99"][data-id="${t.titleQ.answer}"]`);}
  if(t.type==='colour'){await p.click('[data-act="clearpaint"]');for(const a of [].concat(t.colourAns||[{part:"win1",col:"pink"}])){await p.click(`[data-act="part"][data-id="${a.part}"]`);await p.click(`[data-act="paint"][data-id="${a.col}"]`);}if(t.write)await p.fill(`#${t.id}w`,t.write.accept[0]);}
  if(t.type==='pick'){await p.click(`[data-act="pick"][data-id="${t.answer}"]`);return t;}
  if(t.type==='speak'){for(let k=0;k<t.steps.length;k++){await p.click('[data-act="spoke"]');await p.click('[data-act="rate"]');}return t;}
  await p.click('[data-act="check"]');return t;}
async function wrongCur(){const t=await p.evaluate(()=>JSON.parse(JSON.stringify(__LI.cur().t)));
  if(t.type==='fields'){for(let k=0;k<t.fields.length;k++)await p.fill(`#${t.id}f${k}`,'zz');}
  await p.click('[data-act="check"]');}
// mission 1: t1 correct
await p.click('[data-act="go"]');await p.click('[data-act="chapgo"]').catch(()=>{});
console.log('task1 =',await p.evaluate(()=>__LI.cur().t.id),'playsNote:',!!(await p.$('text=每段英文只能聽兩次')));
await p.click('[data-act="mplay"][data-q="0"]');await p.click('[data-act="mplay"][data-q="0"]');await p.click('[data-act="mplay"][data-q="0"]');console.log('3rd play fb:',await p.textContent('#fb'));
await p.screenshot({path:__dirname+'/m_t1.png',fullPage:true});
e0=await energy();await solveCur();console.log('t1 win:',!!await p.$('.win'),'gain',await energy()-e0,'btn:',await p.textContent('.win .btn.main'));
await p.click('[data-act="mgo"]');console.log('task2 =',await p.evaluate(()=>__LI.cur().t.id));
await p.click('[data-act="hint"]');await p.click('[data-act="hint"]');await p.click('[data-act="hint"]');console.log('hint3 fb:',await p.textContent('#fb'),'hints shown',(await p.$$('#hintbox .hint')).length);
e0=await energy();await solveCur();console.log('t2 gain',await energy()-e0);
await p.click('[data-act="mgo"]');console.log('task3 =',await p.evaluate(()=>__LI.cur().t.id));
for(let k=0;k<3;k++){await wrongCur();console.log('  wrong',k+1,(await p.textContent('#fb')).slice(0,30),'hints',(await p.$$('#hintbox .hint')).length,'ans',!!await p.$('#hintbox .hint.ans'));}
await p.screenshot({path:__dirname+'/m_reveal.png',fullPage:true});
e0=await energy();await solveCur();console.log('t3 after reveal: gain',await energy()-e0,'title',await p.textContent('.win div'),'btn',await p.textContent('.win .btn.main'));
await p.screenshot({path:__dirname+'/m_reveal_win.png',fullPage:true});
console.log('t3 rec',await p.evaluate(()=>JSON.stringify(__LI.st().tasks.t3)));
await p.click('.win .btn.main');console.log('home msg:',await p.textContent('.today p'));
await p.screenshot({path:__dirname+'/m_done.png',fullPage:true});
await p.click('[data-act="backup"]');console.log('backup page:',!!await p.$('#exportbox'));await p.click('[data-act="home"]');
// map gating
await p.click('.spot[data-c="0"]');await p.click('[data-act="task"][data-i="4"]',{force:true});console.log('toast:',await p.textContent('#toast'));
await p.screenshot({path:__dirname+'/m_map.png',fullPage:true});
await p.click('[data-act="chapters"]');
// parent extra
await p.click('[data-act="parent"]');await p.click('[data-act="extra"]');console.log('extra:',await p.textContent('#extramsg'));await p.screenshot({path:__dirname+'/m_parent.png',fullPage:true});await p.click('[data-act="home"]');
console.log('after extra list:',await p.$$eval('.mlist .mi b',e=>e.map(x=>x.textContent)));
// next day
await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('lemon-island-ch1-v1'));s.daily.day-=1;s.lastTrainDay-=1;localStorage.setItem('lemon-island-ch1-v1',JSON.stringify(s));});
await p.reload();console.log('day2 list:',await p.$$eval('.mlist .mi',e=>e.map(x=>x.textContent)));
// training kinds
for(const kind of ['def','pos','read','dialog','pic']){
  await p.evaluate(k=>{const s=JSON.parse(localStorage.getItem('lemon-island-ch1-v1'));s.lastTrainDay=0;const sp=s.spell;sp.kinds={read:50,def:50,pos:50};sp.dlg=sp.dlg||{};sp.pic=sp.pic||{};sp.dlg.d1={n:50,ok:0};sp.pic.p1={n:50,ok:0};if(k==='dialog')sp.dlg={};else if(k==='pic')sp.pic={};else sp.kinds[k]=0;localStorage.setItem('lemon-island-ch1-v1',JSON.stringify(s));},kind);
  await p.reload();console.log('train',kind,':',(await doTraining(kind)).slice(0,90));
}
await p.screenshot({path:__dirname+'/m_trainend2.png',fullPage:true});
console.log('errors',errs);await b.close();})();
