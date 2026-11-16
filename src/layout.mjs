// The page shell: <head> with SEO and Open Graph tags, header, footer, closing CTA.
import { esc, icon, ctaBand } from './components.mjs';

function isCurrent(href, pagePath) {
  return href === '/' ? pagePath === '/' : pagePath.startsWith(href);
}

function header(site, pagePath) {
  const links = site.nav
    .map((item) => `<a href="${esc(item.href)}"${isCurrent(item.href, pagePath) ? ' aria-current="page"' : ''}>${esc(item.label)}</a>`)
    .join('');
  return `<header class="site-header" data-header>
  <div class="container site-header__bar">
    <a class="logo" href="/" aria-label="${esc(site.name)} home"><span class="logo__mark" aria-hidden="true"></span>${esc(site.name)}</a>
    <nav class="site-nav" id="site-nav" aria-label="Main">${links}<a class="btn btn--primary site-nav__cta" href="${esc(site.cta.href)}">${esc(site.cta.label)}</a></nav>
    <a class="btn btn--primary btn--small site-header__cta" href="${esc(site.cta.href)}">${esc(site.cta.shortLabel)}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-toggle><span class="sr-only">Menu</span>${icon('menu', 22)}${icon('x', 22)}</button>
  </div>
</header>`;
}

function footer(site, content) {
  const services = (content.services || []).map((service) => `<li><a href="/services/#${esc(service.slug)}">${esc(service.name)}</a></li>`).join('');
  const industries = (content.industries || [])
    .map((industry) => `<li><a href="/industries/${esc(industry.slug)}/">${esc(industry.name)}</a></li>`)
    .join('');
  const company = site.nav
    .filter((item) => !['/services/', '/industries/'].includes(item.href))
    .concat([{ label: 'Contact', href: '/contact/' }])
    .map((item) => `<li><a href="${esc(item.href)}">${esc(item.label)}</a></li>`)
    .join('');
  const social = site.social
    .map((item) => `<a href="${esc(item.href)}" aria-label="${esc(item.label)}" rel="noopener">${icon(item.icon, 20)}</a>`)
    .join('');
  return `<footer class="site-footer">
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      <a class="logo" href="/"><span class="logo__mark" aria-hidden="true"></span>${esc(site.name)}</a>
      <p>${esc(site.tagline)}.</p>
      <p class="site-footer__small">${esc(site.location)}.</p>
      <p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
      <div class="site-footer__social">${social}</div>
    </div>
    <nav aria-label="Services"><h2>Services</h2><ul>${services}</ul></nav>
    <nav aria-label="Industries"><h2>Industries</h2><ul>${industries}</ul></nav>
    <nav aria-label="Company"><h2>Company</h2><ul>${company}</ul></nav>
  </div>
  <div class="container site-footer__legal">
    <p>© ${new Date().getFullYear()} ${esc(site.name)}. Built with: ${site.stack.map(esc).join(', ')}.</p>
    <p>${esc(site.sampleNotice)}</p>
    ${Object.keys(content.photos || {}).length ? '<p><a href="/credits/">Photo credits</a></p>' : ''}
  </div>
</footer>`;
}

// page: { path, title, description, body, ogImage?, ogType?, jsonLd?, noCta?, noindex? }
export function renderPage(page, { content, site }) {
  const fullTitle = page.path === '/' ? `${site.name}: ${site.tagline}` : `${page.title} | ${site.name}`;
  const canonical = `${site.url}${page.path}`;
  const ogImage = `${site.url}${page.ogImage || '/assets/img/og-default.png'}`;
  const organisation = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.name,
    slogan: site.tagline,
    description: site.description,
    url: site.url,
    email: site.email,
    founder: { '@type': 'Person', name: site.founder },
    areaServed: ['US', 'GB', 'AE', 'AU'],
  };
  const jsonLd = [organisation].concat(page.jsonLd ? [page.jsonLd] : []);
  return `<!doctype html>
<html lang="${esc(site.locale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${esc(canonical)}">
${page.noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="${esc(page.ogType || 'website')}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1a4fe0">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${header(site, page.path)}
<main id="main">
${page.body}
${page.noCta ? '' : ctaBand(site)}
</main>
${footer(site, content)}
<script src="/assets/js/site.js" defer></script>
</body>
</html>
`;
}
