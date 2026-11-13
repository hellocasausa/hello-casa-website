import {test,expect} from "@playwright/test";
test.beforeEach(async({page})=>{
 await page.goto("/");
 await page.evaluate(()=>document.fonts.ready);
});
test("mobile typography uses the approved fixed pixel sizes and the Contact line is offset",async({page})=>{
 for(const width of [320,375,390,430,520,750]){
  await page.setViewportSize({width,height:950});
  for(const [selector,size] of [
   [".steps h2","20px"],
   [".steps h2 span","18px"],
   [".steps .step-number","18px"],
   ["#standards .st-intro h2","20px"],
   ["#standards .st-heading h3","20px"],
   ["#contact .hc-contact-heading-stage h2","20px"],
   ["#standards .st-kicker","9.5px"],
   ["#contact .hc-contact-eyebrow","9.5px"],
   ["#hc-mobile-vertical .hc-featured-label","9.5px"],
   ["#standards .st-prose","14px"]
  ] as const)await expect(page.locator(selector).first(),selector+" at "+width+"px").toHaveCSS("font-size",size);
  await expect(page.locator("#standards .st-prose").first()).toHaveCSS("line-height","21.7px");
  const lead=await page.locator("#contact .hc-contact-heading-stage").evaluate(el=>{
   const s=getComputedStyle(el),rule=getComputedStyle(el,"::before"),r=el.getBoundingClientRect();
   return {margin:s.marginTop,top:rule.top,left:rule.left,height:rule.height,ruleWidth:parseFloat(rule.width),
    hostWidth:r.width,overflow:document.documentElement.scrollWidth-innerWidth};
  });
  expect(lead.margin).toBe("22px");
  expect(lead.top).toBe("-14px");
  expect(lead.left).toBe("0px");
  expect(lead.height).toBe("4px");
  expect(lead.ruleWidth).toBeGreaterThan(lead.hostWidth*.64);
  expect(lead.ruleWidth).toBeLessThan(lead.hostWidth*.68);
  expect(lead.overflow).toBeLessThanOrEqual(2);
 }
});
test("tablet and desktop typography remain unchanged",async({page})=>{
 for(const width of [820,900,1100,1440]){
  await page.setViewportSize({width,height:950});
  const heading=width<=900?"28px":"32px";
  for(const selector of [".steps h2","#standards .st-intro h2","#standards .st-heading h3","#contact .hc-contact-heading-stage h2"])
   await expect(page.locator(selector).first()).toHaveCSS("font-size",heading);
  await expect(page.locator("#standards .st-prose").first()).toHaveCSS("font-size","16px");
  await expect(page.locator("#standards .st-prose").first()).toHaveCSS("line-height","24px");
 }
});
test("capture new mobile typography at 320px and 390px",async({page})=>{
 for(const width of [320,390]){
  await page.setViewportSize({width,height:950});
  await page.locator(".steps").screenshot({path:"test-results/mobile-type-steps-"+width+".png",animations:"disabled"});
  await page.locator("#standards").screenshot({path:"test-results/mobile-type-standards-"+width+".png",animations:"disabled"});
  await page.locator("#contact").screenshot({path:"test-results/mobile-type-contact-"+width+".png",animations:"disabled"});
 }
});
