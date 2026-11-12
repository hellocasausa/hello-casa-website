import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const walk = (p) =>
  fs
    .readdirSync(p, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(p, e.name)) : [path.join(p, e.name)],
    );
for (const [label, build] of [
  ["before", process.argv[2] || ".artifacts/approved-dist"],
  ["after", "dist"],
]) {
  const p = `docs/performance/${label}.json`;
  if (!fs.existsSync(p)) continue;
  const d = JSON.parse(fs.readFileSync(p));
  const all = walk(build);
  for (const [type, re] of Object.entries({
    html: /\.html$/,
    css: /\.css$/,
    js: /\.js$/,
    image: /\.(png|jpg|webp|svg)$/,
    font: /\.woff2$/,
  })) {
    const a = all.filter((f) => re.test(f));
    d.files[type] = {
      count: a.length,
      raw: a.reduce((s, f) => s + fs.statSync(f).size, 0),
      gzip: a.reduce((s, f) => s + zlib.gzipSync(fs.readFileSync(f)).length, 0),
    };
  }
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
}
const b = JSON.parse(fs.readFileSync("docs/performance/before.json")),
  a = JSON.parse(fs.readFileSync("docs/performance/after.json"));
const median = (n) => n.sort((a, b) => a - b)[Math.floor(n.length / 2)];
let lines = [
  "# Phase B.3 measured results",
  "",
  "Approved checkpoint: `e5953f2d0d4375daf5a8462c9343d71785e5f81b`. All sizes below are bytes; gzip is an encoded-size estimate for text, not source size.",
  "",
  "| Production resource | Before raw | After raw | Before gzip | After gzip |",
  "| --- | ---: | ---: | ---: | ---: |",
];
for (const k of ["html", "css", "js", "image", "font"])
  lines.push(
    `| ${k} | ${b.files[k].raw} | ${a.files[k].raw} | ${["image", "font"].includes(k) ? "—" : b.files[k].gzip} | ${["image", "font"].includes(k) ? "—" : a.files[k].gzip} |`,
  );
lines.push(
  "",
  "Initial cold first-party measurements (no scrolling; median of three local samples):",
  "",
  "| Width | Before response bodies | After response bodies | Before transfer incl. header estimate | After transfer | Before LCP ms | After LCP ms | Before CLS | After CLS |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
);
for (const w of [390, 820, 1440]) {
  const calc = (d, key) =>
    median(
      d.loads
        .filter((l) => l.width === w)
        .map((l) =>
          key === "body"
            ? l.navigation.encoded +
              l.resources.reduce((s, r) => s + r.encoded, 0)
            : key === "transfer"
              ? l.navigation.transfer +
                l.resources.reduce((s, r) => s + r.transfer, 0)
              : l.vitals[key],
        ),
    );
  lines.push(
    `| ${w} | ${calc(b, "body")} | ${calc(a, "body")} | ${calc(b, "transfer")} | ${calc(a, "transfer")} | ${calc(b, "lcp")} | ${calc(a, "lcp")} | ${calc(b, "cls").toFixed(6)} | ${calc(a, "cls").toFixed(6)} |`,
  );
}
const lh = {};
for (const n of ["before", "after"]) {
  const p = `.artifacts/lighthouse-${n}.json`;
  if (fs.existsSync(p)) {
    const d = JSON.parse(fs.readFileSync(p));
    lh[n] = {
      version: d.lighthouseVersion,
      score: d.categories.performance.score,
      settings: {
        formFactor: d.configSettings.formFactor,
        throttlingMethod: d.configSettings.throttlingMethod,
        throttling: d.configSettings.throttling,
      },
      audits: Object.fromEntries(
        [
          "first-contentful-paint",
          "largest-contentful-paint",
          "cumulative-layout-shift",
          "total-blocking-time",
          "speed-index",
        ].map((k) => [k, d.audits[k].numericValue]),
      ),
    };
  }
}
fs.writeFileSync(
  "docs/performance/lighthouse.json",
  JSON.stringify(lh, null, 2) + "\n",
);
lines.push(
  "",
  "Lighthouse: one bounded mobile simulated-throttling run per version; external HTTPS/Jotform blocked. See `lighthouse.json` for exact version, settings and audit values. These are lab results, not field Core Web Vitals or INP. Native lazy loading can prefetch near-below-fold art; do not infer savings from a loading attribute alone.",
  "",
);
fs.writeFileSync("docs/performance/results.md", lines.join("\n"));

const auditKeys = [
  "first-contentful-paint",
  "largest-contentful-paint",
  "cumulative-layout-shift",
  "total-blocking-time",
  "speed-index",
];
if (lh.before && lh.after) {
  const rows = [
    "",
    "Mobile Lighthouse lab sample (external provider excluded):",
    "",
    "| Metric | Before | After |",
    "| --- | ---: | ---: |",
    `| Performance score | ${Math.round(lh.before.score * 100)} | ${Math.round(lh.after.score * 100)} |`,
    ...auditKeys.map(
      (k) =>
        `| ${k} | ${lh.before.audits[k].toFixed(k === "cumulative-layout-shift" ? 6 : 1)} | ${lh.after.audits[k].toFixed(k === "cumulative-layout-shift" ? 6 : 1)} |`,
    ),
    "",
    "Times are milliseconds. LCP remains an optimization opportunity under simulated mobile conditions. Single-run score differences are not a production performance guarantee.",
    "",
  ];
  fs.appendFileSync("docs/performance/results.md", rows.join("\n"));
}
