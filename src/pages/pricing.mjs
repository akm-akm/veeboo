// /pricing/ : every price and every line of copy comes from content/pricing.json.
import fs from 'node:fs';
import { auditButton, button, checkList, esc, faq, icon, ledger, pageHero, section, steps } from '../components.mjs';

// The calculator's sum is defined once, in the browser script, and reused here for the no-JS example.
const calcSource = fs.readFileSync(new URL('../../public/assets/js/pricing.js', import.meta.url), 'utf8');
const veebooPayback = new Function(`${calcSource}\nreturn veebooPayback;`)();

function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));
}

// "$2,500" -> 2500. "Custom" -> null, which keeps that tier out of the calculator.
function amount(text) {
  const digits = String(text).replace(/[^0-9.]/g, '');
  return digits ? Number(digits) : null;
}

function tierCard(tier, labels, site) {
  return `<article class="pricing-tier${tier.featured ? ' pricing-tier--featured' : ''}" id="${esc(tier.slug)}">
  ${tier.featured ? `<p class="pricing-tier__flag">${esc(labels.featured)}</p>` : ''}
  <header class="pricing-tier__head">
    <h3 class="h3">${esc(tier.name)}</h3>
    <p class="pricing-tier__outcome">${esc(tier.outcome)}</p>
  </header>
  ${ledger({
    rows: [
      { label: labels.setupFee, note: labels.setupNote, value: tier.setupFee },
      { label: labels.monthly, note: labels.monthlyNote, value: tier.monthly },
    ],
  })}
  ${tier.guide ? `<p class="pricing-tier__guide">${esc(tier.guide)}</p>` : ''}
  <p class="pricing-tier__best"><strong>${esc(labels.bestFor)}:</strong> ${esc(tier.bestFor)}</p>
  ${checkList(tier.includes)}
  <div class="pricing-tier__cta"><a class="btn btn--block btn--${tier.featured ? 'primary' : 'ghost'}" href="${esc(site.cta.href)}">${esc(tier.cta)}</a></div>
</article>`;
}

function calculator(pricing, calcTiers) {
  const calc = pricing.calculator;
  const symbol = pricing.currencySymbol;
  const money = (value) => `${value < 0 ? '−' : ''}${symbol}${Math.abs(value).toLocaleString('en-US')}`;
  const defaults = calc.defaults;
  const limits = calc.limits;
  const startTier = calcTiers.find((tier) => tier.slug === defaults.tier) || calcTiers[0];
  const start = veebooPayback({
    hours: defaults.hoursPerWeek,
    cost: defaults.hourlyCost,
    share: defaults.sharePercent,
    setup: startTier.setup,
    monthly: startTier.monthly,
    weeksPerMonth: calc.weeksPerMonth,
    maxMonths: calc.maxMonths,
  });
  const data = {
    symbol,
    weeksPerMonth: calc.weeksPerMonth,
    maxMonths: calc.maxMonths,
    defaults,
    tiers: calcTiers,
    text: {
      valueNote: calc.result.valueNote,
      pays: calc.result.pays,
      paysOne: calc.result.paysOne,
      slow: calc.result.slow,
      none: calc.result.none,
    },
  };
  const range = (name, limit, value, attrs) =>
    `<input class="pricing-calc__range" type="range" data-calc-range="${name}" min="${limit.min}" max="${limit.max}" step="${limit.step}" value="${value}" ${attrs}>`;

  return `<div class="pricing-calc" data-pricing-calc>
  <form class="pricing-calc__form" novalidate>
    <fieldset class="pricing-calc__fields">
      <legend class="h3">${esc(calc.inputs.legend)}</legend>

      <div class="pricing-calc__field">
        <label id="calc-hours-label" for="calc-hours">${esc(calc.inputs.hours)}</label>
        <div class="pricing-calc__pair">
          ${range('hours', limits.hoursPerWeek, defaults.hoursPerWeek, 'aria-labelledby="calc-hours-label"')}
          <span class="pricing-calc__box"><input id="calc-hours" type="number" inputmode="numeric" data-calc-number="hours" min="${limits.hoursPerWeek.min}" max="${limits.hoursPerWeek.max}" step="${limits.hoursPerWeek.step}" value="${defaults.hoursPerWeek}" aria-describedby="calc-hours-hint"><span aria-hidden="true">${esc(calc.inputs.hoursUnit)}</span></span>
        </div>
        <p class="pricing-calc__hint" id="calc-hours-hint">${esc(calc.inputs.hoursHint)}</p>
      </div>

      <div class="pricing-calc__field">
        <label for="calc-cost">${esc(calc.inputs.cost)}</label>
        <span class="pricing-calc__box pricing-calc__box--lead"><span aria-hidden="true">${esc(symbol)}</span><input id="calc-cost" type="number" inputmode="decimal" data-calc-number="cost" min="${limits.hourlyCost.min}" max="${limits.hourlyCost.max}" step="${limits.hourlyCost.step}" value="${defaults.hourlyCost}" aria-describedby="calc-cost-hint"></span>
        <p class="pricing-calc__hint" id="calc-cost-hint">${esc(calc.inputs.costHint)}</p>
      </div>

      <div class="pricing-calc__field">
        <div class="pricing-calc__labelrow"><label for="calc-share">${esc(calc.inputs.share)}</label><output class="num" for="calc-share" data-calc-share-out>${defaults.sharePercent}%</output></div>
        ${range('share', limits.sharePercent, defaults.sharePercent, 'id="calc-share" aria-describedby="calc-share-hint"')}
        <p class="pricing-calc__hint" id="calc-share-hint">${esc(calc.inputs.shareHint)}</p>
      </div>

      <fieldset class="pricing-calc__field pricing-calc__tiers">
        <legend>${esc(calc.inputs.tier)}</legend>
        ${calcTiers
          .map(
            (tier) =>
              `<label class="pricing-calc__tier"><input type="radio" name="calc-tier" value="${esc(tier.slug)}" data-calc-tier${tier.slug === startTier.slug ? ' checked' : ''}><span><strong>${esc(tier.name)}</strong><small>${esc(fill(calc.tierOption, { setup: tier.setupFee, monthly: tier.monthlyFee }))}</small></span></label>`,
          )
          .join('\n        ')}
      </fieldset>
    </fieldset>
  </form>

  <div class="pricing-calc__result">
    <div class="ledger" role="group" aria-label="${esc(calc.result.caption)}">
      <div class="ledger__caption"><span>${esc(calc.result.caption)}</span><span class="sample-tag">${esc(calc.result.tag)}</span></div>
      <dl class="ledger__rows">
        <div class="ledger__row"><dt>${esc(calc.result.value)}<small data-calc-out="valueNote">${esc(fill(calc.result.valueNote, { hours: start.hoursSaved, cost: money(defaults.hourlyCost) }))}</small></dt><dd data-calc-out="value">${money(start.value)}</dd></div>
        <div class="ledger__row"><dt>${esc(calc.result.retainer)}<small data-calc-out="retainerNote">${esc(startTier.name)}</small></dt><dd data-calc-out="retainer">${money(-startTier.monthly)}</dd></div>
        <div class="ledger__row pricing-calc__net"><dt>${esc(calc.result.net)}</dt><dd data-calc-out="net">${money(start.net)}</dd></div>
        <div class="ledger__row"><dt>${esc(calc.result.setup)}</dt><dd data-calc-out="setup">${money(startTier.setup)}</dd></div>
      </dl>
      <div class="ledger__total pricing-calc__total" data-calc-total data-verdict="${start.verdict}"><strong data-calc-out="verdict" aria-live="polite">${esc(fill(calc.result[start.verdict], { n: start.months }))}</strong></div>
    </div>
    <p class="pricing-calc__disclaimer">${esc(calc.disclaimer)}</p>
    <noscript><p class="pricing-calc__disclaimer">${esc(calc.staticNote)}</p></noscript>
  </div>
  <script type="application/json" id="pricing-calc-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</div>`;
}

function compareTable(pricing) {
  const tiers = pricing.tiers;
  const labels = pricing.labels;
  const rows = [
    { label: labels.setupFee, values: tiers.map((tier) => tier.setupFee), price: true },
    { label: labels.monthly, values: tiers.map((tier) => tier.monthly), price: true },
  ].concat(pricing.comparison.rows);
  return `<table class="pricing-compare">
  <thead><tr><th scope="col">${esc(pricing.comparison.rowHeader)}</th>${tiers.map((tier) => `<th scope="col"${tier.featured ? ' class="pricing-compare__featured"' : ''}>${esc(tier.name)}</th>`).join('')}</tr></thead>
  <tbody>
    ${rows
      .map(
        (row) =>
          `<tr><th scope="row">${esc(row.label)}</th>${tiers
            .map((tier, index) => `<td data-label="${esc(tier.name)}"${tier.featured ? ' class="pricing-compare__featured"' : ''}>${row.price ? `<span class="num pricing-compare__price">${esc(row.values[index])}</span>` : esc(row.values[index])}</td>`)
            .join('')}</tr>`,
      )
      .join('\n    ')}
  </tbody>
</table>`;
}

export default function pages({ content, site }) {
  const pricing = content.pricing;
  const labels = pricing.labels;
  const calcTiers = pricing.tiers
    .map((tier) => ({ slug: tier.slug, name: tier.name, setupFee: tier.setupFee, monthlyFee: tier.monthly, setup: amount(tier.setupFee), monthly: amount(tier.monthly) }))
    .filter((tier) => tier.setup !== null && tier.monthly !== null);
  if (pricing.tiers.filter((tier) => tier.featured).length !== 1) {
    throw new Error('content/pricing.json: exactly one tier must have "featured": true');
  }
  const every = pricing.everyPlan;

  const body = [
    pageHero({
      title: pricing.hero.title,
      lede: pricing.hero.lede,
      crumbs: [{ label: pricing.meta.title }],
      actions: auditButton(site) + button(pricing.hero.calculatorButton, '#payback', 'ghost'),
    }),
    `<section class="pricing-plans" id="plans" aria-label="${esc(pricing.meta.title)}">
  <div class="container">
    <div class="pricing-tiers">
      ${pricing.tiers.map((tier) => tierCard(tier, labels, site)).join('\n      ')}
    </div>
    <p class="pricing-note">${esc(pricing.note)}</p>
  </div>
</section>`,
    section({ id: 'payback', tone: 'tint', title: pricing.calculator.title, lede: pricing.calculator.lede, body: calculator(pricing, calcTiers) }),
    section({
      id: 'included',
      title: every.title,
      lede: every.lede,
      body: `<div class="split">
  ${checkList(every.items)}
  <div class="pricing-retainer">
    <h3 class="h3">${esc(every.retainerTitle)}</h3>
    <dl class="pricing-retainer__list">
      ${every.retainer.map((item) => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.text)}</dd></div>`).join('\n      ')}
    </dl>
  </div>
</div>
<div class="pricing-excluded">
  <div>
    <h3 class="h3">${esc(every.excludedTitle)}</h3>
    <p>${esc(every.excludedLede)}</p>
  </div>
  <ul class="pricing-excluded__list">${every.excluded.map((item) => `<li>${icon('minus', 18)}<span>${esc(item)}</span></li>`).join('')}</ul>
</div>`,
    }),
    section({ id: 'compare', tone: 'tint', title: pricing.comparison.title, body: compareTable(pricing) }),
    section({
      id: 'process',
      tone: 'ink',
      title: pricing.process.title,
      lede: pricing.process.lede,
      body: steps(pricing.process.steps.map((step) => ({ title: step.title, text: step.text, meta: step.fee }))),
    }),
    section({ id: 'faq', title: pricing.faq.title, narrow: true, body: faq(pricing.faq.items) }),
    '<script src="/assets/js/pricing.js" defer></script>',
  ].join('\n');

  return [
    {
      path: '/pricing/',
      title: pricing.meta.title,
      description: pricing.meta.description,
      body,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: pricing.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    },
  ];
}
