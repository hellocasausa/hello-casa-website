// Original masters are immutable. Delivery copies are derived deterministically.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const originalDir = "assets/originals",
  outputDir = "public/assets";
fs.mkdirSync(outputDir, { recursive: true });
const delivery = {};
const markup = fs
  .readdirSync("src/components/markup")
  .map((n) => fs.readFileSync("src/components/markup/" + n, "utf8"))
  .join("\n");
for (const name of fs.readdirSync(originalDir).sort()) {
  for (const n of [name, name.replace(/\.(png|jpg)$/i, ".webp")]) {
    const p = path.join(outputDir, n);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  if (!markup.includes("/assets/" + name)) continue;
  const input = path.join(originalDir, name),
    meta = await sharp(input).metadata(),
    output = name.replace(/\.(png|jpg)$/i, ".webp");
  const bytes = await sharp(input)
    .webp({ lossless: true, effort: 6 })
    .toBuffer();
  let selected = name;
  if (bytes.length < fs.statSync(input).size) {
    const original = await sharp(input).ensureAlpha().raw().toBuffer();
    const decoded = await sharp(bytes).ensureAlpha().raw().toBuffer();
    let equal = original.length === decoded.length;
    for (let i = 0; equal && i < original.length; i += 4) {
      if (
        original[i + 3] !== decoded[i + 3] ||
        (original[i + 3] !== 0 &&
          (original[i] !== decoded[i] ||
            original[i + 1] !== decoded[i + 1] ||
            original[i + 2] !== decoded[i + 2]))
      )
        equal = false;
    }
    if (!equal) {
      fs.copyFileSync(input, path.join(outputDir, name));
      delivery["/assets/" + name] = {
        src: "/assets/" + name,
        width: meta.width,
        height: meta.height,
        originalBytes: fs.statSync(input).size,
        deliveryBytes: fs.statSync(input).size,
      };
      continue;
    }
    fs.writeFileSync(path.join(outputDir, output), bytes);
    selected = output;
  } else fs.copyFileSync(input, path.join(outputDir, name));
  delivery["/assets/" + name] = {
    src: "/assets/" + selected,
    width: meta.width,
    height: meta.height,
    originalBytes: fs.statSync(input).size,
    deliveryBytes: fs.statSync(path.join(outputDir, selected)).size,
  };
}
fs.writeFileSync(
  "src/data/delivery.json",
  JSON.stringify(delivery, null, 2) + "\n",
);
console.log("Prepared lossless originals:", Object.keys(delivery).length);
