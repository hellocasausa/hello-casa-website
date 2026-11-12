// Remove declarations that cannot affect the native markup; preserve cascade order.
import plans from '../src/data/plans.json' with {type:'json'};import {checklist} from '../src/components/services.ts';import fs from 'node:fs';import postcss from 'postcss';import {parseHTML} from 'linkedom';
const {document}=parseHTML(fs.readFileSync('index.html','utf8'));for(const p of plans){const el=document.createElement('div');el.innerHTML=checklist(p);document.querySelector('#hc-detail-body').append(el)}
for(const path of ['src/components/source-authored.css','src/components/services.css','src/components/footer.css']){
 const root=postcss.parse(fs.readFileSync(path,'utf8'));root.walkComments(c=>c.remove());
 root.walkRules(r=>{if(r.parent.type==='atrule'&&r.parent.name==='font-face')return;
 const selectors=postcss.list.comma(r.selector).filter(s=>{let sel=s.replace(/::[a-z-]+(?:\([^)]*\))?/g,'').replace(/:(hover|focus-visible|focus-within|focus|active)\b/g,'');try{return !!document.querySelector(sel)}catch{return true}});if(selectors.length)r.selector=selectors.join(',\n');else r.remove();
 });
 const seen=new Set();const declarations=[];root.walkDecls(d=>declarations.push(d));
 for(const d of declarations.reverse()){const rule=d.parent;if(rule.type!=='rule')continue;let scope='';for(let p=rule.parent;p;p=p.parent)if(p.type==='atrule')scope=p.name+p.params+'/'+scope;const key=scope+'|'+rule.selector+'|'+d.prop+'|'+!!d.important;if(seen.has(key))d.remove();else seen.add(key)}
 root.walkRules(r=>{if(!r.nodes.length)r.remove()});root.walkAtRules(r=>{if(r.nodes&&!r.nodes.length)r.remove()});fs.writeFileSync(path,root.toString());console.log(path,root.toString().length);
}
