/* Four compositions, one canonical data feed generated from the approved Services source. */
(function(){
"use strict";
var root=document.getElementById("services-app"),allowed=["atlas","index","ribbon","featured"];
var requested=new URL(location.href).searchParams.get("design");
var concept=allowed.includes(requested)?requested:"atlas";
var siteRoot=new URL("../",location.href),plans=[],catalog=null,activeId="maintenance",focus="standard";
var escapeText=function(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
var byId=function(id){return plans.find(function(p){return p.id===id;});};
function iconUrl(p){return new URL(p.icon.replace(/^\//,""),siteRoot).href;}
function style(p){return "--tile:"+p.tile+";--icon-bg:"+p.iconBg+";";}
function img(p){return '<span class="ico"><img src="'+escapeText(iconUrl(p))+'" alt="" width="32" height="32" loading="eager"></span>';}
function item(p,i){
 var on=p.id===activeId,ind=concept==="index";
 return '<button type="button" class="svc-option" data-plan="'+escapeText(p.id)+'" id="concept-plan-'+escapeText(p.id)+'" style="'+escapeText(style(p))+'"'+
 (ind?' aria-controls="service-panel" aria-expanded="'+on+'"':' role="tab" aria-controls="service-panel" aria-selected="'+on+'" tabindex="'+(on?"0":"-1")+'"')+'>'+
 (ind?'<span class="index-number">'+String(i+1).padStart(2,"0")+'</span>':"")+
 img(p)+'<span class="name">'+escapeText(p.name)+'</span><span class="nav-chevron" aria-hidden="true">'+(ind?(on?"−":"+"):"›")+'</span></button>';
}
function panel(p){
 var html=p.checklists[focus]||p.checklists.standard;
 return '<section class="service-panel" id="service-panel" role="'+(concept==="index"?"region":"tabpanel")+'" aria-labelledby="concept-plan-'+escapeText(p.id)+'" tabindex="0">'+
 '<div class="panel-head"><p class="meta">YOUR CLEANING CHECKLIST</p><h2>'+escapeText(p.name)+(p.id==="maintenance"&&focus!=="standard"?" · "+(focus==="kitchen"?"Kitchen":"Bathrooms")+" focus":"")+'</h2><p class="panel-description">'+escapeText(p.description)+'</p></div>'+
 (p.id==="maintenance"?'<div class="focus-host">'+catalog.focusHtml+'</div>':"")+
 '<div class="panel-body">'+html+'</div><div class="panel-actions"><a class="quote-cta" href="'+escapeText(catalog.quote)+'" target="_blank" rel="noopener noreferrer">Customize My Quote <span aria-hidden="true">→</span></a></div></section>';
}
function render(){
 var active=byId(activeId),panelHtml=panel(active);
 var navItems=plans.map(function(p,i){
  return concept==="index"?'<div class="index-item">'+item(p,i)+(p.id===activeId?panelHtml:"")+'</div>':item(p,i);
 }).join("");
 var feature=concept==="featured"?'<div class="feature-header" style="--active-color:'+escapeText(active.iconBg)+'"><span class="featured-icon"><img src="'+escapeText(iconUrl(active))+'" alt="" width="47" height="47"></span><div><p class="meta">YOUR SELECTED PLAN</p><h2>'+escapeText(active.name)+'</h2><p>'+escapeText(active.description)+'</p></div></div>':"";
 var nav='<div class="selector-zone"><p class="shell-label">'+(concept==="index"?"THE SERVICE INDEX":concept==="featured"?"EXPLORE OTHER PLANS":"EXPLORE THE PLANS")+'</p><div class="svc-nav"'+(concept==="index"?' aria-label="Cleaning plans"':' role="tablist" aria-label="Cleaning plans"')+'>'+navItems+'</div></div>';
 root.innerHTML='<div class="service-shell variant-'+concept+'" style="--active-color:'+escapeText(active.iconBg)+'">'+feature+nav+(concept==="index"?"":panelHtml)+'</div>';
 root.setAttribute("aria-busy","false");
 if(active.id==="maintenance"){
  root.querySelectorAll("[data-focus]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.focus===focus));});
  var select=root.querySelector("#essential-focus");
  if(select)select.value=focus;
 }
 document.documentElement.dataset.concept=concept;
}
root.addEventListener("click",function(e){
 var plan=e.target.closest("[data-plan]");
 if(plan){
  var same=activeId===plan.dataset.plan;
  activeId=plan.dataset.plan;
  render();
  if(!same){var b=root.querySelector('[data-plan="'+activeId+'"]');if(b){b.focus({preventScroll:true});b.scrollIntoView({block:"nearest",behavior:"instant"});}}
  return;
 }
 var f=e.target.closest("[data-focus]");
 if(f){focus=f.dataset.focus;render();var current=root.querySelector('[data-focus="'+focus+'"]');if(current)current.focus({preventScroll:true});}
});
root.addEventListener("change",function(e){if(e.target.id==="essential-focus"){focus=e.target.value;render();root.querySelector("#essential-focus").focus({preventScroll:true});}});
root.addEventListener("keydown",function(e){
 var tab=e.target.closest("[data-plan]");if(!tab)return;
 if(!["ArrowRight","ArrowLeft","ArrowDown","ArrowUp","Home","End"].includes(e.key))return;
 e.preventDefault();
 var i=plans.findIndex(function(p){return p.id===tab.dataset.plan;});
 var n=e.key==="Home"?0:e.key==="End"?plans.length-1:(i+(["ArrowRight","ArrowDown"].includes(e.key)?1:-1)+plans.length)%plans.length;
 activeId=plans[n].id;render();root.querySelector('[data-plan="'+activeId+'"]').focus({preventScroll:true});
});
fetch("./services-data.json",{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("Could not fetch generated catalog: "+r.status);return r.json();}).then(function(data){
 if(!data||data.plans.length!==6||data.taskIdCount!==129)throw Error("Canonical catalog validation failed");
 catalog=data;plans=data.plans;activeId=plans[0].id;render();
}).catch(function(err){root.innerHTML='<p class="loading" role="alert">The preview catalog could not load. Please refresh the page. '+escapeText(err.message)+'</p>';root.setAttribute("aria-busy","false");});
})();
