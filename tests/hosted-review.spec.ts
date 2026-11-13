import {test,expect} from "@playwright/test";
test("GitHub responsive viewer renders the actual interactive site at three design widths",async({page})=>{
 await page.route("https://form.jotform.com/**",r=>r.abort());
 await page.goto("/review/index.html");
 await expect(page.locator("#site")).toHaveAttribute("src","../");
 const site=page.frameLocator("#site");
 await expect(site.locator(".st-story")).toHaveCount(3);
 await expect(site.locator("[role=tab]")).toHaveCount(6);
 for(const [label,width] of [["Desktop",1440],["Tablet",820],["Mobile",390]] as const){
  await page.getByRole("button",{name:label,exact:true}).click();
  await expect(page.locator("#site")).toHaveAttribute("width",String(width));
  await expect(page.getByRole("button",{name:label,exact:true})).toHaveAttribute("aria-pressed","true");
  await expect(page.locator("#details")).toContainText(width+"px");
  const resolved=await site.locator("#standards").evaluate(el=>el.ownerDocument.defaultView!.innerWidth);
  expect(resolved).toBe(width);
 }
 await page.getByRole("button",{name:"Desktop",exact:true}).click();
 await expect(site.locator("#standards .st-story--two .st-prose")).toHaveCSS("border-top-left-radius","22px");
 await expect(site.locator("#standards .st-story--two .st-prose")).toHaveCSS("border-bottom-left-radius","22px");
 await site.locator('[data-plan="guest"]').click();
 await expect(site.locator("#hc-name")).toHaveText("Guest Turnover");
 await expect(site.locator("#hc-detail-body .hc-group h4")).toHaveText(["All Rooms","Kitchen","Bathrooms","Final Touches"]);
});
