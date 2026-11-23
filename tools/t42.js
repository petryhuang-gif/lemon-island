const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const U='file://'+require('path').resolve(__dirname,'../index.html')+'#test';
await p.goto(U);await p.click('[data-act="introdone"]');
await p.click('[data-act="wardrobe"]');await p.screenshot({path:__dirname+'/w1.png',fullPage:true});
await p.click('[data-act="wtab"][data-k="bg"]');await p.screenshot({path:__dirname+'/w2.png',fullPage:true});
await p.click('[data-act="dex"]');await p.screenshot({path:__dirname+'/w3.png'});
// seed: 105 words collected, 7 mission days
await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('lemon-island-ch1-v1'));s.spell=s.spell||{words:{},letters:{},names:{n:0,ok:0},sessions:[]};s.spell.rec={};const raw=document.documentElement.innerHTML;return 0;});
await p.evaluate(()=>{const st=__LI.st();st.spell=st.spell||{};st.spell.rec=st.spell.rec||{};const words=Array.from(document.querySelectorAll('.dcard')).length;});
await p.evaluate(()=>{const st=__LI.st();});
// use game VOCAB via dex page DOM is hidden; seed by reading VOCAB_RAW from page source
const vocab=await p.evaluate(()=>{const m=document.querySelector('script').textContent.match(/var VOCAB_RAW=("[^\n]*?");/);return JSON.parse(m[1]).split(';').filter(x=>x).map(e=>e.replace(/^!/,'').split('=')[0]);});
await p.evaluate(v=>{const s=JSON.parse(localStorage.getItem('lemon-island-ch1-v1'));s.spell=s.spell||{words:{},letters:{},names:{n:0,ok:0},sessions:[]};s.spell.rec={};v.slice(0,105).forEach(w=>s.spell.rec[w]={box:2,ok:1,bad:0,due:0});s.mdays=[1,2,3,4,5,6,7];localStorage.setItem('lemon-island-ch1-v1',JSON.stringify(s));},vocab);
await p.reload();console.log('home dex btn:',await p.textContent('[data-act="dex"]'));
await p.click('[data-act="wardrobe"]');console.log('msg:',await p.textContent('.wshop .fb'));
await p.click('[data-act="witem"][data-k="outfit:book"]');console.log(await p.textContent('.wshop .fb'));await p.screenshot({path:__dirname+'/w4.png',fullPage:true});
await p.click('[data-act="wtab"][data-k="bg"]');await p.click('[data-act="witem"][data-k="bg:sweets"]');console.log(await p.textContent('.wshop .fb'));
await p.click('[data-act="home"]');console.log('bg style:',await p.$eval('#pagebg',e=>e.style.backgroundImage));
await p.click('[data-act="dex"]');await p.screenshot({path:__dirname+'/w5.png'});
console.log('errors',errs);await b.close();})();
