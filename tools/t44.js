// 家長區密碼測試：node tools/t44.js <密碼>
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../index.html'));await p.click('[data-act="introdone"]');
await p.click('[data-act="parent"]');console.log('gate:',!!await p.$('#pinin'));
await p.fill('#pinin','0000');await p.press('#pinin','Enter');console.log('wrong:',await p.textContent('.fb'));
await p.fill('#pinin',process.argv[2]);await p.click('form[data-form="pin"] button');console.log('opened:',!!await p.$('#exportbox'));
await p.click('[data-act="home"]');await p.click('[data-act="parent"]');console.log('locked again after home:',!!await p.$('#pinin'));
await p.screenshot({path:'/tmp/pin.png'});
console.log('errors',errs);await b.close();})();
