import {test,expect} from "@playwright/test";
const headings=["Thoroughly Vetted Professionals","Personalized Cleaning Profiles","No Long-Term Contracts"];
test.beforeEach(async({page})=>{
 await page.route("https://form.jotform.com/**",r=>r.abort());
 await page.goto("/");
 await page.evaluate(()=>document.fonts.ready);
});
test("approved Atelier v4 geometry, copy, original imagery and responsive photo relationships",async({page})=>{
 test.setTimeout(120000);
 for(const width of [901,1000,1100,1199,1200,1440,1920]){
  await page.setViewportSize({width,height:950});
  const standard=page.locator("#standards");
  await expect(standard).toBeVisible();
  await expect(page.locator(".st-intro h2")).toHaveText("Care starts at home.");
  await expect(page.locator(".st-intro p")).toHaveText("Who comes through your door matters.So do the little details, & the freedom to change your plans.");
  await expect(page.locator(".st-intro p span")).toHaveCSS("display","block");
  await expect(page.locator(".st-copy p")).toHaveCount(6);
  await expect(page.locator(".st-story")).toHaveCount(3);
  for(let i=0;i<3;i++)await expect(page.locator(".st-story").nth(i).locator("h3")).toHaveText(headings[i]);
  await expect.poll(()=>page.locator(".st-figure img").evaluateAll(imgs=>imgs.filter(i=>(i as HTMLImageElement).naturalWidth>0).length),{timeout:15000}).toBe(3);
  const info=await standard.evaluate(el=>{
   const w=el.ownerDocument.defaultView!,shell=el.querySelector(".st-shell")!,intro=el.querySelector(".st-intro")!,line=el.querySelector(".st-intro-rule")!,ir=intro.getBoundingClientRect(),lr=line.getBoundingClientRect();
   const rows=[...el.querySelectorAll(".st-story")].map(story=>{
    const photo=story.querySelector(".st-figure")!.getBoundingClientRect(),card=story.querySelector(".st-prose")!.getBoundingClientRect(),heading=story.querySelector(".st-heading")!.getBoundingClientRect();
    return {w:photo.width,h:photo.height,left:photo.left,cardLeft:card.left,headingBottom:heading.bottom,cardTop:card.top,
      overlapX:Math.max(0,Math.min(photo.right,card.right)-Math.max(photo.left,card.left)),
      overlapY:Math.max(0,Math.min(photo.bottom,card.bottom)-Math.max(photo.top,card.top)),
      textFits:[...story.querySelectorAll(".st-copy p")].every(p=>p.getBoundingClientRect().bottom<=card.bottom+2),
      alignment:w.getComputedStyle(story.querySelector(".st-heading")!).textAlign};
   });
   return {width:w.innerWidth,overflow:el.scrollWidth-el.clientWidth,storyShell:shell.getBoundingClientRect().width,
    intro:{left:ir.left,right:ir.right,height:ir.height,background:w.getComputedStyle(intro).backgroundColor,backgroundImage:w.getComputedStyle(intro).backgroundImage},
    rule:{right:lr.right,width:lr.width,height:lr.height,color:w.getComputedStyle(line).backgroundColor},
    rows};
  });
  console.log("APPROVED_STANDARDS_DESKTOP",width,JSON.stringify(info));
  expect(info.overflow).toBeLessThanOrEqual(3);
  expect(info.intro.background).toBe("rgb(216, 234, 247)");
  expect(info.intro.backgroundImage).toBe("none");
  expect(info.rule.height).toBe(6);
  expect(info.rule.color).toBe(info.intro.background);
  expect(Math.abs(info.rule.right-width)).toBeLessThanOrEqual(2);
  expect(info.rows.map(r=>r.alignment)).toEqual(["left","right","left"]);
  expect(info.rows[1].h).toBeGreaterThan(info.rows[0].h);
  expect(info.rows[1].h).toBeGreaterThan(info.rows[2].h);
  for(const row of info.rows){
   expect(row.textFits).toBe(true);
   expect(row.headingBottom).toBeLessThanOrEqual(row.cardTop+2);
   expect(row.overlapX).toBeGreaterThanOrEqual(7);
   expect(row.overlapY).toBeGreaterThanOrEqual(40);
  }
  if(width===1440){
   expect(info.rows.map(x=>Math.round(x.w))).toEqual([321,297,352]);
   expect(info.rows.map(x=>Math.round(x.h))).toEqual([413,470,426]);
  }
  if(width===1100){
   expect(info.rows.map(x=>Math.round(x.w))).toEqual([275,254,301]);
   expect(info.rows.map(x=>Math.round(x.h))).toEqual([354,402,365]);
  }
  if([901,1100,1440,1920].includes(width))
   await standard.screenshot({path:"test-results/approved-standards-desktop-"+width+".png",animations:"disabled",style:".skip-link{visibility:hidden !important}"});
 }
});
test("all approved full-length Standards copy remains readable on tablet and phone",async({page})=>{
 test.setTimeout(90000);
 for(const width of [320,350,390,430,750,751,820,900]){
  await page.setViewportSize({width,height:900});
  await expect(page.locator(".st-story")).toHaveCount(3);
  const info=await page.locator("#standards").evaluate(section=>{
   const win=section.ownerDocument.defaultView!;
   const rows=[...section.querySelectorAll(".st-story")].map(el=>{
    const card=el.querySelector(".st-prose")!,image=el.querySelector(".st-figure")!,heading=el.querySelector(".st-heading")!;
    const c=card.getBoundingClientRect(),p=image.getBoundingClientRect(),h=heading.getBoundingClientRect();
    return {layout:win.getComputedStyle(el).display,headingBeforePhoto:h.bottom<p.top+2,photoBeforeParagraph:p.bottom<c.top+50,
      paragraphsInside:[...card.querySelectorAll(".st-copy p")].every(p=>p.getBoundingClientRect().bottom<=c.bottom+2),
      cardTextSize:parseFloat(win.getComputedStyle(card).fontSize),imageWidth:p.width,headingVisible:!!heading.textContent?.trim()};
   });
   return {width:win.innerWidth,overflow:section.scrollWidth-section.clientWidth,stories:rows};
  });
  console.log("APPROVED_STANDARDS_MOBILE",width,JSON.stringify(info));
  expect(info.overflow).toBeLessThanOrEqual(3);
  for(const story of info.stories){
   expect(story.layout).toBe("flex");
   expect(story.headingBeforePhoto).toBe(true);
   expect(story.photoBeforeParagraph).toBe(true);
   expect(story.paragraphsInside).toBe(true);
   expect(story.cardTextSize).toBeGreaterThanOrEqual(14);
   expect(story.headingVisible).toBe(true);
  }
  if([390,750].includes(width))
   await page.locator("#standards").screenshot({path:"test-results/approved-standards-mobile-"+width+".png",animations:"disabled",style:".skip-link{visibility:hidden !important}"});
 }
});