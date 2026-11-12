import { test, expect } from "@playwright/test";

const concepts = ["a", "b", "c"] as const;
const widths = [1100, 1440] as const;
const labels = [
  "Thoroughly Vetted Professionals",
  "Personalized Cleaning Profiles",
  "No Long-Term Contracts",
];
const firstWords = [
  "Inviting someone into your home is personal.",
  "It's often the little things that make the biggest difference.",
  "Some weeks call for a little extra help.",
];

test("Standards editorial remixes render full approved copy and original imagery at both desktop widths", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1680, height: 1000 });
  const jsErrors: string[] = [];
  page.on("pageerror", err => jsErrors.push(err.message));
  await page.goto("/preview/experiments/standards-editorial-gallery.html");
  const frame = page.frameLocator("#frame");
  await expect(page.locator("#statusText")).toContainText("All copy preserved", {
    timeout: 25000,
  });
  for (const concept of concepts) {
    await page.locator('button[data-concept="' + concept + '"]').click();
    await expect(frame.locator("body")).toHaveAttribute("data-concept", concept);
    for (const width of widths) {
      await page.locator('button[data-width="' + width + '"]').click();
      await expect(page.locator("#viewportLabel")).toHaveText(
        width + "px · " + concept.toUpperCase(),
      );
      await expect(frame.locator(".st-story")).toHaveCount(3);
      await expect(frame.locator(".st-copy p")).toHaveCount(6);
      for (let i = 0; i < labels.length; i++) {
        await expect(frame.locator(".st-story").nth(i).locator("h3")).toHaveText(labels[i]);
        await expect(frame.locator(".st-story").nth(i).locator(".st-copy p").first()).toContainText(firstWords[i]);
      }
      await expect(frame.locator(".st-intro h2")).toHaveText("Care starts at home.");
      await expect(frame.locator(".st-intro .st-subtitle")).toHaveText(
        "Who comes through your door matters. So do the little details, and the freedom to change your plans.",
      );
      await expect(frame.locator(".st-figure img")).toHaveCount(3);
      await expect.poll(() =>
        frame.locator(".st-figure img").evaluateAll(
          imgs => imgs.filter(img => (img as HTMLImageElement).naturalWidth > 0).length
        ), {timeout:15000}
      ).toBe(3);
      const measurements = await page.locator("#frame").evaluate((el: HTMLIFrameElement) => {
        const d = el.contentDocument!;
        const w = d.defaultView!;
        const section = d.querySelector("#standards")!;
        const shell = d.querySelector(".st-shell")!;
        const intro = d.querySelector(".st-intro")!.getBoundingClientRect();
        const shellBox = shell.getBoundingClientRect();
        const rows = Array.from(d.querySelectorAll(".st-story")).map(story => {
          const r = story.getBoundingClientRect();
          const visual = story.querySelector(".st-visual")!.getBoundingClientRect();
          const prose = story.querySelector(".st-prose")!.getBoundingClientRect();
          const allText = Array.from(story.querySelectorAll(".st-prose p"));
          return {
            top: r.top,
            height: r.height,
            visualLeft: visual.left,
            paragraphLeft: prose.left,
            copyHeight: prose.height,
            textFits: allText.every(p => {
              const br = p.getBoundingClientRect();
              return br.bottom <= prose.bottom + 2 && br.left >= prose.left - 2;
            }),
          };
        });
        return {
          innerWidth: w.innerWidth,
          scrollWidth: section.scrollWidth,
          clientWidth: section.clientWidth,
          shellWidth: Math.round(shellBox.width),
          introLeft: Math.round(intro.left),
          introCenter: Math.round(intro.left + intro.width / 2),
          sectionHeight: Math.round(section.getBoundingClientRect().height),
          gradient: w.getComputedStyle(section).backgroundImage,
          images: Array.from(d.querySelectorAll(".st-figure img")).map(img => ({
            src: (img as HTMLImageElement).src,
            loaded: (img as HTMLImageElement).naturalWidth > 0,
          })),
          rows,
        };
      });
      console.log("STANDARDS_REMIX:", concept, width, JSON.stringify(measurements));
      expect(measurements.innerWidth).toBe(width);
      expect(measurements.scrollWidth - measurements.clientWidth).toBeLessThanOrEqual(3);
      expect(measurements.introCenter).toBeGreaterThan(width / 2);
      expect(measurements.gradient).toContain("linear-gradient");
      expect(measurements.images.every(im => im.loaded)).toBeTruthy();
      expect(measurements.images.every(im => im.src.includes("/public/assets/"))).toBeTruthy();
      expect(measurements.rows.every(row => row.textFits && row.height > 250)).toBeTruthy();
      // A/B read image-left, image-right, image-left; C deliberately reverses.
      for (let i = 0; i < 3; i++) {
        const imageOnRight = concept === "c" ? i !== 1 : i === 1;
        expect(
          measurements.rows[i].visualLeft > measurements.rows[i].paragraphLeft,
          "image/text zigzag for " + concept + " row " + (i + 1),
        ).toBe(imageOnRight);
      }
      await page.locator("#frame").screenshot({
        path: "test-results/standards-" + concept + "-" + width + ".png",
        animations: "disabled",
        timeout: 30000,
      });
    }
  }
  expect(jsErrors).toEqual([]);
});
