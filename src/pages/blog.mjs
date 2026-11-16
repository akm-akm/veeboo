import { pageHero, section, auditButton, button, icon, esc } from '../components.mjs';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "2026-11-10" -> "10 November 2026". Parsed by hand so the build machine's time zone cannot shift the day.
function formatDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!match) return String(iso);
  return `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
}

function meta(post, labels, withAuthor) {
  const parts = [];
  if (withAuthor && post.author) parts.push(`<span>${esc(labels.byLabel)} ${esc(post.author)}</span>`);
  parts.push(`<time datetime="${esc(post.date)}">${esc(formatDate(post.date))}</time>`);
  parts.push(`<span>${esc(post.readMinutes)} ${esc(labels.minutesLabel)}</span>`);
  return `<p class="blog-meta">${parts.join('')}</p>`;
}

function featured(post, labels) {
  return `<article class="blog-featured">
  <div class="blog-featured__side">
    <span class="tag">${esc(labels.latestLabel)}</span>
    ${meta(post, labels, true)}
  </div>
  <div class="blog-featured__main">
    <h2 class="h2"><a href="/blog/${esc(post.slug)}/">${esc(post.title)}</a></h2>
    <p class="lede">${esc(post.description)}</p>
    <a class="blog-read" href="/blog/${esc(post.slug)}/">${esc(labels.readLabel)} ${icon('arrow-right', 18)}</a>
  </div>
</article>`;
}

function row(post, labels) {
  return `<li class="blog-row">
  ${meta(post, labels, false)}
  <div>
    <h3 class="h3"><a href="/blog/${esc(post.slug)}/">${esc(post.title)}</a></h3>
    <p class="muted">${esc(post.description)}</p>
  </div>
</li>`;
}

function listing(posts, copy) {
  if (!posts.length) return `<p class="lede">${esc(copy.list.empty)}</p>`;
  const rest = posts.slice(1);
  const earlier = rest.length
    ? `<div class="blog-earlier"><h2 class="h3">${esc(copy.list.moreTitle)}</h2><ul class="blog-rows">${rest.map((post) => row(post, copy.list)).join('')}</ul></div>`
    : '';
  return `${featured(posts[0], copy.list)}
${earlier}
<aside class="blog-next">
  <h2 class="h3">${esc(copy.next.title)}</h2>
  <p class="muted">${esc(copy.next.text)}</p>
  <ul class="blog-next__list">${copy.next.topics.map((topic) => `<li>${esc(topic)}</li>`).join('')}</ul>
</aside>`;
}

function postPage(post, copy, site) {
  const url = `${site.url}/blog/${post.slug}/`;
  return {
    path: `/blog/${post.slug}/`,
    title: post.title,
    description: post.description,
    ogType: 'article',
    // The article ends with its own audit call to action, so the site-wide band is left off.
    noCta: true,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      author: { '@type': 'Person', name: post.author || site.founder, url: `${site.url}/about/` },
      publisher: { '@type': 'Organization', name: site.name, url: site.url },
      mainEntityOfPage: url,
      url,
    },
    body: [
      pageHero({
        title: post.title,
        lede: post.description,
        crumbs: [{ label: copy.meta.title, href: '/blog/' }, { label: post.title }],
        actions: meta(post, copy.list, true),
      }),
      `<article class="section blog-article"><div class="container container--narrow">
  <div class="prose blog-prose">
${post.html}
  </div>
  <aside class="blog-cta">
    <h2 class="h3">${esc(copy.post.cta.title)}</h2>
    <p>${esc(copy.post.cta.text)}</p>
    <div class="actions">${auditButton(site, 'light')}${button(copy.post.backLabel, '/blog/', 'text')}</div>
  </aside>
</div></article>`,
    ].join('\n'),
  };
}

export default function pages({ content, site }) {
  const copy = content['blog-page'];
  const posts = content.blog || [];
  return [
    {
      path: '/blog/',
      title: copy.meta.title,
      description: copy.meta.description,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: `${site.name} ${copy.meta.title}`,
        url: `${site.url}/blog/`,
        blogPost: posts.map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.date,
          url: `${site.url}/blog/${post.slug}/`,
        })),
      },
      body: [
        pageHero({ title: copy.hero.title, lede: copy.hero.lede, crumbs: [{ label: copy.meta.title }] }),
        section({ body: listing(posts, copy) }),
      ].join('\n'),
    },
  ].concat(posts.map((post) => postPage(post, copy, site)));
}
