import {test,expect} from "@playwright/test";
const variants=["atlas","index","ribbon","featured"] as const;
const widths=[320,375,390] as const;
test("four isolated mobile concepts reuse the actual approved checklist and controls",async({page})=>{
 test.setTimeout(120000);
 await page.goto("/mobile-concepts/index.html?design=atlas&width=390");
 const frame=page.frameLocator("#design-frame");
 for(const variant of variants){
  await page.locator('[data-concept="'+variant+'"]').click();
  await expect(page.locator('[data-concept="'+variant+'"]')).toHaveAttribute("aria-pressed","true");
  await expect(frame.locator("#services-app")).toHaveAttribute("aria-busy","false");
  await expect(frame.locator(".svc-option")).toHaveCount(6);
  await expect(frame.locator(".svc-option")).toContainText([
   "Essential Clean","Deep Detail","Moving Reset","Guest Turnover","Office Fresh","Specialty Clean"
  ]);
  for(const width of widths){
   await page.locator('[data-width="'+width+'"]').click();
   await expect(page.locator("#design-frame")).toHaveAttribute("width",String(width));
   const geometry=await frame.locator("body").evaluate(el=>{
     const w=el.ownerDocument.defaultView!;
     return {width:w.innerWidth,scroll:el.ownerDocument.documentElement.scrollWidth,content:el.scrollWidth};
   });
   expect(geometry.width,variant+" viewport").toBe(width);
   expect(geometry.scroll,variant+" @"+width+"px overflows").toBeLessThanOrEqual(width+1);
   const tasks=frame.locator("[data-task-id]");
   await expect(tasks.first()).toHaveAttribute("data-task-id",/^essential-/);
   expect(await tasks.count()).toBe(20);
  }
  await frame.locator('[data-plan="deep"]').click();
  await expect(frame.locator(".panel-head h2")).toHaveText("Deep Detail");
  await expect(frame.locator('[data-task-id="deep-all-001"]')).toBeVisible();
  await expect(frame.locator(".hc-extras-list li")).toHaveCount(8);
  await expect(frame.locator(".quote-cta")).toHaveAttribute("href","https://form.jotform.com/262983802449064");
  await expect(frame.locator(".quote-cta")).toHaveAttribute("target","_blank");
  await frame.locator('[data-plan="guest"]').click();
  await expect(frame.locator(".panel-head h2")).toHaveText("Guest Turnover");
  await expect(frame.locator(".hc-group h4")).toHaveText(["All Rooms","Kitchen","Bathrooms","Final Touches"]);
  await expect(frame.locator('[data-task-id^="vacation-out-"]')).toHaveCount(0);
  await frame.locator('[data-plan="maintenance"]').click();
  await expect(frame.locator(".hc-focus-btn")).toHaveCount(3);
  await frame.locator('[data-focus="kitchen"]').click();
  await expect(frame.locator(".hc-group h4")).toContainText(["All Rooms","Kitchen+","Bathrooms"]);
  await expect(frame.locator('[data-task-id="deep-kit-001"]')).toBeVisible();
  await frame.locator("#essential-focus").selectOption("bathroom");
  await expect(frame.locator('[data-task-id="deep-bath-001"]')).toBeVisible();
  await expect(frame.locator('[data-task-id="essential-kit-001"]')).toBeVisible();
 }
});
test("comparison is a separate viewer; the approved mobile section stays unchanged",async({page})=>{
 await page.goto("/");
 await page.setViewportSize({width:390,height:875});
 await expect(page.locator("#hc-mobile-vertical .hc-card")).toHaveCount(6);
 await expect(page.locator("#mobile-concepts")).toHaveCount(0);
 await expect(page.locator("#hc-mobile-vertical .hc96-mobile-invitation")).toBeVisible();
});
test("mobile Services design study captures four review screenshots at 390px",async({page})=>{
 test.setTimeout(60000);
 await page.goto("/mobile-concepts/index.html?design=atlas&width=390");
 for(const variant of variants){
  await page.locator('[data-concept="'+variant+'"]').click();
  await expect(page.frameLocator("#design-frame").locator("#services-app")).toHaveAttribute("aria-busy","false");
  await page.locator("#phone-body").screenshot({path:"test-results/approved-mobile-concept-"+variant+"-390.png",animations:"disabled"});
 }
});
