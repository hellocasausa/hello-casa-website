import fs from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
const [before = ".artifacts/before", after = ".artifacts/after"] =
    process.argv.slice(2),
  results = [];
let failed = false;
for (const name of fs.readdirSync(before).filter((f) => f.endsWith(".png"))) {
  const a = PNG.sync.read(fs.readFileSync(before + "/" + name)),
    b = PNG.sync.read(fs.readFileSync(after + "/" + name));
  if (a.width !== b.width || a.height !== b.height) {
    results.push({
      name,
      error: "dimensions",
      before: [a.width, a.height],
      after: [b.width, b.height],
    });
    failed = true;
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const pixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
    threshold: 0.1,
  });
  results.push({ name, pixels, total: a.width * a.height });
  if (pixels) {
    PNG.sync.write(diff);
    fs.writeFileSync(".artifacts/diff-" + name, PNG.sync.write(diff));
    failed = true;
  }
}
fs.writeFileSync(
  "docs/performance/visual-comparison.json",
  JSON.stringify(results, null, 2) + "\n",
);
console.log({
  images: results.length,
  failed: results.filter((r) => r.pixels || r.error),
});
if (failed) process.exitCode = 1;
