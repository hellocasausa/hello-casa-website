import {test,expect} from "@playwright/test";
import plans from "../src/data/plans.json" with {type:"json"};

test.beforeEach(async({page})=>{
 await page.route("https://form.jotform.com/**",route=>route.abort());
 await page.goto("/");
 await page.evaluate(()=>document.fonts.ready);
});

test("native Featured Service uses six canonical tabs, mobile focus buttons, and a single plan title",async({page})=>{
 test.setTimeout(90000);
 for(const width of [320,375,390,520,750]){
  await page.setViewportSize({width,height:950});
  const section=page.locator("#hc-mobile-vertical");
  await expect(section.locator(".hc-mobile-feature")).toBeVisible();
  await expect(section.locator("#hc-feature-title")).toHaveText("Essential Clean");
  await expect(section.locator(".hc96-mobile-invitation")).toHaveCount(0);
  await expect(section.locator(".hc-intro")).toBeHidden();
  await expect(section.locator(".hc-panel-caption")).toBeHidden();
  await expect(section.locator("#hc-name")).toBeHidden();
  await expect(section.locator("#hc-description")).toBeHidden();
  await expect(section.locator(".hc-choices .hc-card")).toHaveCount(6);
  await expect(section.locator(".hc-choices")).toHaveCSS("display","grid");
  const grid=await section.locator(".hc-choices").evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(" ").length);
  expect(grid,"three service columns at "+width+"px").toBe(3);
  await expect(section.locator(".hc-v93-focus-select")).toBeHidden();
  await expect(section.locator(".hc-v93-focus-dock .hc-focus-btn")).toHaveCount(3);
  for(const focusBtn of await section.locator(".hc-v93-focus-dock .hc-focus-btn").all())
    await expect(focusBtn).toHaveCSS("border-radius","999px");
  await expect(section.locator(".hc-panel-actions .hc-button")).toHaveCSS("border-radius","999px");
  await expect(section.locator(".hc-selector")).toHaveCSS("background-color","rgb(243, 250, 254)");
  await expect(section.locator(".hc-v93-focus-dock .hc-focus-help")).toBeHidden();
  await expect(section.locator(".hc-footnote")).toBeHidden();
  const neutral=await section.evaluate(el=>{
   const feature=el.querySelector(".hc-mobile-feature")!,focus=el.querySelector(".hc-focus-wrap")!,cards=el.querySelector(".hc-group-approved")!;
   return {gradient:getComputedStyle(feature).backgroundImage,focus:getComputedStyle(focus).backgroundColor,
    checklist:getComputedStyle(cards).backgroundColor,wrapper:getComputedStyle(el.querySelector(".hc-bound")!).backgroundColor,
    overflow:el.scrollWidth-el.clientWidth,docOverflow:document.documentElement.scrollWidth-innerWidth};
  });
  expect(neutral.gradient).toContain("rgb(255, 255, 255)");
  expect(neutral.focus).toBe(neutral.checklist);
  expect(neutral.wrapper).toBe("rgb(243, 250, 254)");
  expect(neutral.overflow).toBeLessThanOrEqual(2);
  expect(neutral.docOverflow).toBeLessThanOrEqual(2);
  await section.locator('[data-plan="deep"]').click();
  await expect(section.locator("#hc-feature-title")).toHaveText("Deep Detail");
  await expect(section.locator("#hc-feature-description")).toHaveText(plans.find(p=>p.id==="deep")!.description);
  await expect(section.locator("#hc-feature-image")).toHaveAttribute("src",/8f1d7bbc170e2af0fa43/);
  await expect(section.locator('[data-task-id="deep-all-001"]')).toBeVisible();
  await section.locator('[data-plan="guest"]').click();
  await expect(section.locator("#hc-feature-title")).toHaveText("Guest Turnover");
  await expect(section.locator("#hc-detail-body .hc-group h4")).toHaveText(["All Rooms","Kitchen","Bathrooms","Final Touches"]);
  await expect(section.locator('[data-task-id^="vacation-out-"]')).toHaveCount(0);
  await section.locator('[data-plan="maintenance"]').click();
  await expect(section.locator("#hc-feature-title")).toHaveText("Essential Clean");
  await section.locator('[data-focus="kitchen"]').click();
  await expect(section.locator('[data-task-id="deep-kit-001"]')).toBeVisible();
  await expect(section.locator('[data-focus="kitchen"]')).toHaveAttribute("aria-pressed","true");
  await section.locator('[data-focus="bathroom"]').click();
  await expect(section.locator('[data-task-id="deep-bath-001"]')).toBeVisible();
  await expect(section.locator('[data-task-id="essential-kit-001"]')).toBeVisible();
  await section.locator('[data-focus="standard"]').click();
  await expect(section.locator('[data-task-id="essential-kit-001"]')).toBeVisible();
  await expect(section.locator(".hc-panel-actions .hc-button")).toHaveAttribute("href","https://form.jotform.com/262983802449064");
  await expect(section.locator(".hc-panel-actions .hc-button")).toHaveAttribute("target","_blank");
 }
});

test("three phone Hero benefits stay on one line below Book Now",async({page})=>{
 for(const width of [320,375,390,430,520,750]){
  await page.setViewportSize({width,height:980});
  const g=await page.locator(".hero").evaluate(el=>{
   const row=el.querySelector(".benefits")!.getBoundingClientRect();
   const button=el.querySelector(".book-now")!.getBoundingClientRect();
   const h=el.getBoundingClientRect();
   const spans=[...el.querySelectorAll(".benefits li span")].map(span=>{
     const r=span.getBoundingClientRect();
     return {text:span.textContent,top:r.top,scroll:span.scrollWidth,width:span.clientWidth};
   });
   return {spans,benefitTop:row.top,benefitBottom:row.bottom,bookBottom:button.bottom,
    bookLeft:button.left,benefitLeft:row.left,benefitRight:row.right,heroRight:h.right,
    heroBottom:h.bottom,docOverflow:document.documentElement.scrollWidth-innerWidth};
  });
  expect(g.spans.map(x=>x.text)).toEqual(["Custom checklists","Vetted cleaners","No contracts"]);
  expect(Math.max(...g.spans.map(x=>x.top))-Math.min(...g.spans.map(x=>x.top)),"single trust row at "+width).toBeLessThanOrEqual(4);
  expect(g.spans.every(x=>x.scroll<=x.width+1),"no label wrap/clip at "+width).toBe(true);
  expect(Math.abs(g.benefitLeft-g.bookLeft),"checkmarks align with Book Now at "+width).toBeLessThanOrEqual(2);
  expect(g.benefitRight-g.benefitLeft,"naturally grouped checkmarks at "+width).toBeLessThan(width*.84);
  expect(g.bookBottom+3,"checkmarks sit below CTA at "+width).toBeLessThanOrEqual(g.benefitTop);
  expect(g.benefitBottom,"benefits stay within Hero at "+width).toBeLessThanOrEqual(g.heroBottom+2);
  expect(g.docOverflow).toBeLessThanOrEqual(2);
 }
});

test("tablet blue Standards capsule is quarter narrower, right-anchored; other layouts unaffected",async({page})=>{
 for(const width of [751,820,900]){
  await page.setViewportSize({width,height:1000});
  await expect(page.locator(".hc-mobile-feature")).toBeHidden();
  await expect(page.locator("#hc-mobile-vertical .hc-tabs-heading")).toBeVisible();
  await expect(page.locator("#hc-mobile-vertical .hc-layout")).toHaveCSS("display","contents");
  const g=await page.locator("#standards .st-intro").evaluate(el=>{
   const r=el.getBoundingClientRect(),t=el.querySelector("h2")!.getBoundingClientRect();
   return {width:r.width,right:r.right,headingRight:t.right};
  });
  const target=Math.min(502.5,width*.645);
  expect(Math.abs(g.width-target),"capsule width at "+width).toBeLessThanOrEqual(1);
  expect(Math.abs(g.right-width),"anchored right edge at "+width).toBeLessThanOrEqual(2);
  expect(g.headingRight).toBeLessThanOrEqual(g.right+1);
 }
 for(const width of [901,1440]){
  await page.setViewportSize({width,height:1000});
  await expect(page.locator(".hc-mobile-feature")).toBeHidden();
  await expect(page.locator(".hc-intro")).toBeHidden();
  await expect(page.locator("#hc-mobile-vertical .hc-bound")).toHaveCSS("display","grid");
 }
});

test("native mobile and tablet integration review screenshots",async({page})=>{
 test.setTimeout(90000);
 for(const width of [320,390]){
  await page.setViewportSize({width,height:850});
  await page.locator("#hc-mobile-vertical").screenshot({path:"test-results/approved-native-featured-"+width+".png",animations:"disabled"});
  await page.screenshot({path:"test-results/approved-native-mobile-full-"+width+".png",fullPage:true,animations:"disabled"});
 }
 await page.setViewportSize({width:820,height:950});
 await page.locator("#standards .st-intro").screenshot({path:"test-results/approved-tablet-capsule-820.png",animations:"disabled"});
 await page.locator("#standards").screenshot({path:"test-results/approved-tablet-standards-integrated-820.png",animations:"disabled"});
});
