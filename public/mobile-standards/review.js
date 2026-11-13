(function(){
"use strict";
var designs={
 postcard:{name:"Editorial Postcard",description:"A compact original portrait sits beside the heading. The first paragraph then spreads across the full card beneath it.",strength:"Clear editorial rhythm while preserving every photograph",tradeoff:"Still shows three full stories one after another"},
 chapters:{name:"Illustrated Chapters",description:"Three short landscape photograph bands connect directly to a heading and text, like the chapters of a picture book.",strength:"Predictable reading flow and elegant alignments",tradeoff:"Landscape cropping can lose part of the portrait artwork"},
 gallery:{name:"Three-Story Gallery",description:"Three immediately accessible topic tabs show one watercolor illustration and its paragraph at a time.",strength:"Least scrolling with strong storytelling",tradeoff:"Two stories are hidden until selected"},
 accordion:{name:"Illustrated Accordion",description:"Three compact thumbnail rows allow readers to expand any one of the selling points.",strength:"Visitors see the complete list of advantages at a glance",tradeoff:"Feels more like a useful interface than an editorial spread"},
 interlocking:{name:"Interlocking Postcards",description:"Large photographs overlap white note cards on alternating sides of the screen, preserving our beloved LEGO overlap.",strength:"Warm, layered, distinctly Hello Casa",tradeoff:"Takes a little more height than the compact concepts"},
 corners:{name:"Puzzle Corners",description:"Photographs tuck into alternating upper corners beside the headings; the paragraph flows full-width underneath.",strength:"Most economical literal interlocking effect",tradeoff:"Smaller photographs reveal less of each original illustration"},
 cascade:{name:"Cascading Zigzag",description:"Three overlapping picture-and-text compositions step left, right, then left, with a subtle shared visual thread.",strength:"A continuous artistic story and unmistakable zigzag movement",tradeoff:"Needs careful alignment and vertical rhythm on narrow phones"}
};
var buttons=[...document.querySelectorAll("[data-design]")],widthButtons=[...document.querySelectorAll("[data-width]")];
var frame=document.getElementById("design-frame"),holder=document.getElementById("device-holder"),phone=document.getElementById("phone"),stage=document.getElementById("stage");
var params=new URL(location.href).searchParams;
var design=Object.hasOwn(designs,params.get("design"))?params.get("design"):"postcard";
var width=[320,375,390].includes(Number(params.get("width")))?Number(params.get("width")):390;
var height=800;
function resize(){
 var space=Math.max(265,stage.clientWidth-4),fullWidth=width+14;
 var scale=Math.min(1,space/fullWidth);
 holder.style.width=Math.ceil(fullWidth*scale)+"px";holder.style.height=Math.ceil((height+14)*scale)+"px";
 phone.style.width=fullWidth+"px";phone.style.height=(height+14)+"px";phone.style.transform="scale("+scale+")";
 frame.style.width=width+"px";frame.style.height=height+"px";frame.setAttribute("width",String(width));
 document.getElementById("viewport-readout").textContent=width+"px design viewport · "+height+"px visible height"+(scale<1?" · scaled to fit":"");
}
function update(){
 buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.design===design)));
 widthButtons.forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.width)===width)));
 var description=designs[design],number=String(Object.keys(designs).indexOf(design)+1).padStart(2,"0");
 document.getElementById("notes-title").textContent=description.name;
 document.getElementById("notes-description").textContent=description.description;
 document.getElementById("notes-strength").textContent=description.strength;
 document.getElementById("notes-tradeoff").textContent=description.tradeoff;
 document.getElementById("preview-heading").textContent=number+" · "+description.name;
 var url="./concept.html?design="+encodeURIComponent(design);
 if(frame.getAttribute("src")!==url)frame.setAttribute("src",url);
 document.getElementById("open-direct").href=url;
 var current=new URL(location.href);current.searchParams.set("design",design);current.searchParams.set("width",String(width));
 history.replaceState(null,"",current.pathname+current.search+current.hash);
 resize();
}
buttons.forEach(b=>b.addEventListener("click",()=>{design=b.dataset.design;update();}));
widthButtons.forEach(b=>b.addEventListener("click",()=>{width=Number(b.dataset.width);update();}));
window.addEventListener("resize",resize,{passive:true});
update();
})();