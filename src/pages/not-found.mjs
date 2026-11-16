import { auditButton, button } from '../components.mjs';

export default function pages({ site }) {
  return [
    {
      path: '/404.html',
      title: 'Page not found',
      description: 'This page does not exist.',
      noindex: true,
      noCta: true,
      body: `<section class="section"><div class="container container--narrow stack">
  <h1 class="page-hero__title">That page is not here</h1>
  <p class="lede">The link may be old, or the address may have a typo. The home page has everything.</p>
  <div class="actions">${button('Go to the home page', '/', 'ghost')}${auditButton(site)}</div>
</div></section>`,
    },
  ];
}
