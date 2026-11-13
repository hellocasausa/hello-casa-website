import fs from "node:fs";
import assert from "node:assert/strict";
import postcss from "postcss";
const styles = fs.readdirSync("src/styles").filter((n) => n.endsWith(".css"));
let important = 0;
const actualExceptions = new Set();
const normalize = (s) => s.replace(/\s+/g, "");
const key = (file, selector, property, scope) =>
  [file, normalize(selector), property, normalize(scope)].join("|");
const faces = new Set();
for (const file of styles) {
  const root = postcss.parse(fs.readFileSync("src/styles/" + file, "utf8"));
  root.walkDecls((d) => {
    if (d.important) {
      important++;
      actualExceptions.add(
        key(
          file,
          d.parent.selector,
          d.prop,
          d.parent.parent.type === "atrule" ? d.parent.parent.params : "base",
        ),
      );
    }
  });
  root.walkAtRules("font-face", (r) => {
    const values = Object.fromEntries(
      r.nodes.filter((n) => n.type === "decl").map((n) => [n.prop, n.value]),
    );
    const key = JSON.stringify(Object.entries(values).sort());
    assert(!faces.has(key), "Duplicate font face");
    faces.add(key);
  });
}
const ledger = JSON.parse(
  fs.readFileSync("docs/performance/css-exceptions.json"),
);
assert.deepEqual(
  actualExceptions,
  new Set(ledger.map((e) => key(e.file, e.selector, e.property, e.scope))),
  "Unreviewed priority declaration or scope",
);
assert.equal(
  important,
  JSON.parse(fs.readFileSync("docs/performance/css-exceptions.json")).length,
  "Priority exceptions must be explicitly reviewed in the ledger",
);
assert(
  !fs.readFileSync("src/style.css", "utf8").includes("source-authored"),
  "Historical stylesheet must not reenter the build",
);
const first = fs.readFileSync("index.html", "utf8");
await import("./build-page.ts?determinism-check");
assert.equal(
  fs.readFileSync("index.html", "utf8"),
  first,
  "HTML export must be deterministic",
);
assert(
  !/data-hc-target|hc-card-topline|data-design-version/.test(first),
  "Obsolete source/editor hooks must not leak into output",
);
for (const n of [
  "header",
  "hero",
  "steps",
  "services",
  "standards",
  "contact",
  "footer",
])
  assert(fs.existsSync(`src/components/markup/${n}.html`));
console.log({
  componentStyles: styles.length,
  priorityExceptions: important,
  fontFaces: faces.size,
  deterministicHTML: true,
});
