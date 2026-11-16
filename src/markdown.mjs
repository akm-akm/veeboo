// Small Markdown renderer for blog posts: front matter, headings, paragraphs,
// lists, blockquotes, fenced code, and inline bold / italic / code / links.
import fs from 'node:fs';
import path from 'node:path';

export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text) {
  return esc(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

export function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let paragraph = [];
  let list = null;
  let quote = [];

  function flush() {
    if (paragraph.length) out.push(`<p>${inline(paragraph.join(' '))}</p>`);
    paragraph = [];
    if (list) out.push(`<${list.tag}>${list.items.map((item) => `<li>${inline(item)}</li>`).join('')}</${list.tag}>`);
    list = null;
    if (quote.length) out.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`);
    quote = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith('```')) {
      flush();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
      continue;
    }
    const heading = /^(#{2,4})\s+(.*)$/.exec(line);
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (bullet || numbered) {
      const tag = bullet ? 'ul' : 'ol';
      if (paragraph.length || quote.length || (list && list.tag !== tag)) flush();
      if (!list) list = { tag, items: [] };
      list.items.push((bullet || numbered)[1]);
    } else if (line.startsWith('>')) {
      if (paragraph.length || list) flush();
      quote.push(line.replace(/^>\s?/, ''));
    } else if (line.trim() === '') {
      flush();
    } else if (list && /^\s+\S/.test(line)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`;
    } else {
      if (list || quote.length) flush();
      paragraph.push(line.trim());
    }
  }
  flush();
  return out.join('\n');
}

// Front matter is a block of `key: value` lines between two `---` lines.
export function parseMarkdownFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!match) throw new Error(`${path.basename(file)} needs front matter (--- title: ... ---)`);
  const meta = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    meta[line.slice(0, colon).trim()] = line
      .slice(colon + 1)
      .trim()
      .replace(/^"(.*)"$/, '$1');
  }
  for (const key of ['title', 'description', 'date']) {
    if (!meta[key]) throw new Error(`${path.basename(file)} front matter is missing "${key}"`);
  }
  const words = match[2].split(/\s+/).filter(Boolean).length;
  return Object.assign({ slug: path.basename(file, '.md'), readMinutes: Math.max(1, Math.round(words / 220)) }, meta, {
    html: renderMarkdown(match[2]),
  });
}
