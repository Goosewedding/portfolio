/* ============================================================
   DEV SERVER — serves the portfolio and lists builder images
   Run with: node server.js
   Then open: http://localhost:3000
   ============================================================ */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT       = 3000;
const ROOT       = __dirname;
const IMAGES_DIR = path.join(ROOT, 'images', 'page builder images');

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.otf':  'font/otf',
  '.ttf':  'font/ttf',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = decodeURIComponent(req.url.split('?')[0]);

  // ── API: list builder images ──────────────────────────────
  if (url === '/api/images') {
    fs.readdir(IMAGES_DIR, (err, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Could not read images folder' }));
        return;
      }

      const images = files
        .filter(f => /\.(png|jpe?g|gif|webp|svg)$/i.test(f))
        .map(f => ({
          name: f,
          src:  'images/page%20builder%20images/' + encodeURIComponent(f),
        }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(images));
    });
    return;
  }

  // ── Static file serving ───────────────────────────────────
  let filePath = path.join(ROOT, url === '/' ? 'index.html' : url);

  fs.stat(filePath, (err, stat) => {
    // If it's a directory, serve index.html inside it
    if (!err && stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      const ext  = path.extname(filePath).toLowerCase();
      const mime = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  console.log(`Images API at     http://localhost:${PORT}/api/images`);
});
