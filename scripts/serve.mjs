import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const requestedRoot = process.argv[2] || '.';
const port = Number(process.argv[3] || process.env.PORT || 4173);
const root = resolve(process.cwd(), requestedRoot);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon' };

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const decoded = decodeURIComponent(url.pathname);
    let path = normalize(join(root, decoded));
    if (!path.startsWith(root)) throw new Error('Invalid path');
    try { if ((await stat(path)).isDirectory()) path = join(path, 'index.html'); } catch (_) {
      if (!extname(path)) path = join(path, 'index.html');
    }
    await access(path);
    res.writeHead(200, { 'Content-Type': mime[extname(path).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-cache' });
    createReadStream(path).pipe(res);
  } catch (_) {
    res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Infinity CMS preview: http://127.0.0.1:${port}/admin/`));
