import { pageHero, section, steps, checkList, auditButton, esc } from '../components.mjs';

const TODO = 'TODO';

// Text the owner still has to fill in starts with "TODO" and is rendered as a loud note.
function isTodo(text) {
  return String(text).startsWith(TODO);
}

function todoNote(text) {
  const rest = String(text).slice(TODO.length).replace(/^[:\s]+/, '');
  return `<p class="about-todo"><span class="about-todo__tag">${TODO}</span><span>${esc(rest)}</span></p>`;
}

function paragraph(text) {
  return isTodo(text) ? todoNote(text) : `<p>${esc(text)}</p>`;
}

// A sentence may end with an inline "TODO: ..." the owner must settle.
function withInlineTodo(text) {
  const at = String(text).indexOf(TODO);
  if (at === -1) return esc(text);
  return `${esc(text.slice(0, at))}<mark class="about-todo-inline">${esc(text.slice(at))}</mark>`;
}

// A supporting stock photo from content.photos; renders nothing when the slot is missing.
function photoFigure(photo, className, sizes) {
  if (!photo) return '';
  return `<img class="about-stock ${className}" src="${esc(photo.src)}" srcset="${esc(photo.srcSmall)} 800w, ${esc(photo.src)} 1600w" sizes="${sizes}" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async">`;
}

function story(block, workspace) {
  return `<div class="about-story">
  <figure class="about-photo">
    <div class="about-photo__frame">
      <img src="${esc(block.photo.src)}" alt="${esc(block.photo.alt)}" width="400" height="480" loading="lazy">
      <span class="about-photo__todo">${esc(block.photo.note)}</span>
    </div>
    <figcaption>${esc(block.caption)}</figcaption>
  </figure>
  <div class="about-story__text stack">
    ${block.paragraphs.map(paragraph).join('\n    ')}
  </div>
  ${photoFigure(workspace, 'about-stock--workspace', '(min-width: 1200px) 1120px, 100vw')}
</div>`;
}

function reasons(items) {
  return `<div class="about-reasons">
  ${items
    .map(
      (item) => `<article class="about-reason">
    <h3 class="h3">${esc(item.title)}</h3>
    <div class="about-reason__body">
      <p class="about-reason__text">${esc(item.text)}</p>
      ${checkList(item.points)}
    </div>
  </article>`,
    )
    .join('\n  ')}
</div>`;
}

function timezoneTable(block) {
  const cols = block.columns;
  const rows = block.rows
    .map(
      (row) => `<tr>
        <th scope="row" data-label="${esc(cols.region)}">${esc(row.region)}</th>
        <td data-label="${esc(cols.overlap)}"><span>${esc(row.overlap)}${row.flag ? ` <mark class="about-todo-inline">${esc(row.flag)}</mark>` : ''}</span></td>
        <td data-label="${esc(cols.india)}"><span>${esc(row.india)}</span></td>
        <td data-label="${esc(cols.use)}"><span>${esc(row.use)}</span></td>
      </tr>`,
    )
    .join('\n      ');
  return `<div class="about-tz">
  <table class="about-tz__table">
    <thead><tr><th scope="col">${esc(cols.region)}</th><th scope="col">${esc(cols.overlap)}</th><th scope="col">${esc(cols.india)}</th><th scope="col">${esc(cols.use)}</th></tr></thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  ${paragraph(block.note)}
  <div class="about-tz__habits">
    <h3 class="h3">${esc(block.habitsTitle)}</h3>
    <ul class="about-plain-list">${block.habits.map((habit) => `<li>${withInlineTodo(habit)}</li>`).join('')}</ul>
  </div>
</div>`;
}

function limits(items) {
  return `<dl class="about-limits">
  ${items.map((item) => `<div class="about-limit"><dt>${esc(item.title)}</dt><dd>${esc(item.text)}</dd></div>`).join('\n  ')}
</dl>`;
}

function tools(block) {
  return `<dl class="about-tools">
  ${block.groups.map((group) => `<div class="about-tool"><dt>${esc(group.label)}</dt><dd>${esc(group.items)}</dd></div>`).join('\n  ')}
</dl>
<p class="about-disclaimer small muted">${esc(block.disclaimer)}</p>`;
}

function processBody(items, photo) {
  const image = photoFigure(photo, 'about-stock--process', '(min-width: 1100px) 440px, (min-width: 900px) 40vw, 100vw');
  return image ? `<div class="about-process">${image}${steps(items)}</div>` : steps(items);
}

export default function pages({ content, site }) {
  const about = content.about;
  const photos = content.photos || {};
  return [
    {
      path: '/about/',
      title: about.meta.title,
      description: about.meta.description,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: site.founder,
        jobTitle: about.jsonLd.jobTitle,
        url: `${site.url}/about/`,
        image: `${site.url}${about.story.photo.src}`,
        address: { '@type': 'PostalAddress', addressCountry: about.jsonLd.country },
        worksFor: { '@type': 'Organization', name: site.name, url: site.url },
        knowsAbout: site.stack,
      },
      body: [
        pageHero({
          title: about.hero.title,
          lede: about.hero.lede,
          crumbs: [{ label: about.meta.title }],
          actions: auditButton(site),
        }),
        section({ id: 'founder', title: about.story.title, body: story(about.story, photos['about-workspace']) }),
        section({ id: 'why', tone: 'tint', title: about.why.title, lede: about.why.lede, body: reasons(about.why.items) }),
        section({ id: 'time-zones', title: about.timezones.title, lede: about.timezones.lede, body: timezoneTable(about.timezones) }),
        section({ id: 'process', tone: 'ink', title: about.process.title, lede: about.process.lede, body: processBody(about.process.steps, photos['process-whiteboard']) }),
        section({ id: 'limits', title: about.limits.title, lede: about.limits.lede, body: limits(about.limits.items) }),
        section({ id: 'tools', tone: 'tint', title: about.tools.title, lede: about.tools.lede, body: tools(about.tools) }),
      ].join('\n'),
    },
  ];
}
