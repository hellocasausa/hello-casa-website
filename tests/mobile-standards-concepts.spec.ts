import {test,expect} from "@playwright/test";
import fs from "node:fs";
import {parseHTML} from "linkedom";
const variants=["postcard","chapters","gallery","accordion","interlocking","corners","cascade"] as const;
const widths=[320,375,390] as const;
const {document}=parseHTML("<html><body>"+fs.readFileSync("src/components/markup/standards.html","utf8")+"</body></html>");
const source=[...document.querySelectorAll(".st-story")].map((s,i)=>({
 eyebrow:s.querySelector(".st-kicker")!.textContent!.trim(),
 title:s.querySelector(".st-heading h3")!.textContent!.trim(),
 first:s.querySelector(".st-copy p")!.textContent!.trim(),
 second:s.querySelectorAll(".st-copy p")[1]!.textContent!.trim(),
 image:s.querySelector(".st-figure img")!.getAttribute("src")!
}));
test.beforeEach(async({page})=>{await page.goto("/mobile-standards/index.html");});
test("all seven comparisons use exactly original first paragraphs and three watercolor assets",async({page})=>{
 test.setTimeout(120000);
 const frame=page.frameLocator("#design-frame");
 await expect(page.locator("[data-design]")).toHaveCount(7);
 for(const variant of variants){
  await page.locator('[data-design="'+variant+'"]').click();
  await expect(page.locator('[data-design="'+variant+'"]')).toHaveAttribute("aria-pressed","true");
  await expect(frame.locator("#standards-root")).toHaveAttribute("aria-busy","false");
  await expect(frame.locator(".section-intro h2")).toHaveText("Care starts at home.");
  const original=await frame.locator("body").evaluate(async el=>{
   const data=await (await fetch("./data.json")).json();
   return data.stories.map((x:any)=>({eyebrow:x.eyebrow,title:x.title,paragraph:x.paragraph,image:x.image}));
  });
  expect(original.map((x:any)=>x.eyebrow)).toEqual(source.map(x=>x.eyebrow));
  expect(original.map((x:any)=>x.title)).toEqual(source.map(x=>x.title));
  expect(original.map((x:any)=>x.paragraph)).toEqual(source.map(x=>x.first));
  for(const width of widths){
   await page.locator('[data-width="'+width+'"]').click();
   const size=await frame.locator("body").evaluate(el=>{
    const win=el.ownerDocument.defaultView!;
    return {width:win.innerWidth,scroll:el.ownerDocument.documentElement.scrollWidth};
   });
   expect(size.width).toBe(width);
   expect(size.scroll,"horizontal overflow in "+variant+" at "+width).toBeLessThanOrEqual(width+1);
   const paragraphs=frame.locator(".story-copy p");
   const expected=variant==="gallery"||variant==="accordion"?1:3;
   if(variant==="accordion"){
    await expect(frame.locator(".accordion-item")).toHaveCount(3);
    await expect(frame.locator(".accordion-trigger[aria-expanded=true]")).toHaveCount(1);
   }else await expect(paragraphs).toHaveCount(expected);
   const images=await frame.locator(".story-figure img").evaluateAll(els=>els.map(img=>({
    loaded:(img as HTMLImageElement).naturalWidth>0,
    path:(img as HTMLImageElement).getAttribute("src")
   })));
   expect(images.length).toBe(variant==="gallery"?1:3);
   expect(images.every(x=>x.loaded),variant+" images loaded at "+width).toBe(true);
   expect(images.every(x=>x.path?.includes("/hello-casa-website/assets/")||x.path?.includes("/assets/")),variant+" images from canonical assets").toBe(true);
  }
  if(variant!=="gallery"&&variant!=="accordion"){
   for(let i=0;i<3;i++){
    await expect(frame.locator(".story-copy p").nth(i)).toHaveText(source[i].first);
    await expect(frame.locator(".story-heading h3").nth(i)).toHaveText(source[i].title);
   }
  }
 }
});
test("gallery tabs and accordion expansion work with mouse and keyboard",async({page})=>{
 const frame=page.frameLocator("#design-frame");
 await page.locator('[data-design="gallery"]').click();
 await expect(frame.locator(".gallery-tab")).toHaveCount(3);
 await frame.locator('[data-gallery="1"]').click();
 await expect(frame.locator(".gallery-panel .story-heading h3")).toHaveText(source[1].title);
 await expect(frame.locator(".gallery-panel .story-copy p")).toHaveText(source[1].first);
 await frame.locator('[data-gallery="1"]').press("ArrowRight");
 await expect(frame.locator(".gallery-panel .story-heading h3")).toHaveText(source[2].title);
 await frame.locator('[data-gallery="2"]').press("Home");
 await expect(frame.locator(".gallery-panel .story-heading h3")).toHaveText(source[0].title);
 await page.locator('[data-design="accordion"]').click();
 await expect(frame.locator(".accordion-item")).toHaveCount(3);
 await expect(frame.locator(".accordion-trigger[aria-expanded=true]")).toHaveCount(1);
 await frame.locator('[data-accordion="2"]').click();
 await expect(frame.locator(".accordion-trigger[aria-expanded=true]")).toHaveCount(1);
 await expect(frame.locator("#acc-panel-2 .story-copy p")).toHaveText(source[2].first);
 await expect(frame.locator("#acc-panel-0")).toBeHidden();
 await frame.locator('[data-accordion="2"]').press("ArrowUp");
 await expect(frame.locator('[data-accordion="1"]')).toBeFocused();
});
test("zigzag variants visibly alternate image side left-right-left at 320 and 390px",async({page})=>{
 const frame=page.frameLocator("#design-frame");
 for(const variant of ["postcard","interlocking","corners","cascade"]){
  await page.locator('[data-design="'+variant+'"]').click();
  for(const width of [320,390]){
   await page.locator('[data-width="'+width+'"]').click();
   const placements=await frame.locator(".story").evaluateAll((stories,concept)=>stories.map(story=>{
    const image=story.querySelector(".story-figure")!.getBoundingClientRect();
    const shell=story.getBoundingClientRect();
    const center=(image.left+image.right)/2;
    return {relative:center-(shell.left+shell.right)/2,photoHeight:image.height};
   }),variant);
   expect(placements.length).toBe(3);
   expect(placements[0].relative,variant+" first image left").toBeLessThan(0);
   expect(placements[1].relative,variant+" second image right").toBeGreaterThan(0);
   expect(placements[2].relative,variant+" third image left").toBeLessThan(0);
  }
 }
});
test("captures all seven Standards preview screenshots at 390px",async({page})=>{
 test.setTimeout(120000);
 const frame=page.frameLocator("#design-frame");
 for(const variant of variants){
  await page.locator('[data-design="'+variant+'"]').click();
  await expect(frame.locator("#standards-root")).toHaveAttribute("aria-busy","false");
  await frame.locator("body").screenshot({path:"test-results/approved-standards-concept-"+variant+"-390.png",animations:"disabled"});
 }
});
test("the approved homepage Standards remains unchanged with both original paragraphs",async({page})=>{
 await page.goto("/");
 await page.setViewportSize({width:390,height:850});
 await expect(page.locator("#standards .st-story")).toHaveCount(3);
 for(let i=0;i<3;i++){
  await expect(page.locator("#standards .st-story").nth(i).locator(".st-copy p")).toHaveCount(2);
  await expect(page.locator("#standards .st-story").nth(i).locator(".st-copy p").first()).toHaveText(source[i].first);
  await expect(page.locator("#standards .st-story").nth(i).locator(".st-copy p").nth(1)).toHaveText(source[i].second);
 }
});
