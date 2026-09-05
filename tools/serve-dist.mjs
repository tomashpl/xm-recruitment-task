import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const ROOT = resolve('dist/gallery-template/browser');
const PORT = Number(process.env['PORT'] ?? 4300);

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

if (!existsSync(ROOT)) {
  console.error(`Missing ${ROOT}. Run "npm run build" first.`);
  process.exit(1);
}

const fallback = join(ROOT, 'index.html');

function resolveFile(pathname) {
  let decoded;

  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return fallback;
  }

  const candidate = join(ROOT, normalize(decoded));

  if (candidate !== ROOT && !candidate.startsWith(ROOT + sep)) {
    return fallback;
  }

  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    const directoryIndex = join(candidate, 'index.html');

    return existsSync(directoryIndex) && statSync(directoryIndex).isFile()
      ? directoryIndex
      : fallback;
  }

  return existsSync(candidate) && statSync(candidate).isFile() ? candidate : fallback;
}

createServer((request, response) => {
  const file = resolveFile(new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`).pathname);

  response.writeHead(200, {
    'Content-Type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });

  createReadStream(file)
    .on('error', () => response.destroy())
    .pipe(response);
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Serving ${ROOT} on http://127.0.0.1:${PORT}`);
});
