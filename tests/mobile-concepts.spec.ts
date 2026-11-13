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
  if(variant==="featured"){
   await expect(frame.locator(".concept-intro")).toBeHidden();
   await expect(frame.locator(".panel-head")).toHaveCount(0);
   await expect(frame.locator(".feature-name")).toHaveText("Essential Clean");
   await expect(frame.locator(".feature-header")).toContainText("SELECT YOUR PLAN");
   await expect(frame.locator(".selector-zone")).toBeVisible();
   await expect(frame.locator(".svc-nav")).toHaveCSS("grid-template-columns",/\d+.*\d+/);
   await expect(frame.locator(".shell-label")).toHaveCount(0);
   await expect(frame.locator("#essential-focus")).toHaveCount(0);
   await expect(frame.locator(".hc-footnote")).toHaveCount(0);
  } else if(variant==="atlas"){
   await expect(frame.locator(".hc-footnote")).toContainText("Essential+ focuses on one area per visit");
  }
  const selectPlan=async(id:string)=>{
   await frame.locator('[data-plan="'+id+'"]').click();
  };
  const expectPlan=async(name:string)=>{
   if(variant==="featured")await expect(frame.locator(".feature-name")).toHaveText(name);
   else await expect(frame.locator(".panel-head h2")).toHaveText(name);
  };
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
  await selectPlan("deep");
  await expectPlan("Deep Detail");
  await expect(frame.locator('[data-task-id="deep-all-001"]')).toBeVisible();
  await expect(frame.locator(".hc-extras-list li")).toHaveCount(8);
  await expect(frame.locator(".quote-cta")).toHaveAttribute("href","https://form.jotform.com/262983802449064");
  await expect(frame.locator(".quote-cta")).toHaveAttribute("target","_blank");
  await selectPlan("guest");
  await expectPlan("Guest Turnover");
  await expect(frame.locator(".hc-group h4")).toHaveText(["All Rooms","Kitchen","Bathrooms","Final Touches"]);
  await expect(frame.locator('[data-task-id^="vacation-out-"]')).toHaveCount(0);
  await selectPlan("maintenance");
  await expectPlan("Essential Clean");
  await expect(frame.locator(".hc-focus-btn")).toHaveCount(3);
  if(variant==="featured")await expect(frame.locator("#essential-focus")).toHaveCount(0);
  else await expect(frame.locator("#essential-focus")).toHaveCount(1);
  await frame.locator('[data-focus="kitchen"]').click();
  await expect(frame.locator(".hc-group h4")).toContainText(["All Rooms","Kitchen+","Bathrooms"]);
  await expect(frame.locator('[data-task-id="deep-kit-001"]')).toBeVisible();
  if(variant==="featured")await frame.locator('[data-focus="bathroom"]').click();
  else await frame.locator("#essential-focus").selectOption("bathroom");
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

test("Featured Service displays the original six small cards, uses focus buttons only, and omits the Essential note",async({page})=>{
 await page.goto("/mobile-concepts/concept.html?design=featured");
 for(const width of [320,375,390]){
  await page.setViewportSize({width,height:800});
  await expect(page.locator(".feature-header")).toBeVisible();
  await expect(page.locator(".feature-header")).toContainText("SELECT YOUR PLAN");
  await expect(page.locator(".feature-name")).toHaveText("Essential Clean");
  await expect(page.locator(".panel-head")).toHaveCount(0);
  await expect(page.locator(".concept-intro")).toBeHidden();
  await expect(page.locator(".svc-option")).toHaveCount(6);
  await expect(page.locator(".svc-nav")).toHaveCSS("display","grid");
  const columns=await page.locator(".svc-nav").evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(" ").length);
  expect(columns,"3 columns at "+width+"px").toBe(3);
  await expect(page.locator("#essential-focus")).toHaveCount(0);
  await expect(page.locator(".hc-focus-btn")).toHaveCount(3);
  await expect(page.locator(".hc-footnote")).toHaveCount(0);
  await expect(page.getByText("Essential+ focuses on one area per visit", {exact:false})).toHaveCount(0);
  await page.locator('[data-plan="deep"]').focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-plan="moving"]')).toBeFocused();
  await expect(page.locator(".feature-name")).toHaveText("Moving Reset");
  await page.keyboard.press("Home");
  await expect(page.locator('[data-plan="maintenance"]')).toBeFocused();
  await expect(page.locator(".feature-name")).toHaveText("Essential Clean");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow,"horizontal overflow at "+width+"px").toBeLessThanOrEqual(1);
 }
});
