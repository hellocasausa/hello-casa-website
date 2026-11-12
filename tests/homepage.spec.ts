import { test, expect } from "@playwright/test";
import plans from "../src/data/plans.json" with { type: "json" };
test.beforeEach(async ({ page }) => {
  await page.route("https://form.jotform.com/**", (r) => r.abort());
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});
test("all six source catalogs retain all 129 unique tasks and exact copy", async ({
  page,
}) => {
  const ids = new Set<string>();
  for (const p of plans) {
    await page.locator(`[data-plan="${p.id}"]`).click();
    await expect(page.locator("#hc-name")).toHaveText(p.name);
    const expected = p.groups.flatMap((g) => g.taskIds);
    expect(
      await page
        .locator("[data-task-id]")
        .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.taskId)),
    ).toEqual(expected);
    for (const g of p.groups)
      for (let i = 0; i < g.items.length; i++) {
        await expect(
          page.locator(`[data-task-id="${g.taskIds[i]}"]`),
        ).toHaveText(g.items[i]);
        ids.add(g.taskIds[i]);
      }
    await expect(page.locator(".hc-extras-list li")).toHaveCount(
      p.extras.length,
    );
    await expect(page.locator(".hc-footnote")).toHaveText(p.note);
    if (p.id === "guest")
      await expect(
        page.getByRole("heading", { name: "Outdoor Areas · if included" }),
      ).toBeVisible();
  }
  expect(ids.size).toBe(129);
});
test("focus swaps only the requested room, retains focus and survives plan and viewport changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const f of ["kitchen", "bathroom"]) {
    const control = page.locator(`[data-focus="${f}"]`);
    await control.click();
    await expect(control).toBeFocused();
    await expect(control).toHaveAttribute("aria-pressed", "true");
    const prefix = f === "kitchen" ? "deep-kit" : "deep-bath";
    expect(
      await page.locator(`[data-task-id^="${prefix}"]`).count(),
    ).toBeGreaterThan(0);
    await expect(
      page.locator('[data-task-id="essential-all-001"]'),
    ).toBeVisible();
  }
  await page.locator('[data-plan="deep"]').click();
  await expect(page.locator("#hc-focus-dock")).toBeHidden();
  await page.locator('[data-plan="maintenance"]').click();
  for (const width of [750, 751, 900, 901]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator("#hc-name")).toContainText("Bathrooms focus");
    await expect(page.locator('[data-task-id="deep-bath-001"]')).toBeVisible();
  }
});
test("tabs support wrapped arrows, Home, End and native activation", async ({
  page,
}) => {
  const tabs = page.getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowLeft");
  await expect(tabs.last()).toBeFocused();
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("End");
  await expect(tabs.last()).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.first()).toBeFocused();
  expect(
    await tabs.evaluateAll(
      (es) => es.filter((e) => e.getAttribute("tabindex") === "0").length,
    ),
  ).toBe(1);
});
test("responsive boundaries retain one page, original images and no horizontal overflow", async ({
  page,
}) => {
  for (const width of [
    320, 350, 351, 359, 360, 369, 370, 385, 386, 390, 391, 430, 431, 520, 521,
    750, 751, 840, 841, 900, 901, 1000, 1001, 1050, 1051, 1100, 1101, 1149,
    1150, 1199, 1200, 1290, 1291, 1299, 1300, 1440, 1920,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `overflow at ${width}`,
    ).toBe(width);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("tab")).toHaveCount(6);
    await expect(page.locator(".steps li")).toHaveCount(3);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 5));
      }
      await Promise.all(
        [...document.images].map((i) => i.decode().catch(() => {})),
      );
      scrollTo(0, 0);
    });
    expect(
      await page.evaluate(() =>
        [...document.images]
          .filter((i) => !i.complete || !i.naturalWidth)
          .map((i) => i.src),
      ),
    ).toEqual([]);
    const book = await page.locator(".book-now").boundingBox(),
      benefit = await page.locator(".benefits").boundingBox();
    expect(
      book!.y + book!.height,
      `hero collision ${width}`,
    ).toBeLessThanOrEqual(benefit!.y + 2);
  }
});
test("compact navigation closes on Escape and selection; destinations and newsletter stay truthful", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 900 });
  const toggle = page.locator(".hc-float-toggle");
  await toggle.click();
  await expect(page.locator(".hc-float-dropdown")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-label", "Open navigation");
  await toggle.click();
  await page.locator('.hc-float-dropdown a[href="#contact"]').click();
  await expect(page.locator(".hc-float-dropdown")).toBeHidden();
  await expect(page.locator(".hc-button")).toHaveAttribute(
    "href",
    "https://form.jotform.com/262983802449064",
  );
  await expect(page.locator(".hc-button")).toHaveAttribute("target", "_blank");
  await expect(page.locator(".book-now")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await page.locator("#hc-b-footer-signup button").click();
  await expect(page.locator("#hc-b-footer-form-status")).toContainText(
    "No information has been sent.",
  );
  expect(await page.locator(".hc-b-footer__pending a").count()).toBe(0);
});
test("default checklist and contact fallback are usable without application JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const p = await context.newPage();
  await p.goto(process.env.TEST_BASE_URL || "http://127.0.0.1:5173");
  await expect(p.locator("[data-task-id]")).toHaveCount(20);
  await expect(p.locator(".hc-button")).toBeVisible();
  await expect(p.locator(".contact-fallback")).toHaveAttribute(
    "href",
    "https://form.jotform.com/262930639373060",
  );
  await context.close();
});

// Measurements from the original embedded document, not implementation constants.
import baseline from "./fixtures/b633-layout.json" with { type: "json" };
test("Hero baseline and deliberate 16px desktop Steps rhythm adjustment", async ({ page }) => {
  for (const [width, reference] of Object.entries(baseline.measurements)) {
    await page.setViewportSize({ width: Number(width), height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    const title = (await page.locator(".hero h1").boundingBox())!,
      steps = (await page.locator(".steps h2").boundingBox())!,
      services = (await page.locator("#services").boundingBox())!;
    for (const [name, actual, expected] of [
      ["headline inset", title.x, reference.titleX],
      ["headline top", title.y, reference.titleY],
      ["headline height", title.height, reference.titleHeight],
      ["Steps inset", steps.x, reference.stepsTitleX],
      ["Steps top", steps.y, reference.stepsTitleY - (Number(width)>750 ? 8 : 0)],
      ["Steps height", steps.height, reference.stepsTitleHeight],
      ["Services start", services.y, reference.servicesTop - (Number(width)>750 ? 16 : 0)],
    ] as const) {
      expect(Math.abs(actual - expected), `${name} at ${width}px`).toBeLessThan(
        2,
      );
    }
  }
});


test("desktop Customize My Quote button aligns to the right edge", async ({
  page,
}) => {
  for (const width of [901, 1100, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const actions = page.locator("#hc-mobile-vertical .hc-panel-actions");
    const button = actions.locator(".hc-button");
    await expect(button).toBeVisible();
    const [rowBox, buttonBox] = await Promise.all([
      actions.boundingBox(),
      button.boundingBox(),
    ]);
    expect(rowBox, `actions at ${width}px`).not.toBeNull();
    expect(buttonBox, `button at ${width}px`).not.toBeNull();
    const rightInset =
      rowBox!.x + rowBox!.width - (buttonBox!.x + buttonBox!.width);
    expect(
      Math.abs(rightInset - 20),
      `desktop CTA right inset at ${width}px`,
    ).toBeLessThanOrEqual(2);
  }
});
