import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = "docs";
const basePath = "/vagus-reset-coach/";
const port = 4173;

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".webmanifest": "application/manifest+json",
};

createServer((request, response) => {
  const url = new URL(
    request.url ?? basePath,
    `http://${request.headers.host}`,
  );
  if (!url.pathname.startsWith(basePath)) {
    response.writeHead(302, { Location: basePath });
    response.end();
    return;
  }

  const relative = url.pathname.slice(basePath.length) || "index.html";
  const safeRelative = normalize(relative).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = join(root, safeRelative);
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(root, "404.html");
  }

  response.writeHead(200, {
    "Content-Type": types[extname(filePath)] ?? "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(
    `Serving ${root} at http://127.0.0.1:${port}${basePath}\n`,
  );
});
