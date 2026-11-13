import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const [url = "http://127.0.0.1:4173", label = "current", build = "dist"] =
    process.argv.slice(2),
  dir = `.artifacts/${label}`;
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const result = {
  url,
  label,
  build,
  environment:
    "Local Chromium, 1x DPR, no CPU/network throttling; cold contexts; external provider blocked, no submissions",
  files: {},
  loads: [],
};
const walk = (p) =>
  fs
    .readdirSync(p, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(p, e.name)) : [path.join(p, e.name)],
    );
const files = walk(path.join(build, "assets"));
for (const ext of ["html", "css", "js", "image", "font"]) {
  const all =
    ext === "html"
      ? [path.join(build, "index.html")]
      : files.filter((f) =>
          ext === "image"
            ? /\.(png|jpg|webp|svg)$/.test(f)
            : ext === "font"
              ? f.endsWith(".woff2")
              : f.endsWith("." + ext),
        );
  result.files[ext] = {
    count: all.length,
    raw: all.reduce((n, f) => n + fs.statSync(f).size, 0),
    gzip: all.reduce((n, f) => n + zlib.gzipSync(fs.readFileSync(f)).length, 0),
  };
}
if (!process.argv.includes("--extras"))
  for (const width of [390, 820, 1440])
    for (let sample = 0; sample < 3; sample++) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      await page.route("https://**", (r) => r.abort());
      await page.addInitScript(() => {
        window.__vitals = { lcp: 0, cls: 0 };
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) window.__vitals.lcp = e.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries())
            if (!e.hadRecentInput) window.__vitals.cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(600);
      const load = await page.evaluate(() => ({
        vitals: window.__vitals,
        paint: performance
          .getEntriesByType("paint")
          .map((e) => ({ name: e.name, startTime: e.startTime })),
        resources: performance
          .getEntriesByType("resource")
          .filter((e) => e.name.startsWith(location.origin))
          .map((e) => ({
            path: new URL(e.name).pathname,
            type: e.initiatorType,
            encoded: e.encodedBodySize,
            decoded: e.decodedBodySize,
            transfer: e.transferSize,
          })),
        navigation: performance.getEntriesByType("navigation").map((e) => ({
          encoded: e.encodedBodySize,
          transfer: e.transferSize,
        }))[0],
      }));
      result.loads.push({ width, sample, ...load });
      await context.close();
    }
// Full-page comparisons load all lazy art by scrolling, then return to top.
if (!process.argv.includes("--measure-only"))
  for (const width of process.argv.includes("--extras")
    ? [390, 820, 1440]
    : [
        320, 350, 351, 359, 360, 369, 370, 385, 386, 390, 391, 430, 431, 520,
        521, 750, 751, 820, 840, 841, 900, 901, 1000, 1001, 1050, 1051, 1100,
        1101, 1149, 1150, 1199, 1200, 1290, 1291, 1299, 1300, 1440, 1920,
      ]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    await page.route("https://**", (r) => r.abort());
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    const states = process.argv.includes("--extras")
      ? ["nav", "hover", "focus"]
      : [
          "maintenance",
          ...([390, 820, 1440].includes(width)
            ? [
                "deep",
                "moving",
                "guest",
                "office",
                "specialty",
                "kitchen",
                "bathroom",
              ]
            : []),
        ];
    for (const state of states) {
      if (["nav", "hover", "focus"].includes(state)) {
        await page.keyboard.press("Escape");
        await page.evaluate(() =>
          document.querySelector("[data-plan=maintenance]").click(),
        );
        if (state === "nav")
          await page.evaluate(() =>
            document.querySelector(".hc-float-toggle").click(),
          );
        if (state === "hover") await page.locator("[data-plan=deep]").hover();
        if (state === "focus") await page.locator("[data-plan=deep]").focus();
      } else if (["kitchen", "bathroom"].includes(state)) {
        await page.locator('[data-plan="maintenance"]').click();
        const select = page.locator("#essential-focus");
        if (await select.isVisible()) await select.selectOption(state);
        else await page.locator(`[data-focus="${state}"]`).click();
      } else await page.locator(`[data-plan="${state}"]`).click();
      await page.evaluate(async () => {
        for (const img of document.images) img.loading = "eager";
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 10));
        }
        await Promise.all(
          [...document.images].map((i) => i.decode().catch(() => {})),
        );
        scrollTo(0, 0);
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
      });
      await page.screenshot({
        path: `${dir}/${width}-${state}.png`,
        fullPage: true,
        animations: "disabled",
      });
    }
    await page.close();
  }
if (!process.argv.includes("--extras"))
  fs.writeFileSync(
    `docs/performance/${label}.json`,
    JSON.stringify(result, null, 2) + "\n",
  );
await browser.close();
console.log(`Saved ${label} measurements and visual references`);
