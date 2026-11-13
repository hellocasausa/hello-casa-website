import {test,expect} from "@playwright/test";
test.beforeEach(async({page})=>{
 await page.route("https://form.jotform.com/**",route=>route.abort());
 await page.goto("/");
 await page.evaluate(()=>document.fonts.ready);
});
test("mobile Contact removes redundant heading and link without disturbing Jotform embed",async({page})=>{
 for(const width of [320,375,390,520,750]){
  await page.setViewportSize({width,height:860});
  const section=page.locator("#contact");
  await expect(section.locator(".hc-card-title")).toBeHidden();
  await expect(section.locator(".hc-card-desc")).toBeVisible();
  await expect(section.locator(".contact-fallback")).toHaveCount(0);
  await expect(section.locator("#hc-contact-jotform")).toBeAttached();
  await expect(section.locator("#hc-contact-jotform script[src]")).toHaveAttribute("src","https://form.jotform.com/jsform/262930639373060");
  const g=await section.evaluate(root=>{
   const desc=root.querySelector(".hc-card-desc")!.getBoundingClientRect();
   const embed=root.querySelector(".hc-jotform-embed")!;
   const container=root.querySelector(".hc-contact-card")!.getBoundingClientRect();
   return {gap:embed.getBoundingClientRect().top-desc.bottom,padding:desc.top-container.top,display:getComputedStyle(embed).display,
     overflow:document.documentElement.scrollWidth-innerWidth};
  });
  expect(g.gap,"description-to-embed gap at "+width).toBeLessThanOrEqual(18);
  expect(g.padding,"collapsed top padding at "+width).toBeLessThanOrEqual(25);
  expect(g.display).toBe("flow-root");
  expect(g.overflow).toBeLessThanOrEqual(2);
 }
});
test("Hero trust labels stay grouped, finish close to the description, and sit just below Book Now",async({page})=>{
 for(const width of [320,375,390,430,520,750]){
  await page.setViewportSize({width,height:980});
  const g=await page.locator(".hero").evaluate(el=>{
   const row=el.querySelector(".benefits")!.getBoundingClientRect();
   const cta=el.querySelector(".book-now")!.getBoundingClientRect();
   const sub=el.querySelector(".hero-mobile-copy")!.getBoundingClientRect();
   const li=[...el.querySelectorAll(".benefits li")].map(x=>x.getBoundingClientRect());
   return {gap:row.top-cta.bottom,benefitWidth:row.width,subWidth:sub.width,allOneRow:Math.max(...li.map(x=>x.top))-Math.min(...li.map(x=>x.top))<4,
   rightGap:sub.right-row.right,overflow:document.documentElement.scrollWidth-innerWidth};
  });
  expect(g.gap,"trust row below Book Now at "+width).toBeGreaterThanOrEqual(2);
  expect(g.gap,"tight trust row below Book Now at "+width).toBeLessThanOrEqual(17);
  expect(g.allOneRow).toBe(true);
  expect(g.rightGap,"trust row ends near subtitle at "+width).toBeGreaterThan(-45);
  expect(g.overflow).toBeLessThanOrEqual(2);
 }
});
test("selected plan heading is restrained on mobile; tablet/desktop Contact heading stays untouched",async({page})=>{
 for(const width of [320,375,390,750]){
  await page.setViewportSize({width,height:950});
  const size=await page.locator("#hc-feature-title").evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBe(width<=340?17:18);
  await page.locator('#hc-mobile-vertical [data-plan="specialty"]').click();
  await expect(page.locator("#hc-feature-title")).toHaveText("Specialty Clean");
 }
 for(const width of [820,1000,1440]){
  await page.setViewportSize({width,height:900});
  await expect(page.locator("#contact .hc-card-title")).toBeVisible();
  await expect(page.locator("#contact .hc-card-title")).toHaveText("Leave a little note.");
 }
});
test("capture polished contact and Hero on small phones",async({page})=>{
 for(const width of [320,390]){
  await page.setViewportSize({width,height:860});
  await page.locator(".hero").screenshot({path:"test-results/mobile-hero-benefits-polish-"+width+".png",animations:"disabled"});
  await page.locator("#contact").screenshot({path:"test-results/mobile-contact-polish-"+width+".png",animations:"disabled"});
  await page.locator("#hc-mobile-vertical .hc-mobile-feature").screenshot({path:"test-results/mobile-plan-heading-polish-"+width+".png",animations:"disabled"});
 }
});
