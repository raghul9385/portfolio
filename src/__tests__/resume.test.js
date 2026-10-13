import { describe, expect, it, vi } from 'vitest';
import { experience, profile, projects } from '../data.js';
import { buildResumeHTML, openResume } from '../resume.js';

describe('buildResumeHTML', () => {
  const html = buildResumeHTML();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  it('is titled with the full name', () => {
    expect(doc.title).toBe(`${profile.firstName} ${profile.lastName} — Résumé`);
    expect(doc.querySelector('h1').textContent).toBe(`${profile.firstName} ${profile.lastName}`);
  });

  it('lists the contact details', () => {
    expect(doc.querySelector(`a[href="mailto:${profile.email}"]`)).not.toBeNull();
    expect(doc.querySelector(`a[href="${profile.linkedin}"]`)).not.toBeNull();
  });

  it('includes every job and project', () => {
    const headings = [...doc.querySelectorAll('h3')].map((h) => h.textContent);

    for (const project of projects) expect(headings).toContain(project.title);
    for (const job of experience.filter((x) => x.points.length)) {
      expect(headings).toContain(job.role);
    }
  });

  it('puts the degree under Education, not Experience', () => {
    const education = experience.find((x) => x.university);
    expect(doc.querySelector('.edu h4').textContent).toBe(education.role);
    expect(doc.querySelector('.edu time').textContent).toContain(education.grade);
  });
});

describe('openResume', () => {
  it('returns false when the browser blocks the pop-up', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    expect(openResume()).toBe(false);
  });

  it('writes the résumé into the new tab', () => {
    const tab = {
      document: { write: vi.fn(), close: vi.fn(), readyState: 'loading' },
      focus: vi.fn(),
      print: vi.fn(),
      addEventListener: vi.fn(),
    };
    vi.spyOn(window, 'open').mockReturnValue(tab);

    expect(openResume()).toBe(true);
    expect(tab.document.write).toHaveBeenCalledWith(buildResumeHTML());
    expect(tab.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
  });
});
