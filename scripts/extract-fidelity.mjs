// Reusable style values from the embedded B6.3.3 document only.
import fs from "node:fs";
import crypto from "node:crypto";
import postcss from "postcss";
const raw = fs.readFileSync(process.argv[2], "utf8");
const css = [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
  .map((m) => m[1])
  .join("\n");
const root = postcss.parse(css),
  out = postcss.root();
// Recover the exact embedded Nunito variant used by the desktop Hero.
const fonts = [];
root.walkAtRules("font-face", (rule) => {
  if (!rule.toString().includes("nunito-sans-v2")) return;
  const copy = rule.clone();
  copy.walkDecls("src", (d) => {
    d.value = d.value.replace(
      /data:([^;]+);base64,([\w+/=]+)/g,
      (uri, mime, b64) => {
        const bytes = Buffer.from(b64, "base64"),
          sha = crypto.createHash("sha256").update(bytes).digest("hex"),
          path = `/assets/${sha.slice(0, 20)}.woff2`;
        fs.writeFileSync("public" + path, bytes);
        return path;
      },
    );
  });
  fonts.push(copy.toString());
});
fs.writeFileSync(
  "src/components/hero-fonts.css",
  [...new Set(fonts)].join("\n") + "\n",
);
root.walkRules((rule) => {
  if (!/\.hc96-(mobile-invitation|invitation-rule)/.test(rule.selector)) return;
  const copy = rule.clone();
  copy.selector = postcss.list
    .comma(rule.selector)
    .filter((s) => /\.hc96-(mobile-invitation|invitation-rule)/.test(s))
    .join(",");
  let parent = copy;
  for (let p = rule.parent; p && p.type !== "root"; p = p.parent) {
    const wrapper = p.clone({ nodes: [] });
    wrapper.append(parent);
    parent = wrapper;
  }
  out.append(parent);
});
fs.writeFileSync("src/components/invitation.css", out.toString());
