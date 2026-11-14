import fs from "node:fs";
import { parseHTML } from "linkedom";
import plans from "../src/data/plans.json" with { type: "json" };
import delivery from "../src/data/delivery.json" with { type: "json" };
import { checklist, focusControls } from "../src/components/services.ts";
// Templates contain the approved native structure. Catalog data owns the initial
// checklist; behavior binds to stable IDs without moving or duplicating sections.
const names = [
  "header",
  "hero",
  "steps",
  "services",
  "standards",
  "contact",
  "footer",
] as const;
const sections = Object.fromEntries(
  names.map((name) => [
    name,
    fs.readFileSync(`src/components/markup/${name}.html`, "utf8"),
  ]),
);
const { document } = parseHTML(
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Hello Casa | Professional Cleaning Services</title><meta name="description" content="Professional cleaning services, personalized checklists &amp; more time for the things you love."><link rel="canonical" href="https://www.hello-casa.com"><link rel="stylesheet" href="/src/style.css"></head><body id="top"><a class="skip-link" href="#services">Skip to services</a><header>${sections.header}</header><main>${sections.hero}${sections.steps}<div id="services">${sections.services}</div>${sections.standards}${sections.contact}</main>${sections.footer}<script type="module" src="/src/main.ts"></script></body></html>`,
);
function required(selector: string) {
  const el = document.querySelector(selector);
  if (!el) throw Error(`Missing component contract: ${selector}`);
  return el;
}
for (const selector of [
  ".hc-nav-v7",
  ".hc-float-toggle",
  ".hero h1",
  ".steps ol",
  "#standards",
  "#hc-native-contact-form",
  "#footer",
])
  required(selector);
required("#hc-detail-body").innerHTML = checklist(plans[0]);
required("#hc-name").textContent = plans[0].name;
required("#hc-description").textContent = plans[0].description;
required("#hc-focus-dock").innerHTML = focusControls();
required("#hc-details").setAttribute("aria-labelledby", "hc-tab-maintenance");
document
  .querySelectorAll("[role=tab]")
  .forEach((el, i) => el.setAttribute("tabindex", i ? "-1" : "0"));
for (const img of document.querySelectorAll("img")) {
  const source = img.getAttribute("src")!,
    entry = delivery[source as keyof typeof delivery];
  if (entry) {
    img.setAttribute("src", entry.src);
    img.setAttribute("width", String(entry.width));
    img.setAttribute("height", String(entry.height));
  }
  img.setAttribute(
    "decoding",
    img.closest("#standards,#contact") ? "async" : "auto",
  );
  if (img.closest("#standards,#contact")) img.setAttribute("loading", "lazy");
  else img.setAttribute("loading", "eager");
  if (img.classList.contains("hero-art"))
    img.setAttribute("fetchpriority", "high");
}
for (const source of document.querySelectorAll("picture source")) {
  const original = source.getAttribute("srcset")!,
    entry = delivery[original as keyof typeof delivery];
  if (entry) source.setAttribute("srcset", entry.src);
}
fs.writeFileSync(
  "index.html",
  "<!doctype html>\n" + document.documentElement.outerHTML + "\n",
);
