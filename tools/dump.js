const fs=require('fs');let src=fs.readFileSync(process.argv[2],'utf8');
let js=src.match(/<script>([\s\S]*?)<\/script>/)[1];
js=js.replace(/(if\(!state\.introSeen\)renderIntro\(0\);else )?renderHome\(\);\s*\}\)\(\);\s*$/,'globalThis.__C=CHAPTERS;})();');
const el={innerHTML:'',addEventListener(){},classList:{toggle(){},add(){}}};
globalThis.document={getElementById:()=>el,querySelector:()=>null,addEventListener(){}};globalThis.window=globalThis;globalThis.location={hash:""};globalThis.localStorage={getItem:()=>null,setItem(){}};
eval(js);
function cnt(t){if(t.type==='pick')return 1;if(t.type==='fields')return t.fields.length;if(t.type==='choice'||t.type==='multipick')return t.questions.length;if(t.type==='passage')return t.gaps.length+(t.titleQ?1:0);if(t.type==='match')return t.names.length;if(t.type==='colour')return (t.colourAns?[].concat(t.colourAns).length:1)+(t.write?1:0);if(t.type==='speak')return t.steps.length;return '?';}
__C.forEach(c=>c.tasks.forEach(t=>{const sets=t.sets||[{}];console.log(t.id,t.type,t.skill,sets.map(s=>cnt(Object.assign({},t,s))).join('/'));}));
