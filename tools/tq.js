const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../questions.html'));
await p.fill('#pin','1234');await p.click('#f button');console.log('wrong:',await p.textContent('#msg'));
await p.fill('#pin',process.argv[2]);await p.click('#f button');
console.log('tasks',await p.$$eval('.task',e=>e.length),'| h2:',await p.$$eval('h2',e=>e.map(x=>x.textContent).join(' | ')));
await p.screenshot({path:'/tmp/q1.png'});
const els=await p.$$('.task');
for(const i of [0,7,13,30,50]){if(els[i]){await els[i].screenshot({path:'/tmp/qt'+i+'.png'});}}
console.log('errors',errs);await b.close();})();
