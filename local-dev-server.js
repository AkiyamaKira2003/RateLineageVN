const http = require("http");
const fs = require("fs");
const path = require("path");

const ratesHandler = require(path.join(__dirname, "api", "rates.js"));
const chartHandler = require(path.join(__dirname, "api", "chart.js"));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml"
};

function readForwardedHeader(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  return value.split(",")[0].trim();
}

function getRequestOrigin(req) {
  const forwardedProto = readForwardedHeader(req.headers["x-forwarded-proto"]);
  const proto = forwardedProto || (req.socket && req.socket.encrypted ? "https" : "http");
  const forwardedHost = readForwardedHeader(req.headers["x-forwarded-host"]);
  const host = forwardedHost || req.headers.host || "127.0.0.1";
  return `${proto}://${host}`;
}

function injectHtmlMetaTemplate(html, req, pathname) {
  const origin = getRequestOrigin(req);
  const cleanPath = pathname && pathname !== "/" ? pathname : "/";
  const publicUrl = `${origin}${cleanPath}`;
  const publicImage = `${origin}/og-preview.jpg`;

  return html
    .replace(/__PUBLIC_ORIGIN__/g, origin)
    .replace(/__PUBLIC_URL__/g, publicUrl)
    .replace(/__PUBLIC_IMAGE__/g, publicImage);
}

function wrapResponse(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      res.setHeader(name, value);
    },
    end(body) {
      res.end(body);
    },
    json(obj) {
      if (!res.getHeader("Content-Type")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      res.end(JSON.stringify(obj));
    }
  };
}

function getPort() {
  const argIndex = process.argv.findIndex((arg) => arg === "--port");
  if (argIndex >= 0 && process.argv[argIndex + 1]) {
    const parsed = Number(process.argv[argIndex + 1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 3100;
}

const port = getPort();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    const query = Object.fromEntries(url.searchParams);

    if (url.pathname === "/api/rates") {
      await ratesHandler({ method: req.method, query }, wrapResponse(res));
      return;
    }

    if (url.pathname === "/api/chart") {
      await chartHandler({ method: req.method, query }, wrapResponse(res));
      return;
    }

    const rel = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = path.join(__dirname, rel);
    if (!filePath.startsWith(__dirname)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.setHeader("X-Robots-Tag", "all, index, follow, max-image-preview:large");

    if (ext === ".html") {
      const html = fs.readFileSync(filePath, "utf8");
      const injectedHtml = injectHtmlMetaTemplate(html, req, url.pathname);
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Length", Buffer.byteLength(injectedHtml, "utf8"));
      res.end(injectedHtml);
      return;
    }

    const stat = fs.statSync(filePath);
    res.setHeader("Content-Length", stat.size);
    if (path.basename(filePath).toLowerCase().startsWith("og-preview")) {
      res.setHeader("Cache-Control", "public, max-age=300");
    }

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(`Server error: ${String(err)}`);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Local server running on http://127.0.0.1:${port}`);
});
