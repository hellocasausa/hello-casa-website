// DESIGN EXPLORATION ONLY. Do not copy canonical checklists or reproduce business rules.
import fs from "node:fs";
import path from "node:path";
import {parseHTML} from "linkedom";
import plans from "../src/data/plans.json" with {type:"json"};
import {checklist,focusControls} from "../src/components/services.ts";

const original=fs.readFileSync("src/components/markup/services.html","utf8");
const {document}=parseHTML("<!doctype html><html><body>"+original+"</body></html>");
const tile=(plan)=>{
 const button=document.querySelector('[data-plan="'+plan.id+'"]');
 if(!button)throw new Error("No approved service tile for "+plan.id);
 const style=button.getAttribute("style")||"";
 const color=(key)=>style.match(new RegExp("(?:^|;)"+key+":([^;]+)"))?.[1]?.trim();
 const icon=button.querySelector("img")?.getAttribute("src");
 if(!icon||!color("--tile")||!color("--icon-bg"))throw new Error("Missing approved icon/color "+plan.id);
 return {
  id:plan.id,name:plan.name,description:plan.description,
  icon,tile:color("--tile"),iconBg:color("--icon-bg"),
  checklists:{
   standard:checklist(plan,"standard"),
   ...(plan.id==="maintenance"?{kitchen:checklist(plan,"kitchen"),bathroom:checklist(plan,"bathroom")}:{})
  }
 };
};
const quote=document.querySelector("a.hc-button")?.getAttribute("href");
if(!quote||!quote.startsWith("https://form.jotform.com/"))throw new Error("Missing canonical quote link");
const taskIds=[...new Set(plans.flatMap(p=>p.groups.flatMap(g=>g.taskIds)))];
if(plans.length!==6||taskIds.length!==129)throw new Error("Unexpected canonical plan/task inventory");
const out={
 source:"src/data/plans.json + src/components/services.ts + src/components/markup/services.html",
 revision:process.env.GITHUB_SHA||"local",
 taskIdCount:taskIds.length,
 quote,
 focusHtml:focusControls(),
 plans:plans.map(tile)
};
const destination="public/mobile-concepts/services-data.json";
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.writeFileSync(destination,JSON.stringify(out));
console.log("Generated isolated mobile Services preview from canonical source: "+out.plans.length+" plans; "+out.taskIdCount+" catalog task IDs");
