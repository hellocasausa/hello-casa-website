import {expect,test} from "@playwright/test";

test("Atelier v4 reproduces owner photo settings proportionally, solid compressed banner and CSS exports",async({page})=>{
  test.setTimeout(120000);
  await page.setViewportSize({width:1680,height:1000});
  const errors:string[]=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto("/preview/experiments/standards-atelier-proportional-v4.html");
  await expect(page.locator("#statusText")).toContainText("Atelier v4",{timeout:30000});
  const frame=page.frameLocator("#frame");
  await expect(frame.locator(".st-copy p")).toHaveCount(6);
  await expect(frame.locator(".st-intro h2")).toHaveText("Care starts at home.");
  await expect(frame.locator(".st-intro p")).toHaveText("Who comes through your door matters.So do the little details, & the freedom to change your plans.");
  await expect(frame.locator(".st-intro p span")).toHaveCSS("display","block");
  await expect.poll(()=>frame.locator(".st-figure img").evaluateAll(imgs=>imgs.filter(i=>(i as HTMLImageElement).naturalWidth>0).length),{timeout:20000}).toBe(3);
  let firstBannerHeight:number|undefined;
  for(const width of [1440,1100]){
    await page.locator('.sizebutton[data-width="'+width+'"]').click();
    await expect(page.locator("#viewportLabel")).toContainText(width+"px");
    const info=await page.locator("#frame").evaluate((f:HTMLIFrameElement)=>{
      const d=f.contentDocument!,w=d.defaultView!;
      const section=d.querySelector("#standards")!,intro=d.querySelector(".st-intro")!,rule=d.querySelector(".st-intro-rule")!;
      const boxes=[...d.querySelectorAll(".st-story")].map(el=>{
        const fig=el.querySelector(".st-figure")!,img=fig.querySelector("img")!,fr=fig.getBoundingClientRect(),card=el.querySelector(".st-prose")!.getBoundingClientRect();
        return {w:Math.round(fr.width),h:Math.round(fr.height),x:fr.x,cardRight:card.right,
          cardBottom:card.bottom,overlapX:Math.max(0,Math.min(fr.right,card.right)-Math.max(fr.left,card.left)),
          overlapY:Math.max(0,Math.min(fr.bottom,card.bottom)-Math.max(fr.top,card.top)),
          crop:img.style.objectPosition,transform:fig.style.transform};
      });
      return {
        w:w.innerWidth,overflow:section.scrollWidth-section.clientWidth,
        introHeight:intro.getBoundingClientRect().height,
        lineHeight:rule.getBoundingClientRect().height,
        lineColor:w.getComputedStyle(rule).backgroundColor,
        bannerColor:w.getComputedStyle(intro).backgroundColor,
        bannerImage:w.getComputedStyle(intro).backgroundImage,
        lineRight:rule.getBoundingClientRect().right,bannerRight:intro.getBoundingClientRect().right,
        lineFraction:rule.getBoundingClientRect().width/intro.getBoundingClientRect().width,
        subtitleBreaks:intro.querySelectorAll("p span").length,
        rows:boxes,
      };
    });
    console.log("ATELIER_V4_GEOMETRY",width,JSON.stringify(info));
    expect(info.w).toBe(width);
    expect(info.overflow).toBeLessThanOrEqual(3);
    expect(info.lineHeight).toBe(6);
    expect(info.lineColor).toBe(info.bannerColor);
    expect(info.bannerImage).toBe("none");
    expect(info.lineRight).toBeCloseTo(info.bannerRight,0);
    expect(info.lineFraction).toBeGreaterThan(.72);
    expect(info.lineFraction).toBeLessThan(.79);
    expect(info.subtitleBreaks).toBe(1);
    expect(info.introHeight).toBeLessThan(166);
    if(!firstBannerHeight)firstBannerHeight=info.introHeight;
    const ratio=width===1440?1:1038/1210;
    const baseline=[[321,413],[297,470],[352,426]];
    for(let i=0;i<3;i++){
      expect(info.rows[i].w).toBe(Math.round(baseline[i][0]*ratio));
      expect(info.rows[i].h).toBe(Math.round(baseline[i][1]*ratio));
      expect(info.rows[i].overlapX).toBeGreaterThanOrEqual(12);
      expect(info.rows[i].overlapY).toBeGreaterThan(45);
    }
    expect(info.rows[1].h).toBeGreaterThan(info.rows[0].h);
    expect(info.rows[1].h).toBeGreaterThan(info.rows[2].h);
    await page.locator("#frame").screenshot({path:"test-results/atelier-v4-"+width+".png",animations:"disabled",timeout:30000});
  }
  // Editing from the 1100px view updates the single shared 1440px design.
  await page.locator('.sizebutton[data-width="1100"]').click();
  await page.locator('button[data-photo="0"]').click();
  const range=page.locator("#photoWidth");
  await expect(page.locator("#photoWidthValue")).toHaveText("275px");
  await range.evaluate((node:HTMLInputElement)=>{node.value="293";node.dispatchEvent(new Event("input",{bubbles:true}))});
  await expect(page.locator("#photoWidthValue")).toHaveText("293px");
  await page.locator('.sizebutton[data-width="1440"]').click();
  const resolved=Number((await page.locator("#photoWidth").inputValue()));
  console.log("ATELIER_V4_SHARED_PROPAGATION",resolved);
  expect(resolved).toBeCloseTo(342,0);
  await page.locator("#resetAllPhotos").click();
  await expect(page.locator("#photoWidthValue")).toHaveText("321px");
  // Check the clipboard contains reproducible CSS *and* surrounding layout geometry.
  await page.evaluate(()=>{
    (window as any).__copied="";
    Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async (value:string)=>{(window as any).__copied=value;}}});
  });
  await page.locator("#copyPhotoSettings").click();
  const css=await page.evaluate(()=>(window as any).__copied as string);
  expect(css).toContain(".st-story--one .st-figure");
  expect(css).toContain("width:321px");
  expect(css).toContain("width:275px");
  expect(css).toContain("@media (min-width:1200px)");
  await page.locator("#copyComposition").click();
  const composition=await page.evaluate(()=>(window as any).__copied as string);
  expect(composition).toContain("Layout measurements");
  expect(composition).toContain("paragraphCard");
  expect(composition).toContain(".st-heading");
  expect(composition).toContain("background:#d8eaf7");
  expect(errors).toEqual([]);
});