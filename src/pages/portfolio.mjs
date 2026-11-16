// /portfolio/ : filterable grid of smaller projects. Copy lives in content/work-page.json and content/portfolio.json.
import { pageHero, auditButton, button, sampleTag, icon, esc } from '../components.mjs';

function nameOf(list, slug) {
  const match = (list || []).find((item) => item.slug === slug);
  return match ? match.name : slug;
}

// Small mock at the top of each card. Drawn from the project's `visual` data, decorative only.
function miniVisual(visual) {
  if (!visual) return '';
  if (visual.type === 'chat') {
    return `<div class="portfolio-mini portfolio-mini--chat">${(visual.messages || [])
      .map((message) => `<p class="portfolio-mini__msg portfolio-mini__msg--${esc(message.from)}">${esc(message.text)}</p>`)
      .join('')}</div>`;
  }
  if (visual.type === 'ledger') {
    return `<div class="portfolio-mini portfolio-mini--ledger">${(visual.rows || [])
      .map((row) => `<p class="portfolio-mini__row"><span>${esc(row.label)}</span><strong>${esc(row.value)}</strong></p>`)
      .join('')}</div>`;
  }
  if (visual.type === 'log') {
    return `<div class="portfolio-mini portfolio-mini--log">${(visual.events || [])
      .map(
        (event) =>
          `<p class="portfolio-mini__event portfolio-mini__event--${esc(event.who)}"><span>${esc(event.time)}</span>${esc(event.text)}</p>`,
      )
      .join('')}</div>`;
  }
  return `<div class="portfolio-mini portfolio-mini--flow">${(visual.nodes || [])
    .map((node) => `<p class="portfolio-mini__node"><span>${icon(node.icon, 18)}</span>${esc(node.label)}</p>`)
    .join('')}</div>`;
}

function chipGroup({ id, label, key, allLabel, options }) {
  const chips = [{ slug: '', name: allLabel }].concat(options);
  return `<div class="portfolio-filters__group" role="group" aria-labelledby="${id}">
      <span class="portfolio-filters__label" id="${id}">${esc(label)}</span>
      <div class="chips">${chips
        .map(
          (option) =>
            `<button class="chip" type="button" data-filter="${key}" data-value="${esc(option.slug)}" aria-pressed="${option.slug === '' ? 'true' : 'false'}">${esc(option.name)}</button>`,
        )
        .join('')}</div>
    </div>`;
}

function projectCard(project, { content, copy, studies }) {
  const study = project.caseStudy ? studies.find((item) => item.slug === project.caseStudy) : null;
  const services = project.services || [];
  return `<article class="portfolio-card" data-project data-industry="${esc(project.industry)}" data-services="${esc(services.join(' '))}">
  <div class="portfolio-card__visual" aria-hidden="true">${miniVisual(project.visual)}</div>
  <div class="portfolio-card__body">
    <div class="portfolio-card__meta"><span>${esc(nameOf(content.industries, project.industry))}</span>${project.sample ? sampleTag() : ''}</div>
    <h2 class="h3 portfolio-card__title">${esc(project.title)}</h2>
    ${project.client ? `<p class="portfolio-card__client">${esc(project.client)}</p>` : ''}
    <p class="portfolio-card__summary">${esc(project.summary)}</p>
    <div class="tags">${services.map((slug) => `<span class="tag">${esc(nameOf(content.services, slug))}</span>`).join('')}</div>
    <dl class="portfolio-card__facts">
      <div><dt>${esc(copy.card.outcomeLabel)}</dt><dd class="portfolio-card__outcome">${esc(project.outcome)}</dd></div>
      ${(project.stack || []).length ? `<div><dt>${esc(copy.card.stackLabel)}</dt><dd>${esc(project.stack.join(', '))}</dd></div>` : ''}
    </dl>
    ${study ? `<a class="portfolio-card__link" href="/case-studies/${esc(study.slug)}/">${esc(copy.card.caseStudyLabel)} ${icon('arrow-up-right', 16)}</a>` : ''}
  </div>
</article>`;
}

export default function pages({ content, site }) {
  const copy = (content['work-page'] || {}).portfolio;
  const projects = content.portfolio || [];
  if (!copy) return [];
  const studies = content['case-studies'] || [];
  const used = (slugs) => (item) => slugs.includes(item.slug);
  const industries = (content.industries || []).filter(used(projects.map((project) => project.industry)));
  const services = (content.services || []).filter(used(projects.flatMap((project) => project.services || [])));
  const total = projects.length;
  const countText = copy.filters.countTemplate.replace('{shown}', total).replace('{total}', total);

  const body = `${pageHero({
    title: copy.title,
    lede: copy.lede,
    crumbs: [{ label: copy.navLabel }],
    actions: auditButton(site),
  })}
<section class="section portfolio-section">
  <div class="container">
    <p class="work-note"><span>${esc(copy.sampleNote)}</span></p>
    <div class="portfolio-filters" data-portfolio-filters hidden>
      ${chipGroup({ id: 'portfolio-filter-industry', label: copy.filters.industryLabel, key: 'industry', allLabel: copy.filters.all, options: industries })}
      ${chipGroup({ id: 'portfolio-filter-service', label: copy.filters.serviceLabel, key: 'service', allLabel: copy.filters.all, options: services })}
    </div>
    <p class="portfolio-count" data-portfolio-count data-template="${esc(copy.filters.countTemplate)}" data-total="${total}" role="status">${esc(countText)}</p>
    <div class="portfolio-grid" data-portfolio-grid>
      ${projects.map((project) => projectCard(project, { content, copy, studies })).join('\n      ')}
    </div>
    <div class="portfolio-empty" data-portfolio-empty hidden>
      <h2 class="h3">${esc(copy.filters.emptyTitle)}</h2>
      <p>${esc(copy.filters.emptyText)}</p>
      <button class="btn btn--ghost" type="button" data-portfolio-reset>${esc(copy.filters.resetLabel)}</button>
    </div>
  </div>
</section>
<section class="section section--tint">
  <div class="container work-pointer">
    <div>
      <h2 class="h2">${esc(copy.closing.title)}</h2>
      <p class="lede">${esc(copy.closing.text)}</p>
    </div>
    ${button(copy.closing.linkLabel, '/case-studies/', 'ghost')}
  </div>
</section>
<script src="/assets/js/portfolio.js" defer></script>`;

  return [
    {
      path: '/portfolio/',
      title: copy.metaTitle,
      description: copy.description,
      body,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
          { '@type': 'ListItem', position: 2, name: copy.navLabel, item: `${site.url}/portfolio/` },
        ],
      },
    },
  ];
}
