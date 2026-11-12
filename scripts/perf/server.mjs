import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const root = path.resolve(process.argv[2] || "dist"),
  port = Number(process.argv[3] || 4173);
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};
http
  .createServer((req, res) => {
    const file = path.resolve(
      root,
      "." +
        decodeURIComponent(
          new URL(req.url, "http://localhost").pathname,
        ).replace(/\/$/, "/index.html"),
    );
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    let bytes = fs.readFileSync(file),
      headers = {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      };
    if (
      /\.(html|css|js|svg)$/.test(file) &&
      req.headers["accept-encoding"]?.includes("gzip")
    ) {
      bytes = zlib.gzipSync(bytes);
      headers["Content-Encoding"] = "gzip";
      headers.Vary = "Accept-Encoding";
    }
    headers["Content-Length"] = bytes.length;
    res.writeHead(200, headers);
    res.end(bytes);
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Production fixture: http://127.0.0.1:${port}`),
  );
