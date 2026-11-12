import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const results = [];
for (const width of [390, 820, 1440]) {
  const variants = {};
  for (const [name, port] of [
    ["approved", 4174],
    ["optimized", 4173],
  ]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.route("https://**", (route) => {
      if (
        route.request().url() ===
        "https://form.jotform.com/jsform/262930639373060"
      )
        return route.fulfill({
          contentType: "application/javascript",
          body: `document.currentScript.insertAdjacentHTML('afterend','<iframe id="262930639373060" title="Jotform fixture" src="about:blank" style="width:10px;min-width:100%;display:block;overflow:hidden;height:513px;border:0"></iframe>')`,
        });
      return route.abort();
    });
    await page.goto(`http://127.0.0.1:${port}`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('[id="262930639373060"]').waitFor();
    const sizes = [];
    for (const height of [513, 800]) {
      await page
        .locator('[id="262930639373060"]')
        .evaluate(
          (frame, height) => (frame.style.height = height + "px"),
          height,
        );
      sizes.push({
        card: await page.locator(".hc-contact-card").boundingBox(),
        iframe: await page.locator('[id="262930639373060"]').boundingBox(),
      });
    }
    variants[name] = sizes;
    assert.equal(
      await page.locator('[id="262930639373060"]').getAttribute("title"),
      "Contact Hello Casa",
    );
    await page.close();
  }
  for (let i = 0; i < 2; i++)
    for (const element of ["card", "iframe"])
      for (const prop of ["x", "y", "width", "height"])
        assert(
          Math.abs(
            variants.approved[i][element][prop] -
              variants.optimized[i][element][prop],
          ) < 0.02,
          `${element} ${prop} ${width}`,
        );
  results.push({ width, ...variants });
}
await browser.close();
fs.writeFileSync(
  "docs/performance/provider-sizing.json",
  JSON.stringify(results, null, 2) + "\n",
);
console.log(
  "Provider fixture resizing matches approved layout at 390/820/1440; no external submissions.",
);
