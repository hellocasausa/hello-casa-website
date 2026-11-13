/* Experimental UI only: displays the actual native Services component using the real
   published homepage, CSS-isolated in a same-origin iframe. No copied plan logic. */
(function(){
"use strict";
var stage=document.getElementById("stage");
var holder=document.getElementById("phone-holder");
var shell=document.getElementById("phone-shell");
var frame=document.getElementById("native-services");
var status=document.getElementById("preview-status");
var widthBtns=Array.from(document.querySelectorAll("[data-width]"));
var layoutBtns=Array.from(document.querySelectorAll("[data-layout]"));
var search=new URL(location.href).searchParams;
var width=[320,375,390].includes(Number(search.get("width")))?Number(search.get("width")):390;
var layout=["current","proposed"].includes(search.get("layout"))?search.get("layout"):"proposed";
var section=null,ready=false,iframeHeight=1550,observer=null,resizeObserver=null,raf=0;
var rulePromise=fetch("./grid-overlay.css",{cache:"no-store"}).then(function(r){
 if(!r.ok)throw Error("Comparison style unavailable ("+r.status+")");
 return r.text();
});
function columns(){return layout==="current"||width<375?1:2;}
function labels(){
 var n=columns();
 document.getElementById("preview-title").textContent=layout==="current"?"Previous single-column checklist":"Approved compact checklist";
 document.getElementById("columns").textContent=String(n);
 document.getElementById("task-size").textContent=n===2?"11.5px":"12.5px";
 document.getElementById("check-size").textContent=n===2?"10px":"11px";
 document.getElementById("design-description").textContent=
  layout==="current"?"Previous single-column presentation for reference. The six service tiles, focus controls and real checklist stay the same. Compare scrolling with the approved two-column version.":
  width<375?"The 320px version intentionally uses the existing single-column checklist, protecting the longest task descriptions from cramped wrapping.":
  "Two actual checklist cards per row, with modestly smaller type, checkmarks and padding. All task descriptions and additions are unchanged; switch plans to see how other checklists fit.";
 widthBtns.forEach(function(b){b.setAttribute("aria-pressed",String(Number(b.dataset.width)===width));});
 layoutBtns.forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.layout===layout));});
 var url=new URL(location.href);url.searchParams.set("width",String(width));url.searchParams.set("layout",layout);
 history.replaceState(null,"",url.pathname+url.search+url.hash);
}
function place(){
 var outerWidth=width+12;
 var available=Math.max(260,stage.clientWidth-7);
 var scale=Math.min(1,available/outerWidth);
 holder.style.width=Math.ceil(outerWidth*scale)+"px";
 holder.style.height=Math.ceil((iframeHeight+12)*scale)+"px";
 shell.style.width=outerWidth+"px";
 shell.style.height=(iframeHeight+12)+"px";
 shell.style.transform="scale("+scale+")";
 frame.style.width=width+"px";
 frame.style.height=iframeHeight+"px";
 frame.setAttribute("width",String(width));
 document.getElementById("viewport-info").textContent=width+"px viewport"+(scale<1?" · scaled to fit":"")+" · "+columns()+" checklist column"+(columns()===1?"":"s");
}
function resizeToContent(){
 if(!ready||!section)return;
 if(raf)cancelAnimationFrame(raf);
 raf=requestAnimationFrame(function(){
  raf=0;
  var computed=section.getBoundingClientRect();
  var h=Math.ceil(Math.max(440,computed.height+2));
  if(h!==iframeHeight){iframeHeight=h;place();}
 });
}
function setView(){
 labels();
 if(ready&&frame.contentDocument){
  frame.contentDocument.documentElement.dataset.layout=layout;
  resizeToContent();
 }
 place();
}
function selectionFromPage(){
 if(!frame.contentDocument)return;
 var selected=frame.contentDocument.querySelector("#hc-mobile-vertical [data-plan][aria-selected='true']");
 var title=selected?.querySelector(".hc-card-label")?.textContent?.replace(/\s+/g," ").trim()||"Essential Clean";
 status.textContent="Ready · "+title;
 status.dataset.ready="true";
}
function installListeners(doc){
 if(observer)observer.disconnect();
 if(resizeObserver)resizeObserver.disconnect();
 section=doc.getElementById("hc-mobile-vertical");
 if(!section)throw Error("The native Services section could not be located");
 observer=new MutationObserver(function(){selectionFromPage();resizeToContent();});
 observer.observe(section,{childList:true,characterData:true,attributes:true,subtree:true});
 resizeObserver=new ResizeObserver(resizeToContent);
 resizeObserver.observe(section);
 ready=true;
 setView();
 selectionFromPage();
 doc.fonts?.ready?.then(resizeToContent);
 Array.from(section.querySelectorAll("img")).forEach(function(img){
  if(!img.complete)img.addEventListener("load",resizeToContent,{once:true});
 });
 resizeToContent();
}
frame.addEventListener("load",async function(){
 try{
  var doc=frame.contentDocument;
  if(!doc)throw Error("Preview iframe is not same-origin");
  var rules=await rulePromise;
  doc.documentElement.classList.add("hc-services-study");
  doc.documentElement.dataset.layout=layout;
  var style=doc.createElement("style");
  style.id="hc-services-experiment-only";
  style.textContent=rules;
  doc.head.appendChild(style);
  installListeners(doc);
 }catch(err){
  status.textContent="Preview unavailable";
  status.dataset.ready="false";
  document.getElementById("design-description").textContent=String(err.message||err);
 }
});
layoutBtns.forEach(function(button){
 button.addEventListener("click",function(){layout=button.dataset.layout;setView();});
});
widthBtns.forEach(function(button){
 button.addEventListener("click",function(){width=Number(button.dataset.width);setView();});
});
window.addEventListener("resize",place,{passive:true});
labels();place();
})();