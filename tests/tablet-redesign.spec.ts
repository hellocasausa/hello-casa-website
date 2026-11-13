import {test,expect} from "@playwright/test";
test.beforeEach(async({page})=>{
 await page.route("https://form.jotform.com/**",r=>r.abort());
 await page.goto("/");
 await page.evaluate(()=>document.fonts.ready);
});
test("tablet design has unified rhythm and live native Services at 751, 768, 820, 900px",async({page})=>{
 test.setTimeout(90000);
 for(const width of [751,768,820,900]){
  await page.setViewportSize({width,height:930});
  await expect(page.locator(".hc-nav-v7 .hc-float-quote")).toBeHidden();
  await expect(page.locator(".hc-nav-v7 .hc-float-toggle")).toBeVisible();
  const titleSize=parseFloat(await page.locator(".hero h1").evaluate(e=>getComputedStyle(e).fontSize));
  expect(titleSize).toBeCloseTo(width*.0379447,1);
  await expect(page.locator(".hero-copy p")).toHaveCSS("font-size","16px");
  await expect(page.locator(".hero-copy p")).toHaveCSS("line-height","24px");
  await expect(page.locator(".book-now")).toHaveCSS("font-size","15px");
  await expect(page.locator(".book-now")).toHaveCSS("height","44px");
  const hero=await page.locator(".hero").evaluate(e=>{
   const b=e.querySelector(".book-now").getBoundingClientRect(),t=e.querySelector(".benefits").getBoundingClientRect(),h=e.getBoundingClientRect();
   return {buttonBottom:b.bottom,trustTop:t.top,trustBottom:t.bottom,heroBottom:h.bottom};
  });
  expect(hero.trustTop-hero.buttonBottom,"trust row beneath CTA at "+width).toBeGreaterThanOrEqual(7);
  expect(hero.trustBottom,"trust row within hero at "+width).toBeLessThanOrEqual(hero.heroBottom+1);
  const steps=page.locator(".steps h2"),contact=page.locator("#contact .hc-contact-heading-stage h2");
  await expect(steps).toHaveCSS("font-size","28px");
  await expect(contact).toHaveCSS("font-size","28px");
  const [a,b]=await Promise.all([steps.boundingBox(),contact.boundingBox()]);
  expect(Math.abs(a.x-b.x),"shared Steps and Contact inset at "+width).toBeLessThanOrEqual(2);
  await expect(page.locator(".steps .step-number").first()).toHaveCSS("width","39px");
  await expect(page.locator("#hc-mobile-vertical .hc-tabs-heading")).toBeVisible();
  await expect(page.locator("#hc-mobile-vertical .hc-tabs-heading h2")).toHaveCSS("font-size","28px");
  await expect(page.locator("#hc-mobile-vertical .hc-layout")).toHaveCSS("display","contents");
  const connected=await page.locator("#hc-mobile-vertical").evaluate(e=>{
   const a=e.querySelector(".hc-selector").getBoundingClientRect(),b=e.querySelector(".hc-panel").getBoundingClientRect();
   return {right:a.right,left:b.left,overflow:e.scrollWidth-e.clientWidth};
  });
  expect(Math.abs(connected.right-connected.left)).toBeLessThanOrEqual(2);
  expect(connected.overflow).toBeLessThanOrEqual(2);
  const standards=page.locator("#standards");
  await expect(standards.locator(".st-intro h2")).toHaveCSS("font-size","28px");
  for(const heading of await standards.locator(".st-heading h3").all())await expect(heading).toHaveCSS("font-size","28px");
  const stories=await standards.evaluate(e=>[...e.querySelectorAll(".st-story")].map(story=>{
   const img=story.querySelector(".st-figure").getBoundingClientRect(),card=story.querySelector(".st-prose").getBoundingClientRect();
   return {display:getComputedStyle(story).display,imgX:img.x,cardX:card.x,
     fits:[...story.querySelectorAll(".st-copy p")].every(p=>p.getBoundingClientRect().bottom<=card.bottom+2)};
  }));
  expect(stories.map(x=>x.display)).toEqual(["grid","grid","grid"]);
  expect(stories[0].imgX).toBeLessThan(stories[0].cardX);
  expect(stories[1].imgX).toBeGreaterThan(stories[1].cardX);
  expect(stories[2].imgX).toBeLessThan(stories[2].cardX);
  expect(stories.every(x=>x.fits)).toBe(true);
  await expect(page.locator("#contact .hc-card-desc")).toHaveCSS("font-size","16px");
  await expect(page.locator("#contact .hc-card-desc")).toHaveCSS("line-height","24px");
  await expect(page.locator("#contact #hc-contact-jotform")).toHaveCSS("overflow","visible");
  await expect(page.locator("#footer .hc-b-footer__brand img")).toHaveCSS("width","180px");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  if(width===820){
   await page.screenshot({path:"test-results/approved-tablet-full-820.png",fullPage:true,animations:"disabled",style:".skip-link{visibility:hidden!important}"});
   await page.locator("#hc-mobile-vertical").screenshot({path:"test-results/approved-tablet-services-820.png",animations:"disabled"});
   await page.locator("#standards").screenshot({path:"test-results/approved-tablet-standards-820.png",animations:"disabled"});
   await page.locator("#contact").screenshot({path:"test-results/approved-tablet-contact-820.png",animations:"disabled"});
   await page.locator("#footer").screenshot({path:"test-results/approved-tablet-footer-820.png",animations:"disabled"});
  }
 }
});
test("existing phone and desktop style boundaries stay in their correct composition",async({page})=>{
 for(const width of [390,750,901,1440]){
  await page.setViewportSize({width,height:900});
  const title=page.locator("#hc-mobile-vertical .hc-tabs-heading");
  if(width<=750) await expect(title).toBeHidden();
  else await expect(title).toBeVisible();
  if(width>=901) await expect(page.locator(".st-intro h2")).toHaveCSS("font-size","32px");
  if(width<=750) await expect(page.locator("#standards .st-story").first()).toHaveCSS("display","flex");
 }
});
