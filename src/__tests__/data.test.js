import { describe, expect, it } from 'vitest';
import { about, experience, profile, projects, skills, socials, websites } from '../data.js';
import { shot } from '../shots.js';

const isUrl = (value) => {
  try {
    return ['http:', 'https:', 'mailto:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

describe('site content (data.js)', () => {
  it('has a valid contact email and WhatsApp number', () => {
    expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/);
    if (profile.whatsapp) expect(profile.whatsapp).toMatch(/^\d{10,15}$/);
  });

  it('only links to real URLs', () => {
    const links = [
      profile.linkedin,
      profile.github,
      ...socials.map((s) => s.href),
      ...projects.flatMap((p) => p.links.map((l) => l.href)),
      ...websites.map((w) => w.href),
    ].filter(Boolean);

    for (const link of links) expect(isUrl(link), link).toBe(true);
  });

  it.each(projects.map((p) => [p.title, p]))('project "%s" is complete', (_title, project) => {
    for (const field of ['title', 'kind', 'problem', 'role', 'result']) {
      expect(project[field], field).toBeTruthy();
    }
    expect(project.tech.length).toBeGreaterThan(0);
  });

  it('has a screenshot file for every website card', () => {
    for (const site of websites) expect(shot(site.shot), site.shot).toBeTruthy();
  });

  it('has no empty skill groups or duplicate skills', () => {
    for (const group of skills) {
      expect(group.items.length, group.title).toBeGreaterThan(0);
      expect(new Set(group.items).size, group.title).toBe(group.items.length);
    }
  });

  it('lists experience newest first', () => {
    const startYear = (entry) => Number(entry.dates.match(/\d{4}/)[0]);
    const years = experience.map(startYear);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });

  it('has stats that are numbers', () => {
    for (const stat of about.stats) expect(Number.isFinite(stat.value)).toBe(true);
  });
});
