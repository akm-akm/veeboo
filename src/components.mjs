// Shared HTML building blocks. Every function returns a string of HTML.
// Page files in src/pages/ compose these; styles live in src/styles/base.css.
import fs from 'node:fs';
import { esc } from './markdown.mjs';

export { esc };

const ICONS = JSON.parse(fs.readFileSync(new URL('./icons.json', import.meta.url), 'utf8'));

// Lucide icons (ISC licence), vendored in src/icons.json.
export function icon(name, size = 20) {
  if (!ICONS[name]) throw new Error(`Unknown icon "${name}". Available: ${Object.keys(ICONS).join(', ')}`);
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

// variant: primary | ghost | light (for dark backgrounds) | text
export function button(label, href, variant = 'primary') {
  return `<a class="btn btn--${variant}" href="${esc(href)}">${esc(label)}</a>`;
}

export function auditButton(site, variant = 'primary') {
  return button(site.cta.label, site.cta.href, variant);
}

// The small marker that keeps placeholder proof honest until real results replace it.
export function sampleTag(label = 'Sample') {
  return '';
}

// Header block for every inner page.
// crumbs: [{ label, href }]   aside: optional HTML shown beside the title on wide screens
export function pageHero({ title, lede, crumbs = [], actions = '', aside = '' }) {
  const trail = crumbs.length
    ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a>${crumbs
        .map((crumb) => (crumb.href ? `<a href="${esc(crumb.href)}">${esc(crumb.label)}</a>` : `<span aria-current="page">${esc(crumb.label)}</span>`))
        .join('')}</nav>`
    : '';
  return `<section class="page-hero">
  <div class="container page-hero__grid${aside ? ' page-hero__grid--split' : ''}">
    <div>
      ${trail}
      <h1 class="page-hero__title">${esc(title)}</h1>
      ${lede ? `<p class="lede">${esc(lede)}</p>` : ''}
      ${actions ? `<div class="actions">${actions}</div>` : ''}
    </div>
    ${aside ? `<div class="page-hero__aside">${aside}</div>` : ''}
  </div>
</section>`;
}

// A standard content section. tone: '' | 'tint' | 'ink'
export function section({ id = '', tone = '', title = '', lede = '', body, narrow = false }) {
  const head = title
    ? `<header class="section__head"><h2 class="h2">${esc(title)}</h2>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}</header>`
    : '';
  return `<section class="section${tone ? ` section--${tone}` : ''}"${id ? ` id="${esc(id)}"` : ''}>
  <div class="container${narrow ? ' container--narrow' : ''}">
    ${head}
    ${body}
  </div>
</section>`;
}

// The signature element: results set out like a ledger, costs against returns.
// rows: [{ label, value, note? }]   total: optional { label, value }
export function ledger({ caption = '', rows, total = null, sample = false }) {
  return `<div class="ledger">
  ${caption ? `<div class="ledger__caption"><span>${esc(caption)}</span>${sample ? sampleTag() : ''}</div>` : ''}
  <dl class="ledger__rows">
    ${rows
      .map(
        (row) => `<div class="ledger__row"><dt>${esc(row.label)}${row.note ? `<small>${esc(row.note)}</small>` : ''}</dt><dd>${esc(row.value)}</dd></div>`,
      )
      .join('\n    ')}
  </dl>
  ${total ? `<div class="ledger__total"><span>${esc(total.label)}</span><strong>${esc(total.value)}</strong></div>` : ''}
</div>`;
}

// A timeline of what an automation did, minute by minute.
// events: [{ time, who, text }]  who: 'customer' | 'ai' | 'team' | 'system'
export function runlog({ title, events, footer = '' }) {
  return `<div class="runlog">
  <div class="runlog__title">${esc(title)}</div>
  <ol class="runlog__events">
    ${events
      .map(
        (event) =>
          `<li class="runlog__event runlog__event--${esc(event.who)}"><time>${esc(event.time)}</time><p>${esc(event.text)}</p></li>`,
      )
      .join('\n    ')}
  </ol>
  ${footer ? `<div class="runlog__footer">${esc(footer)}</div>` : ''}
</div>`;
}

// A phone-style chat mock, for showing WhatsApp / SMS / web-chat conversations.
// messages: [{ from: 'them' | 'us', text, time? }]
export function chatMock({ title, subtitle = '', messages }) {
  return `<figure class="chat-mock" aria-label="Example conversation: ${esc(title)}">
  <div class="chat-mock__bar"><span class="chat-mock__avatar">${icon('bot', 16)}</span><div><strong>${esc(title)}</strong>${subtitle ? `<small>${esc(subtitle)}</small>` : ''}</div></div>
  <div class="chat-mock__body">
    ${messages
      .map(
        (message) =>
          `<p class="chat-mock__msg chat-mock__msg--${esc(message.from)}">${esc(message.text)}${message.time ? `<time>${esc(message.time)}</time>` : ''}</p>`,
      )
      .join('\n    ')}
  </div>
</figure>`;
}

// A workflow diagram mock: connected steps, wraps to a column on phones.
// nodes: [{ icon, label, sub? }]
export function flowMock({ title = '', nodes }) {
  return `<figure class="flow-mock"${title ? ` aria-label="${esc(title)}"` : ''}>
  ${title ? `<figcaption>${esc(title)}</figcaption>` : ''}
  <ol class="flow-mock__nodes">
    ${nodes
      .map(
        (node) =>
          `<li class="flow-mock__node"><span class="flow-mock__icon">${icon(node.icon, 18)}</span><span><strong>${esc(node.label)}</strong>${node.sub ? `<small>${esc(node.sub)}</small>` : ''}</span></li>`,
      )
      .join('\n    ')}
  </ol>
</figure>`;
}

// Numbered steps. Only for content that really is a sequence.
// items: [{ title, text, meta? }]
export function steps(items) {
  return `<ol class="steps">
  ${items
    .map(
      (item) =>
        `<li class="steps__item"><h3 class="h3">${esc(item.title)}</h3><p>${esc(item.text)}</p>${item.meta ? `<p class="steps__meta">${esc(item.meta)}</p>` : ''}</li>`,
    )
    .join('\n  ')}
</ol>`;
}

// items: [{ q, a }]
export function faq(items) {
  return `<div class="faq">
  ${items
    .map((item) => `<details class="faq__item"><summary>${esc(item.q)}</summary><div class="faq__answer"><p>${esc(item.a)}</p></div></details>`)
    .join('\n  ')}
</div>`;
}

// testimonial: { quote, name, role, company, sample? }
export function quoteCard(testimonial) {
  return `<figure class="quote">
  <blockquote><p>${esc(testimonial.quote)}</p></blockquote>
  <figcaption><span class="quote__avatar" aria-hidden="true">${esc(testimonial.name.slice(0, 1))}</span><span><strong>${esc(testimonial.name)}</strong><small>${esc(testimonial.role)}, ${esc(testimonial.company)}</small></span>${testimonial.sample ? sampleTag() : ''}</figcaption>
</figure>`;
}

// A list with check marks. items: string[]
export function checkList(items) {
  return `<ul class="check-list">${items.map((item) => `<li>${icon('check', 18)}<span>${esc(item)}</span></li>`).join('')}</ul>`;
}

// Card linking to a case study. Uses case-studies.json fields.
export function caseCard(study, industryName = '') {
  const metrics = (study.results || []).slice(0, 2);
  return `<a class="case-card" href="/case-studies/${esc(study.slug)}/">
  <div class="case-card__meta"><span>${esc(industryName || study.clientType)}</span>${study.sample ? sampleTag() : ''}</div>
  <h3 class="h3">${esc(study.title)}</h3>
  <p>${esc(study.summary)}</p>
  <dl class="case-card__metrics">${metrics.map((metric) => `<div><dd>${esc(metric.value)}</dd><dt>${esc(metric.label)}</dt></div>`).join('')}</dl>
  <span class="case-card__more">See the full example ${icon('arrow-up-right', 16)}</span>
</a>`;
}

// Closing call to action. Rendered on every page by the layout unless the page sets noCta.
export function ctaBand(site) {
  return `<section class="cta-band">
  <div class="container cta-band__grid">
    <div>
      <h2 class="h2">${esc(site.cta.bandTitle)}</h2>
      <p>${esc(site.cta.bandText)}</p>
    </div>
    <div class="cta-band__actions">
      ${auditButton(site, 'light')}
      <a class="cta-band__link" href="/pricing/">See pricing first</a>
    </div>
  </div>
</section>`;
}
