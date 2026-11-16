import { pageHero, section, esc } from '../components.mjs';

const UNSPLASH_URL = 'https://unsplash.com/?utm_source=veeboo_ai_site&utm_medium=referral';
const THUMB_WIDTH = 160;

function thumb(url) {
  return url.replace(/([?&])w=\d+/, `$1w=${THUMB_WIDTH}`);
}

function creditLine(item) {
  if (item.source !== 'Unsplash') return `Photo by ${esc(item.credit)}, ${esc(item.license)}`;
  return `Photo by <a href="${esc(item.creditUrl)}" rel="noopener">${esc(item.credit)}</a> on <a href="${esc(UNSPLASH_URL)}" rel="noopener">Unsplash</a>`;
}

export default function pages({ content }) {
  const photos = content.photos || {};
  const rows = Object.keys(photos)
    .map((slot) => {
      const item = photos[slot];
      return `<li class="credits-item"><img class="credits-item__thumb" src="${esc(thumb(item.srcSmall))}" alt="" width="${THUMB_WIDTH}" height="${Math.round((THUMB_WIDTH * item.height) / item.width)}" loading="lazy" decoding="async">
    <div><p class="credits-item__line">${creditLine(item)}</p><p class="credits-item__alt">${esc(item.alt)}</p></div></li>`;
    })
    .join('\n  ');

  return [
    {
      path: '/credits/',
      title: 'Photo credits',
      description: 'Credits for the photographs used on this site.',
      noCta: true,
      body: `${pageHero({ title: 'Photo credits', lede: 'Photographs used on this site.', crumbs: [{ label: 'Photo credits' }] })}
${section({ narrow: true, body: `<ul class="credits-list">\n  ${rows}\n</ul>` })}`,
    },
  ];
}
