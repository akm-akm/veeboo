import { pageHero, section, steps, checkList, icon, esc } from '../components.mjs';

const TODO = 'TODO';
const OTHER_VALUE = 'other';

function isTodo(value) {
  return String(value).startsWith(TODO);
}

function todoNote(text) {
  const rest = String(text).slice(TODO.length).replace(/^[:\s]+/, '');
  return `<p class="contact-todo"><span class="contact-todo__tag">${TODO}</span><span>${esc(rest)}</span></p>`;
}

function fieldError(id) {
  return `<p class="contact-error" id="${id}-error" data-error-for="${id}" hidden></p>`;
}

function form(copy, site, industries) {
  const fields = copy.fields;
  const connected = !isTodo(site.formEndpoint);
  // Without JavaScript the form is a normal POST to the form service. Until that
  // is connected, the no-JS fallback opens the visitor's mail app instead.
  const action = connected
    ? `action="${esc(site.formEndpoint)}" method="post"`
    : `action="mailto:${esc(site.email)}" method="post" enctype="text/plain"`;
  const options = industries
    .map((industry) => `<option value="${esc(industry.slug)}">${esc(industry.name)}</option>`)
    .concat([`<option value="${OTHER_VALUE}">${esc(fields.niche.other)}</option>`])
    .join('');
  const messages = {
    errors: copy.errors,
    notConnected: copy.notConnected,
    failed: copy.failed,
    submit: copy.submit,
    sending: copy.sending,
    mailSubject: copy.mailSubject,
    labels: {
      name: fields.name.label,
      email: fields.email.label,
      company: fields.company.label,
      niche: fields.niche.label,
      process: fields.process.label,
    },
  };
  return `<div class="contact-panel">
  <h2 class="h3">${esc(copy.title)}</h2>
  <p class="muted">${esc(copy.intro)}</p>

  <form class="form contact-form" ${action} data-contact-form data-endpoint="${esc(site.formEndpoint)}" data-email="${esc(site.email)}">
    <div class="field">
      <label for="contact-name">${esc(fields.name.label)}</label>
      <input id="contact-name" name="name" type="text" autocomplete="name" required aria-describedby="contact-name-error">
      ${fieldError('contact-name')}
    </div>
    <div class="field">
      <label for="contact-email">${esc(fields.email.label)}</label>
      <input id="contact-email" name="email" type="email" autocomplete="email" inputmode="email" required aria-describedby="contact-email-hint contact-email-error">
      <p class="hint" id="contact-email-hint">${esc(fields.email.hint)}</p>
      ${fieldError('contact-email')}
    </div>
    <div class="field">
      <label for="contact-company">${esc(fields.company.label)} <span class="hint">(${esc(fields.company.hint)})</span></label>
      <input id="contact-company" name="company" type="text" autocomplete="organization">
    </div>
    <div class="field">
      <label for="contact-niche">${esc(fields.niche.label)}</label>
      <select id="contact-niche" name="niche" required aria-describedby="contact-niche-error">
        <option value="">${esc(fields.niche.placeholder)}</option>${options}
      </select>
      ${fieldError('contact-niche')}
    </div>
    <div class="field">
      <label for="contact-process">${esc(fields.process.label)}</label>
      <textarea id="contact-process" name="process" rows="6" required aria-describedby="contact-process-hint contact-process-error"></textarea>
      <p class="hint" id="contact-process-hint">${esc(fields.process.hint)}</p>
      ${fieldError('contact-process')}
    </div>
    <div class="contact-hp" aria-hidden="true">
      <label for="contact-website">Leave this field empty</label>
      <input id="contact-website" name="_gotcha" type="text" tabindex="-1" autocomplete="off">
    </div>
    <div class="contact-status" data-contact-status role="alert" hidden></div>
    <button class="btn btn--primary btn--block contact-submit" type="submit" data-contact-submit>${esc(copy.submit)}</button>
    <p class="hint contact-privacy">${esc(copy.privacy)}</p>
  </form>
  <div class="contact-success" data-contact-success tabindex="-1" hidden>
    <span class="contact-success__icon">${icon('check', 24)}</span>
    <h2 class="h3">${esc(copy.success.title)}</h2>
    <p>${esc(copy.success.text)}</p>
  </div>
  <script type="application/json" data-contact-messages>${JSON.stringify(messages).replace(/</g, '\\u003c')}</script>
</div>`;
}

function booking(copy, site) {
  const ready = !isTodo(site.calendlyUrl);
  const inner = ready
    ? `<div class="contact-booking__frame" data-calendly data-calendly-url="${esc(site.calendlyUrl)}" data-loading-label="${esc(copy.loading)}">
      <button class="btn btn--ghost btn--block" type="button" data-calendly-load>${icon('calendar-check', 18)}${esc(copy.button)}</button>
      <p class="hint">${esc(copy.consent)}</p>
      <p class="hint"><a href="${esc(site.calendlyUrl)}" target="_blank" rel="noopener">${esc(copy.fallback)}</a></p>
    </div>`
    : `<div class="contact-booking__frame contact-booking__frame--todo">
      <span class="contact-booking__icon">${icon('calendar-check', 24)}</span>
      <p class="contact-booking__placeholder-title">${esc(copy.placeholder.title)}</p>
      <p>${esc(copy.placeholder.text)}</p>
    </div>`;
  return `<div class="contact-booking">
  <h2 class="h3">${esc(copy.title)}</h2>
  <p class="muted">${esc(copy.text)}</p>
  ${inner}
</div>`;
}

function emailBlock(copy, site) {
  return `<div class="contact-email">
  <h2 class="h3">${esc(copy.title)}</h2>
  <p class="muted">${esc(copy.text)}</p>
  <p><a class="contact-email__link" href="mailto:${esc(site.email)}">${icon('mail', 18)}<span>${esc(site.email)}</span></a></p>
</div>`;
}

export default function pages({ content, site }) {
  const contact = content.contact;
  const industries = content.industries || [];
  return [
    {
      path: '/contact/',
      title: contact.meta.title,
      description: contact.meta.description,
      noCta: true,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: contact.meta.title,
        description: contact.meta.description,
        url: `${site.url}/contact/`,
        mainEntity: {
          '@type': 'Organization',
          name: site.name,
          url: site.url,
          contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: site.email, availableLanguage: 'en' },
        },
      },
      body: [
        pageHero({ title: contact.hero.title, lede: contact.hero.lede, crumbs: [{ label: contact.meta.title }] }),
        `<section class="section contact-main"><div class="container split split--wide-left">
  ${form(contact.form, site, industries)}
  <div class="contact-side">
    ${booking(contact.booking, site)}
    ${emailBlock(contact.email, site)}
  </div>
</div></section>`,
        section({ id: 'after', tone: 'tint', title: contact.after.title, lede: contact.after.lede, body: steps(contact.after.steps) }),
        section({ id: 'bring', narrow: true, title: contact.bring.title, body: checkList(contact.bring.items) }),
        '<script src="/assets/js/contact.js" defer></script>',
      ].join('\n'),
    },
  ];
}
