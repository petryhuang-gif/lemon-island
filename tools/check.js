// Usage: node check.js game.html wordlist.json
const fs=require('fs');
const [,,htmlPath,wlPath]=process.argv;
const WL=JSON.parse(fs.readFileSync(wlPath,'utf8'));
const S=new Set(WL.starters),M=new Set(WL.movers),F=new Set(WL.flyers);
const NUM=['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
NUM.forEach(w=>S.add(w));['thirty','forty','fifty','sixty','seventy','eighty','ninety','hundred'].forEach(w=>M.add(w));
// proper names used in the game (story characters, not vocabulary)
const NAMES=new Set(['lemon','cloud','bell','forest','star','bobby','mr','hill','mangos','bobo']);
const IRR={is:'be',am:'be',are:'be',was:'be',were:'be',been:'be',being:'be',has:'have',had:'have',does:'do',did:'do',done:'do',went:'go',gone:'go',came:'come',saw:'see',seen:'see',got:'get',made:'make',took:'take',taken:'take',gave:'give',given:'give',said:'say',told:'tell',ate:'eat',eaten:'eat',drank:'drink',ran:'run',sat:'sit',stood:'stand',found:'find',bought:'buy',brought:'bring',thought:'think',flew:'fly',fell:'fall',felt:'feel',knew:'know',known:'know',left:'leave',lost:'lose',put:'put',read:'read',rode:'ride',sang:'sing',slept:'sleep',swam:'swim',threw:'throw',woke:'wake',won:'win',wrote:'write',written:'write',could:'can',children:'child',men:'man',women:'woman',people:'person',feet:'foot',teeth:'tooth',mice:'mouse',better:'good',best:'good',worse:'bad',worst:'bad',an:'a',its:'it',them:'they',us:'we',him:'he',her:'she',our:'we',your:'you',my:'i',their:'they',his:'he'};
const PP=new Set(['been','seen','gone','done','eaten','taken','given','known','written','found','made','had','got','bought','brought','lost','left','read','won','put','finished','visited','played','watched','lived','lost','broken','forgotten']);
function level(w){if(S.has(w))return'S';if(M.has(w))return'M';if(F.has(w))return'F';return null;}
function cands(w){
  const c=[w];
  if(IRR[w])c.push(IRR[w]);
  const rules=[[/ies$/,'y'],[/ied$/,'y'],[/es$/,''],[/s$/,''],[/ed$/,''],[/ed$/,'e'],[/d$/,''],[/ing$/,''],[/ing$/,'e'],[/er$/,''],[/est$/,''],[/ier$/,'y'],[/iest$/,'y']];
  for(const [re,rep] of rules){if(re.test(w)){let b=w.replace(re,rep);c.push(b);if(/(.)\1$/.test(b))c.push(b.slice(0,-1));}}
  return c;
}
function best(w){let r=null;for(const c of cands(w)){const l=level(c);if(l==='S'||l==='M')return {l,base:c};if(l&&!r)r={l,base:c};}return r;}
// ---- load game data
let src=fs.readFileSync(htmlPath,'utf8');
let js=src.match(/<script>([\s\S]*?)<\/script>/)[1];
js=js.replace(/renderHome\(\);\s*\}\)\(\);\s*$/,'globalThis.__T=TASKS;globalThis.__C=CHAPTERS;globalThis.__P=PRAISE;globalThis.__D=DIALOGS;globalThis.__PI=PICS;globalThis.__R=READS;globalThis.__DF=DEFS;})();');
const el={innerHTML:'',addEventListener(){},classList:{toggle(){},add(){}}};
globalThis.document={getElementById:()=>el,querySelector:()=>null,addEventListener(){}};
globalThis.window=globalThis;globalThis.location={hash:""};globalThis.localStorage={getItem:()=>null,setItem(){}};
eval(js);
const SKIP=new Set(['art','id','type','speaker','skill','answer','treasure','title','story','answerText','show','svg','parts','part','col']);
const strings=[];
function walk(o,where){
  if(typeof o==='string'){strings.push({where,text:o.replace(/<[^>]+>/g,' ').replace(/&#?\w+;/g,' ').replace(/\\'/g,"'")});return;}
  if(Array.isArray(o)){o.forEach((x,i)=>walk(x,where+'['+i+']'));return;}
  if(o&&typeof o==='object')for(const k of Object.keys(o)){if(!SKIP.has(k)&&typeof o[k]!=='function')walk(o[k],where+'.'+k);}
}
__C.forEach(c=>{c.tasks.forEach((t,i)=>walk(t,c.id+'任務'+(i+1)));walk(c.endSay,c.id+'.endSay');});
__D.forEach(d=>{d.lines.forEach((l,i)=>walk(l[1],d.id+'.line'+i));d.fields.forEach((f,i)=>{walk(f.label,d.id+'.label'+i);walk(f.after||'',d.id+'.after'+i);walk(f.accept,d.id+'.accept'+i);});});
__PI.forEach(p=>{walk(p.q1.before,p.id+'.q1');walk(p.q1.after,p.id+'.q1');walk(p.q1.accept,p.id+'.q1a');walk(p.q2.q,p.id+'.q2');walk(p.q2.model,p.id+'.model');walk(p.own,p.id+'.own');});
__R.forEach((r,i)=>{walk(r.t,'read'+i);r.q.forEach((q,k)=>{walk(q[0],'read'+i+'q'+k);walk(q[1],'read'+i+'q'+k);walk(q[2],'read'+i+'a'+k);});});
__DF.forEach((d,i)=>{walk(d[0],'def'+i);walk(d[1],'def'+i);});
// hints: only English ones (skip strings that contain Chinese)
const eng=strings.filter(s=>!/[㐀-鿿]/.test(s.text));
const bad=[];const gram=[];
for(const s of eng){
  const toks=(s.text.toLowerCase().replace(/[’]/g,"'").replace(/(^|[^a-z])'|'(?![a-z])/g,'$1 ').match(/[a-z][a-z']*/g)||[]).filter(t=>t.length>1||t==='a'||t==='i');
  for(let t of toks){
    t=t.replace(/'s$|'m$|'re$|'ve$|'ll$|'d$/,'').replace(/n't$/,'');
    if(t==='can')continue; if(t==='won')t='will'; if(t==='ca')t='can';
    if(!t||NAMES.has(t))continue;
    const b=best(t);
    if(!b||b.l==='F')bad.push({where:s.where,word:t,level:b?'Flyers':'不在單字表',text:s.text.trim()});
  }
  const low=' '+s.text.toLowerCase().replace(/[’]/g,"'")+' ';
  const pp=low.match(/\b(have|has|haven't|hasn't|i've|you've|we've|they've|she's|he's)\s+(\w+)/g)||[];
  for(const m of pp){const w=m.split(/\s+/)[1];if(w!=='got'&&w!=='to'&&(PP.has(w)||/ed$/.test(w)))gram.push({where:s.where,rule:'現在完成式（Flyers）',hit:m,text:s.text.trim()});}
  const pass=low.match(/\b(is|are|was|were|be|been)\s+(\w+ed|made|written|taken|given|seen|found|broken)\s+by\b/g)||[];
  pass.forEach(m=>gram.push({where:s.where,rule:'被動語態',hit:m,text:s.text.trim()}));
  const mod=(s.text.replace(/\bMay\b/g,'').toLowerCase().match(/\b(will|won't|might|may|should|shall|going to)\b/g))||[];
  mod.forEach(m=>gram.push({where:s.where,rule:'需人工確認的情態／未來式',hit:m,text:s.text.trim()}));
}
console.log('檢查了 '+eng.length+' 段英文');
console.log('\n[超出 Movers 範圍的字] '+bad.length+' 處');
bad.forEach(b=>console.log(' - '+b.where+' ｜ '+b.word+'（'+b.level+'）｜ '+b.text.slice(0,90)));
console.log('\n[文法提醒] '+gram.length+' 處');
gram.forEach(g=>console.log(' - '+g.where+' ｜ '+g.rule+'：'+g.hit+' ｜ '+g.text.slice(0,90)));
process.exitCode=bad.length||gram.some(g=>!g.rule.startsWith('需人工'))?1:0;
