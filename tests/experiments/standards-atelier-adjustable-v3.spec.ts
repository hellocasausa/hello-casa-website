import { expect, test } from "@playwright/test";

test("Atelier v3: blue header rule, image-facing headings and working photo placement controls", async ({page}) => {
  test.setTimeout(120000);
  await page.setViewportSize({width:1680,height:1000});
  const errors:string[]=[];
  page.on("pageerror",err=>errors.push(err.message));
  await page.goto("/preview/experiments/standards-atelier-adjustable-v3.html");
  const frame=page.frameLocator("#frame");
  await expect(page.locator("#statusText")).toContainText("No site edits",{timeout:25000});
  await expect(page.locator(".control-fields input[type=range]")).toHaveCount(7);
  for(const width of [1100,1440]){
    await page.locator('.sizebutton[data-width="'+width+'"]').click();
    await expect(page.locator("#viewportLabel")).toContainText(width+"px");
    await expect(frame.locator(".st-copy p")).toHaveCount(6);
    await expect(frame.locator(".st-intro h2")).toHaveText("Care starts at home.");
    await expect(frame.locator(".st-intro p")).toHaveText("Who comes through your door matters. So do the little details, and the freedom to change your plans.");
    await expect.poll(()=>frame.locator(".st-figure img").evaluateAll(imgs=>imgs.filter(i=>(i as HTMLImageElement).naturalWidth>0).length)).toBe(3);
    const info=await page.locator("#frame").evaluate((f:HTMLIFrameElement)=>{
      const d=f.contentDocument!,win=d.defaultView!,section=d.querySelector("#standards")!;
      const intro=d.querySelector(".st-intro")!.getBoundingClientRect();
      const line=d.querySelector(".st-intro-rule")!.getBoundingClientRect();
      const headings=[...d.querySelectorAll(".st-heading")].map(el=>win.getComputedStyle(el).textAlign);
      const rows=[...d.querySelectorAll(".st-story")].map(el=>{
        const card=el.querySelector(".st-prose")!.getBoundingClientRect(),photo=el.querySelector(".st-figure")!.getBoundingClientRect();
        return {w:photo.width,h:photo.height,overlapX:Math.max(0,Math.min(card.right,photo.right)-Math.max(card.left,photo.left)),overlapY:Math.max(0,Math.min(card.bottom,photo.bottom)-Math.max(card.top,photo.top))};
      });
      return {width:win.innerWidth,overflow:section.scrollWidth-section.clientWidth,line:{x:line.left,right:line.right,y:line.top,bottom:line.bottom,h:line.height,w:line.width,color:win.getComputedStyle(d.querySelector(".st-intro-rule")!).backgroundColor},intro:{x:intro.x,y:intro.y,right:intro.right,w:intro.width},headings,rows};
    });
    console.log("ATELIER_V3_GEOMETRY",width,JSON.stringify(info));
    expect(info.width).toBe(width);
    expect(info.overflow).toBeLessThanOrEqual(3);
    expect(info.line.h).toBe(6);
    expect(info.line.right).toBeCloseTo(info.intro.right,0);
    expect(info.line.bottom).toBeLessThan(info.intro.y);
    expect(info.line.w/info.intro.w).toBeGreaterThan(.72);
    expect(info.line.w/info.intro.w).toBeLessThan(.79);
    expect(info.line.color).toBe("rgb(165, 201, 224)");
    expect(info.headings).toEqual(["left","right","left"]);
    expect(info.rows[1].h).toBeGreaterThan(info.rows[0].h+60);
    expect(info.rows[1].h).toBeGreaterThan(info.rows[2].h+85);
    expect(info.rows.every(row=>row.overlapX>=12&&row.overlapY>45)).toBe(true);
    await page.locator("#frame").screenshot({path:"test-results/atelier-v3-"+width+".png",animations:"disabled",timeout:30000});
  }
  // Start with photo 02 at 1440px. Its slider changes must reach the actual iframe.
  await page.locator('button[data-photo="1"]').click();
  await expect(page.locator("#photoWidthValue")).toHaveText("287px");
  await page.locator("#photoWidth").evaluate((input:HTMLInputElement) => {input.value="332";input.dispatchEvent(new Event("input",{bubbles:true}));});
  await page.locator("#photoY").evaluate((input:HTMLInputElement) => {input.value="24";input.dispatchEvent(new Event("input",{bubbles:true}));});
  await page.locator("#cropX").evaluate((input:HTMLInputElement) => {input.value="63";input.dispatchEvent(new Event("input",{bubbles:true}));});
  await page.locator("#photoZoom").evaluate((input:HTMLInputElement) => {input.value="127";input.dispatchEvent(new Event("input",{bubbles:true}));});
  const changed=await frame.locator(".st-story--two .st-figure").evaluate(el=>{
    const w=el.ownerDocument!.defaultView!;
    const img=el.querySelector("img")!;
    return {width:Math.round(el.getBoundingClientRect().width),transform:el.style.transform,crop:img.style.objectPosition,zoom:img.style.transform};
  });
  console.log("ATELIER_V3_CONTROLS",JSON.stringify(changed));
  expect(changed.width).toBe(332);
  expect(changed.transform).toContain("24px");
  expect(changed.crop).toBe("63% 48%");
  expect(changed.zoom).toBe("scale(1.27)");
  // 1100px has its own untouched starting values.
  await page.locator('.sizebutton[data-width="1100"]').click();
  await expect(page.locator("#photoWidthValue")).toHaveText("260px");
  await expect(page.locator("#photoYValue")).toHaveText("0px");
  await page.locator('.sizebutton[data-width="1440"]').click();
  await expect(page.locator("#photoWidthValue")).toHaveText("332px");
  // Drag photo 02 to the right using actual pointer events.
  const fig=frame.locator(".st-story--two .st-figure");
  const box=await fig.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);
  await page.mouse.down();
  await page.mouse.move(box!.x+box!.width/2+42,box!.y+box!.height/2-19,{steps:6});
  await page.mouse.up();
  const dragged=await page.locator("#photoX").inputValue();
  console.log("ATELIER_V3_DRAG_X",dragged);
  expect(Number(dragged)).toBeGreaterThan(0);
  await page.locator("#resetPhoto").click();
  await expect(page.locator("#photoWidthValue")).toHaveText("287px");
  await expect(page.locator("#photoYValue")).toHaveText("0px");
  await expect(page.locator("#photoZoomValue")).toHaveText("100%");
  expect(errors).toEqual([]);
});