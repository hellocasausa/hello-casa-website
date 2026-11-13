import {test,expect} from "@playwright/test";
test.beforeEach(async({page})=>{
 await page.route("https://form.jotform.com/**",route=>route.abort());
 await page.goto("/");
 await page.evaluate(()=>document.fonts.ready);
});
test("approved Services grid, all plans and focus controls retain actual content without overflow",async({page})=>{
 test.setTimeout(90000);
 for(const width of [320,375,390,430,520,750]){
  await page.setViewportSize({width,height:940});
  const root=page.locator("#hc-mobile-vertical");
  const grid=root.locator(".hc-grid-approved");
  await expect(grid).toBeVisible();
  const data=await grid.evaluate(el=>{
   const d=el.ownerDocument;
   const cols=getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length;
   const cards=[...el.children] as HTMLElement[];
   const li=el.querySelector(".hc-group-approved li")!;
   return {cols,taskSize:getComputedStyle(li).fontSize,
    checkSize:getComputedStyle(li,"::before").fontSize,
    overflow:d.documentElement.scrollWidth-d.defaultView!.innerWidth,
    fit:cards.every(x=>x.scrollWidth<=x.clientWidth+2)};
  });
  expect(data.cols).toBe(width<375?1:2);
  expect(data.taskSize).toBe(width<375?"12.5px":"11.5px");
  expect(data.checkSize).toBe(width<375?"11px":"10px");
  expect(data.overflow).toBeLessThanOrEqual(2);
  expect(data.fit).toBe(true);
  await expect(root.locator(".hc-choices .hc-card")).toHaveCount(6);
  await expect(root.locator(".hc-v93-focus-dock .hc-focus-btn")).toHaveCount(3);
  await expect(root.locator(".hc-panel-actions .hc-button")).toHaveAttribute("href","https://form.jotform.com/262983802449064");
 }
 await page.setViewportSize({width:390,height:940});
 for(const [plan,title] of [["guest","Guest Turnover"],["deep","Deep Detail"],["specialty","Specialty Clean"],["maintenance","Essential Clean"]] as const){
  await page.locator('#hc-mobile-vertical [data-plan="'+plan+'"]').click();
  await expect(page.locator("#hc-feature-title")).toHaveText(title);
  await expect(page.locator("#hc-mobile-vertical .hc-grid-approved")).toBeVisible();
 }
 await page.locator('#hc-mobile-vertical [data-focus="kitchen"]').click();
 await expect(page.locator('[data-task-id="deep-kit-001"]')).toBeVisible();
});
test("Contact rule reaches the left edge; Standards title groups and all peach rules align consistently",async({page})=>{
 for(const width of [320,375,390,520,750]){
  await page.setViewportSize({width,height:940});
  const contact=await page.locator("#contact .hc-contact-heading-stage").evaluate(el=>{
   const st=getComputedStyle(el,"::before");
   return {left:st.left,width:parseFloat(st.width),height:st.height};
  });
  expect(contact.left).toBe("0px");
  expect(contact.height).toBe("4px");
  expect(contact.width).toBeGreaterThan(100);
  const stories=await page.locator("#standards .st-story").evaluateAll(els=>els.map(story=>{
   const heading=story.querySelector(".st-heading")!;
   const label=story.querySelector(".st-kicker")!;
   const p=getComputedStyle(label,"::before"),s=getComputedStyle(heading);
   return {width:parseFloat(p.width),height:p.height,paddingLeft:parseFloat(s.paddingLeft),
     paddingRight:parseFloat(s.paddingRight)};
  }));
  expect(stories.map(x=>x.width)).toEqual([39,39,39]);
  expect(stories.map(x=>x.height)).toEqual(["2px","2px","2px"]);
  expect(stories[0].paddingLeft).toBe(25);
  expect(stories[1].paddingRight).toBe(25);
  expect(stories[2].paddingLeft).toBe(25);
 }
});
test("release review mobile screenshot at 320px and 390px",async({page})=>{
 for(const width of [320,390]){
  await page.setViewportSize({width,height:900});
  await page.locator("#hc-mobile-vertical").screenshot({path:"test-results/release-services-"+width+".png",animations:"disabled"});
  await page.locator("#standards").screenshot({path:"test-results/release-standards-"+width+".png",animations:"disabled"});
  await page.locator("#contact").screenshot({path:"test-results/release-contact-"+width+".png",animations:"disabled"});
 }
});
