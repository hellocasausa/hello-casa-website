(function(){
"use strict";
var models={
 atlas:{title:"Compact Atlas",summary:"Six friendly pastel tiles sit inside one connected service and checklist surface.",strength:"All six plans visible with familiar icons",tradeoff:"Uses more vertical space than compact tabs"},
 index:{title:"Editorial Index",summary:"A refined service-menu index opens its full checklist immediately beneath the selected row.",strength:"Elegant reading flow and generous labels",tradeoff:"Changing plans may involve more scrolling"},
 ribbon:{title:"Service Ribbon",summary:"A tight six-tab palette joins directly to the checklist, with a continuous selected state.",strength:"The most economical navigation footprint",tradeoff:"Longer names require careful 320px typography"},
 featured:{title:"Featured Service",summary:"A larger plan introduction adds personality before the compact six-plan navigation and checklist.",strength:"Strong visual storytelling and active-plan clarity",tradeoff:"A taller introduction than the ribbon"}
};
var choices=Array.from(document.querySelectorAll("[data-concept]")),sizes=Array.from(document.querySelectorAll("[data-width]"));
var frame=document.getElementById("design-frame"),stage=document.getElementById("phone-stage"),holder=document.getElementById("phone-holder"),body=document.getElementById("phone-body");
var params=new URL(location.href).searchParams;
var active=Object.hasOwn(models,params.get("design"))?params.get("design"):"atlas";
var size=["320","375","390"].includes(params.get("width"))?Number(params.get("width")):390;
var height=800,frameUrl="";
function layout(){
 var available=Math.max(250,stage.clientWidth-12),deviceWidth=size+14,scale=Math.min(1,available/deviceWidth);
 holder.style.width=Math.ceil(deviceWidth*scale)+"px";
 holder.style.height=Math.ceil((height+14)*scale)+"px";
 body.style.width=deviceWidth+"px";body.style.height=(height+14)+"px";body.style.transform="scale("+scale+")";
 frame.style.width=size+"px";frame.style.height=height+"px";frame.setAttribute("width",String(size));
 document.getElementById("viewport-label").textContent=size+"px viewport · "+height+"px phone height"+(scale<1?" · scaled to fit":"");
}
function draw(){
 choices.forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.concept===active));});
 sizes.forEach(function(b){b.setAttribute("aria-pressed",String(Number(b.dataset.width)===size));});
 var note=models[active];
 document.getElementById("assessment-title").textContent=note.title;
 document.getElementById("assessment-summary").textContent=note.summary;
 document.getElementById("assessment-strength").textContent=note.strength;
 document.getElementById("assessment-tradeoff").textContent=note.tradeoff;
 var id=String(Object.keys(models).indexOf(active)+1).padStart(2,"0");
 document.getElementById("preview-title").textContent=id+" · "+note.title;
 frameUrl="./concept.html?design="+encodeURIComponent(active);
 if(frame.getAttribute("src")!==frameUrl)frame.setAttribute("src",frameUrl);
 document.getElementById("open-prototype").href=frameUrl;
 var url=new URL(location.href);url.searchParams.set("design",active);url.searchParams.set("width",String(size));history.replaceState(null,"",url.pathname+url.search+url.hash);
 layout();
}
choices.forEach(function(b){b.addEventListener("click",function(){active=b.dataset.concept;draw();});});
sizes.forEach(function(b){b.addEventListener("click",function(){size=Number(b.dataset.width);draw();});});
window.addEventListener("resize",layout,{passive:true});draw();
})();
