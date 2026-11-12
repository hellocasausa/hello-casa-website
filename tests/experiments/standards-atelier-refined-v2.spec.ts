import { expect, test } from "@playwright/test";

test("Refined Atelier v2 renders original copy, organic overlaps and distinct photo proportions", async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({width: 1600, height: 1000});
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/preview/experiments/standards-atelier-refined-v2.html");
  await expect(page.locator("#statusText")).toContainText("Read-only", {timeout: 20000});
  const frame=page.frameLocator("#frame");
  for (const width of [1100,1440]) {
    await page.locator('[data-width="' + width + '"]').click();
    await expect(page.locator("#viewportLabel")).toContainText(width + "px");
    await expect(frame.locator(".st-story")).toHaveCount(3);
    await expect(frame.locator(".st-copy p")).toHaveCount(6);
    await expect(frame.locator(".st-intro h2")).toHaveText("Care starts at home.");
    await expect(frame.locator(".st-intro p")).toHaveText(
      "Who comes through your door matters. So do the little details, and the freedom to change your plans.",
    );
    await expect(frame.locator(".st-intro > *")).toHaveCount(2);
    await expect(frame.locator(".st-intro .st-eyebrow")).toHaveCount(0);
    await expect.poll(() => frame.locator(".st-figure img").evaluateAll(images =>
      images.filter(img => (img as HTMLImageElement).naturalWidth > 0).length
    ), {timeout: 15000}).toBe(3);
    const layout = await page.locator("#frame").evaluate((el:HTMLIFrameElement) => {
      const doc=el.contentDocument!,win=doc.defaultView!;
      const s=doc.querySelector("#standards")!;
      const line=doc.querySelector(".st-intro-rule")!;
      const band=doc.querySelector(".st-intro")!;
      const stories=[...doc.querySelectorAll(".st-story")].map(article=>{
        const get=selector=>article.querySelector(selector)!.getBoundingClientRect();
        const image=get(".st-figure"),card=get(".st-prose"),heading=get(".st-heading");
        const cardStyle=win.getComputedStyle(article.querySelector(".st-prose")!);
        const headingStyle=win.getComputedStyle(article.querySelector(".st-heading")!);
        const paragraphs=[...article.querySelectorAll(".st-copy p")].map(p=>p.textContent!.trim());
        return {
          image:{x:image.x,y:image.y,w:image.width,h:image.height,right:image.right,bottom:image.bottom},
          card:{x:card.x,y:card.y,w:card.width,h:card.height,right:card.right,bottom:card.bottom},
          heading:{x:heading.x,y:heading.y,bottom:heading.bottom},
          headingAlign:headingStyle.textAlign,
          opacity:cardStyle.backgroundColor,
          bodyParagraphs:paragraphs,
          overlapX: Math.max(0,Math.min(image.right,card.right)-Math.max(image.left,card.left)),
          overlapY: Math.max(0,Math.min(image.bottom,card.bottom)-Math.max(image.top,card.top)),
        };
      });
      return {
        viewport:win.innerWidth,docWidth:s.scrollWidth,clientWidth:s.clientWidth,
        lineThickness:win.getComputedStyle(line).height,
        intro:band.getBoundingClientRect().toJSON(),
        sectionHeight:s.getBoundingClientRect().height,
        bg:win.getComputedStyle(s).backgroundImage,
        images:[...doc.querySelectorAll(".st-figure img")].map(img=>({src:(img as HTMLImageElement).src,loaded:(img as HTMLImageElement).naturalWidth>0})),
        stories
      };
    });
    console.log("REFINED_ATELIER_V2:",width,JSON.stringify(layout));
    expect(layout.viewport).toBe(width);
    expect(layout.docWidth-layout.clientWidth).toBeLessThanOrEqual(3);
    expect(parseFloat(layout.lineThickness)).toBe(3);
    expect(layout.intro.x+layout.intro.width).toBeGreaterThanOrEqual(width-3);
    expect(layout.bg).toContain("linear-gradient");
    expect(layout.images.every(x=>x.loaded && x.src.endsWith(".webp"))).toBe(true);
    expect(layout.stories[1].image.h).toBeGreaterThan(layout.stories[0].image.h+50);
    expect(layout.stories[1].image.h).toBeGreaterThan(layout.stories[2].image.h+80);
    for (let i=0;i<3;i++) {
      const story=layout.stories[i];
      expect(story.overlapX).toBeGreaterThanOrEqual(12);
      expect(story.overlapY).toBeGreaterThanOrEqual(45);
      expect(story.heading.bottom).toBeLessThanOrEqual(story.card.y+1);
      expect(story.bodyParagraphs).toHaveLength(2);
      expect(story.bodyParagraphs.every(p=>p.length>140)).toBe(true);
      expect(story.opacity).toMatch(/rgba\(/);
      expect(story.headingAlign).toBe(i===1?"left":"right");
      const imageRight=i===1;
      expect(story.image.x>story.card.x).toBe(imageRight);
    }
    await page.locator("#frame").screenshot({path:"test-results/refined-atelier-v2-"+width+".png",animations:"disabled",timeout:30000});
  }
  expect(errors).toEqual([]);
});
