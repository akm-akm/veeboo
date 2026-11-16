// /industries/ (index) and /industries/<slug>/ (one template for every niche).
// All copy comes from content/industries.json and content/industries-page.json.
import {
  auditButton,
  button,
  caseCard,
  chatMock,
  checkList,
  esc,
  faq,
  flowMock,
  icon,
  ledger,
  pageHero,
  runlog,
  section,
} from '../components.mjs';

// hero.type in industries.json picks the shared mock; the rest of `hero` is that mock's data.
const HERO_MOCKS = { runlog, chat: chatMock, ledger };

// How many automations the index row names, and how many case studies a niche page shows.
const INDEX_AUTOMATIONS = 3;
const MAX_CASE_STUDIES = 2;

function breadcrumbs(site, trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path}`,
    })),
  };
}

function automationItems(industry) {
  return (industry.automations && industry.automations.items) || [];
}

/* ---------- Index ---------- */

// One photo slot -> a lazy <img> with the JSON's size and alt text; empty when the slot is missing.
function photoImg(photo, className, sizes) {
  if (!photo) return '';
  return `<img class="${className}" src="${esc(photo.src)}" srcset="${esc(photo.srcSmall)} 800w, ${esc(photo.src)} 1600w" sizes="${sizes}" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async">`;
}

function indexRow(industry, labels, photos) {
  const names = automationItems(industry).slice(0, INDEX_AUTOMATIONS);
  const href = `/industries/${industry.slug}/`;
  const photo = photoImg(photos[industry.photo], 'industries-photo industries-row__photo', '(min-width: 1100px) 352px, (min-width: 900px) 440px, 100vw');
  return `<li class="industries-row${photo ? ' industries-row--photo' : ''}">
  ${photo ? `<div class="industries-row__media">${photo}</div>` : ''}
  <div class="industries-row__main">
    <span class="industries-row__icon">${icon(industry.icon, 24)}</span>
    <h2 class="h2"><a href="${esc(href)}">${esc(industry.name)}</a></h2>
    <p class="lede">${esc(industry.short)}</p>
    <div class="actions">${button(industry.linkLabel || industry.name, href, 'ghost')}</div>
  </div>
  ${
    names.length
      ? `<div class="industries-row__autos">
    <p class="industries-label">${esc(labels.automationsLabel)}</p>
    <ul>${names.map((item) => `<li>${esc(item.name)}</li>`).join('')}</ul>
  </div>`
      : ''
  }
</li>`;
}

function indexPage(industries, page, site, photos) {
  const other = page.other;
  const body = `${pageHero({
    title: page.hero.title,
    lede: page.hero.lede,
    crumbs: [{ label: page.crumb }],
  })}
<section class="section industries-index">
  <div class="container">
    <ul class="industries-rows">
      ${industries.map((industry) => indexRow(industry, page.rows, photos)).join('\n      ')}
    </ul>
  </div>
</section>
<section class="section section--tint">
  <div class="container industries-other">
    <div>
      <h2 class="h2">${esc(other.title)}</h2>
      <p class="lede">${esc(other.text)}</p>
    </div>
    <div class="actions">${auditButton(site)}${other.secondary ? button(other.secondary.label, other.secondary.href, 'text') : ''}</div>
  </div>
</section>`;
  return {
    path: '/industries/',
    title: page.title,
    description: page.description,
    body,
    jsonLd: breadcrumbs(site, [
      { name: 'Home', path: '/' },
      { name: page.crumb, path: '/industries/' },
    ]),
  };
}

/* ---------- Niche page sections ---------- */

function heroVisual(hero, caption) {
  if (!hero) return '';
  const render = HERO_MOCKS[hero.type];
  if (!render) {
    throw new Error(`industries.json: hero.type "${hero.type}" is not one of ${Object.keys(HERO_MOCKS).join(', ')}`);
  }
  return `<div class="industries-visual industries-visual--${esc(hero.type)}">
  ${render(hero)}
  ${caption ? `<p class="industries-visual__caption">${esc(caption)}</p>` : ''}
</div>`;
}

function splitHead(title, lede) {
  return `<header class="industries-head"><h2 class="h2">${esc(title)}</h2>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}</header>`;
}

function painsSection(pains, labels, photo) {
  if (!pains || !pains.items.length) return '';
  const image = photoImg(photo, 'industries-photo industries-pains__photo', '(min-width: 1100px) 560px, (min-width: 900px) 45vw, 100vw');
  return `<section class="section industries-pains">
  <div class="container split${image ? ' industries-pains__split' : ''}">
    ${splitHead(pains.title || labels.painsTitle, pains.lede)}
    <ul class="industries-list">
      ${pains.items.map((item) => `<li><h3 class="industries-item-title">${esc(item.title)}</h3><p>${esc(item.text)}</p></li>`).join('\n      ')}
    </ul>
    ${image}
  </div>
</section>`;
}

function automationRow(item, labels) {
  return `<li class="industries-auto">
  <h3 class="h3">${esc(item.name)}</h3>
  <dl class="industries-auto__facts">
    <div><dt>${esc(labels.triggerLabel)}</dt><dd>${esc(item.trigger)}</dd></div>
    <div><dt>${esc(labels.doesLabel)}</dt><dd>${esc(item.does)}</dd></div>
    <div><dt>${esc(labels.personLabel)}</dt><dd>${esc(item.person)}</dd></div>
  </dl>
</li>`;
}

function automationsSection(automations, labels) {
  if (!automations || !automations.items.length) return '';
  return section({
    id: 'automations',
    tone: 'tint',
    title: automations.title || labels.automationsTitle,
    lede: automations.lede,
    body: `${automations.flow ? flowMock(automations.flow) : ''}
    <ul class="industries-autos">
      ${automations.items.map((item) => automationRow(item, labels)).join('\n      ')}
    </ul>`,
  });
}

function worthSection(worth, labels) {
  if (!worth) return '';
  return `<section class="section industries-worth">
  <div class="container split">
    <div>
      ${splitHead(worth.title || labels.worthTitle, worth.lede)}
      <p class="industries-label">${esc(labels.assumptionsLabel)}</p>
      <ul class="industries-bullets">${worth.assumptions.map((line) => `<li>${esc(line)}</li>`).join('')}</ul>
    </div>
    <div class="industries-worth__sum">
      ${ledger(worth.ledger)}
      ${worth.setupNote ? `<p class="small">${esc(worth.setupNote)}</p>` : ''}
      <p class="small muted">${esc(labels.illustrativeNote)}</p>
    </div>
  </div>
</section>`;
}

// trust.ownerNote is a reminder for the site owner and is deliberately never rendered.
function toolsAndTrustSection(tools, trust, labels) {
  const toolsBlock =
    tools && tools.groups.length
      ? `<div>
      <h2 class="h2">${esc(tools.title || labels.toolsTitle)}</h2>
      <dl class="industries-tools">
        ${tools.groups.map((group) => `<div><dt>${esc(group.label)}</dt><dd>${esc(group.text)}</dd></div>`).join('\n        ')}
      </dl>
      <p class="small muted">${esc(labels.toolsDisclaimer)}</p>
    </div>`
      : '';
  const trustBlock =
    trust && trust.items.length
      ? `<div>
      <h2 class="h2">${esc(trust.title || labels.trustTitle)}</h2>
      <ul class="industries-trust">
        ${trust.items.map((item) => `<li>${icon('shield-check', 20)}<div><h3 class="industries-item-title">${esc(item.title)}</h3><p>${esc(item.text)}</p></div></li>`).join('\n        ')}
      </ul>
    </div>`
      : '';
  if (!toolsBlock && !trustBlock) return '';
  return `<section class="section section--ink industries-fit">
  <div class="container split">
    ${toolsBlock}
    ${trustBlock}
  </div>
</section>`;
}

function casesSection(studies, industry, labels) {
  if (!studies.length) return '';
  return section({
    title: labels.casesTitle,
    body: `<div class="grid grid--2">${studies.map((study) => caseCard(study, industry.name)).join('')}</div>`,
  });
}

function faqSection(questions, labels) {
  if (!questions || !questions.items.length) return '';
  return section({ title: questions.title || labels.faqTitle, body: faq(questions.items), narrow: true });
}

function pilotSection(pilot, labels) {
  if (!pilot) return '';
  return `<section class="section section--tint industries-pilot">
  <div class="container">
    <header class="section__head">
      <h2 class="h2">${esc(pilot.title || labels.pilotTitle)}</h2>
      <p class="lede">${esc(pilot.lede)}</p>
    </header>
    <div class="split">
      <div>
        <h3 class="industries-item-title">${esc(labels.scopeLabel)}</h3>
        ${checkList(pilot.scope)}
      </div>
      <div>
        <h3 class="industries-item-title">${esc(labels.timelineLabel)}<span class="tag">${icon('clock', 14)}${esc(labels.pilotDuration)}</span></h3>
        <ol class="industries-timeline">
          ${pilot.timeline.map((stage) => `<li><strong>${esc(stage.when)}</strong><span>${esc(stage.text)}</span></li>`).join('\n          ')}
        </ol>
      </div>
    </div>
    <div class="industries-pilot__foot">
      <p>${esc(labels.pilotPriceNote)}</p>
      ${button(labels.pricingLink.label, labels.pricingLink.href, 'ghost')}
    </div>
  </div>
</section>`;
}

function nichePage(industry, page, site, caseStudies, photos) {
  const labels = page.detail;
  const path = `/industries/${industry.slug}/`;
  const related = caseStudies.filter((study) => study.industry === industry.slug).slice(0, MAX_CASE_STUDIES);
  const body = [
    pageHero({
      title: industry.headline || industry.name,
      lede: industry.lede || industry.short,
      crumbs: [{ label: page.crumb, href: '/industries/' }, { label: industry.name }],
      actions: `${auditButton(site)}${automationItems(industry).length ? button(labels.heroSecondary, '#automations', 'text') : ''}`,
      aside: heroVisual(industry.hero, labels.heroCaption),
    }),
    painsSection(industry.pains, labels, photos[industry.photo]),
    automationsSection(industry.automations, labels),
    worthSection(industry.worth, labels),
    toolsAndTrustSection(industry.tools, industry.trust, labels),
    casesSection(related, industry, labels),
    faqSection(industry.faq, labels),
    pilotSection(industry.pilot, labels),
  ].join('\n');
  return {
    path,
    title: industry.title || industry.name,
    description: industry.description || industry.short,
    body,
    jsonLd: breadcrumbs(site, [
      { name: 'Home', path: '/' },
      { name: page.crumb, path: '/industries/' },
      { name: industry.name, path },
    ]),
  };
}

export default function pages({ content, site }) {
  const industries = content.industries || [];
  const page = content['industries-page'];
  const studies = content['case-studies'];
  const photos = content.photos || {};
  const caseStudies = Array.isArray(studies) ? studies : (studies && studies.items) || [];
  return [indexPage(industries, page, site, photos)].concat(
    industries.map((industry) => nichePage(industry, page, site, caseStudies, photos)),
  );
}
