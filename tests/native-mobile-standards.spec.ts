import {test,expect} from "@playwright/test";
const firstParagraphs=[
 "Inviting someone into your home is personal.",
 "It's often the little things that make the biggest difference.",
 "Some weeks call for a little extra help."
];
const headings=["Thoroughly Vetted Professionals","Personalized Cleaning Profiles","No Long-Term Contracts"];
test.beforeEach(async({page})=>{
 await page.goto("/");
 await page.evaluate(()=>document.fonts.ready);
});
test("approved Cascading Zigzag is native mobile Standards, first paragraph only and no horizontal overflow",async({page})=>{
 test.setTimeout(90000);
 for(const width of [320,375,390,430,520,750]){
  await page.setViewportSize({width,height:850});
  const section=page.locator("#standards");
  await expect(section.locator(".st-story")).toHaveCount(3);
  await expect(section.locator(".st-copy p")).toHaveCount(6);
  const layout=await section.evaluate(el=>{
    const intro=el.querySelector(".st-intro")!;
    const phrase=el.querySelector(".st-intro p span")!;
    const range=document.createRange();range.selectNodeContents(phrase);
    const spanWidth=phrase.getBoundingClientRect().width,actualTextWidth=range.getBoundingClientRect().width;
    const rows=[...el.querySelectorAll(".st-story")].map(story=>{
      const photo=story.querySelector(".st-figure")!.getBoundingClientRect();
      const proseEl=story.querySelector(".st-prose")!;
      const prose=proseEl.getBoundingClientRect();
      const shell=story.getBoundingClientRect();
      const paras=[...story.querySelectorAll(".st-copy p")];
      return {
        side:(photo.left+photo.right)/2-(shell.left+shell.right)/2,
        overlap:Math.max(0,Math.min(prose.bottom,photo.bottom)-Math.max(prose.top,photo.top)),
        visible:paras.map(p=>getComputedStyle(p).display!=="none"),
        bg:getComputedStyle(proseEl).backgroundColor,
        textFits:paras[0].getBoundingClientRect().bottom<=prose.bottom+2,
        imageWidth:photo.width,
        imageHeight:photo.height
      };
    });
    return {
      introHeight:intro.getBoundingClientRect().height,
      phraseHeight:phrase.getBoundingClientRect().height,
      phraseLineHeight:parseFloat(getComputedStyle(phrase).lineHeight),
      phraseNoWrap:getComputedStyle(phrase).whiteSpace,
      phraseTextWidth:actualTextWidth,
      phraseWidth:spanWidth,
      phraseScrollWidth:phrase.scrollWidth,
      rows,
      overflow:document.documentElement.scrollWidth-innerWidth
    };
  });
  expect(layout.phraseNoWrap).toBe("nowrap");
  expect(layout.phraseHeight,"one text line "+width).toBeLessThanOrEqual(layout.phraseLineHeight+2);
  expect(layout.phraseTextWidth,"phrase does not clip at "+width).toBeLessThanOrEqual(layout.phraseWidth+1);
  expect(layout.phraseScrollWidth).toBeLessThanOrEqual(layout.phraseWidth+1);
  expect(layout.introHeight,"compact intro "+width).toBeLessThanOrEqual(150);
  expect(layout.overflow,"no overflow at "+width).toBeLessThanOrEqual(2);
  expect(layout.rows.map(x=>x.visible)).toEqual([[true,false],[true,false],[true,false]]);
  expect(layout.rows[0].side,"image 1 left").toBeLessThan(-8);
  expect(layout.rows[1].side,"image 2 right").toBeGreaterThan(8);
  expect(layout.rows[2].side,"image 3 left").toBeLessThan(-8);
  for(const row of layout.rows){
    expect(row.overlap,"interlocking photo-card overlap "+width).toBeGreaterThan(18);
    expect(row.textFits).toBe(true);
    expect(row.imageWidth).toBeGreaterThan(130);
  }
  for(let i=0;i<3;i++){
    await expect(section.locator(".st-story").nth(i).locator("h3")).toHaveText(headings[i]);
    await expect(section.locator(".st-story").nth(i).locator(".st-copy p").first()).toContainText(firstParagraphs[i]);
  }
 }
});
test("desktop and tablet retain both paragraphs and their original Standards geometry",async({page})=>{
 for(const width of [751,820,900,1000,1440]){
  await page.setViewportSize({width,height:900});
  for(const story of await page.locator("#standards .st-story").all()){
   await expect(story.locator(".st-copy p")).toHaveCount(2);
   await expect(story.locator(".st-copy p").nth(1)).toBeVisible();
  }
  const intro=await page.locator("#standards .st-intro p span").evaluate(el=>getComputedStyle(el).whiteSpace);
  expect(intro).not.toBe("nowrap");
  const photo=await page.locator("#standards .st-story--one .st-figure").evaluate(el=>el.getBoundingClientRect().height);
  expect(photo).toBeGreaterThan(200);
 }
});
test("capture integrated mobile Standards as full section at 320 and 390px",async({page})=>{
 test.setTimeout(60000);
 for(const width of [320,390]){
  await page.setViewportSize({width,height:900});
  await page.locator("#standards .st-figure img").first().scrollIntoViewIfNeeded();
  await page.evaluate(async()=>Promise.all([...document.querySelectorAll("#standards img")].map(x=>(x as HTMLImageElement).decode().catch(()=>{}))));
  await page.locator("#standards").screenshot({path:"test-results/approved-native-standards-cascade-"+width+".png",animations:"disabled"});
  await page.screenshot({path:"test-results/approved-native-mobile-cascade-full-"+width+".png",fullPage:true,animations:"disabled"});
 }
});
