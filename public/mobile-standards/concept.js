/* Isolated design exploration. Uses one original paragraph per story; never rewrites the source site. */
(function(){
"use strict";
var available=["postcard","chapters","gallery","accordion","interlocking","corners","cascade"];
var params=new URL(location.href).searchParams;
var design=available.includes(params.get("design"))?params.get("design"):"postcard";
var currentStory=0,expanded=0;
var mount=document.getElementById("standards-root"),catalog;
var esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
var asset=s=>new URL("../"+s.replace(/^\//,""),location.href).href;
function photo(s,klass=""){
 return '<figure class="story-figure '+klass+'"><img src="'+esc(asset(s.image))+'" alt="'+esc(s.alt)+'" loading="eager" width="380" height="515"></figure>';
}
function headline(s){
 return '<header class="story-heading"><p class="story-kicker">'+esc(s.eyebrow)+'</p><h3>'+esc(s.title)+'</h3></header>';
}
function para(s){return '<div class="story-copy"><p>'+esc(s.paragraph)+'</p></div>';}
function headingIndex(i){return '<span class="story-index" aria-hidden="true">'+String(i+1).padStart(2,"0")+'</span>';}
function intro(){
 return '<div class="section-top"><span class="section-accent" aria-hidden="true"></span>'+
 '<div class="section-intro"><h2>'+esc(catalog.title)+'</h2>'+
 '<p>'+esc(catalog.intro[0])+'<span>'+esc(catalog.intro[1])+'</span></p></div></div>';
}
function storyCard(s,i,variant){
 return '<article class="story story--'+(i+1)+' story-'+variant+'" id="'+esc(s.id)+'">'+
 (variant==="postcard"?
  '<div class="postcard-row">'+photo(s)+headline(s)+'</div>'+para(s):
 variant==="chapters"?
  photo(s)+headline(s)+para(s):
 variant==="interlocking"?
  headline(s)+photo(s)+para(s):
 variant==="corners"?
  '<div class="puzzle-wrap"><div class="puzzle-top">'+photo(s)+headline(s)+'</div>'+para(s)+'</div>':
 variant==="cascade"?
  '<div class="cascade-heading">'+headingIndex(i)+headline(s)+'</div><div class="cascade-photo">'+photo(s)+'</div>'+para(s):
 "")+'</article>';
}
function gallery(){
 var links=catalog.stories.map((s,i)=>'<button type="button" class="gallery-tab" role="tab" id="gallery-tab-'+i+'" data-gallery="'+i+'" aria-selected="'+(i===currentStory)+'" tabindex="'+(i===currentStory?0:-1)+'" aria-controls="gallery-panel"><span class="tab-index">'+String(i+1).padStart(2,"0")+'</span><span>'+esc(["People","Profiles","Freedom"][i])+'</span></button>').join("");
 var s=catalog.stories[currentStory];
 return '<nav class="gallery-nav" role="tablist" aria-label="Hello Casa Standards stories">'+links+'</nav>'+
 '<div class="gallery-panel" id="gallery-panel" role="tabpanel" aria-labelledby="gallery-tab-'+currentStory+'" tabindex="0">'+
 '<div class="gallery-title">'+headline(s)+'<span class="gallery-count">'+String(currentStory+1).padStart(2,"0")+' / 03</span></div>'+
 photo(s)+para(s)+'</div>';
}
function accordion(){
 return '<div class="accordion-list">'+catalog.stories.map((s,i)=>'<article class="accordion-item '+(expanded===i?"is-open":"")+'">'+
 '<h3 class="accordion-heading"><button class="accordion-trigger" id="acc-heading-'+i+'" type="button" data-accordion="'+i+'" aria-expanded="'+(expanded===i)+'" aria-controls="acc-panel-'+i+'">'+
 photo(s,'accordion-thumb')+'<span class="accordion-label"><span class="story-kicker">'+esc(s.eyebrow)+'</span><span class="acc-title">'+esc(s.title)+'</span></span>'+
 '<span class="accordion-icon" aria-hidden="true">'+(expanded===i?"−":"+")+'</span></button></h3>'+
 '<div class="accordion-detail" id="acc-panel-'+i+'" role="region" aria-labelledby="acc-heading-'+i+'"'+(expanded===i?"":" hidden")+'>'+para(s)+'</div></article>').join("")+'</div>';
}
function render(){
 var body=["gallery","accordion"].includes(design)?(design==="gallery"?gallery():accordion()):catalog.stories.map((s,i)=>storyCard(s,i,design)).join("");
 mount.innerHTML=intro()+'<section class="stories variant-'+design+'" aria-label="Three Hello Casa advantages">'+body+'</section>';
 mount.className="standards-study design-"+design;
 mount.setAttribute("aria-busy","false");
 document.documentElement.dataset.design=design;
}
mount.addEventListener("click",e=>{
 const galleryButton=e.target.closest("[data-gallery]");
 if(galleryButton){currentStory=Number(galleryButton.dataset.gallery);render();mount.querySelector('[data-gallery="'+currentStory+'"]').focus({preventScroll:true});return;}
 const accordionButton=e.target.closest("[data-accordion]");
 if(accordionButton){const i=Number(accordionButton.dataset.accordion);expanded=expanded===i?-1:i;render();mount.querySelector('[data-accordion="'+i+'"]').focus({preventScroll:true});}
});
mount.addEventListener("keydown",e=>{
 const tab=e.target.closest("[data-gallery]");
 if(tab&&["ArrowRight","ArrowLeft","Home","End"].includes(e.key)){
  e.preventDefault();
  const i=Number(tab.dataset.gallery);
  currentStory=e.key==="Home"?0:e.key==="End"?2:(i+(e.key==="ArrowRight"?1:-1)+3)%3;
  render();mount.querySelector('[data-gallery="'+currentStory+'"]').focus({preventScroll:true});return;
 }
 const disclosure=e.target.closest("[data-accordion]");
 if(disclosure&&["ArrowDown","ArrowUp","Home","End"].includes(e.key)){
  e.preventDefault();const i=Number(disclosure.dataset.accordion);
  const next=e.key==="Home"?0:e.key==="End"?2:(i+(e.key==="ArrowDown"?1:-1)+3)%3;
  mount.querySelector('[data-accordion="'+next+'"]').focus({preventScroll:true});
 }
});
fetch("./data.json",{cache:"no-store"})
 .then(r=>{if(!r.ok)throw Error("Catalog unavailable ("+r.status+")");return r.json();})
 .then(d=>{
  if(d.stories?.length!==3||d.stories.some(s=>!s.paragraph||!s.image))throw Error("Incomplete original Standards data");
  catalog=d;render();
 })
 .catch(err=>{mount.innerHTML='<p role="alert" class="loading">Unable to load the Standards source. '+esc(err.message)+'</p>';mount.setAttribute("aria-busy","false");});
})();