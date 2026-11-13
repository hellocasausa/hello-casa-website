import { test, expect } from "@playwright/test";

test("read-only full-page review loads the integrated native design checkpoint", async ({page})=>{
 test.setTimeout(65000);
 await page.setViewportSize({width:1600,height:950});
 await page.goto("/preview/visual-review.html");
 await expect(page.locator("#status")).toContainText("Loaded fixed review snapshot",{timeout:35000});
 const frame=page.frameLocator("#site");
 await expect(frame.locator(".hc-tabs-heading h2")).toContainText("A clean for",{timeout:12000});
 await expect(frame.locator(".st-intro h2")).toHaveText("Care starts at home.");
 await expect(frame.locator(".st-story")).toHaveCount(3);
 await expect(frame.locator(".st-copy p")).toHaveCount(6);
 await page.locator('[data-width="1440"]').click();
 await expect(page.locator('[data-width="1440"]')).toHaveAttribute("aria-pressed","true");
 const src=await page.locator("#site").evaluate((e:HTMLIFrameElement)=>({tabs:e.contentDocument?.querySelectorAll("[data-plan]").length,standards:e.contentDocument?.querySelectorAll(".st-story").length}));
 expect(src.tabs).toBe(6);expect(src.standards).toBe(3);
});
test("Element Explorer maps and loads the promoted Services and Standards components",async({page})=>{
 test.setTimeout(65000);
 await page.setViewportSize({width:1650,height:1000});
 await page.goto("/preview/element-explorer.html");
 await expect(page.locator("#status")).toHaveClass(/ready/,{timeout:40000});
 const frame=page.frameLocator("#site");
 await expect(frame.locator(".hc-tabs-heading")).toHaveCount(1);
 await expect(frame.locator(".st-story--two")).toHaveCount(1);
 await expect(frame.locator(".hc-card")).toHaveCount(6);
 // These are real native component identifiers, not generic class guesses.
 await expect(page.getByRole("button",{name:/Intro banner|Translucent text card|Plan rail headline/}).first()).toBeVisible();
});