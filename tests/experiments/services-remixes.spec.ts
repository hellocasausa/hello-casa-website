import { test, expect } from "@playwright/test";

const conceptNames = {
  a: "The Layered Folio",
  b: "The Integrated Tabs",
  c: "The Editorial Collection",
} as const;
const widths = [1100, 1440] as const;

test("gallery previews all concepts at both desktop widths and retains functional checklists", async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1600, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/preview/experiments/services-remix-gallery.html");
  const frame = page.frameLocator("#siteFrame");
  await expect(page.locator("#statusMessage")).toContainText("authentic service plans", { timeout: 20000 });
  const observed = new Set<string>();

  for (const [concept, title] of Object.entries(conceptNames)) {
    await page.locator('button[data-concept="' + concept + '"]').click();
    await expect(page.locator("#conceptTitle")).toHaveText(title);
    await expect(frame.locator("body")).toHaveAttribute("data-concept", concept);
    await expect(frame.locator('button[role="tab"][data-plan]')).toHaveCount(6);
    for (const width of widths) {
      await page.locator('button[data-width="' + width + '"]').click();
      await expect(page.locator("#currentCanvas")).toHaveText(width + "px");
      const layout = await page.locator("#siteFrame").evaluate((el: HTMLIFrameElement) => {
        const doc = el.contentDocument!;
        const section = doc.querySelector("#hc-mobile-vertical")!;
        const panel = doc.querySelector(".hc-panel")!;
        const selector = doc.querySelector(".hc-selector")!;
        const cta = doc.querySelector(".hc-panel-actions .hc-button")!;
        const row = doc.querySelector(".hc-panel-actions")!;
        const a = cta.getBoundingClientRect(), r = row.getBoundingClientRect();
        return {
          viewport: doc.defaultView!.innerWidth,
          columns: doc.defaultView!.getComputedStyle(doc.querySelector(".hc-bound")!).gridTemplateColumns,
          selectorTop: Math.round(selector.getBoundingClientRect().top),
          panelTop: Math.round(panel.getBoundingClientRect().top),
          contentOverflow: section.scrollWidth - section.clientWidth,
          rightInset: Math.round(r.right - a.right),
          ctaLabel: cta.textContent?.trim(),
          active: doc.querySelector('[role="tab"][aria-selected="true"]')?.getAttribute("data-plan"),
          linkDisabled: !cta.hasAttribute("href"),
        };
      });
      console.log("REMIX_GEOMETRY:", concept, width, JSON.stringify(layout));
      expect(layout.viewport).toBe(width);
      expect(layout.ctaLabel).toContain("Customize My Quote");
      expect(layout.rightInset).toBeGreaterThanOrEqual(13);
      expect(layout.rightInset).toBeLessThanOrEqual(35);
      expect(layout.contentOverflow).toBeLessThanOrEqual(3);
      expect(layout.linkDisabled).toBe(true);
      if (concept === "c") expect(layout.panelTop).toBeGreaterThan(layout.selectorTop);
      else expect(Math.abs(layout.panelTop - layout.selectorTop)).toBeLessThan(80);
      await page.locator("#siteFrame").screenshot({
        path: "test-results/remix-" + concept + "-" + width + ".png",
        animations: "disabled",
        timeout: 25000,
      });
    }
    await frame.locator("#hc-tab-deep").click();
    await expect(frame.locator("#hc-name")).toContainText("Deep Detail");
    await expect(frame.locator('[data-task-id="deep-all-001"]')).toHaveCount(1);
    await frame.locator("#hc-tab-maintenance").click();
    await frame.locator('button[data-focus="kitchen"]').click();
    await expect(frame.locator("#hc-name")).toContainText("Kitchen focus");
    await expect(frame.locator("h4")).toContainText(["All Rooms", "Kitchen+", "Bathrooms", "Available additions"]);
    await expect(frame.locator('[data-task-id="deep-kit-001"]')).toHaveCount(1);
    await frame.locator('button[data-focus="bathroom"]').click();
    await expect(frame.locator("#hc-name")).toContainText("Bathrooms focus");
    await expect(frame.locator('[data-task-id="deep-bath-001"]')).toHaveCount(1);
    await frame.locator('button[data-focus="standard"]').click();
    for (const plan of ["maintenance", "deep", "moving", "guest", "office", "specialty"]) {
      await frame.locator('button[data-plan="' + plan + '"]').click();
      const ids = await frame.locator("[data-task-id]").evaluateAll(nodes => nodes.map(n => n.getAttribute("data-task-id")!));
      ids.forEach(i => observed.add(i));
    }
  }
  expect(observed.size).toBe(129);
  expect(errors).toEqual([]);
});