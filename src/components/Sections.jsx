import { motion, useScroll, useSpring } from 'motion/react';
import { ArrowUpRight, Check, Search, ShieldCheck, WifiOff } from 'lucide-react';
import { useRef } from 'react';
import { about, experience, profile, projects, skills } from '../data.js';
import { EASE } from '../hooks.js';
import { photo, shot } from '../shots.js';
import SiteShowcase from './SiteShowcase.jsx';
import AskPanel from './AskPanel.jsx';
import { Brackets, Counter, Reveal, SectionHead, SmartLink } from './ui.jsx';

/** Instagram glyph (lucide-react no longer ships brand icons). */
function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

/* ───────────────────────── ABOUT ───────────────────────── */
export function About() {
  const portrait = photo();
  return (
    <section id="about" aria-labelledby="about-title" className="py-20 md:py-32">
      <div className="wrap">
        <SectionHead index="01" id="about-title" path="/about" title="The unglamorous middle" muted="is where I'm useful." />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)_minmax(0,300px)]">
          <Reveal className="overflow-hidden rounded-2xl border border-line bg-ink-2/85">
            {portrait
              ? <img src={portrait} alt="Raghul Babu J" width="1000" height="1250" className="aspect-[4/5] w-full object-cover object-center" />
              : <div className="label-mono grid aspect-[4/5] w-full place-items-center bg-ink-3 p-4 text-center text-dim">Add src/assets/photo.jpg</div>}
            <p className="label-mono flex items-center justify-between gap-2 border-t border-line px-3 py-2.5 text-dim">
              {profile.instagram
                ? <a href={profile.instagram} target="_blank" rel="noopener" aria-label="Instagram profile"
                    className="inline-flex items-center gap-1.5 text-muted no-underline transition-colors hover:text-surf">
                    <InstagramIcon />@{profile.instagram.replace(/\/$/, '').split('/').pop()}
                  </a>
                : 'raghul.jpg'}
              <span className="text-surf">● available</span>
            </p>
          </Reveal>

          <Reveal delay={0.06} className="grid max-w-[62ch] gap-6 text-[clamp(1.05rem,1.5vw,1.2rem)] leading-relaxed">
            {about.paragraphs.map((p, i) => <p key={i} className={i ? 'text-muted' : ''}>{p}</p>)}
          </Reveal>

          <Reveal as="aside" delay={0.12} aria-label="Working principles" className="rounded-2xl border border-line bg-ink-2/85 p-6">
            <h3 className="label-mono mb-3 font-medium uppercase text-dim">How I work</h3>
            <ul className="divide-y divide-line">
              {about.principles.map((p) => (
                <li key={p} className="grid grid-cols-[auto_1fr] gap-3 py-3 text-[0.95rem] before:font-mono before:text-surf before:content-['→']">{p}</li>
              ))}
            </ul>
          </Reveal>

          <div className="grid border-t border-line md:grid-cols-3 lg:col-span-3">
            {about.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08} className="border-b border-line py-6 md:border-b-0 md:py-8 md:pr-6 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-6">
                <div className="flex items-start gap-1 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-none tracking-[-.04em]">
                  <Counter value={s.value} /><span className="mt-[.15em] text-[.35em] tracking-normal text-surf">{s.suffix}</span>
                </div>
                <p className="mt-2 max-w-[28ch] text-sm text-muted">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── SKILLS ───────────────────────── */
function SkillPanel({ s, i }) {
  return (
    <Reveal as="article" delay={i * 0.05}
      className="group relative grid content-start gap-4 bg-ink/80 px-6 py-8 transition-colors duration-300 hover:bg-ink-2/80"
    >
      <Brackets />
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[1.625rem] font-semibold">{s.title}</h3>
        <span className="label-mono text-dim">{s.tag}</span>
      </div>
      <p className="text-sm text-muted">{s.note}</p>
      <ul className="flex flex-wrap gap-2">
        {s.items.map((t) => (
          <li key={t} className="rounded-full border border-line-2 px-3 py-1 text-sm transition-colors duration-300 hover:border-surf hover:text-surf">{t}</li>
        ))}
      </ul>
    </Reveal>
  );
}

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="pb-20 md:pb-32">
      <div className="wrap">
        <SectionHead index="02" id="skills-title" path="/skills" title="A toolkit for the" muted="whole request lifecycle." />
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line/70 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s, i) => (
            <SkillPanel key={s.title} s={s} i={i} />
          ))}
          <Reveal delay={0.3} y={24} className="relative grid content-between gap-6 bg-[linear-gradient(140deg,color-mix(in_oklab,var(--color-glow)_20%,transparent),transparent_60%)] px-6 py-8">
            <p className="label-mono uppercase text-surf">Open to work</p>
            <div className="grid gap-2">
              <h3 className="text-[1.625rem] font-semibold">Need this on your team?</h3>
              <p className="text-sm text-muted">Mobile app, web front end, or both — tell me what you are building.</p>
            </div>
            <a href="#contact" className="group inline-flex w-fit items-center gap-2 rounded-full border border-surf px-4 py-2.5 text-sm font-semibold text-surf no-underline transition-colors duration-300 hover:bg-surf hover:text-surf-ink">
              Start a conversation
              <ArrowUpRight size={15} className="transition-transform duration-500 ease-expo group-hover:rotate-45" />
            </a>
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
          {[0, 1, 2, 3, 4].map((i) => <span key={i} className="size-5 rounded-full bg-[radial-gradient(circle,#c2541f_35%,#e7a1c0_40%,#d77fa6_70%,transparent_72%)]" />)}
        </div>
        <div className="absolute inset-x-0 top-[26%] text-center">
          <svg viewBox="0 0 60 16" className="mx-auto h-3 w-10" aria-hidden="true"><path d="M0 16 L22 3 L30 9 L40 0 L60 16 Z" fill="#5a1a14" /></svg>
          <p className="text-[9px] tracking-wide">mountain rose herbs</p>
        </div>
        <div className="absolute inset-x-2 bottom-2 flex items-center gap-1 rounded-full border border-[#2b1d14]/60 bg-[#fdf8e6] px-2 py-1 font-sans text-[7px] text-[#6b5a3a]">
          <Search size={8} />What can we help you find today?
        </div>
      </div>
      <div className="shrink-0 bg-[#b39a5b] px-2 py-1.5 text-center">
        <p className="text-[8px] leading-tight">Save up to $75 on your Order*!</p>
        <p className="mt-0.5 font-sans text-[5.5px] font-semibold tracking-[.2em]">VIEW DETAILS</p>
      </div>
      <p className="mt-2 text-center font-sans text-[5px] tracking-[.2em] text-[#6b5a3a]">ORGANIC GOODS FOR NATURAL LIVING</p>
      <p className="text-center text-[10px]">New &amp; Featured</p>
      <div className="mt-1.5 grid grid-cols-2 gap-1.5 px-2">
        {[['California Poppy', '#e9b72a'], ['Goldenseal Root', '#6f7a2e']].map(([name, c]) => (
          <div key={name} className="flex flex-col gap-0.5">
            <div className="grid aspect-square place-items-center rounded bg-white">
              <span className="relative h-9 w-4 rounded-b-sm rounded-t-[3px] bg-[#4a2a18]"><span className="absolute -top-2 left-1 h-2.5 w-2 rounded-t-full bg-[#1a1a1a]" /><span className="absolute inset-x-0.5 top-3 h-3 bg-[#f4efe2]" /></span>
              <span className="-mt-3 h-1.5 w-8 rounded-full opacity-80" style={{ background: c }} />
            </div>
            <span className="text-[6.5px] leading-tight">{name}</span>
            <span className="font-sans text-[6px] text-[#8a6d1f]">★ 5</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-2 bottom-2 flex justify-around rounded-full border border-white/60 bg-[#e8e0cc]/90 py-1.5 font-sans text-[5.5px] font-semibold backdrop-blur">
        {['Home', 'Shop', 'Cart', 'Account'].map((t, i) => <span key={t} className={i ? 'text-[#5b4a3a]' : 'text-[#2b1d14]'}>{t}</span>)}
      </div>
    </div>
  );
}

function CheckinScreen() {
  return (
    <div className="flex h-full flex-col gap-2.5 p-3">
      <div className="font-display text-[13px] font-semibold">Sunday check-in</div>
      {[['Ava M.', '7K4Q'], ['Noah K.', '7K4Q'], ['Leo S.', 'P2X9']].map(([n, code], i) => (
        <div key={n} className="flex items-center gap-2 rounded-lg bg-white/6 p-2">
          <span className={`grid size-6 place-items-center rounded-full text-[9px] font-bold text-ink ${['bg-[#8ecae6]', 'bg-[#ffb4a2]', 'bg-[#b8e0a0]'][i]}`}>{n[0]}</span>
          <span className="flex-1 text-[9.5px]">{n}</span>
          <span className="rounded bg-surf/20 px-1 font-mono text-[8px] text-surf-2">{code}</span>
          <Check size={11} className="text-[#5be49b]" />
        </div>
      ))}
      <div className="mt-auto flex items-center justify-center gap-1 rounded-lg bg-surf py-2 text-[9.5px] font-semibold text-surf-ink"><ShieldCheck size={11} />Print name tags</div>
    </div>
  );
}

function Phone({ children }) {
  return (
    <div className="relative h-[270px] aspect-[9/19] sm:h-[380px] lg:h-[460px] rounded-[28px] border border-white/15 bg-ink/90 p-1.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,.7)]">
      <div className="absolute left-1/2 top-2.5 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-black/80" />
      <div className="h-full overflow-hidden rounded-[22px] bg-[#0c1322] pt-4 text-paper">{children}</div>
    </div>
  );
}

function ProjectCard({ p, index }) {
  const flip = index % 2 === 1;
  const image = shot(p.shot);
  const image2 = shot(p.shot2);

  return (
    <Reveal>
      <motion.article
        initial="rest" whileHover="hover" animate="rest"
        className="group relative grid overflow-hidden rounded-2xl border border-line bg-ink-2/90 transition-colors duration-300 hover:border-line-2 lg:grid-cols-2"
      >
        <Brackets className="z-20" />

        <div className={`media-grid relative grid min-h-[340px] max-w-full place-items-center overflow-hidden border-b border-line sm:min-h-[440px] lg:min-h-[560px] lg:border-b-0 ${flip ? 'lg:order-2 lg:border-l' : 'lg:border-r'} ${p.theme}`}>
          <div role="img" aria-label={image ? `${p.title} app, first screen` : `Illustration of the ${p.title} app`} className="absolute inset-0 grid place-items-center">
            {image2 && (
              <motion.div aria-hidden="true" className="absolute left-[6%] top-[12%] hidden origin-bottom-right sm:block"
                variants={{ rest: { x: 0, rotate: -9, opacity: 0.6 }, hover: { x: -12, rotate: -11, opacity: 0.85 } }} transition={{ duration: 0.5, ease: EASE }}>
                <div className="origin-top-left scale-[.8]"><Phone><img src={image2} alt="" className="-mt-4 size-full object-cover object-top" /></Phone></div>
              </motion.div>
            )}
            <motion.div className={`grid place-items-center ${image2 ? 'sm:translate-x-[18%]' : ''}`} variants={{ rest: { y: 0 }, hover: { y: -8 } }} transition={{ duration: 0.5, ease: EASE }}>
              <Phone>
                {image
                  ? <img src={image} alt="" loading="lazy" className="-mt-4 size-full object-cover object-top" />
                  : p.mock === 'shop' ? <ShopScreen /> : <CheckinScreen />}
              </Phone>
            </motion.div>
            <span
              className="label-mono absolute right-[8%] top-[14%] flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/85 px-2.5 py-1 text-[10px] text-paper">
              {p.mock === 'shop' ? <><WifiOff size={11} className="text-surf" />Offline ready</> : <><ShieldCheck size={11} className="text-surf" />Secure pickup</>}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex items-baseline justify-between gap-3">
            <p className="label-mono uppercase text-dim">{p.kind}</p>
            <p className="label-mono uppercase text-dim">{p.year}</p>
          </div>
          <h3 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-.03em]">{p.title}</h3>
          <p className="text-muted"><strong className="font-semibold text-paper">Problem:</strong> {p.problem}</p>
          <p className="text-muted"><strong className="font-semibold text-paper">My role:</strong> {p.role}</p>
          <p className="flex items-baseline gap-3 border-y border-line py-3">
            <span className="label-mono shrink-0 uppercase text-surf">Result</span>{p.result}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {p.tech.map((t) => <li key={t} className="rounded-md border border-line bg-ink-3 px-2.5 py-1.5 font-mono text-[11px] leading-none text-muted">{t}</li>)}
          </ul>
          <div className="mt-auto flex gap-6 pt-3">
            {p.links.map((l) => (
              <SmartLink key={l.label} href={l.href} placeholder={`Add the ${p.title} ${l.label.replace(' ↗', '')} URL`}
                className="relative py-0.5 text-sm font-semibold no-underline after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-25 after:bg-surf after:transition-transform after:duration-500 after:ease-expo hover:after:scale-x-100 focus-visible:after:scale-x-100">
                {l.label}
              </SmartLink>
            ))}
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}

/** Ask-me panel: an assistant-style way into the same facts. */
export function Ask() {
  return (
    <section id="ask" aria-labelledby="ask-title" className="pb-20 md:pb-32">
      <div className="wrap">
        <SectionHead index="03" id="ask-title" path="/ask" title="Ask about my work" muted="get the short answer." />
        <Reveal><AskPanel /></Reveal>
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section id="work" aria-labelledby="work-title" className="pb-20 md:pb-32">
      <div className="wrap">
        <SectionHead index="04" id="work-title" path="/work" title="Apps I've shipped" muted="& the problems they solve." />
        <div className="grid gap-8">{projects.map((p, i) => <ProjectCard key={p.title} p={p} index={i} />)}</div>
        <SiteShowcase />
      </div>
    </section>
  );
}

/* ───────────────────────── EXPERIENCE ───────────────────────── */
export function Experience() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="experience" aria-labelledby="exp-title" className="pb-20 md:pb-32">
      <div className="wrap">
        <SectionHead index="05" id="exp-title" path="/experience — git log --oneline" title="Where I've" muted="committed." />
        <ol ref={ref} className="relative grid">
          <span aria-hidden="true" className="absolute bottom-2 left-[5px] top-2 w-px bg-line-2 md:left-[220px]" />
          <motion.span aria-hidden="true" style={{ scaleY: fill }} className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-gradient-to-b from-surf to-surf-2 md:left-[220px]" />
          {experience.map((x) => (
            <Reveal as="li" key={x.hash} className="relative grid gap-3 pb-16 pl-8 last:pb-0 md:grid-cols-[220px_1fr] md:gap-0 md:pl-0">
              <motion.span aria-hidden="true" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, amount: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="absolute left-0 top-1.5 z-10 size-[11px] rounded-full border-2 border-surf bg-ink md:left-[215px]" />
              <div className="label-mono flex flex-wrap items-center gap-3 text-dim md:grid md:content-start md:gap-1.5 md:pr-8">
                <span className="text-surf">{x.hash}</span>
                <time className="font-sans text-sm tracking-normal text-paper">{x.dates}</time>
                <span className={`label-mono w-fit rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[.14em] ${/present/i.test(x.dates)
                  ? 'border-surf/50 text-surf'
                  : 'border-line-2 text-dim'}`}>
                  {/present/i.test(x.dates) ? 'current' : 'completed'}
                </span>
              </div>
              <div className="grid max-w-[720px] gap-3 md:pl-12">
                <h3 className="text-[clamp(1.4rem,2.4vw,1.9rem)] font-semibold">{x.role} <span className="font-normal text-muted">· {x.org}</span></h3>
                <p className="text-muted">{x.summary}</p>
                {x.points.length > 0 && (
                  <ul className="grid gap-2">
                    {x.points.map((pt) => <li key={pt} className="relative pl-6 before:absolute before:left-0 before:font-mono before:text-surf before:content-['+']">{pt}</li>)}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
