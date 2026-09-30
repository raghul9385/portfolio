import { motion } from 'motion/react';
import { ArrowRight, Copy, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { profile, socials } from '../data.js';
import { openResume } from '../resume.js';
import { EASE, useToast } from '../hooks.js';
import Logo from './Logo.jsx';
import { Button, Reveal, SmartLink } from './ui.jsx';

const TYPES = ['Full-time role', 'Contract project', 'Freelance build', 'Just saying hi'];
const EMPTY = { name: '', email: '', type: TYPES[0], message: '', company: '' };

// Point this at your server: set VITE_CONTACT_API in .env, e.g.
// VITE_CONTACT_API=https://api.your-domain.com/api/contact
const CONTACT_API = import.meta.env.VITE_CONTACT_API || '/api/contact';

const mailtoFor = ({ name, email, type, message }, to) =>
  `mailto:${to}?subject=${encodeURIComponent(`[${type}] from ${name}`)}&body=${encodeURIComponent(`${message}\n\n— ${name}\n${email}`)}`;
const FIELD = 'w-full rounded-md border border-line-2 bg-ink px-3.5 py-3 text-paper placeholder:text-dim transition focus:border-surf focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-surf)_25%,transparent)] focus:outline-none';
const LABEL = 'label-mono font-medium uppercase text-muted';

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [hint, setHint] = useState({ text: 'Goes straight to my inbox', error: false });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const getResume = () => {
    if (!openResume()) toast("Allow pop-ups to open your résumé");
    else toast("Résumé ready — save it as PDF from the print dialog");
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); toast('Email copied to clipboard'); }
    catch { toast(`Copy blocked. Email: ${profile.email}`); }
  };

  const openWhatsApp = () => {
    if (!profile.whatsapp) {
      toast('Add your number as profile.whatsapp in src/data.js');
      return;
    }
    const text = form.message
      ? `Hi Raghul — ${form.message}\n\n— ${form.name || 'from your portfolio'}`
      : 'Hi Raghul, I saw your portfolio and would like to talk about a project.';
    window.open(`https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const el = e.currentTarget;
    const bad = [...el.elements].find((x) => x.willValidate && !x.checkValidity());
    if (bad) {
      const name = el.querySelector(`label[for="${bad.id}"]`)?.textContent.toLowerCase();
      setHint({ text: bad.type === 'email' && bad.value ? 'Enter a valid email, like name@company.com' : `Fill in ${name}`, error: true });
      bad.focus();
      return;
    }

    setSending(true);
    setHint({ text: 'Sending…', error: false });

    try {
      const res = await fetch(CONTACT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(12000),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Delivery failed');

      const routes = [data.email && 'email', data.whatsapp && 'WhatsApp'].filter(Boolean).join(' and ');
      setSent(true);
      setForm(EMPTY);
      setHint({ text: routes ? `Delivered to my ${routes}` : 'Message received', error: false });
      toast('Message sent — I reply within a working day');
    } catch {
      // the API is not reachable (or not deployed yet): hand off to their mail app
      setHint({ text: 'Server unavailable — opening your email app instead', error: true });
      window.location.href = mailtoFor(form, profile.email);
      toast('Opening your email app');
    } finally {
      setSending(false);
    }
  };

  return (
    <footer id="contact" aria-labelledby="contact-title" className="relative overflow-hidden border-t border-line pt-20 md:pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute -top-[30%] left-1/2 size-[900px] max-w-[140vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-glow)_16%,transparent),transparent)]" />
      <div className="wrap relative">
        <div className="grid gap-6">
          <p className="label-mono flex items-center gap-3 text-surf before:h-px before:w-7 before:bg-current">/contact</p>
          <h2 id="contact-title" className="max-w-[14ch] text-[clamp(2.75rem,9vw,7.5rem)] font-semibold leading-[.92] tracking-[-.045em]">
            Got something that needs to <span className="text-surf">ship?</span>
          </h2>
          <p className="max-w-[52ch] text-muted">
            I reply within one working day. The best first message says what you're building, the rough timeline, and what's currently in the way.
          </p>
          <div className="flex max-w-full flex-wrap items-center gap-4">
              <a href={`mailto:${profile.email}`}
                className="bg-[linear-gradient(var(--color-surf),var(--color-surf))] bg-[length:0_2px] bg-left-bottom bg-no-repeat pb-1 font-display text-[clamp(1.25rem,3.6vw,2.5rem)] font-medium tracking-tight [overflow-wrap:anywhere] no-underline transition-[background-size,color] duration-700 ease-expo hover:bg-[length:100%_2px] hover:text-surf-2 focus-visible:bg-[length:100%_2px]">
                {profile.email}
              </a>
            <button type="button" onClick={copy} aria-label="Copy email address"
              className="label-mono inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line-2 bg-transparent px-3.5 py-2 text-muted transition-colors hover:border-surf hover:text-surf">
              <Copy size={12} />Copy
            </button>
          </div>
        </div>

        <div className="mt-18 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-18">
          <Reveal className="grid content-start border-t border-line">
            {socials.map((s) => (s.label === 'Résumé' && !s.href ? (
              <button key={s.label} type="button" onClick={getResume}
                className="group flex cursor-pointer items-center justify-between gap-4 border-b border-line bg-transparent py-4 text-left font-display text-[1.625rem] font-medium text-paper transition-[padding,color] duration-500 ease-expo hover:px-3 hover:text-surf focus-visible:px-3">
                Résumé
                <span className="label-mono flex items-center gap-2 text-dim">
                  build PDF<ArrowRight size={14} className="transition-transform duration-500 ease-expo group-hover:rotate-90" />
                </span>
              </button>
            ) : (
              <SmartLink key={s.label} href={s.href} placeholder={s.placeholder}
                className="group flex items-center justify-between gap-4 border-b border-line py-4 font-display text-[1.625rem] font-medium no-underline transition-[padding,color] duration-500 ease-expo hover:px-3 hover:text-surf focus-visible:px-3">
                {s.label}
                <span className="label-mono flex items-center gap-2 text-dim">
                  {s.meta}<ArrowRight size={14} className="transition-transform duration-500 ease-expo group-hover:-rotate-45" />
                </span>
              </SmartLink>
            )))}
          </Reveal>

          <Reveal as="form" delay={0.1} onSubmit={submit} noValidate className="relative grid gap-4 rounded-2xl border border-line bg-ink-2/70 p-6 md:p-8">
            <h3 className="text-[1.625rem] font-semibold">Send a quick brief</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor="f-name" className={LABEL}>Your name</label>
                <input id="f-name" autoComplete="name" required placeholder="Priya Raman" value={form.name} onChange={set('name')} className={FIELD} />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="f-email" className={LABEL}>Your email</label>
                <input id="f-email" type="email" autoComplete="email" required placeholder="priya@company.com" value={form.email} onChange={set('email')} className={FIELD} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="f-type" className={LABEL}>What is it?</label>
              <select id="f-type" value={form.type} onChange={set('type')} className={FIELD}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="f-msg" className={LABEL}>Message</label>
              <textarea id="f-msg" required value={form.message} onChange={set('message')} className={`${FIELD} min-h-30 resize-y`}
                placeholder="We're building a React Native app and need someone to own the mobile UI for ~3 months…" />
            </div>
            <div aria-hidden="true" className="absolute left-[-9999px] size-px overflow-hidden">
              <label htmlFor="f-company">Company (leave blank)</label>
              <input id="f-company" name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={set('company')} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <motion.span key={hint.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
                aria-live="polite" className={`label-mono ${hint.error ? 'text-surf' : 'text-dim'}`}>
                {hint.text}
              </motion.span>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={openWhatsApp}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-2 px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-surf hover:text-surf">
                  <MessageCircle size={15} /> WhatsApp
                </button>
                <Button type="submit" disabled={sending} className={sending ? 'opacity-70' : ''}>
                  {sending ? 'Sending…' : sent ? 'Send another' : 'Send brief'}
                  {sending
                    ? <Send size={16} className="animate-pulse" />
                    : <ArrowRight size={16} className="transition-transform duration-500 ease-expo group-hover:translate-x-1" />}
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-24 grid justify-items-center gap-3 text-center">
          <p aria-hidden="true" className="arise select-none whitespace-nowrap font-display text-[clamp(4rem,15vw,12rem)] font-extrabold leading-[.85] tracking-[.02em]">{profile.firstName.toUpperCase()}</p>
          <p className="label-mono uppercase tracking-[.3em] text-dim"><span className="text-surf">⟪ Arise ⟫</span> · Every level earned, one shipped app at a time.</p>
        </Reveal>

        <div className="label-mono mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pb-8 pt-6 text-dim">
          <span className="flex items-center gap-3">
            <Logo size={28} tagline={false} title="" className="text-surf" />
            © {new Date().getFullYear()} {profile.firstName} {profile.lastName}
          </span>
          <a href="#top" className="text-muted no-underline hover:text-surf">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
