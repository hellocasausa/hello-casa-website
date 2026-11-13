import {test,expect} from "@playwright/test";

test.beforeEach(async({page})=>{
 await page.route("https://form.jotform.com/**",r=>r.abort());
 await page.goto("/");
 await page.evaluate(()=>document.fonts.ready);
});
test("native approved Services B tabs join the checklist at desktop widths",async({page})=>{
 for(const width of [901,1000,1100,1440,1920]){
  await page.setViewportSize({width,height:1000});
  await expect(page.locator(".hc-tabs-heading")).toBeVisible();
  await expect(page.locator(".hc-tabs-heading h2")).toHaveText("A clean forevery chapter.");
  await expect(page.locator("#hc-mobile-vertical .hc-card")).toHaveCount(6);
  await expect(page.locator(".hc-tabs-tail")).toHaveCount(0);
  const layout=await page.evaluate(()=>{
   const section=document.querySelector("#hc-mobile-vertical")!,shell=section.querySelector(".hc-bound")!,selector=section.querySelector(".hc-selector")!,panel=section.querySelector(".hc-panel")!,tab=section.querySelector('.hc-card[aria-selected="true"]')!,button=section.querySelector(".hc-panel-actions .hc-button")!,actions=section.querySelector(".hc-panel-actions")!;
   const r=(el:Element)=>el.getBoundingClientRect(),s=r(selector),p=r(panel),b=r(button),a=r(actions);
   const style=getComputedStyle(tab),panelStyle=getComputedStyle(panel),note=section.querySelector('.hc-footnote'),noteBottom=note?r(note).bottom:r(section.querySelector('.hc-panel-body')!).bottom;
   return {width:innerWidth,overflow:section.scrollWidth-section.clientWidth,layout:getComputedStyle(shell).display,selectorRight:s.right,panelLeft:p.left,selectorHeight:s.height,panelHeight:p.height,chosenTab:tab.getAttribute("data-plan"),activeBackground:style.backgroundColor,panelBackground:panelStyle.backgroundColor,buttonRightInset:a.right-b.right,checklistToButtonGap:Math.round(a.top-noteBottom),labels:[...section.querySelectorAll(".hc-card-label")].map(el=>({scroll:el.scrollWidth,width:el.clientWidth}))};
  });
  console.log("APPROVED_SERVICES",width,JSON.stringify(layout));
  expect(layout.overflow).toBeLessThanOrEqual(3);
  expect(layout.layout).toBe("grid");
  expect(Math.abs(layout.selectorRight-layout.panelLeft)).toBeLessThanOrEqual(2);
  expect(Math.abs(layout.selectorHeight-layout.panelHeight)).toBeLessThanOrEqual(2);
  expect(layout.chosenTab).toBe("maintenance");
  expect(layout.activeBackground).toBe(layout.panelBackground);
  expect(layout.buttonRightInset).toBeGreaterThanOrEqual(17);
  expect(layout.buttonRightInset).toBeLessThanOrEqual(24);
  expect(layout.labels.every(l=>l.scroll<=l.width+2)).toBe(true);
  await page.locator("#hc-mobile-vertical").screenshot({path:"test-results/approved-services-"+width+".png",animations:"disabled"});
 }
});
test("tablet inherits connected desktop Services layout, phone retains compact tiles",async({page})=>{
 for(const width of [350,390,750,751,820,900]){
  await page.setViewportSize({width,height:950});
  if(width<=750) await expect(page.locator(".hc-tabs-heading")).toBeHidden();
  else await expect(page.locator(".hc-tabs-heading")).toBeVisible();
  await expect(page.locator(".hc-tabs-tail")).toBeHidden();
  const section=page.locator("#hc-mobile-vertical");
  await expect(page.locator('[data-plan="deep"]')).toBeVisible();
  await page.locator('[data-plan="deep"]').click();
  await expect(page.locator("#hc-name")).toHaveText("Deep Detail");
  await page.locator('[data-plan="maintenance"]').click();
  const check=await section.evaluate(el=>({overflow:el.scrollWidth-el.clientWidth}));
  expect(check.overflow).toBeLessThanOrEqual(3);
  if(width>750){
    await expect(page.locator("#hc-mobile-vertical .hc-bound")).toHaveCSS("display","grid");
    await expect(page.locator("#hc-mobile-vertical .hc-layout")).toHaveCSS("display","contents");
    await expect(page.locator("#hc-mobile-vertical .hc-choices")).toHaveCSS("flex-direction","column");
  }
 }
});

test("homepage spacing rhythm and footer at phone, tablet and desktop",async({page})=>{
 for(const width of [390,820,1440]){
  await page.setViewportSize({width,height:1000});
  const metrics=await page.evaluate(()=>{
   const box=(s:string)=>document.querySelector(s)!.getBoundingClientRect();
   const st=box(".steps"),footer=box("#footer"),logo=box(".hc-b-footer__brand img"),panel=box("#hc-mobile-vertical .hc-panel-actions"),note=box(".hc-footnote");
   const newsletter=document.querySelector(".hc-b-footer__newsletter");
   const visible=!!newsletter&&getComputedStyle(newsletter).display!=="none";
   const description=visible?box(".hc-b-footer__newsletter p"):null;
   const form=visible?box(".hc-b-footer__newsletter form"):null;
   return {stepsHeight:st.height,footerHeight:footer.height,logoWidth:logo.width,ctaGap:panel.top-note.bottom,newsletterGap:description&&form?form.top-description.bottom:null};
  });
  console.log("HOMEPAGE_RHYTHM",width,JSON.stringify(metrics));
  expect(metrics.ctaGap).toBeLessThanOrEqual(30);
  if(width===1440){
   expect(Math.abs(metrics.stepsHeight-128)).toBeLessThanOrEqual(1);
   expect(Math.abs(metrics.logoWidth-208)).toBeLessThanOrEqual(1);
   expect(metrics.newsletterGap).not.toBeNull();
   expect(metrics.newsletterGap!).toBeLessThanOrEqual(12);
  }
  await page.locator(".steps").screenshot({path:"test-results/approved-steps-"+width+".png",animations:"disabled",style:".skip-link{visibility:hidden !important}"});
  await page.locator("#footer").screenshot({path:"test-results/approved-footer-"+width+".png",animations:"disabled",style:".skip-link{visibility:hidden !important}"});
 }
});
