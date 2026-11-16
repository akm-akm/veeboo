// Zero-dependency static site builder.
// content/*.json + content/blog/*.md  ->  src/pages/*.mjs  ->  dist/**/*.html
// Run: node build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderPage } from './src/layout.mjs';
import { parseMarkdownFile } from './src/markdown.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const CONTENT_DIR = path.join(ROOT, 'content');

function loadContent() {
  const content = {};
  for (const file of fs.readdirSync(CONTENT_DIR)) {
    if (!file.endsWith('.json')) continue;
    const key = file.replace(/\.json$/, '');
    try {
      content[key] = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
    } catch (error) {
      throw new Error(`content/${file} is not valid JSON: ${error.message}`);
    }
  }
  const blogDir = path.join(CONTENT_DIR, 'blog');
  content.blog = fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => parseMarkdownFile(path.join(blogDir, file)))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return content;
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, target);
    else fs.copyFileSync(source, target);
  }
}

function bundleCss() {
  const dir = path.join(ROOT, 'src', 'styles');
  // base.css first, then every other stylesheet alphabetically.
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.css'));
  files.sort((a, b) => (a === 'base.css' ? -1 : b === 'base.css' ? 1 : a.localeCompare(b)));
  return files.map((file) => `/* ${file} */\n${fs.readFileSync(path.join(dir, file), 'utf8')}`).join('\n');
}

function outputFile(pagePath) {
  if (pagePath.endsWith('.html')) return path.join(DIST, pagePath);
  return path.join(DIST, pagePath, 'index.html');
}

async function build() {
  const content = loadContent();
  const site = content.site;
  fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(path.join(ROOT, 'public'), DIST);
  fs.writeFileSync(path.join(DIST, 'assets', 'site.css'), bundleCss());

  const pagesDir = path.join(ROOT, 'src', 'pages');
  const pages = [];
  for (const file of fs.readdirSync(pagesDir).filter((name) => name.endsWith('.mjs')).sort()) {
    const mod = await import(pathToFileURL(path.join(pagesDir, file)).href);
    const produced = mod.default({ content, site });
    for (const page of produced) {
      if (!page.path || !page.title || !page.description || typeof page.body !== 'string') {
        throw new Error(`${file}: every page needs path, title, description and body (got ${JSON.stringify(page.path)})`);
      }
      pages.push(page);
    }
  }

  const seen = new Set();
  for (const page of pages) {
    if (seen.has(page.path)) throw new Error(`Two pages share the path ${page.path}`);
    seen.add(page.path);
    const file = outputFile(page.path);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, renderPage(page, { content, site }));
  }

  const indexable = pages.filter((page) => !page.noindex && !page.path.endsWith('.html'));
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]
    .concat(indexable.map((page) => `  <url><loc>${site.url}${page.path}</loc></url>`))
    .concat(['</urlset>', ''])
    .join('\n');
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

  process.stdout.write(`Built ${pages.length} pages into dist/\n`);
}

build().catch((error) => {
  process.stderr.write(`Build failed: ${error.message}\n`);
  process.exit(1);
});
