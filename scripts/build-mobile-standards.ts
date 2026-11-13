// Seven isolated Standards design previews. Existing Standards code/copy stays canonical.
// Run after npm install; linkedom is an existing project dependency.
import fs from "node:fs";
import {parseHTML} from "linkedom";
import delivery from "../src/data/delivery.json" with {type:"json"};

const markup=fs.readFileSync("src/components/markup/standards.html","utf8");
const {document}=parseHTML("<!doctype html><html><body>"+markup+"</body></html>");
const intro=document.querySelector(".st-intro");
if(!intro)throw Error("Cannot locate approved Standards introduction");
const p=intro.querySelector("p");
const opening=(p.childNodes[0]?.textContent||"").trim();
const continuation=(p.querySelector("span")?.textContent||"").trim();
const records=[...document.querySelectorAll(".st-story")].map((story,i)=>{
 const paragraphs=[...story.querySelectorAll(".st-copy > p")];
 if(paragraphs.length<2)throw Error("Expected full, two-paragraph original for story "+(i+1));
 const source=story.querySelector(".st-figure img");
 const original=source?.getAttribute("src");
 const image=delivery[original]?.src||original;
 if(!image||!image.startsWith("/assets/"))throw Error("Missing canonical picture for story "+(i+1));
 const title=story.querySelector(".st-heading h3")?.textContent?.trim();
 const eyebrow=story.querySelector(".st-kicker")?.textContent?.trim();
 const paragraph=paragraphs[0]?.textContent?.trim();
 if(!title||!eyebrow||!paragraph)throw Error("Missing approved copy for story "+(i+1));
 const alt=source?.getAttribute("alt")||"";
 return {number:i+1,id:"standards-story-"+(i+1),eyebrow,title,paragraph,image,alt};
});
if(records.length!==3)throw Error("Expect exactly three Standards stories");
if(records.some(x=>x.paragraph.length<140))throw Error("First-paragraph extraction appears truncated");
const data={
 source:"src/components/markup/standards.html; src/data/delivery.json",
 title:intro.querySelector("h2").textContent.trim(),
 intro:[opening,continuation],
 paragraphPolicy:"first paragraph only in all seven experimental mobile variants",
 stories:records
};
fs.mkdirSync("public/mobile-standards",{recursive:true});
fs.writeFileSync("public/mobile-standards/data.json",JSON.stringify(data,null,2)+"\n");
console.log("Generated seven-layout Standards data: "+records.length+" original images; one canonical paragraph per story");
