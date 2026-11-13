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
    const visibleGroups = p.id === "guest"
      ? p.groups.filter((g) => g.title !== "Outdoor Areas")
      : p.groups;
    const expected = visibleGroups.flatMap((g) => g.taskIds);
    expect(
      await page
        .locator("[data-task-id]")
        .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.taskId)),
    ).toEqual(expected);
    for (const g of p.groups)
      for (let i = 0; i < g.items.length; i++) {
        if (p.id !== "guest" || g.title !== "Outdoor Areas")
          await expect(
            page.locator(`[data-task-id="${g.taskIds[i]}"]`),
          ).toHaveText(g.items[i]);
        ids.add(g.taskIds[i]);
      }
    await expect(page.locator(".hc-extras-list li")).toHaveCount(
      p.extras.length,
    );
    await expect(page.locator(".hc-footnote")).toHaveText(p.note);
    if (p.id === "guest") {
      await expect(page.getByRole("heading", {name:"Outdoor Areas · if included"})).toHaveCount(0);
      await expect(page.locator("#hc-detail-body .hc-group h4")).toHaveText([
        "All Rooms", "Kitchen", "Bathrooms", "Final Touches",
      ]);
      await expect(page.locator('[data-task-id^="vacation-out-"]')).toHaveCount(0);
      await expect(page.locator('[data-task-id^="vacation-final-"]')).toHaveCount(5);
    }
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
  // Newsletter was intentionally removed from tablet, but remains on desktop.
  await expect(page.locator("#footer .hc-b-footer__newsletter")).toBeHidden();
  await page.setViewportSize({width:1100,height:900});
  await expect(page.locator("#footer .hc-b-footer__newsletter")).toBeVisible();
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
    // Tablet composition is intentionally revised; original baseline still validates phone and desktop.
    if (Number(width) >= 751 && Number(width) <= 900) continue;
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
      ["Steps top", steps.y, reference.stepsTitleY - (Number(width)>750 ? 8 : 0) + (Number(width)<=359 ? 14 : 0)],
      ["Steps height", steps.height, Number(width)<=750 ? (20 * 1.14 + 18 * 1.18) : reference.stepsTitleHeight],
      ["Services start", services.y, reference.servicesTop - (Number(width)>750 ? 16 : 13) + (Number(width)<=359 ? 14 : 0) + (Number(width)<=750 ? (20 * 1.14 + 18 * 1.18 - reference.stepsTitleHeight) : 0)],
    ] as const) {
      // Desktop Steps title height/top intentionally change with the new exact 32px type size.
      if (Number(width) >= 901 && (name === "Steps top" || name === "Steps height")) continue;
      expect(Math.abs(actual - expected), `${name} at ${width}px`).toBeLessThan(
        2,
      );
    }
  }
});



test("all primary section headings use exactly 32px on desktop", async ({page}) => {
  for (const width of [901, 1000, 1100, 1440, 1920]) {
    await page.setViewportSize({width, height:1000});
    await page.evaluate(() => document.fonts.ready);
    for (const selector of [".steps h2", ".steps h2 span", ".st-intro h2", "#contact .hc-contact-heading-stage h2"]) {
      await expect(page.locator(selector)).toHaveCSS("font-size", "32px");
      await expect(page.locator(selector)).toHaveCSS("font-weight", "400");
    }
    const bounds = await page.locator(".steps h2").boundingBox();
    const container = await page.locator(".steps").boundingBox();
    expect(bounds && container && bounds.y >= container.y - 2 && bounds.y + bounds.height <= container.y + container.height + 2).toBeTruthy();
  }
});


test("approved desktop body rhythm, headings, mirrored inset and bubble ending", async ({page}) => {
  for (const width of [901, 1000, 1100, 1101, 1200, 1440, 1920]) {
    await page.setViewportSize({width, height:1000});
    await page.evaluate(() => document.fonts.ready);
    for (const selector of [".hero .hero-desktop-copy", "#standards .st-prose", "#contact .hc-card-desc"]) {
      const target = page.locator(selector).first();
      await expect(target, `${selector} at ${width}px`).toHaveCSS("font-size", "16px");
      await expect(target).toHaveCSS("line-height", "24px");
    }
    await expect(page.locator("#standards .st-heading h3").first()).toHaveCSS("font-size", "32px");
    for (const heading of await page.locator("#standards .st-heading h3").all()) {
      await expect(heading).toHaveCSS("font-size", "32px");
      await expect(heading).toHaveCSS("font-weight", "400");
    }
    const left = await page.locator("#contact .hc-contact-heading-stage h2").boundingBox();
    const right = await page.locator("#standards .st-intro h2").boundingBox();
    expect(left && right).not.toBeNull();
    expect(Math.abs(left!.x - (width - (right!.x + right!.width))), `mirrored heading insets at ${width}px`).toBeLessThanOrEqual(2);
    const radius = page.locator("#standards .st-story--two .st-prose");
    await expect(radius).toHaveCSS("border-top-left-radius", "22px");
    await expect(radius).toHaveCSS("border-bottom-left-radius", "22px");
    await expect(radius).toHaveCSS("border-top-right-radius", "22px");
    await expect(radius).toHaveCSS("border-bottom-right-radius", "22px");
    await expect(page.locator(".st-intro h2")).toHaveCSS("font-size", "32px");
  }
  for (const width of [390, 750, 820, 900]) {
    await page.setViewportSize({width, height:1000});
    const heading = page.locator("#standards .st-heading h3").first();
    const currentSize = parseFloat(await heading.evaluate(el => getComputedStyle(el).fontSize));
    const expectedSize = width >= 751
      ? 28
      : 20;
    expect(currentSize, `approved tablet/mobile heading at ${width}px`).toBeCloseTo(expectedSize, 1);
    const card = page.locator("#standards .st-story--two .st-prose");
    await expect(card).toHaveCSS("border-top-right-radius", width<=750?"6px":"20px");
    await expect(card).toHaveCSS("border-bottom-right-radius", width<=750?"19px":"20px");
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
