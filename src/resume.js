import { about, experience, profile, projects, skills, websites } from './data.js';
import { photo } from './shots.js';

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const fullName = `${profile.firstName} ${profile.lastName}`;
const strip = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

const ICON = {
  mail: '<path d="M2 4h12v8H2z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="m2.5 4.5 5.5 4 5.5-4" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  pin: '<path d="M8 1.6c2.3 0 4 1.8 4 4C12 8.9 8 14.4 8 14.4S4 8.9 4 5.6c0-2.2 1.7-4 4-4z" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="5.6" r="1.5" fill="currentColor"/>',
  link: '<path d="M6.5 9.5a3 3 0 0 0 4.2 0l2-2a3 3 0 1 0-4.2-4.2l-.8.8" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M9.5 6.5a3 3 0 0 0-4.2 0l-2 2a3 3 0 1 0 4.2 4.2l.8-.8" fill="none" stroke="currentColor" stroke-width="1.3"/>',
};
const icon = (name) => `<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">${ICON[name]}</svg>`;

/** A4 résumé built from the same content as the site. */
export function buildResumeHTML() {
  const src = photo();
  const contacts = [
    ['mail', profile.email, `mailto:${profile.email}`],
    ['pin', profile.location, null],
    ...(profile.linkedin ? [['link', strip(profile.linkedin), profile.linkedin]] : []),
    ...(profile.github ? [['link', strip(profile.github), profile.github]] : []),
  ]
    .map(([ic, label, href]) => {
      const inner = `${icon(ic)}<span>${esc(label)}</span>`;
      return href ? `<a href="${esc(href)}">${inner}</a>` : `<span class="c">${inner}</span>`;
    })
    .join('');

  const isEdu = (x) => /\bB\.?E\b|degree|college|university/i.test(`${x.role} ${x.org}`);
  const jobs = experience.filter((x) => !isEdu(x))
    .map((x) => `
      <article class="entry">
        <div class="entry-head">
          <h3>${esc(x.role)}</h3>
          <time>${esc(x.dates)}</time>
        </div>
        <p class="org">${esc(x.org)}</p>
        <p>${esc(x.summary)}</p>
        ${x.points.length ? `<ul>${x.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
      </article>`)
    .join('');

  const work = projects
    .map((p) => `
      <article class="entry project">
        <div class="entry-head">
          <h3>${esc(p.title)}</h3>
          <time>${esc(p.year)}</time>
        </div>
        <p class="org">${esc(p.kind)}</p>
        <p><b>Role</b> ${esc(p.role)}</p>
        <p><b>Outcome</b> ${esc(p.result)}</p>
        <p class="tags">${p.tech.map((t) => `<span>${esc(t)}</span>`).join('')}</p>
      </article>`)
    .join('');

  const skillBlocks = skills
    .map((s) => `<div class="skill"><h4>${esc(s.title)}</h4><p>${s.items.map(esc).join(' · ')}</p></div>`)
    .join('');

  const sites = websites
    .map((w) => `<li><b>${esc(w.name)}</b><span>${esc(w.kind)}</span><em>${esc(strip(w.href))}</em></li>`)
    .join('');

  const eduBlock = experience.filter(isEdu)
    .map((e) => `<div class="edu"><h4>${esc(e.role)}</h4><p>${esc(e.org)}</p><time>${esc(e.dates)}</time></div>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(fullName)} — Résumé</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Hanken+Grotesk:wght@400;500;600&display=swap">
<style>
  :root {
    --ink: #0c2233; --body: #2f4a5c; --soft: #64818f; --hair: #dde8ed;
    --teal: #0f8f86; --deep-1: #0b2f45; --deep-2: #12566a; --wash: #f2f8fa;
    --display: "Bricolage Grotesque", Georgia, serif;
    --sans: "Hanken Grotesk", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #e8eef1; }
  body { font: 10pt/1.5 var(--sans); color: var(--body); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { width: 210mm; min-height: 297mm; margin: 6mm auto; background: #fff; box-shadow: 0 10px 40px rgb(12 34 51 / .18); overflow: hidden; }

  /* header band */
  .band { position: relative; display: flex; align-items: center; gap: 9mm; padding: 12mm 14mm 10mm;
          background: linear-gradient(120deg, var(--deep-1) 0%, var(--deep-2) 62%, var(--teal) 130%); color: #eaf6f8; }
  .band::after { content: ""; position: absolute; inset-inline: 0; bottom: 0; height: 10mm;
                 background: radial-gradient(60% 100% at 20% 0%, rgb(255 255 255 / .10), transparent 70%); }
  .avatar { width: 30mm; height: 30mm; border-radius: 50%; object-fit: cover; object-position: top;
            border: 1.2mm solid rgb(255 255 255 / .22); box-shadow: 0 6mm 12mm rgb(0 0 0 / .25); flex: none; }
  .band h1 { margin: 0; font: 700 27pt/1 var(--display); letter-spacing: -0.02em; }
  .band .role { margin: 2mm 0 3mm; font-size: 11.5pt; font-weight: 600; color: #8ff0e2; }
  .contacts { display: flex; flex-wrap: wrap; gap: 2mm 5mm; font-size: 8.8pt; }
  .contacts a, .contacts .c { display: inline-flex; align-items: center; gap: 1.6mm; color: #d3e9ef; text-decoration: none; }

  /* body */
  .body { display: grid; grid-template-columns: 1fr 62mm; gap: 9mm; padding: 9mm 14mm 14mm; }
  h2 { margin: 0 0 3mm; font: 700 9pt/1 var(--sans); letter-spacing: .14em; text-transform: uppercase; color: var(--teal); }
  h2::after { content: ""; display: block; height: 1px; margin-top: 2mm; background: var(--hair); }
  section + section { margin-top: 7mm; }
  .summary { margin: 0 0 6mm; font-size: 10.2pt; color: var(--ink); }

  .entry { position: relative; padding-left: 5mm; margin-bottom: 5mm; break-inside: avoid; }
  .entry::before { content: ""; position: absolute; left: 0; top: 1.6mm; width: 2mm; height: 2mm; border-radius: 50%; background: var(--teal); }
  .entry::after { content: ""; position: absolute; left: 0.9mm; top: 5mm; bottom: -3mm; width: 0.3mm; background: var(--hair); }
  .entry:last-child::after { display: none; }
  .entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
  .entry h3 { margin: 0; font: 600 11.5pt/1.25 var(--display); color: var(--ink); }
  .entry time { font-size: 8.6pt; color: var(--soft); white-space: nowrap; }
  .entry .org { margin: 0.5mm 0 1.5mm; font-weight: 600; color: var(--teal); font-size: 9.4pt; }
  .entry p { margin: 0 0 1.2mm; }
  .entry b { color: var(--ink); }
  .entry ul { margin: 1mm 0 0; padding-left: 4mm; }
  .entry li { margin: 0.8mm 0; }
  .project::before { background: var(--deep-2); }
  .tags { display: flex; flex-wrap: wrap; gap: 1.2mm; margin-top: 1.6mm !important; }
  .tags span { font-size: 7.8pt; padding: 0.6mm 1.8mm; border-radius: 1mm; background: var(--wash); color: var(--soft); border: 0.2mm solid var(--hair); }

  /* right rail */
  .rail section { background: var(--wash); border: 0.25mm solid var(--hair); border-radius: 2mm; padding: 4mm; }
  .rail section + section { margin-top: 4mm; }
  .rail h2 { color: var(--deep-2); }
  .skill + .skill { margin-top: 2.4mm; padding-top: 2.4mm; border-top: 0.2mm dotted var(--hair); }
  .skill h4 { margin: 0 0 0.6mm; font-size: 9.2pt; color: var(--ink); }
  .skill p { margin: 0; font-size: 8.6pt; color: var(--soft); }
  .edu + .edu { margin-top: 3mm; }
  .edu h4 { margin: 0; font-size: 9.6pt; color: var(--ink); }
  .edu p { margin: 0.4mm 0; font-size: 8.8pt; color: var(--teal); font-weight: 600; }
  .edu time { font-size: 8.4pt; color: var(--soft); }
  .rail ul { margin: 0; padding: 0; list-style: none; }
  .rail li { padding: 1.8mm 0; border-bottom: 0.2mm dotted var(--hair); font-size: 8.6pt; }
  .rail li:last-child { border-bottom: 0; }
  .rail li b { display: block; color: var(--ink); font-size: 9.2pt; }
  .rail li span { color: var(--soft); }
  .rail li em { display: block; font-style: normal; color: var(--teal); }

  @page { size: A4; margin: 0; }
  @media print {
    html, body { background: #fff; }
    .sheet { margin: 0; box-shadow: none; width: auto; min-height: 0; }
  }
</style>
</head>
<body>
  <main class="sheet">
    <header class="band">
      ${src ? `<img class="avatar" src="${src}" alt="${esc(fullName)}">` : ''}
      <div>
        <h1>${esc(fullName)}</h1>
        <p class="role">${esc(profile.role.replace(/ crafting$/, ''))}</p>
        <div class="contacts">${contacts}</div>
      </div>
    </header>

    <div class="body">
      <div class="main">
        <p class="summary">${esc(about.paragraphs[0])}</p>

        <section>
          <h2>Experience</h2>
          ${jobs}
        </section>

        <section>
          <h2>Selected projects</h2>
          ${work}
        </section>
      </div>

      <aside class="rail">
        <section>
          <h2>Skills</h2>
          ${skillBlocks}
        </section>
        <section>
          <h2>Education</h2>
          ${eduBlock}
        </section>
        <section>
          <h2>Websites delivered</h2>
          <ul>${sites}</ul>
        </section>
      </aside>
    </div>
  </main>
</body>
</html>`;
}

/**
 * Opens the résumé in a new tab and starts the print dialog, where it can be
 * saved as PDF. Returns false when the browser blocked the pop-up.
 */
export function openResume() {
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.write(buildResumeHTML());
  win.document.close();
  win.focus();
  const print = () => { try { win.print(); } catch { /* the tab is still usable */ } };
  if (win.document.readyState === 'complete') setTimeout(print, 600);
  else win.addEventListener('load', () => setTimeout(print, 600));
  return true;
}
