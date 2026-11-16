// /services/ : one page, one section per service. Copy lives in content/services.json
// (per service) and content/services-page.json (hero, labels, FAQ).
import { auditButton, button, chatMock, checkList, esc, faq, flowMock, icon, ledger, pageHero, runlog, sampleTag, section } from '../components.mjs';

function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));
}

function mockHtml(mock) {
  if (mock.type === 'flow') return flowMock({ title: mock.title, nodes: mock.nodes });
  if (mock.type === 'chat') return chatMock({ title: mock.title, subtitle: mock.subtitle, messages: mock.messages });
  if (mock.type === 'runlog') return runlog({ title: mock.title, events: mock.events, footer: mock.footer });
  if (mock.type === 'ledger') return ledger({ caption: mock.caption, rows: mock.rows, total: mock.total, sample: true });
  throw new Error(`services.json: unknown mock type "${mock.type}"`);
}

function visual(service, labels) {
  const mock = service.mock;
  // The ledger carries its own Sample marker in the caption; the others get one in the note.
  const tag = mock.type === 'ledger' ? '' : sampleTag(labels.illustrative);
  return `<div class="services-visual services-visual--${esc(mock.type)}">
  ${mockHtml(mock)}
  <p class="services-visual__note">${tag}<span>${esc(mock.note)}</span></p>
</div>`;
}

function startsFromValue(service, tiers, labels) {
  const from = service.startsFrom;
  if (from.text) return from.text;
  const tier = tiers.find((item) => item.slug === from.tier);
  if (!tier) return labels.startsFromFallback;
  return fill(labels.startsFromFormat, { setup: tier.setupFee, monthly: tier.monthly });
}

function block(title, body) {
  return `<div class="services-block"><h3 class="services-block__title">${esc(title)}</h3>${body}</div>`;
}

function serviceSection(service, index, tiers, labels) {
  const blocks = [block(labels.audience, `<p>${esc(service.audience)}</p>`)];
  if (service.automations) {
    blocks.push(
      block(
        labels.automations,
        `<ul class="services-autos">${service.automations
          .map((item) => `<li><strong>${esc(item.name)}</strong><span>${esc(item.text)}</span></li>`)
          .join('')}</ul>`,
      ),
    );
  }
  if (service.agenda) {
    blocks.push(
      block(
        labels.agenda,
        `<ol class="services-agenda">${service.agenda
          .map((item) => `<li><span class="services-agenda__time num">${esc(item.time)}</span><div><strong>${esc(item.title)}</strong><p>${esc(item.text)}</p></div></li>`)
          .join('')}</ol>`,
      ),
    );
  }
  if (service.planContents) blocks.push(block(labels.planContents, checkList(service.planContents)));
  blocks.push(block(labels.deliverables, checkList(service.deliverables)));

  const terms = ledger({
    rows: [
      { label: labels.timeline, note: service.timeline.note, value: service.timeline.value },
      { label: labels.startsFrom, note: service.startsFrom.note, value: startsFromValue(service, tiers, labels) },
    ],
  });

  return `<section class="services-item${index % 2 ? ' services-item--flip' : ''}" id="${esc(service.slug)}">
  <div class="container services-item__grid">
    <div class="services-item__text">
      <header class="services-item__head">
        <span class="card__icon">${icon(service.icon, 22)}</span>
        <h2 class="h2">${esc(service.name)}</h2>
        <p class="lede">${esc(service.short)}</p>
      </header>
      ${blocks.join('\n      ')}
      <div class="services-terms">
        ${terms}
        <a class="services-terms__link" href="/pricing/">${esc(labels.pricingLink)}</a>
      </div>
    </div>
    <div class="services-item__visual">${visual(service, labels)}</div>
  </div>
</section>`;
}

export default function pages({ content, site }) {
  const services = content.services;
  const page = content['services-page'];
  const tiers = (content.pricing || {}).tiers || [];
  const labels = page.labels;

  const jump = `<nav class="services-jump" aria-label="${esc(labels.jump)}">
  <div class="container">
    <ul class="services-jump__list">${services
      .map((service) => `<li><a href="#${esc(service.slug)}">${icon(service.icon, 18)}<span>${esc(service.name)}</span></a></li>`)
      .join('')}</ul>
  </div>
</nav>`;

  const body = [
    pageHero({
      title: page.hero.title,
      lede: page.hero.lede,
      crumbs: [{ label: page.meta.title }],
      actions: auditButton(site) + button(page.hero.pricingButton, '/pricing/', 'ghost'),
    }),
    jump,
    services.map((service, index) => serviceSection(service, index, tiers, labels)).join('\n'),
    section({ id: 'faq', tone: 'tint', title: page.faq.title, narrow: true, body: faq(page.faq.items) }),
  ].join('\n');

  return [
    {
      path: '/services/',
      title: page.meta.title,
      description: page.meta.description,
      body,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    },
  ];
}
