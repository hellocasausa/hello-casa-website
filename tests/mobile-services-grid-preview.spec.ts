import {test,expect} from "@playwright/test";
import plans from "../src/data/plans.json" with {type:"json"};

const widths=[320,375,390] as const;
test.beforeEach(async({page})=>{
 await page.route("https://form.jotform.com/**",route=>route.abort());
 await page.goto("/mobile-services-grid/index.html");
 await expect(page.locator("#preview-status")).toHaveAttribute("data-ready","true",{timeout:45000});
});

test("experimental two-column layout uses full native Services and falls back to one column at 320px",async({page})=>{
 test.setTimeout(120000);
 const native=page.frameLocator("#native-services");
 for(const width of widths){
  await page.locator('[data-width="'+width+'"]').click();
  await page.locator('[data-layout="proposed"]').click();
  await expect(page.locator("[data-layout=proposed]")).toHaveAttribute("aria-pressed","true");
  await expect(native.locator("#hc-feature-title")).toHaveText("Essential Clean");
  await expect(native.locator("#hc-mobile-vertical .hc-choices .hc-card")).toHaveCount(6);
  await expect(native.locator("#hc-mobile-vertical .hc-grid-approved")).toBeVisible();
  await expect(native.locator("#hc-mobile-vertical .hc-extras")).toBeVisible();
  await expect(native.locator("#hc-mobile-vertical .hc-v93-focus-dock .hc-focus-btn")).toHaveCount(3);
  await expect(native.locator("#hc-mobile-vertical .hc-panel-actions .hc-button")).toHaveAttribute("href","https://form.jotform.com/262983802449064");
  const sizes=await native.locator("#hc-mobile-vertical .hc-grid-approved").evaluate(el=>{
   const c=getComputedStyle(el),doc=el.ownerDocument;
   const groups=[...el.querySelectorAll(".hc-group-approved")];
   const elements=[...el.children] as HTMLElement[];
   return {
    width:doc.defaultView!.innerWidth,
    columns:c.gridTemplateColumns.trim().split(/\s+/).length,
    fontSize:getComputedStyle(el.querySelector(".hc-group-approved li")!).fontSize,
    checkSize:getComputedStyle(el.querySelector(".hc-group-approved li")!,"::before").fontSize,
    cardCount:elements.length,
    overflow:doc.documentElement.scrollWidth-doc.defaultView!.innerWidth,
    cardsFit:elements.every(x=>x.scrollWidth<=x.clientWidth+2),
    tasks:groups.reduce((n,g)=>n+g.querySelectorAll("[data-task-id]").length,0)
   };
  });
  expect(sizes.width).toBe(width);
  expect(sizes.columns).toBe(width<375?1:2);
  expect(sizes.cardCount).toBe(4);
  expect(sizes.tasks).toBe(plans[0].groups.reduce((a,g)=>a+g.items.length,0));
  expect(sizes.overflow,"page horizontal overflow at "+width).toBeLessThanOrEqual(2);
  expect(sizes.cardsFit,"no card's content should spill at "+width).toBe(true);
  expect(sizes.fontSize).toBe(width<375?"12.5px":"11.5px");
  expect(sizes.checkSize).toBe(width<375?"11px":"10px");
 }
});

test("toggle Current vs Proposed without losing the active plan, focus, task IDs, or additions",async({page})=>{
 test.setTimeout(90000);
 const native=page.frameLocator("#native-services");
 await page.locator('[data-width="390"]').click();
 await native.locator('[data-plan="maintenance"]').click();
 await native.locator('[data-focus="kitchen"]').click();
 await expect(native.locator('[data-task-id="deep-kit-001"]')).toBeVisible();
 async function getState(){
  return native.locator("#hc-mobile-vertical").evaluate(el=>({
   plan:el.getAttribute("data-active-plan"),
   focus:[...el.querySelectorAll(".hc-focus-btn")].find(b=>b.getAttribute("aria-pressed")==="true")?.getAttribute("data-focus"),
   tasks:[...el.querySelectorAll("[data-task-id]")].map(x=>x.getAttribute("data-task-id")),
   extras:[...el.querySelectorAll(".hc-extras li")].map(x=>x.textContent?.trim())
  }));
 }
 const first=await getState();
 await page.locator('[data-layout="current"]').click();
 await expect(native.locator("#hc-mobile-vertical .hc-grid-approved")).toBeVisible();
 const oldColumns=await native.locator(".hc-grid-approved").evaluate(el=>getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
 expect(oldColumns).toBe(1);
 expect(await getState()).toEqual(first);
 await page.locator('[data-layout="proposed"]').click();
 const newColumns=await native.locator(".hc-grid-approved").evaluate(el=>getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
 expect(newColumns).toBe(2);
 expect(await getState()).toEqual(first);
 await native.locator('[data-plan="guest"]').click();
 await expect(native.locator("#hc-feature-title")).toHaveText("Guest Turnover");
 await expect(native.locator("#hc-detail-body .hc-group h4")).toHaveText(["All Rooms","Kitchen","Bathrooms","Final Touches"]);
 await expect(native.locator('[data-task-id^="vacation-out-"]')).toHaveCount(0);
 await native.locator('[data-plan="deep"]').click();
 await expect(native.locator("#hc-feature-title")).toHaveText("Deep Detail");
 await expect(native.locator('[data-task-id="deep-all-001"]')).toBeVisible();
 await expect(native.locator(".hc-extras")).toBeVisible();
});

test("full Services section screenshots at 320, 375 and 390px",async({page})=>{
 test.setTimeout(90000);
 const native=page.frameLocator("#native-services");
 for(const width of widths){
  await page.locator('[data-width="'+width+'"]').click();
  await page.locator('[data-layout="proposed"]').click();
  await expect(native.locator("#hc-feature-title")).toHaveText("Essential Clean");
  await native.locator("#hc-mobile-vertical").screenshot({path:"test-results/mobile-services-grid-proposed-"+width+".png",animations:"disabled"});
 }
 await page.locator('[data-width="390"]').click();
 await page.locator('[data-layout="current"]').click();
 await native.locator("#hc-mobile-vertical").screenshot({path:"test-results/mobile-services-grid-current-390.png",animations:"disabled"});
});

test("approved homepage uses two columns at 375 and 390px, falling back at 320px",async({page})=>{
 await page.goto("/");
 for(const width of [320,375,390]){
  await page.setViewportSize({width,height:850});
  const grid=page.locator("#hc-mobile-vertical .hc-grid-approved");
  await expect(grid).toBeVisible();
  const style=await grid.evaluate(el=>({
   columns:getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length,
   size:getComputedStyle(el.querySelector(".hc-group-approved li")!).fontSize,
   overflow:document.documentElement.scrollWidth-innerWidth
  }));
  expect(style.columns).toBe(width===320?1:2);
  expect(style.size).toBe(width===320?"12.5px":"11.5px");
  expect(style.overflow).toBeLessThanOrEqual(2);
 }
});
