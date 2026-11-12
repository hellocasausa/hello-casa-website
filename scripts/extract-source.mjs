import fs from "node:fs";
import crypto from "node:crypto";
import { parseHTML } from "linkedom";
import postcss from "postcss";
// Offline extraction tool. Never edits or publishes the immutable original.
const { document: d } = parseHTML(fs.readFileSync(process.argv[2], "utf8"));
fs.mkdirSync("src/generated", { recursive: true });
const manifest = [];
function asset(uri, role = "embedded") {
  const m = uri.match(/^data:([^;,]+)(?:;[^,]*)?;base64,(.*)$/s);
  if (!m) return uri;
  const bytes = Buffer.from(m[2], "base64"),
    sha = crypto.createHash("sha256").update(bytes).digest("hex"),
    ext =
      { "image/png": "png", "image/jpeg": "jpg", "image/svg+xml": "svg" }[
        m[1]
      ] || "woff2",
    path = `/assets/${sha.slice(0, 20)}.${ext}`;
  fs.writeFileSync("public" + path, bytes);
  if (!manifest.some((x) => x.path === path))
    manifest.push({ path, sha256: sha, bytes: bytes.length, role });
  return path;
}
function localize(s) {
  return s.replace(/data:[^\s"')]+;base64,[a-zA-Z0-9+/=]+/g, (u) => asset(u));
}
const map = JSON.parse(
  d
    .querySelector("#hc-b62-offline-asset-resolver")
    .textContent.match(/const assets=(\{.*?\});/s)[1],
);
fs.mkdirSync("public/assets/embedded", { recursive: true });
for (const [p, u] of Object.entries(map))
  fs.copyFileSync("public" + asset(u, p), "public/" + p);
for (const img of d.querySelectorAll("img")) {
  img.src = asset(img.src, img.alt);
  img.removeAttribute("srcset");
}
const named = {
  wordmark: ".hc-float-logo img",
  hero: "#comp-mvfzgkr8 img",
  standard1: ".hc-asym-feature--one img",
  standard2: ".hc-asym-feature--two img",
  standard3: ".hc-asym-feature--three img",
  contact: ".hc-photo-scene img",
  footerArt: "#hc-b-footer-artwork",
  footerLogo: "#hc-b-footer-logo",
  mobileFooterArt: ".hc-v86-original-sunset img",
  mobileFooterLogo: ".hc-v86-brand-logo img",
};
fs.writeFileSync(
  "src/data/assets.json",
  JSON.stringify(
    Object.fromEntries(
      Object.entries(named).map(([k, s]) => [k, d.querySelector(s).src]),
    ),
    null,
    2,
  ),
);
fs.writeFileSync(
  "public/assets/benefit.svg",
  d
    .querySelector("#comp-mvg4k5it svg")
    .outerHTML.replaceAll("viewbox=", "viewBox=")
    .replaceAll("preserveaspectratio=", "preserveAspectRatio=")
    .replace(/<defs>[^]*?<\/defs>/, "")
    .replaceAll("#3567FD", "#91AD91"),
);
const service = d.querySelector("#hc-vertical-in-place-fix").textContent,
  plans = JSON.parse(service.match(/const PLANS=(\[.*?\]);/s)[1]);
fs.writeFileSync("src/data/plans.json", JSON.stringify(plans, null, 2));
fs.writeFileSync(
  "src/generated/services.html",
  JSON.parse(service.match(/const widgetHtml=(".*?");/s)[1]).replaceAll(
    'src="assets/',
    'src="/assets/',
  ),
);
fs.writeFileSync(
  "src/components/services.css",
  JSON.parse(service.match(/css.textContent=(".*?");/s)[1]).replace(
    /@import url\([^]*?\);/g,
    "",
  ),
);
const ids = {
  "comp-mvjmg2wv": "standards",
  "comp-mvgugq2v": "contact",
  "comp-mvj89k3v": "footer",
};
for (const [name, sel] of Object.entries({
  standards: ".hc-standards-asym-section",
  contact: ".hc-contact-new",
  footer: ".hc-b-footer",
  header: ".hc-nav-v7",
})) {
  const c = d.querySelector(sel).cloneNode(true);
  for (const n of c.querySelectorAll("script")) n.remove();
  for (const n of [c, ...c.querySelectorAll("*")])
    for (const a of [...n.attributes])
      if (a.name.startsWith("data-") && a.name !== "data-hc-target")
        n.removeAttribute(a.name);
  if (ids[c.id]) c.id = ids[c.id];
  fs.writeFileSync(`src/generated/${name}.html`, c.outerHTML);
}
const history = d.querySelector(
  'style[data-hc-bundled-from="styles/legacy-site-history.css"]',
).textContent;
const root = postcss.parse(localize(history.replaceAll("#comp-mvfyk6kv ", "")));
root.walkRules((r) => {
  if (r.parent.type === "atrule" && r.parent.name === "font-face") return;
  const selectors = postcss.list
    .comma(r.selector)
    .filter(
      (s) =>
        /\.hc-(?:asym|contact|photo-scene|card-title|card-desc|jotform|104|float|nav-v7)|#hc-mobile-vertical|\.hc-(?:focus|v93|v101|extras|group-approved|grid-approved|conditional)/.test(
          s,
        ) && !/#comp-(?!mvjmg2wv|mvgugq2v)/.test(s),
    );
  if (!selectors.length) r.remove();
  else r.selector = selectors.join(",");
});
root.walkAtRules((r) => {
  if (r.name === "import" || !r.nodes?.length) r.remove();
});
let css = root.toString();
for (const [old, next] of Object.entries(ids))
  css = css.replaceAll("#" + old, "#" + next);
fs.writeFileSync("src/components/source-authored.css", css);
let fonts = "";
const all =
  d.querySelector('style[data-hc-bundled-from="styles/legacy-platform.css"]')
    .textContent + history;
for (const match of all.matchAll(/@font-face\s*\{[^}]+\}/g))
  if (/HC Nunito|HC Libre|playfair-display-v2|dm-sans/.test(match[0])) {
    const f = localize(match[0]);
    if (!fonts.includes(f)) fonts += f + "\n";
  }
fs.writeFileSync("src/fonts.css", fonts);
let footer = d
  .querySelector('style[data-hc-bundled-from="styles/footer.css"]')
  .textContent.replaceAll("#comp-mvj89k3v", "#footer")
  .replace("var(--hc-footer-wash))));", "var(--hc-footer-wash)));")
  .replace(
    "@media(max-width:750px){#footer.hc-b-footer{display:none!important}}",
    "",
  );
fs.writeFileSync(
  "src/components/footer.css",
  d.querySelector('style[data-hc-bundled-from="styles/design-tokens.css"]')
    .textContent +
    "\n" +
    footer,
);
fs.writeFileSync(
  "src/data/asset-manifest.json",
  JSON.stringify(manifest, null, 2),
);
console.log({
  plans: plans.length,
  taskIds: new Set(plans.flatMap((p) => p.groups.flatMap((g) => g.taskIds)))
    .size,
  assets: manifest.length,
  css: css.length,
  fonts: fonts.length,
});
