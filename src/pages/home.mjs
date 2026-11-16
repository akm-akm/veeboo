import { esc, icon, button, auditButton, ledger, faq, quoteCard, sampleTag, chatMock } from '../components.mjs';

const IMG = '/assets/img/home';

// A photo slot from content.photos. Returns '' when the slot is empty so the caller can draw its fallback.
function photo(photos, slot, { eager = false, sizes = '100vw', className = '' } = {}) {
  const item = photos[slot];
  if (!item || !item.src) return '';
  // A srcset only helps when there really are two files.
  const srcset =
    item.srcSmall && item.srcSmall !== item.src
      ? ` srcset="${esc(item.srcSmall)} 800w, ${esc(item.src)} ${esc(item.width || 1600)}w" sizes="${esc(sizes)}"`
      : '';
  const dims = item.width && item.height ? ` width="${esc(item.width)}" height="${esc(item.height)}"` : '';
  return `<img class="home-photo${className ? ` ${className}` : ''}" src="${esc(item.src)}"${srcset}${dims} alt="${esc(item.alt || '')}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}

function head({ eyebrow, title, lede, light = false, id = '' }) {
  return `<header class="home-head${light ? ' home-head--light' : ''}">
  ${eyebrow ? `<p class="home-eyebrow">${esc(eyebrow)}</p>` : ''}
  <h2 class="h2"${id ? ` id="${esc(id)}"` : ''}>${esc(title)}</h2>
  ${lede ? `<p class="lede">${esc(lede)}</p>` : ''}
</header>`;
}

function block(id, className, inner, labelledBy = '') {
  return `<section class="home-section ${className}"${id ? ` id="${esc(id)}"` : ''}${labelledBy ? ` aria-labelledby="${esc(labelledBy)}"` : ''} data-reveal>
  <div class="container">
    ${inner}
  </div>
</section>`;
}

/* ---------- Hero ---------- */

function heroFloats(run, index) {
  const hidden = index === 0 ? '' : ' hidden';
  const bubble = run.bubble
    ? `<div class="home-float home-float--bubble" data-run="${index}"${hidden}>
      <p class="home-bubble__channel">${icon('message-circle', 14)}${esc(run.bubble.channel)}</p>
      <p class="home-bubble__text">${esc(run.bubble.text)}</p>
      <time>${esc(run.bubble.time)}</time>
    </div>`
    : '';
  const chip = run.chip
    ? `<div class="home-float home-float--chip" data-run="${index}"${hidden}>
      <span class="home-chip__icon">${icon(run.chip.icon || 'check', 18)}</span>
      <span><strong>${esc(run.chip.label)}</strong><small>${esc(run.chip.sub)}</small></span>
    </div>`
    : '';
  return bubble + chip;
}

function heroDemo(hero) {
  const tabs = hero.runs
    .map(
      (run, index) =>
        `<button class="home-demo__tab" type="button" role="tab" id="run-tab-${index}" aria-controls="run-panel-${index}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${esc(run.tab)}</button>`,
    )
    .join('');
  const panels = hero.runs
    .map(
      (run, index) => `<div class="home-demo__panel" role="tabpanel" id="run-panel-${index}" aria-labelledby="run-tab-${index}"${index === 0 ? '' : ' hidden'}>
      <p class="home-demo__title">${esc(run.title)}</p>
      <ol class="runlog__events">
        ${run.events
          .map((event) => `<li class="runlog__event runlog__event--${esc(event.who)}"><time>${esc(event.time)}</time><p>${esc(event.text)}</p></li>`)
          .join('\n        ')}
      </ol>
      <p class="runlog__footer">${esc(run.footer)}</p>
    </div>`,
    )
    .join('\n');
  // The hero-team and hero-phone photos are only 600px wide: behind a 500px window they read as soft
  // and muddy, so the backdrop stays a drawn blue panel.
  const payback = hero.payback
    ? `<div class="home-float home-float--ledger">
      <div class="home-mini-ledger__head"><span>${esc(hero.payback.caption)}</span>${sampleTag(hero.payback.tag || 'Illustrative')}</div>
      <dl>${hero.payback.rows.map((row) => `<div><dt>${esc(row.label)}</dt><dd>${esc(row.value)}</dd></div>`).join('')}</dl>
      ${hero.payback.total ? `<p class="home-mini-ledger__total"><span>${esc(hero.payback.total.label)}</span><strong>${esc(hero.payback.total.value)}</strong></p>` : ''}
    </div>`
    : '';
  return `<div class="home-stage">
  <div class="home-stage__main">
  <div class="home-stage__backdrop" aria-hidden="true"></div>
  <div class="home-demo" data-demo>
    <div class="home-demo__chrome" aria-hidden="true"><span></span><span></span><span></span><p>${esc(hero.windowTitle)}</p><em>${esc(hero.liveLabel)}</em></div>
    <div class="home-demo__inner">
      <div class="home-demo__head">
        <span class="home-demo__label" id="demo-label">${esc(hero.demoLabel)}</span>
        <div class="home-demo__tabs" role="tablist" aria-labelledby="demo-label">${tabs}</div>
      </div>
      ${panels}
      <p class="home-demo__note">${esc(hero.demoNote)}</p>
    </div>
  </div>
  </div>
  <div class="home-floats">
    ${hero.runs.map(heroFloats).join('')}
    ${payback}
  </div>
</div>`;
}

function hero(home, site) {
  const h = home.hero;
  return `<section class="home-hero">
  <div class="home-hero__bg" aria-hidden="true"></div>
  <div class="container home-hero__grid">
    <div class="home-hero__copy">
      <p class="home-pill"><span class="home-pill__dot" aria-hidden="true"></span>${esc(h.eyebrow)}</p>
      <h1 class="display">${esc(h.title)}</h1>
      <p class="lede">${esc(h.lede)}</p>
      <div class="actions">${auditButton(site)}${button(h.secondaryCta.label, h.secondaryCta.href, 'ghost')}</div>
      <ul class="home-reassure">${(h.reassurances || []).map((item) => `<li>${icon('check', 16)}<span>${esc(item)}</span></li>`).join('')}</ul>
    </div>
    ${heroDemo(h)}
  </div>
  <div class="container home-stack">
    <p class="home-stack__label">${esc(home.stack.label)}</p>
    <ul class="home-stack__chips">${(site.stack || []).map((tool) => `<li>${esc(tool)}</li>`).join('')}</ul>
    <p class="home-stack__note">${esc(home.stack.note)}</p>
  </div>
</section>`;
}

/* ---------- Problem ---------- */

function problem(p) {
  const cards = p.pairs
    .map(
      (pair) => `<li class="home-pair">
    <p class="home-pair__label"><span class="home-pair__icon">${icon(pair.icon || 'zap', 18)}</span>${esc(pair.label)}</p>
    <div class="home-pair__before">
      <p class="home-pair__tag">${icon('x', 14)}${esc(p.beforeLabel)}</p>
      <p>${esc(pair.before)}</p>
      ${pair.beforeChip ? `<span class="home-pair__status home-pair__status--off">${esc(pair.beforeChip)}</span>` : ''}
    </div>
    <span class="home-pair__arrow" aria-hidden="true">${icon('arrow-right', 16)}</span>
    <div class="home-pair__after">
      <p class="home-pair__tag">${icon('check', 14)}${esc(p.afterLabel)}</p>
      <p>${esc(pair.after)}</p>
      ${pair.afterChip ? `<span class="home-pair__status">${esc(pair.afterChip)}</span>` : ''}
    </div>
  </li>`,
    )
    .join('\n  ');
  return block('', 'home-problem', `${head({ eyebrow: p.eyebrow, title: p.title, lede: p.lede })}<ul class="home-pairs">${cards}</ul>`);
}

/* ---------- Services bento ---------- */

function tileMock(service, tile, note) {
  const mock = service.mock || {};
  const noteHtml = `<span class="home-mock__note">${esc(note)}</span>`;
  if (service.slug === 'workflow-automation' && mock.nodes) {
    return `<div class="home-mock home-mock--flow" aria-hidden="true">
      <ol>${mock.nodes.map((node) => `<li><span>${icon(node.icon, 18)}</span><strong>${esc(node.label)}</strong><small>${esc(node.sub || '')}</small></li>`).join('')}</ol>
      <p class="home-mock__status"><span class="home-live-dot"></span>${esc(tile.runLabel || '')}</p>${noteHtml}
    </div>`;
  }
  if (service.slug === 'ai-agents-chatbots' && mock.messages) {
    return `<div class="home-mock home-mock--chat" aria-hidden="true">
      <p class="home-mock__chathead"><span>${icon('bot', 16)}</span><span><strong>${esc(mock.title || service.name)}</strong><small><span class="home-live-dot"></span>${esc(tile.status || '')}</small></span></p>
      ${mock.messages
        .slice(0, 6)
        .map((message) => `<p class="home-mock__msg home-mock__msg--${esc(message.from)}">${esc(message.text)}</p>`)
        .join('')}
      <p class="home-mock__typing"><span></span><span></span><span></span></p>${noteHtml}
    </div>`;
  }
  if (service.slug === 'voice-whatsapp-receptionists') {
    const bars = Array.from({ length: 28 }, (_, i) => `<i style="--h:${[30, 55, 80, 45, 95, 60, 35, 70][i % 8]}%;--d:${(i % 7) * 0.12}s"></i>`).join('');
    return `<div class="home-mock home-mock--call" aria-hidden="true">
      <p class="home-mock__callhead"><span>${icon('phone-call', 16)}</span><span><strong>${esc(tile.callLabel)}</strong><small>${esc(tile.caller)}</small></span></p>
      <div class="home-wave">${bars}</div>
      <p class="home-mock__callstatus">${esc(tile.status)}</p>
      <p class="home-mock__result">${icon('calendar-check', 16)}${esc(tile.result)}</p>
      <p class="home-mock__sub">${icon('bell', 14)}${esc(tile.followUp)}</p>${noteHtml}
    </div>`;
  }
  if (service.slug === 'meeting-intelligence') {
    return `<div class="home-mock home-mock--doc" aria-hidden="true">
      <p class="home-mock__dochead"><strong>${esc(tile.docTitle)}</strong><small>${esc(tile.docTime)}</small></p>
      <ul>${(tile.items || []).map((item) => `<li>${icon('check', 14)}${esc(item)}</li>`).join('')}</ul>
      <p class="home-mock__crm">${icon('database', 14)}${esc(tile.crm)}</p>${noteHtml}
    </div>`;
  }
  if (service.slug === 'ai-audit' && mock.rows) {
    return `<div class="home-mock home-mock--ledger" aria-hidden="true">
      ${ledger({ caption: mock.caption, rows: mock.rows.slice(0, 3), total: mock.total || null, sample: true })}
    </div>`;
  }
  return '';
}

function services(list, s) {
  const tiles = list
    .map((service) => {
      const tile = (s.tiles || {})[service.slug] || {};
      const audit = service.slug === 'ai-audit';
      return `<li class="home-tile home-tile--${esc(service.slug)}">
    <a class="home-tile__link" href="/services/#${esc(service.slug)}">
      <span class="home-tile__top"><span class="home-tile__icon">${icon(service.icon, 20)}</span>${tile.tag ? `<span class="home-tile__tag">${esc(tile.tag)}</span>` : ''}</span>
      <h3 class="h3">${esc(service.name)}</h3>
      <p class="home-tile__text">${esc(service.short)}</p>
      <span class="home-tile__more">${esc(s.linkLabel)} ${icon('arrow-up-right', 16)}</span>
    </a>
    <div class="home-tile__visual">${tileMock(service, tile, s.mockNote)}</div>
    ${audit && tile.cta ? `<div class="home-tile__cta"><a class="btn btn--light" href="/contact/">${esc(tile.cta)}</a></div>` : ''}
  </li>`;
    })
    .join('\n  ');
  return block('services', 'home-services', `${head({ eyebrow: s.eyebrow, title: s.title, lede: s.lede })}<ul class="home-bento">${tiles}</ul>`);
}

/* ---------- Industries ---------- */

function industries(list, ind, photos) {
  const cards = list
    .map((industry) => {
      const card = (ind.cards || {})[industry.slug] || {};
      const img = photo(photos, `industry-${industry.slug === 'agencies-sales-teams' ? 'agencies-sales' : industry.slug}`, {
        sizes: '(min-width: 1100px) 290px, (min-width: 640px) 50vw, 100vw',
      });
      const visual = img || `<img class="home-industry__art" src="${IMG}/${esc(industry.slug)}.svg" alt="" width="480" height="300" loading="lazy">`;
      return `<li><a class="home-industry home-industry--${esc(industry.slug)}" href="/industries/${esc(industry.slug)}/">
    <span class="home-industry__media${img ? ' has-photo' : ''}">${visual}
      ${card.chip ? `<span class="home-industry__chip">${icon(card.chip.icon || 'check', 16)}<span><strong>${esc(card.chip.label)}</strong><small>${esc(card.chip.sub)}</small></span></span>` : ''}
    </span>
    <span class="home-industry__body">
      <span class="home-industry__name"><span class="home-industry__icon">${icon(industry.icon, 18)}</span><h3 class="h3">${esc(industry.name)}</h3></span>
      <span class="home-industry__text">${esc(industry.short)}</span>
      <span class="home-industry__more">${esc(ind.linkLabel)} ${icon('arrow-up-right', 16)}</span>
    </span>
  </a></li>`;
    })
    .join('\n  ');
  return block('industries', 'home-industries', `${head({ eyebrow: ind.eyebrow, title: ind.title, lede: ind.lede })}<ul class="home-industry-grid">${cards}</ul>`);
}

/* ---------- Commitments band ---------- */

function commitments(c, photos) {
  const bg = photo(photos, 'cta-city', { sizes: '100vw', className: 'home-band__photo' });
  return `<section class="home-band" data-reveal>
  <div class="home-band__bg" aria-hidden="true">${bg}</div>
  <div class="container">
    ${head({ eyebrow: c.eyebrow, title: c.title, light: true })}
    <ul class="home-band__grid">${c.items
      .map((item) => `<li><p class="home-band__value">${esc(item.value)}</p><p class="home-band__label">${esc(item.label)}</p><p class="home-band__text">${esc(item.text)}</p></li>`)
      .join('')}</ul>
  </div>
</section>`;
}

/* ---------- Process ---------- */

function process(p, photos) {
  const img = photo(photos, 'process-whiteboard', { sizes: '(min-width: 900px) 420px, 100vw' });
  const plan = `<figure class="home-plan" aria-label="${esc(p.plan.title)}">
      <div class="home-plan__head"><span class="home-plan__icon">${icon('file-text', 18)}</span><span><strong>${esc(p.plan.title)}</strong><small>${esc(p.plan.subtitle)}</small></span></div>
      <ul>${p.plan.items.map((item) => `<li>${icon('check', 16)}<span>${esc(item)}</span></li>`).join('')}</ul>
      <figcaption>${esc(p.plan.footer)}</figcaption>
    </figure>`;
  const aside = img ? `<div class="home-process__visual"><div class="home-process__photo">${img}</div>${plan}</div>` : plan;
  const stepsHtml = p.steps
    .map(
      (step, index) => `<li class="home-step">
      <span class="home-step__node" aria-hidden="true">${icon(step.icon || 'check', 20)}</span>
      <p class="home-step__count">${String(index + 1).padStart(2, '0')}<span>${esc(step.duration || '')}</span></p>
      <h3 class="h3">${esc(step.title)}</h3>
      <p class="home-step__text">${esc(step.text)}</p>
      <p class="home-step__fee"><span>${esc(p.feeLabel)}</span><strong>${esc(step.meta)}</strong></p>
    </li>`,
    )
    .join('\n    ');
  return block(
    'process',
    'home-process',
    `<div class="home-process__top">${head({ eyebrow: p.eyebrow, title: p.title, lede: p.lede })}${aside}</div>
    <ol class="home-timeline">${stepsHtml}</ol>`,
  );
}

/* ---------- Featured case study ---------- */

function screenMock(study) {
  const screen = (study.screens || []).find((item) => item.kind === 'table' && item.columns && item.rows);
  if (screen) {
    const cell = (value) => (value && typeof value === 'object' ? `<span class="home-pillc home-pillc--${esc(value.tone || 'plain')}">${esc(value.pill)}</span>` : esc(value));
    return `<figure class="home-screen" aria-label="${esc(screen.caption || '')}">
      <div class="home-screen__bar" aria-hidden="true"><span></span><span></span><span></span><p>${esc(screen.address || '')}</p></div>
      <table><thead><tr>${screen.columns.map((col) => `<th scope="col">${esc(col)}</th>`).join('')}</tr></thead>
      <tbody>${screen.rows.map((row) => `<tr>${row.map((value, i) => `<td data-label="${esc(screen.columns[i] || '')}">${cell(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>
    </figure>`;
  }
  const chat = (study.screens || []).find((item) => item.kind === 'chat' && item.messages);
  return chat ? chatMock({ title: chat.title, subtitle: chat.subtitle, messages: chat.messages.slice(0, 3) }) : '';
}

function featuredCase(study, copy, industryList, photos) {
  const industry = industryList.find((item) => item.slug === study.industry);
  const texture = photo(photos, 'texture-abstract', { sizes: '100vw', className: 'home-case__texture' });
  const meta = [
    study.clientType ? `<div><dt>${esc(copy.clientLabel)}</dt><dd>${esc(study.clientType)}</dd></div>` : '',
    study.duration ? `<div><dt>${esc(copy.durationLabel)}</dt><dd>${esc(study.duration)}</dd></div>` : '',
    study.stack && study.stack.length ? `<div><dt>${esc(copy.stackLabel)}</dt><dd>${esc(study.stack.slice(0, 3).join(', '))}</dd></div>` : '',
  ].join('');
  return block(
    '',
    'home-case',
    `${head({ eyebrow: copy.eyebrow, title: copy.title })}
    <article class="home-case__card">
      <div class="home-case__bg" aria-hidden="true">${texture}</div>
      <div class="home-case__copy">
        <p class="home-case__kicker">${industry ? `<span>${icon(industry.icon, 16)}${esc(industry.name)}</span>` : ''}${study.sample ? sampleTag() : ''}</p>
        <h3 class="home-case__title">${esc(study.title)}</h3>
        <p class="home-case__summary">${esc(study.summary)}</p>
        <dl class="home-case__meta">${meta}</dl>
        <div class="actions">${button(copy.linkLabel, `/case-studies/${study.slug}/`, 'light')}${button(copy.allLabel, '/case-studies/', 'text')}</div>
      </div>
      <div class="home-case__visual">
        ${screenMock(study)}
        ${study.results && study.results.length ? ledger({ caption: copy.resultsCaption, rows: study.results.slice(0, 3), sample: Boolean(study.sample) }) : ''}
      </div>
    </article>`,
  );
}

/* ---------- Testimonials, pricing, FAQ ---------- */

function testimonials(list, t) {
  return block('', 'home-quotes', `${head({ eyebrow: t.eyebrow, title: t.title, lede: t.lede })}<div class="home-quotes__grid">${list.map(quoteCard).join('')}</div>`);
}

function pricingPreview(pricing, copy) {
  const tiers = pricing.tiers
    .map(
      (tier) => `<li class="home-tier${tier.featured ? ' home-tier--featured' : ''}">
    ${tier.featured ? `<p class="home-tier__badge">${esc(copy.featuredLabel)}</p>` : ''}
    <h3 class="h3">${esc(tier.name)}</h3>
    <p class="home-tier__for">${esc(tier.outcome || tier.bestFor)}</p>
    <dl class="home-tier__prices">
      <div><dt>${esc(copy.setupLabel)}</dt><dd>${esc(tier.setupFee)}</dd></div>
      <div><dt>${esc(copy.monthlyLabel)}</dt><dd>${esc(tier.monthly)}</dd></div>
    </dl>
    ${tier.guide ? `<p class="home-tier__guide">${esc(tier.guide)}</p>` : ''}
  </li>`,
    )
    .join('\n  ');
  return block(
    'pricing',
    'home-pricing',
    `<div class="home-pricing__top">${head({ eyebrow: copy.eyebrow, title: copy.title, lede: copy.lede })}<div>${button(copy.linkLabel, '/pricing/', 'ghost')}</div></div>
    <ul class="home-tiers">${tiers}</ul>`,
  );
}

function faqSection(f, site) {
  return block(
    'faq',
    'home-faq',
    `<div class="home-faq__grid">
      <div class="home-faq__side">${head({ eyebrow: f.eyebrow, title: f.title })}<p class="home-faq__aside">${esc(f.asideText)}</p><div class="actions">${auditButton(site)}</div></div>
      ${faq(f.items)}
    </div>`,
  );
}

export default function pages({ content, site }) {
  const home = content.home;
  const photos = content.photos || {};
  const serviceList = content.services || [];
  const industryList = content.industries || [];
  const studies = content['case-studies'] || [];
  const quotes = (content.testimonials || []).slice(0, 3);
  const pricing = content.pricing;
  const featured = studies.find((study) => study.featured) || studies[0];

  const body = `${hero(home, site)}
${problem(home.problem)}
${serviceList.length ? services(serviceList, home.services) : ''}
${industryList.length ? industries(industryList, home.industries, photos) : ''}
${commitments(home.commitments, photos)}
${process(home.process, photos)}
${featured ? featuredCase(featured, home.caseStudy, industryList, photos) : ''}
${quotes.length ? testimonials(quotes, home.testimonials) : ''}
${pricing && pricing.tiers ? pricingPreview(pricing, home.pricing) : ''}
${faqSection(home.faq, site)}
<script src="/assets/js/home.js" defer></script>`;

  return [
    {
      path: '/',
      title: home.meta.title,
      description: home.meta.description,
      body,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: home.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    },
  ];
}
