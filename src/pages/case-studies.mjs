// /case-studies/ listing and /case-studies/<slug>/ detail pages.
// Copy lives in content/case-studies.json and content/work-page.json.
import {
  pageHero,
  section,
  ledger,
  runlog,
  chatMock,
  flowMock,
  steps,
  quoteCard,
  caseCard,
  sampleTag,
  button,
  icon,
  esc,
} from '../components.mjs';

function nameOf(list, slug) {
  const match = (list || []).find((item) => item.slug === slug);
  return match ? match.name : slug;
}

function money(currency, amount) {
  return `${currency}${amount.toLocaleString('en-US')}`;
}

function paragraphs(list) {
  return (list || []).map((text) => `<p>${esc(text)}</p>`).join('\n');
}

/* ---------- Mock screens ---------- */

function tableCell(cell, label) {
  const inner = typeof cell === 'string' ? esc(cell) : `<span class="study-pill study-pill--${esc(cell.tone || 'plain')}">${esc(cell.pill)}</span>`;
  return `<td data-label="${esc(label)}">${inner}</td>`;
}

function tableMock(screen) {
  return `<table class="study-table">
  <thead><tr>${screen.columns.map((column) => `<th scope="col">${esc(column)}</th>`).join('')}</tr></thead>
  <tbody>${screen.rows.map((row) => `<tr>${row.map((cell, index) => tableCell(cell, screen.columns[index])).join('')}</tr>`).join('')}</tbody>
</table>`;
}

function dashboardMock(screen) {
  const bars = screen.bars || [];
  const max = Math.max.apply(null, bars.map((bar) => bar.value).concat([1]));
  return `<div class="study-dash">
  <dl class="study-dash__stats">${(screen.stats || []).map((stat) => `<div><dd>${esc(stat.value)}</dd><dt>${esc(stat.label)}</dt></div>`).join('')}</dl>
  ${
    bars.length
      ? `<div class="study-dash__bars"><p class="study-dash__title">${esc(screen.barsTitle || '')}</p><ul>${bars
          .map(
            (bar) =>
              `<li><span class="study-dash__label">${esc(bar.label)}</span><span class="study-dash__track"><span style="width:${Math.round((bar.value / max) * 100)}%"></span></span><span class="study-dash__value">${esc(String(bar.value))}</span></li>`,
          )
          .join('')}</ul></div>`
      : ''
  }
</div>`;
}

function screenContent(screen) {
  if (screen.kind === 'chat') return chatMock({ title: screen.title, subtitle: screen.subtitle, messages: screen.messages });
  if (screen.kind === 'runlog') return runlog({ title: screen.title, events: screen.events, footer: screen.footer });
  if (screen.kind === 'ledger') return ledger({ caption: screen.ledgerCaption, rows: screen.rows, total: screen.total });
  if (screen.kind === 'dashboard') return dashboardMock(screen);
  return tableMock(screen);
}

// screen.ownerNote is a note for the site owner and is deliberately not rendered.
function screenFigure(screen, copy) {
  const phone = screen.frame === 'phone';
  const frame = phone
    ? `<div class="study-frame study-frame--phone"><span class="study-frame__notch"></span>${screenContent(screen)}</div>`
    : `<div class="study-frame study-frame--browser">
    <div class="study-frame__bar"><span class="study-frame__dots"><i></i><i></i><i></i></span>${screen.address ? `<span class="study-frame__address">${esc(screen.address)}</span>` : ''}</div>
    <div class="study-frame__body">${screenContent(screen)}</div>
  </div>`;
  return `<figure class="study-screen study-screen--${esc(screen.kind)}">
  ${frame}
  <figcaption><span class="study-screen__label">${esc(copy.mockLabel)}</span>${esc(screen.caption)}</figcaption>
</figure>`;
}

/* ---------- Detail page ---------- */

function paybackLedger(study, copy) {
  const costs = study.costs;
  if (!costs) return '';
  const net = costs.monthlyValue - costs.retainer;
  const months = Math.ceil((costs.setupFee / net) * 10) / 10;
  const unit = months === 1 ? copy.paybackUnitOne : copy.paybackUnitMany;
  return `${ledger({
    caption: copy.paybackCaption,
    sample: true,
    rows: [
      { label: copy.setupLabel, note: copy.setupNote, value: money(costs.currency, costs.setupFee) },
      { label: copy.retainerLabel, note: copy.retainerNote, value: money(costs.currency, costs.retainer) },
      { label: copy.valueLabel, note: costs.valueBasis, value: money(costs.currency, costs.monthlyValue) },
      { label: copy.netLabel, note: copy.netNote, value: money(costs.currency, net) },
    ],
    total: { label: copy.paybackLabel, value: `${months} ${unit}` },
  })}
<p class="study-payback__note">${esc(copy.paybackNote)}</p>`;
}

function beforeAfterTable(study, copy) {
  return `<table class="study-compare">
  <caption>${esc(copy.beforeAfterCaption)}${study.sample ? sampleTag() : ''}</caption>
  <thead><tr><th scope="col">${esc(copy.measureHeading)}</th><th scope="col">${esc(copy.beforeHeading)}</th><th scope="col">${esc(copy.afterHeading)}</th></tr></thead>
  <tbody>${(study.beforeAfter || [])
    .map(
      (row) =>
        `<tr><th scope="row">${esc(row.measure)}</th><td data-label="${esc(copy.beforeHeading)}">${esc(row.before)}</td><td data-label="${esc(copy.afterHeading)}" class="study-compare__after">${esc(row.after)}</td></tr>`,
    )
    .join('')}</tbody>
</table>`;
}

function neighbourLink(study, label, direction) {
  return `<a class="study-nav__link study-nav__link--${direction}" href="/case-studies/${esc(study.slug)}/"><small>${esc(label)}</small><strong>${esc(study.title)}</strong></a>`;
}

function detailPage(study, index, studies, { content, site, copy, regions }) {
  const industryName = nameOf(content.industries, study.industry);
  const regionName = regions[study.region] || study.region;
  const serviceTags = (study.services || []).map((slug) => `<span class="tag tag--plain">${esc(nameOf(content.services, slug))}</span>`).join('');
  const solution = study.solution || {};
  const previous = studies[(index - 1 + studies.length) % studies.length];
  const next = studies[(index + 1) % studies.length];
  const url = `${site.url}/case-studies/${study.slug}/`;

  const facts = [
    { label: copy.facts.client, value: study.clientType },
    { label: copy.facts.team, value: study.teamSize },
    { label: copy.facts.region, value: regionName },
    { label: copy.facts.timeline, value: study.duration },
    { label: copy.facts.stack, value: (study.stack || []).join(', ') },
  ].filter((fact) => fact.value);

  const body = `${pageHero({
    title: study.title,
    lede: study.summary,
    crumbs: [{ label: 'Example projects', href: '/case-studies/' }, { label: industryName }],
    actions: `<div class="tags study-tags"><span class="tag">${esc(industryName)}</span>${serviceTags}<span class="tag tag--plain">${icon('globe', 14)}${esc(study.region)}</span>${study.sample ? sampleTag() : ''}</div>`,
    aside: ledger({ caption: copy.resultsCaption, rows: study.results || [], sample: study.sample }),
  })}
<div class="container">
  <dl class="study-facts">${facts.map((fact) => `<div><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}</dd></div>`).join('')}</dl>
</div>
<section class="section">
  <div class="container study-cols">
    <h2 class="h2">${esc(copy.problemTitle)}</h2>
    <div class="study-prose">${paragraphs(study.problem)}</div>
  </div>
</section>
<section class="section section--tint">
  <div class="container">
    <div class="study-cols">
      <h2 class="h2">${esc(copy.solutionTitle)}</h2>
      <div class="study-prose">
        ${paragraphs(solution.paragraphs)}
        ${
          (solution.automations || []).length
            ? `<h3 class="h3 study-prose__sub">${esc(copy.automationsTitle)}</h3>
        <dl class="study-automations">${solution.automations.map((item) => `<div><dt>${esc(item.name)}</dt><dd>${esc(item.what)}</dd></div>`).join('')}</dl>`
            : ''
        }
      </div>
    </div>
    ${solution.flow ? `<div class="study-flow">${flowMock(solution.flow)}</div>` : ''}
  </div>
</section>
${
  (study.screens || []).length
    ? section({
        title: copy.screensTitle,
        lede: copy.screensLede,
        body: `<div class="study-screens">${study.screens.map((screen) => screenFigure(screen, copy)).join('\n')}</div>`,
      })
    : ''
}
${section({
  tone: 'tint',
  title: copy.resultsTitle,
  body: `<div class="study-results">
  <div>${beforeAfterTable(study, copy)}</div>
  <div class="study-payback">${paybackLedger(study, copy)}</div>
</div>`,
})}
${section({
  tone: 'ink',
  title: copy.timelineTitle,
  lede: copy.timelineLede,
  body: steps((study.timeline || []).map((item) => ({ title: item.phase, text: item.what, meta: item.duration }))),
})}
<section class="section">
  <div class="container study-close">
    ${study.quote ? `<div class="study-quote"><h2 class="h2">${esc(copy.quoteTitle)}</h2>${quoteCard(study.quote)}</div>` : ''}
    <nav class="study-nav" aria-label="${esc(copy.nextTitle)}">
      <h2 class="h3">${esc(copy.nextTitle)}</h2>
      <div class="study-nav__pair">
        ${neighbourLink(previous, copy.previousLabel, 'prev')}
        ${neighbourLink(next, copy.nextLabel, 'next')}
      </div>
      <div class="actions">
        ${button(`${copy.industryLabel}: ${industryName}`, `/industries/${study.industry}/`, 'ghost')}
        ${button(copy.allLabel, '/case-studies/', 'text')}
      </div>
    </nav>
  </div>
</section>`;

  return {
    path: `/case-studies/${study.slug}/`,
    title: study.title,
    description: study.metaDescription || study.summary,
    ogType: 'article',
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: study.title,
          description: study.metaDescription || study.summary,
          articleSection: industryName,
          mainEntityOfPage: url,
          url,
          author: { '@type': 'Organization', name: site.name, url: site.url },
          publisher: { '@type': 'Organization', name: site.name, url: site.url },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
            { '@type': 'ListItem', position: 2, name: 'Example projects', item: `${site.url}/case-studies/` },
            { '@type': 'ListItem', position: 3, name: study.title, item: url },
          ],
        },
      ],
    },
  };
}

/* ---------- Listing ---------- */

function listingPage(studies, { content, site, copy }) {
  const featured = studies.find((study) => study.featured) || studies[0];
  const rest = studies.filter((study) => study !== featured);
  const card = (study) => caseCard(study, nameOf(content.industries, study.industry));

  const body = `${pageHero({ title: copy.title, lede: copy.lede, crumbs: [{ label: 'Example projects' }] })}
<section class="section studies-section">
  <div class="container">
    <p class="work-note"><span>${esc(copy.sampleNote)}</span></p>
    <h2 class="studies-heading">${esc(copy.featuredLabel)}</h2>
    <div class="studies-featured">${card(featured)}</div>
    ${rest.length ? `<h2 class="studies-heading">${esc(copy.moreTitle)}</h2><div class="grid grid--3">${rest.map(card).join('\n')}</div>` : ''}
  </div>
</section>
<section class="section section--tint">
  <div class="container work-pointer">
    <div>
      <h2 class="h2">${esc(copy.portfolioTitle)}</h2>
      <p class="lede">${esc(copy.portfolioText)}</p>
    </div>
    ${button(copy.portfolioLinkLabel, '/portfolio/', 'ghost')}
  </div>
</section>`;

  return {
    path: '/case-studies/',
    title: copy.metaTitle,
    description: copy.description,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Example projects', item: `${site.url}/case-studies/` },
      ],
    },
  };
}

export default function pages({ content, site }) {
  const work = content['work-page'] || {};
  const studies = content['case-studies'] || [];
  if (!work.caseStudies || !work.detail || !studies.length) return [];
  const regions = work.regions || {};
  return [listingPage(studies, { content, site, copy: work.caseStudies })].concat(
    studies.map((study, index) => detailPage(study, index, studies, { content, site, copy: work.detail, regions })),
  );
}
