// 產生老師用的「題目總覽」頁 questions.html（內容用家長密碼加密，網址不連到遊戲裡）
// 用法：node tools/build-questions.js <4位數密碼>
// 每次改了題目（index.html）都要重跑一次再上傳。
const fs = require('fs'), path = require('path');
const PIN = process.argv[2];
if (!/^\d{4}$/.test(PIN || '')) { console.error('請給 4 位數密碼：node tools/build-questions.js 1234'); process.exit(1); }
const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let js = src.match(/<script>([\s\S]*?)<\/script>/)[1];
js = js.replace(/(if\(!state\.introSeen\)renderIntro\(0\);else )?renderHome\(\);\s*\}\)\(\);\s*$/,
  'globalThis.__D={CHAPTERS,READS,DEFS,DIALOGS,PICS,VOCAB,TSCHED,NAMES,POSW,sceneHTML,picColourHouse,picStage:typeof picStage==="function"?picStage:null,bankHTML,COLOURS,setCur:function(v){cur=v;}};})();');
const el = { innerHTML: '', addEventListener() {}, classList: { toggle() {}, add() {} } };
globalThis.document = { getElementById: () => el, querySelector: () => null, addEventListener() {} };
globalThis.window = globalThis; globalThis.location = { hash: '' };
globalThis.localStorage = { getItem: () => null, setItem() {} };
eval(js);
const D = __D;

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SK = { 'Listening': '聽力', 'Reading & Writing': '讀寫', 'Speaking': '口說' };
function part(t) {
  if (t.type === 'match') return '聽力 Part 1';
  if (t.type === 'fields' && t.skill === 'Listening') return '聽力 Part 2';
  if (t.type === 'multipick') return '聽力 Part 4';
  if (t.type === 'colour') return '聽力 Part 5';
  if (t.type === 'fields' && t.bank) return '讀寫 Part 1';
  if (t.type === 'choice') return '讀寫 Part 2';
  if (t.type === 'passage') return '讀寫 Part 3';
  if (t.type === 'fields') return '讀寫 Part 5／6';
  if (t.type === 'speak') return '口說';
  return SK[t.skill] || t.skill;
}
const who = l => l[0] === 'C' ? '🧒' : '🧑';
const script = lines => lines && lines.length ? '<div class="script"><b>聽力原文</b>' + lines.map(l => '<div>' + who(l) + ' ' + esc(l[1]) + '</div>').join('') + '</div>' : '';
const say = s => s ? '<div class="script"><b>聽力原文</b><div>' + esc(s) + '</div></div>' : '';
const val = v => typeof v === 'function' ? v() : v;
const alt = a => esc(a[0]) + (a.length > 1 ? ' <span class="m">（也接受：' + a.slice(1).map(esc).join('、') + '）</span>' : '');

function setHTML(t) {
  let h = '<p class="pr">' + esc(t.prompt || '') + '</p>';
  if (t.type === 'multipick') {
    h += t.questions.map(q => '<div class="q"><b>' + esc(q.q) + '</b>' + script(q.lines) +
      '<div class="opts">' + q.options.map(o => '<span class="opt' + (o.id === q.answer ? ' ok' : '') + '">' + o.id.toUpperCase() + ' ' + o.art + '</span>').join('') + '</div></div>').join('');
  } else if (t.type === 'fields') {
    if (t.bank) h += D.bankHTML(t.bank);
    if (t.extra) h += val(t.extra);
    h += script(t.lines) + say(t.say);
    h += '<ol class="fl">' + t.fields.map(f => '<li>' + esc(f.before || f.label || '') + ' <u>&nbsp;' + alt(f.accept) + '&nbsp;</u> ' + esc(f.after || '') + '</li>').join('') + '</ol>';
  } else if (t.type === 'choice') {
    h += say(t.say) + t.questions.map((q, i) => '<div class="q"><b>' + (i + 1) + '. ' + esc(q.q) + '</b><div>' + q.options.map(o => '<span class="opt' + (o.id === q.answer ? ' ok' : '') + '">' + o.id.toUpperCase() + '. ' + esc(o.t) + '</span>').join('') + '</div></div>').join('');
  } else if (t.type === 'colour') {
    D.setCur({ fills: Object.fromEntries([].concat(t.colourAns || []).map(a => [a.part, a.col])) });
    h += '<div class="pic">' + (t.svg === 'picStage' && D.picStage ? D.picStage() : D.picColourHouse()) + '</div>' + say(t.say);
    h += '<p class="m">圖上已塗好正確顏色。</p>';
  } else if (t.type === 'passage') {
    h += D.bankHTML(t.bank) + '<div class="letter">' + esc(t.passage).replace(/\{(\d+)\}/g, (m, n) => '<u>(' + n + ') ' + esc(t.gaps[n - 1].accept[0]) + '</u>') + '</div>';
    if (t.titleQ) h += '<div class="q"><b>' + esc(t.titleQ.q) + '</b><div>' + t.titleQ.options.map(o => '<span class="opt' + (o.id === t.titleQ.answer ? ' ok' : '') + '">' + o.id.toUpperCase() + '. ' + esc(o.t) + '</span>').join('') + '</div></div>';
  } else if (t.type === 'match') {
    h += script(t.lines) + '<div class="opts">' + t.targets.map(g => { const n = Object.keys(t.answer).find(k => t.answer[k] === g.id); return '<span class="opt' + (n ? ' ok' : '') + '">' + g.art + '<br>' + (n ? '<b>' + esc(n) + '</b>' : '<span class="m">（沒有人）</span>') + '</span>'; }).join('') + '</div>';
  } else if (t.type === 'speak') {
    h += t.steps.map((s, i) => '<div class="q"><b>' + (i + 1) + '. ' + esc(s.q) + '</b>' + (s.show || '') + '<div class="m">句型提示：' + esc(s.starter || '') + '</div><div>示範回答：' + esc(s.model || '') + '</div></div>').join('');
  }
  if (t.answerText && t.type !== 'speak') h += '<p class="ans"><b>答案：</b>' + esc(t.answerText) + '</p>';
  return h;
}
function merged(t, s) { const o = {}; Object.keys(t).forEach(k => { if (k !== 'sets') o[k] = t[k]; }); Object.keys(s || {}).forEach(k => o[k] = s[k]); return o; }

let body = '', toc = '';
D.CHAPTERS.forEach((ch, ci) => {
  toc += '<a href="#ch' + ci + '">' + esc(ch.name === ch.title ? ch.name : ch.name + '｜' + ch.title) + '</a>';
  body += '<h2 id="ch' + ci + '">' + esc(ch.name === ch.title ? ch.name : ch.name + '｜' + ch.title) + '</h2><p class="m">' + esc(ch.intro || '') + '</p>';
  ch.tasks.forEach((t, i) => {
    const sets = t.sets && t.sets.length ? t.sets : [{}];
    body += '<section class="task"><h3>' + (i + 1) + '. ' + esc(t.title) + ' <span class="tag">' + part(t) + '</span>' + (t.exam ? '<span class="tag ex">考試模式</span>' : '') + '</h3>' +
      sets.map((s, k) => (sets.length > 1 ? '<h4>第 ' + (k + 1) + ' 組' + (k ? '（重玩時出現）' : '') + '</h4>' : '') + setHTML(merged(t, s))).join('') + '</section>';
  });
});

// 魔法訓練題庫
toc += '<a href="#bank">魔法訓練／小測驗題庫</a><a href="#vocab">單字表</a>';
body += '<h2 id="bank">魔法訓練／小測驗題庫</h2><p class="m">每天的魔法訓練和週末小測驗從這些題庫隨機抽題。</p>';
body += '<section class="task"><h3>讀短文寫答案 <span class="tag">讀寫 Part 5</span></h3>' + D.READS.map((r, i) => '<div class="q"><b>短文 ' + (i + 1) + '</b><div class="letter">' + esc(r.t) + '</div><ol class="fl">' + r.q.map((q, k) => '<li>' + (k + 1) + '. ' + esc(q[0]) + ' <u>&nbsp;' + alt(q[2]) + '&nbsp;</u> ' + esc(q[1]) + '</li>').join('') + '</ol></div>').join('') + '</section>';
body += '<section class="task"><h3>看說明寫單字 <span class="tag">讀寫 Part 1</span></h3><p class="m">每次抽 3 題，再加 3 個干擾選項。</p><ol class="fl">' + D.DEFS.map((d, k) => '<li>' + (k + 1) + '. ' + esc(d[0]) + ' → <b>' + esc(d[1]) + '</b></li>').join('') + '</ol></section>';
body += '<section class="task"><h3>聽對話填資訊 <span class="tag">聽力 Part 2</span></h3>' + D.DIALOGS.map((d, i) => '<div class="q"><b>對話 ' + (i + 1) + '</b>' + (d.extra ? val(d.extra) : '') + script(d.lines) + '<ol class="fl">' + d.fields.map((f, k) => '<li>' + (k + 1) + '. ' + esc(f.label) + ' <u>&nbsp;' + alt(f.accept) + '&nbsp;</u></li>').join('') + '</ol></div>').join('') + '</section>';
body += '<section class="task"><h3>看圖寫字和句子 <span class="tag">讀寫 Part 6</span></h3>' + D.PICS.map((p, i) => '<div class="q"><b>圖 ' + (i + 1) + '</b>' + D.sceneHTML(p) + '<ol class="fl"><li>1. ' + esc(p.q1.before) + ' <u>&nbsp;' + alt(p.q1.accept) + '&nbsp;</u> ' + esc(p.q1.after) + '</li><li>2. ' + esc(p.q2.q) + ' → ' + esc(p.q2.model) + '</li><li>自己寫一句，示範：' + esc(p.own) + '</li></ol></div>').join('') + '</section>';
body += '<section class="task"><h3>聽位置選圖 <span class="tag">聽力 Part 1／4</span></h3><p>每題由程式組合一句話（例如 The cat is under the chair.），三張圖選一張。用到的位置詞：' + D.POSW.map(w => esc(w[0])).join('、') + '。</p></section>';
body += '<section class="task"><h3>聽名字拼法 <span class="tag">聽力 Part 2</span></h3><p>' + D.NAMES.map(esc).join('、') + '</p></section>';

// 單字表
const wk = {}; D.TSCHED.forEach(w => w.words.split(' ').forEach(x => { wk[x.toLowerCase()] = wk[x.toLowerCase()] || (w.due[1] + '/' + w.due[2]); }));
body += '<h2 id="vocab">單字表（' + D.VOCAB.length + ' 字）</h2><p class="m">★＝拼字優先字（會出聽寫）。「老師週」＝對應老師週進度表那一週的主題字，那一週會優先出。</p>' +
  '<section class="task"><h3>老師週進度對照</h3><table><thead><tr><th>週（截止）</th><th>主題</th><th>字母</th><th>主題字</th></tr></thead><tbody>' +
  D.TSCHED.map(w => '<tr><td>' + w.due[1] + '/' + w.due[2] + '</td><td>' + esc(w.topic) + '</td><td>' + w.letters.toUpperCase().split('').join('、') + '</td><td>' + esc(w.words) + '</td></tr>').join('') + '</tbody></table></section>' +
  '<section class="task"><table class="vt"><thead><tr><th>單字</th><th>中文</th><th>拼字</th><th>老師週</th></tr></thead><tbody>' +
  D.VOCAB.slice().sort((a, b) => a.w.toLowerCase() < b.w.toLowerCase() ? -1 : 1).map(v => '<tr><td>' + esc(v.w) + '</td><td>' + esc(v.zh) + '</td><td>' + (v.pr ? '★' : '') + '</td><td>' + (wk[v.w.toLowerCase()] || '') + '</td></tr>').join('') + '</tbody></table></section>';

const content = '<nav class="toc">' + toc + '</nav>' + body;

// 加密（防止直接看原始碼就看到答案；不是高強度加密）
function h32(str, seed) { let h = seed >>> 0; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 2654435761); h = (h << 13) | (h >>> 19); } return (h ^ (h >>> 16)) >>> 0; }
function stream(pin, n) { let a = h32('lemon-q:' + pin, 7), out = Buffer.alloc(n); for (let i = 0; i < n; i++) { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; out[i] = ((t ^ (t >>> 14)) >>> 0) & 255; } return out; }
const buf = Buffer.from(content, 'utf8'), ks = stream(PIN, buf.length);
for (let i = 0; i < buf.length; i++) buf[i] ^= ks[i];
const check = h32('lemon-pin:' + PIN, 11);

const css = `:root{--ink2:#4a2c5a;--line:#f0dff3;--white:#fff;--ink:#4a2c5a}
body{margin:0;font-family:-apple-system,"PingFang TC","Noto Sans TC",sans-serif;color:var(--ink);background:#fbf6fd;line-height:1.6}
main{max-width:900px;margin:0 auto;padding:20px}
h1{color:#b0398a;margin:.2em 0}h2{color:#b0398a;border-bottom:3px solid #f3d3ea;padding-bottom:4px;margin-top:40px}h3{margin:0 0 8px}h4{margin:14px 0 4px;color:#8a5aa0}
.m{color:#8a7a99;font-size:14px}.tag{font-size:12px;background:#efe6ff;color:#6a4bc4;border-radius:10px;padding:2px 8px;margin-left:6px;vertical-align:middle}.tag.ex{background:#ffe3ef;color:#b0398a}
.task{background:#fff;border:2px solid var(--line);border-radius:16px;padding:14px 18px;margin:12px 0;break-inside:avoid-page}
.q{margin:10px 0;padding-top:8px;border-top:1px dashed var(--line)}
.opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}.opt{display:inline-block;border:2px solid var(--line);border-radius:12px;padding:4px 10px;margin:3px 4px 3px 0;text-align:center}.opt.ok{border-color:#3fbf7f;background:#e9fbf1}
.script{background:#f7f2ff;border-radius:10px;padding:8px 12px;margin:6px 0;font-size:15px}.script b{font-size:12px;color:#8a5aa0;display:block}
.fl{list-style:none;padding-left:4px}.fl li{margin:4px 0}u{text-decoration:none;border-bottom:2px solid #3fbf7f;color:#1f7a4d;font-weight:700}
.ans{background:#e9fbf1;border-radius:10px;padding:6px 10px}.pr{font-style:italic;color:#6a5a7a;margin:0 0 6px}
.e{font-size:30px;line-height:1}.e.xl{font-size:44px}.e.sm{font-size:22px}.combo{display:inline-flex;align-items:flex-end;gap:2px}
.letter{background:#fff;border:2px dashed var(--line);border-radius:14px;padding:10px 14px;margin:6px 0}.letter p{margin:0 0 4px}
.pic svg{display:block;width:100%;max-width:420px;height:auto}
.bank{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.bk{border:2px solid var(--line);border-radius:10px;padding:2px 8px;display:flex;align-items:center;gap:4px}.bk .e{font-size:22px}
.scene{position:relative;width:min(420px,100%);aspect-ratio:16/10;background:linear-gradient(180deg,#e6f3ff,#fff7e6);border-radius:16px;overflow:hidden;margin:6px 0}
.scene span{position:absolute;line-height:1}.scene.room{background:linear-gradient(180deg,#fdebd3 0 64%,#caa27a 64% 100%)}
.scene .blk{position:absolute;border-radius:4px}.scene .tbl{position:absolute;height:10px;background:#b98a5e;border-radius:4px}
.scene .tbl::before,.scene .tbl::after{content:"";position:absolute;top:10px;width:8px;height:56px;background:#b98a5e}.scene .tbl::before{left:8px}.scene .tbl::after{right:8px}
table{border-collapse:collapse;width:100%;font-size:14px}th,td{border-bottom:1px solid var(--line);padding:4px 6px;text-align:left;vertical-align:top}
.toc{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.toc a{background:#fff;border:2px solid var(--line);border-radius:12px;padding:4px 10px;color:#6a4bc4;text-decoration:none;font-size:14px}
#gate{max-width:360px;margin:15vh auto;text-align:center;background:#fff;border:2px solid var(--line);border-radius:20px;padding:24px}
#gate input{font-size:28px;width:140px;text-align:center;letter-spacing:8px;border:2px solid var(--line);border-radius:12px;padding:6px}
#gate button{font-size:18px;margin-top:12px;padding:8px 24px;border:0;border-radius:14px;background:#ff7eb3;color:#fff;font-weight:700}
@media print{.toc,#printbtn{display:none}body{background:#fff}.task{border-color:#ddd}}`;

const html = `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>題目總覽｜英語魔法冒險島</title><style>${css}</style></head><body>
<div id="gate"><h2 style="border:0;margin-top:0">題目總覽</h2><p class="m">這頁有全部題目和答案，請輸入家長密碼。</p>
<form id="f"><input id="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" autofocus><br><button type="submit">打開</button></form><p id="msg" class="m"></p></div>
<main id="main" hidden><h1>英語魔法冒險島｜題目總覽</h1>
<p class="m">Cambridge A1 Movers 練習遊戲的全部題目與答案。題目為原創練習題，不是劍橋官方試題；用字已對照劍橋官方 Starters／Movers 單字表。綠色＝正確答案。「對應 Part」是依題型大致對照。產生日期：${new Date().toISOString().slice(0, 10)}</p>
<button id="printbtn" onclick="print()" style="font-size:15px;padding:6px 16px;border-radius:12px;border:2px solid var(--line);background:#fff">🖨️ 列印／存成 PDF</button>
<div id="c"></div></main>
<script>
var DATA="${buf.toString('base64')}",CHECK=${check};
function h32(str,seed){var h=seed>>>0;for(var i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),2654435761);h=(h<<13)|(h>>>19);}return (h^(h>>>16))>>>0;}
function open1(pin){if(h32("lemon-pin:"+pin,11)!==CHECK)return false;var b=atob(DATA),u=new Uint8Array(b.length),a=h32("lemon-q:"+pin,7);
for(var i=0;i<b.length;i++){a=(a+0x6D2B79F5)|0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;u[i]=b.charCodeAt(i)^(((t^(t>>>14))>>>0)&255);}
document.getElementById("c").innerHTML=new TextDecoder().decode(u);document.getElementById("gate").hidden=true;document.getElementById("main").hidden=false;return true;}
document.getElementById("f").addEventListener("submit",function(e){e.preventDefault();if(!open1(document.getElementById("pin").value))document.getElementById("msg").textContent="密碼不對，再試一次。";});
</script></body></html>`;
fs.writeFileSync(path.join(root, 'questions.html'), html);
console.log('questions.html', (html.length / 1024).toFixed(0) + ' KB, check=' + check);
