import { test, expect } from "@playwright/test";

test("Element Explorer actually renders the desktop quote CTA on the right", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/preview/element-explorer.html");
  await page.locator('.view-button[data-size="1440"]').click();
  await expect(page.locator("#status")).toHaveClass(/ready/, {
    timeout: 30000,
  });
  await expect(page.locator("#ctaStatus")).toContainText("✓ CTA aligned", {
    timeout: 30000,
  });
  const result = await page.locator("#site").evaluate((frame: HTMLIFrameElement) => {
    const doc = frame.contentDocument!;
    const row = doc.querySelector("#hc-mobile-vertical .hc-panel-actions")!;
    const button = row.querySelector(".hc-button")!;
    const r = row.getBoundingClientRect();
    const b = button.getBoundingClientRect();
    return {
      inset: r.right - b.right,
      layout: doc.defaultView!.getComputedStyle(row).display,
      label: button.textContent!.trim(),
      viewport: doc.defaultView!.innerWidth,
    };
  });
  console.log("EXPLORER_RENDERED_CTA:", JSON.stringify(result));
  expect(result.layout).toBe("grid");
  expect(result.viewport).toBe(1440);
  expect(result.inset).toBeGreaterThanOrEqual(18);
  expect(result.inset).toBeLessThanOrEqual(22);
  expect(result.label).toContain("Customize My Quote");
  await page.screenshot({ path: "test-results/element-explorer-desktop.png" });
});
