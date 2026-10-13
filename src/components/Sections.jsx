import {
  ArrowUpRight,
  Check,
  Database,
  Monitor,
  Palette,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  WifiOff,
} from 'lucide-react';
import { about, experience, profile, projects, skills } from '../data.js';
import { photo, shot } from '../shots.js';
import AskPanel from './AskPanel.jsx';
import SiteShowcase from './SiteShowcase.jsx';
import { Reveal, SectionHead, SmartLink, Tilt } from './ui.jsx';

/** Instagram glyph (lucide-react no longer ships brand icons). */
function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

const instagramHandle = (url) => url.replace(/\/$/, '').split('/').pop();

const TECH_PILL =
  'rounded-md border border-line bg-ink-3/80 px-2.5 py-1.5 font-mono text-[11px] leading-none text-muted';

/* ───────────────────────── ABOUT ───────────────────────── */
export function About() {
  const portrait = photo();

  return (
    <section id="about" aria-labelledby="about-title" className="py-20 md:py-32">
      <div className="wrap">
        <SectionHead
          index="01"
          label="About"
          id="about-title"
          title="The unglamorous middle"
          muted="is where I'm useful."
        />

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,300px)]">
          <Reveal className="w-full max-w-[300px] lg:max-w-none">
            <Tilt max={10} className="portrait-frame rounded-2xl">
              <span aria-hidden="true" className="portrait-plate portrait-plate-1" />
              <span aria-hidden="true" className="portrait-plate portrait-plate-2" />
              <div className="relative overflow-hidden card">
                {portrait ? (
                  <img
                    src={portrait}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    width="572"
                    height="858"
                    className="aspect-[2/3] w-full object-cover object-top"
                  />
                ) : (
                  <div className="grid aspect-[2/3] w-full place-items-center bg-ink-3 p-4 text-center label-mono text-dim">
                    Add src/assets/photo.jpg
                  </div>
                )}
                {profile.instagram && (
                  <a
                    href={profile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram profile"
                    className="flex items-center gap-2 border-t border-line px-4 py-3 label-mono text-muted no-underline transition-colors hover:text-accent"
                  >
                    <InstagramIcon />@{instagramHandle(profile.instagram)}
                  </a>
                )}
              </div>
            </Tilt>
          </Reveal>

          <Reveal
            delay={0.05}
            className="grid max-w-[62ch] gap-6 text-[clamp(1.05rem,1.4vw,1.15rem)] leading-relaxed"
          >
            {about.paragraphs.map((paragraph, i) => (
              <p key={paragraph} className={i > 0 ? 'text-muted' : ''}>
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.1}>
            <Tilt as="aside" aria-label="Working principles" className="card glass p-6">
              <h3 className="mb-3 label-mono font-medium text-dim uppercase">How I work</h3>
              <ul className="depth-1 divide-y divide-line">
                {about.principles.map((principle) => (
                  <li
                    key={principle}
                    className="grid grid-cols-[auto_1fr] gap-3 py-3 text-[0.95rem] before:font-mono before:text-accent before:content-['→']"
                  >
                    {principle}
                  </li>
                ))}
              </ul>
            </Tilt>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-3 lg:col-span-3">
            {about.stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.06}>
                <Tilt max={10} className="h-full card glass p-6">
                  <p className="depth-2 flex items-baseline gap-1 text-[clamp(2.5rem,5.5vw,4rem)] leading-none font-bold tracking-[-.05em]">
                    <span className="text-3d tabular-nums">{stat.value}</span>
                    <span className="text-[.38em] tracking-normal text-accent">{stat.suffix}</span>
                  </p>
                  <p className="mt-4 max-w-[30ch] text-sm text-muted">{stat.label}</p>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── SKILLS ───────────────────────── */
const SKILL_ICONS = {
  react: Monitor,
  'react native': Smartphone,
  craft: Palette,
  '.net': Server,
  sql: Database,
};

function SkillCard({ skill, index }) {
  const Icon = SKILL_ICONS[skill.tag] ?? Monitor;
  return (
    <Reveal delay={(index % 3) * 0.06}>
      <Tilt as="article" className="grid h-full content-start gap-4 card glass p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="icon-cube depth-3" aria-hidden="true">
            <Icon size={20} />
          </span>
          <span className="label-mono text-dim">{skill.tag}</span>
        </div>
        <h3 className="depth-1 text-xl font-semibold">{skill.title}</h3>
        <p className="text-sm text-muted">{skill.note}</p>
        <ul className="depth-1 flex flex-wrap gap-2">
          {skill.items.map((item) => (
            <li key={item} className={TECH_PILL}>
              {item}
            </li>
          ))}
        </ul>
      </Tilt>
    </Reveal>
  );
}

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="pb-20 md:pb-32">
      <div className="wrap">
        <SectionHead
          index="02"
          label="Skills"
          id="skills-title"
          title="A toolkit for the"
          muted="whole request lifecycle."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, i) => (
            <SkillCard key={skill.title} skill={skill} index={i} />
          ))}
          <Reveal delay={0.12}>
            <Tilt className="grid h-full content-between gap-6 card border-accent/40 bg-[linear-gradient(140deg,color-mix(in_oklab,var(--color-accent)_16%,transparent),color-mix(in_oklab,var(--color-glow)_14%,transparent))] p-6">
              <div className="depth-1 grid gap-2">
                <h3 className="text-xl font-semibold">Need this on your team?</h3>
                <p className="text-sm text-muted">
                  Mobile app, web front end, or both — tell me what you are building.
                </p>
              </div>
              <a
                href="#contact"
                className="depth-2 inline-flex w-fit items-center gap-2 rounded-full border border-accent px-4 py-2.5 text-sm font-semibold text-accent no-underline transition-colors duration-200 hover:bg-accent hover:text-accent-ink"
              >
                Start a conversation <ArrowUpRight size={15} />
              </a>
            </Tilt>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── PROJECTS ───────────────────────── */
/** Drawn after the real MRH home screen: hero + search, coupon band, New & Featured, floating tab bar. */
function ShopScreen() {
  return (
    <div className="relative flex h-full flex-col bg-[#fdfbf3] font-serif text-[#2b1d14]">
      <div className="relative -mt-4 h-[38%] shrink-0 overflow-hidden bg-[linear-gradient(180deg,#9fb6cf_0%,#c9d3dc_38%,#8a6b7a_62%,#b76e8f_78%,#5b3a2e_100%)]">
        <div className="absolute inset-x-0 bottom-[22%] flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="size-5 rounded-full bg-[radial-gradient(circle,#c2541f_35%,#e7a1c0_40%,#d77fa6_70%,transparent_72%)]"
            />
          ))}
        </div>
        <div className="absolute inset-x-0 top-[26%] text-center">
          <svg viewBox="0 0 60 16" className="mx-auto h-3 w-10" aria-hidden="true">
            <path d="M0 16 L22 3 L30 9 L40 0 L60 16 Z" fill="#5a1a14" />
          </svg>
          <p className="text-[9px] tracking-wide">mountain rose herbs</p>
        </div>
        <div className="absolute inset-x-2 bottom-2 flex items-center gap-1 rounded-full border border-[#2b1d14]/60 bg-[#fdf8e6] px-2 py-1 font-sans text-[7px] text-[#6b5a3a]">
          <Search size={8} />
          What can we help you find today?
        </div>
      </div>
      <div className="shrink-0 bg-[#b39a5b] px-2 py-1.5 text-center">
        <p className="text-[8px] leading-tight">Save up to $75 on your Order*!</p>
        <p className="mt-0.5 font-sans text-[5.5px] font-semibold tracking-[.2em]">VIEW DETAILS</p>
      </div>
      <p className="mt-2 text-center font-sans text-[5px] tracking-[.2em] text-[#6b5a3a]">
        ORGANIC GOODS FOR NATURAL LIVING
      </p>
      <p className="text-center text-[10px]">New &amp; Featured</p>
      <div className="mt-1.5 grid grid-cols-2 gap-1.5 px-2">
        {[
          ['California Poppy', '#e9b72a'],
          ['Goldenseal Root', '#6f7a2e'],
        ].map(([name, colour]) => (
          <div key={name} className="flex flex-col gap-0.5">
            <div className="grid aspect-square place-items-center rounded bg-white">
              <span className="relative h-9 w-4 rounded-t-[3px] rounded-b-sm bg-[#4a2a18]">
                <span className="absolute -top-2 left-1 h-2.5 w-2 rounded-t-full bg-[#1a1a1a]" />
                <span className="absolute inset-x-0.5 top-3 h-3 bg-[#f4efe2]" />
              </span>
              <span
                className="-mt-3 h-1.5 w-8 rounded-full opacity-80"
                style={{ background: colour }}
              />
            </div>
            <span className="text-[6.5px] leading-tight">{name}</span>
            <span className="font-sans text-[6px] text-[#8a6d1f]">★ 5</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-2 bottom-2 flex justify-around rounded-full border border-white/60 bg-[#e8e0cc]/90 py-1.5 font-sans text-[5.5px] font-semibold">
        {['Home', 'Shop', 'Cart', 'Account'].map((tab, i) => (
          <span key={tab} className={i ? 'text-[#5b4a3a]' : 'text-[#2b1d14]'}>
            {tab}
          </span>
        ))}
      </div>
    </div>
  );
}

function CheckinScreen() {
  const kids = [
    ['Ava M.', '7K4Q', 'bg-[#8ecae6]'],
    ['Noah K.', '7K4Q', 'bg-[#ffb4a2]'],
    ['Leo S.', 'P2X9', 'bg-[#b8e0a0]'],
  ];
  return (
    <div className="flex h-full flex-col gap-2.5 p-3">
      <div className="text-[13px] font-semibold">Sunday check-in</div>
      {kids.map(([name, code, colour]) => (
        <div key={name} className="flex items-center gap-2 rounded-lg bg-white/6 p-2">
          <span
            className={`grid size-6 place-items-center rounded-full text-[9px] font-bold text-ink ${colour}`}
          >
            {name[0]}
          </span>
          <span className="flex-1 text-[9.5px]">{name}</span>
          <span className="rounded bg-accent/20 px-1 font-mono text-[8px] text-accent-2">
            {code}
          </span>
          <Check size={11} className="text-[#5be49b]" />
        </div>
      ))}
      <div className="mt-auto flex items-center justify-center gap-1 rounded-lg bg-accent py-2 text-[9.5px] font-semibold text-accent-ink">
        <ShieldCheck size={11} />
        Print name tags
      </div>
    </div>
  );
}

function Phone({ className = '', children }) {
  return (
    <div
      className={`phone-3d absolute aspect-[9/19] h-[270px] rounded-[28px] border border-white/20 bg-ink/90 p-1.5 sm:h-[380px] lg:h-[440px] ${className}`}
    >
      <div className="absolute top-2.5 left-1/2 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-black/80" />
      <div className="h-full overflow-hidden rounded-[22px] bg-[#0c1322] pt-4 text-paper">
        {children}
      </div>
    </div>
  );
}

function ProjectScreen({ project, image }) {
  if (image) {
    return (
      <img src={image} alt="" loading="lazy" className="-mt-4 size-full object-cover object-top" />
    );
  }
  return project.mock === 'shop' ? <ShopScreen /> : <CheckinScreen />;
}

function ProjectCard({ project, index }) {
  const flip = index % 2 === 1;
  const image = shot(project.shot);
  const secondImage = shot(project.shot2);

  return (
    <Reveal
      as="article"
      className="grid overflow-hidden card transition-colors duration-300 hover:border-line-2 lg:grid-cols-2"
    >
      <div
        data-tilt-scope
        className={`media-grid relative min-h-[360px] overflow-hidden border-b border-line [perspective:1100px] sm:min-h-[460px] lg:min-h-[580px] lg:border-b-0 ${
          flip ? 'lg:order-2 lg:border-l' : 'lg:border-r'
        } ${project.theme}`}
      >
        <div aria-hidden="true" className="project-floor" />
        <Tilt
          max={12}
          scope="[data-tilt-scope]"
          role="img"
          aria-label={
            image
              ? `${project.title} app, first screen`
              : `Illustration of the ${project.title} app`
          }
          className="tilt-bare absolute inset-0 grid place-items-center"
        >
          {secondImage && (
            <Phone className="phone-back hidden sm:block">
              <img
                src={secondImage}
                alt=""
                loading="lazy"
                className="-mt-4 size-full object-cover object-top"
              />
            </Phone>
          )}
          <Phone className={secondImage ? 'phone-front' : 'phone-solo'}>
            <ProjectScreen project={project} image={image} />
          </Phone>
          <span className="phone-badge absolute top-[12%] right-[7%] flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/90 px-2.5 py-1 label-mono text-[10px] text-paper">
            {project.mock === 'shop' ? (
              <>
                <WifiOff size={11} className="text-accent" /> Offline ready
              </>
            ) : (
              <>
                <ShieldCheck size={11} className="text-accent" /> Secure pickup
              </>
            )}
          </span>
        </Tilt>
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-baseline justify-between gap-3 label-mono text-dim uppercase">
          <p>{project.kind}</p>
          <p>{project.year}</p>
        </div>
        <h3 className="text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold">{project.title}</h3>
        <p className="text-muted">
          <strong className="font-semibold text-paper">Problem:</strong> {project.problem}
        </p>
        <p className="text-muted">
          <strong className="font-semibold text-paper">My role:</strong> {project.role}
        </p>
        <p className="flex items-baseline gap-3 border-y border-line py-3">
          <span className="shrink-0 label-mono text-accent uppercase">Result</span>
          {project.result}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <li key={tech} className={TECH_PILL}>
              {tech}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-6 pt-3">
          {project.links.map((link) => (
            <SmartLink
              key={link.label}
              href={link.href}
              placeholder={`Add the ${project.title} ${link.label.replace(' ↗', '')} URL`}
              className="text-sm font-semibold text-accent no-underline underline-offset-4 hover:underline"
            >
              {link.label}
            </SmartLink>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/** Ask-me panel: an assistant-style way into the same facts. */
export function Ask() {
  return (
    <section id="ask" aria-labelledby="ask-title" className="pb-20 md:pb-32">
      <div className="wrap">
        <SectionHead
          index="03"
          label="Ask"
          id="ask-title"
          title="Ask about my work,"
          muted="get the short answer."
        />
        <Reveal>
          <AskPanel />
        </Reveal>
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section id="work" aria-labelledby="work-title" className="pb-20 md:pb-32">
      <div className="wrap">
        <SectionHead
          index="04"
          label="Work"
          id="work-title"
          title="Apps I've shipped"
          muted="and the problems they solve."
        />
        <div className="grid gap-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
        <SiteShowcase />
      </div>
    </section>
  );
}

/* ───────────────────────── EXPERIENCE ───────────────────────── */
export function Experience() {
  return (
    <section id="experience" aria-labelledby="exp-title" className="pb-20 md:pb-32">
      <div className="wrap">
        <SectionHead
          index="05"
          label="Experience"
          id="exp-title"
          title="Where I've"
          muted="worked and studied."
        />
        <ol className="relative grid gap-6">
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[5px] w-px bg-gradient-to-b from-accent via-line-2 to-transparent md:left-[220px]"
          />
          {experience.map((entry) => {
            const isCurrent = /present/i.test(entry.dates);
            return (
              <Reveal
                as="li"
                key={`${entry.role}-${entry.org}`}
                className="relative grid gap-3 pl-8 md:grid-cols-[220px_1fr] md:gap-0 md:pl-0"
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-6 left-0 z-10 size-[11px] rounded-full border-2 md:left-[215px] ${
                    isCurrent
                      ? 'border-accent bg-accent shadow-[0_0_14px_var(--color-accent)]'
                      : 'border-line-2 bg-ink'
                  }`}
                />
                <div className="flex flex-wrap items-center gap-3 md:grid md:content-start md:gap-1.5 md:pt-5 md:pr-8">
                  <time className="text-sm text-paper">{entry.dates}</time>
                  <span
                    className={`w-fit rounded border px-1.5 py-0.5 label-mono text-[10px] tracking-[.12em] uppercase ${
                      isCurrent ? 'border-accent/50 text-accent' : 'border-line-2 text-dim'
                    }`}
                  >
                    {isCurrent ? 'Current' : 'Completed'}
                  </span>
                </div>
                <div className="md:pl-12">
                  <Tilt
                    max={4}
                    className={`grid max-w-[760px] gap-3 card glass p-6 md:p-7 ${
                      isCurrent ? 'border-accent/35' : ''
                    }`}
                  >
                    <h3 className="depth-1 text-[clamp(1.3rem,2.2vw,1.75rem)] font-semibold">
                      {entry.role} <span className="font-normal text-muted">· {entry.org}</span>
                    </h3>
                    <p className="text-muted">{entry.summary}</p>
                    {entry.points.length > 0 && (
                      <ul className="grid gap-2">
                        {entry.points.map((point) => (
                          <li
                            key={point}
                            className="relative pl-6 text-[0.95rem] before:absolute before:left-0 before:font-mono before:text-accent before:content-['›']"
                          >
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Tilt>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
