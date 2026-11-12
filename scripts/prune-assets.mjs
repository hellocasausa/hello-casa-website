import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const walk = (p) =>
  fs
    .readdirSync(p, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(p, e.name)) : [path.join(p, e.name)],
    );
const source =
  walk("src")
    .filter((p) => !p.endsWith("asset-manifest.json"))
    .map((p) => fs.readFileSync(p, "utf8"))
    .join("\n") + fs.readFileSync("scripts/build-page.ts", "utf8");
let manifest = JSON.parse(
  fs.readFileSync("src/data/asset-manifest.json", "utf8"),
);
for (const p of walk("public/assets")) {
  const relative = p.slice("public/".length);
  if (!source.includes(relative) && !p.endsWith("benefit.svg"))
    fs.unlinkSync(p);
}
manifest = manifest.filter((m) => fs.existsSync("public" + m.path));
for (const p of walk("public/assets")) {
  const url = p.slice(6);
  if (!manifest.some((m) => m.path === url)) {
    const bytes = fs.readFileSync(p);
    manifest.push({
      path: url,
      sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
      bytes: bytes.length,
      role: p.includes("original")
        ? "Exact source-referenced Wix CDN original"
        : "Source vector / plan icon",
    });
  }
}
fs.writeFileSync(
  "src/data/asset-manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log("Packaged assets:", manifest.length);
