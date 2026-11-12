import fs from "node:fs";
import { parseHTML } from "linkedom";
import assets from "../src/data/assets.json" with { type: "json" };
import plans from "../src/data/plans.json" with { type: "json" };
import { checklist, focusControls } from "../src/components/services.ts";
const read = (s: string) => fs.readFileSync(`src/generated/${s}.html`, "utf8");
let services = read("services");
const { document: d } = parseHTML(services);
d.querySelector("#hc-detail-body")!.innerHTML = checklist(plans[0]);
d.querySelector("#hc-name")!.textContent = plans[0].name;
d.querySelector("#hc-description")!.textContent = plans[0].description;
d.querySelector("#hc-focus-dock")!.innerHTML = focusControls();
d.querySelector("#hc-details")!.setAttribute(
  "aria-labelledby",
  "hc-tab-maintenance",
);
d.querySelectorAll("[role=tab]").forEach((e, i) =>
  e.setAttribute("tabindex", i ? "-1" : "0"),
);
d.querySelector(".hc-bound")!.insertAdjacentHTML(
  "afterbegin",
  '<h2 class="mobile-invitation">Select your plan:</h2>',
);
services = d.toString();
let header = read("header")
  .replace(/href="#"/g, 'href="#top"')
  .replace(
    /data-hc-target="(services|standards|contact)" href="#top"/g,
    'href="#$1"',
  );
let standards = read("standards")
  .replace(
    '<span class="hc-asym-copy">Care starts at home.</span>',
    '<h2 class="hc-asym-copy">Care starts at home.</h2>',
  )
  .replace(/<h2 class="hc-asym-title">/g, '<h3 class="hc-asym-title">')
  .replace(/<\/h2><\/div>/g, "</h3></div>");
let footer = read("footer")
  .replace('href="#comp-mvg8kq2o"', 'href="#services"')
  .replace('href="#SITE_CONTAINER"', 'href="#top"')
  .replace('href="#comp-mvgugq2v"', 'href="#contact"');
footer = footer
  .replace(
    /<img([^>]*id="hc-b-footer-artwork"[^>]*)>/,
    '<picture class="footer-art"><source media="(max-width:750px)" srcset="' +
      "/assets/footer-mobile-original.jpg" +
      '"><img$1></picture>',
  )
  .replace(
    /<img([^>]*id="hc-b-footer-logo"[^>]*)>/,
    '<picture><source media="(max-width:750px)" srcset="' +
      "/assets/footer-mobile-logo-original.png" +
      '"><img$1></picture>',
  );
let contact = read("contact")
  .replace('<div class="hc-card-topline"></div>', "")
  .replace(/<!--[^]*?-->/g, "")
  .replace(
    /(<div aria-label="Hello Casa contact form"[^>]*>)[^]*?(<\/div>)/,
    '$1<script src="https://form.jotform.com/jsform/262930639373060" type="text/javascript"></script>$2',
  );
contact = contact.replace(
  "</div>\n</div>\n</div>\n</section>",
  '<a class="contact-fallback" href="https://form.jotform.com/262930639373060" target="_blank" rel="noopener noreferrer">Open contact form in a new tab</a></div>\n</div>\n</div>\n</section>',
);
const hero = `<section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><h1 id="hero-title">Come home to<br>fresh &amp; clean.</h1><p class="hero-desktop-copy">Say hello to professional cleaning services, personalized checklists<br>&amp; more time for the things you love.</p><p class="hero-mobile-copy">Say hello to professional cleaning, customized checklists, &amp; more time for what you love.</p><button class="book-now" type="button" aria-disabled="true" aria-describedby="booking-status">Book Now <span aria-hidden="true">→</span></button><span id="booking-status" class="sr-only">Booking destination awaiting confirmation.</span></div><img class="hero-art" src="${assets.hero}" width="629" height="515" alt="Sunlit open window overlooking a peaceful home"><ul class="benefits">${["Custom checklists", "Vetted cleaners", "No contracts"].map((s) => `<li><img src="/assets/benefit.svg" alt="" width="25" height="25"><span>${s}</span></li>`).join("")}</ul></section>`;
const steps = `<section id="how-it-works" class="steps" aria-labelledby="steps-title"><div class="steps-heading"><p>The Hello Casa Way</p><h2 id="steps-title">A Fresh Start,<br><span>In 3 steps</span></h2></div><ol>${["Personalize<br>your checklist", "Schedule<br>your availability", "Wait for<br>your match"].map((s, i) => `<li><span class="step-number" aria-hidden="true">${i + 1}</span><p>${s}</p></li>`).join("")}</ol></section>`;
fs.writeFileSync(
  "index.html",
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Hello Casa | Professional Cleaning Services</title><meta name="description" content="Professional cleaning services, personalized checklists & more time for the things you love."><link rel="canonical" href="https://www.hello-casa.com"><link rel="stylesheet" href="/src/style.css"></head><body id="top"><a class="skip-link" href="#services">Skip to services</a><header>${header}</header><main>${hero}${steps}<div id="services">${services}</div>${standards}${contact}</main>${footer}<script type="module" src="/src/main.ts"></script></body></html>`,
);
