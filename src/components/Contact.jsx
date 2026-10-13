import { motion } from 'motion/react';
import { ArrowRight, Copy, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { gallery, profile, socials } from '../data.js';
import { EASE, useOpenResume, useToast } from '../hooks.js';
import {
  EMPTY_ENQUIRY,
  ENQUIRY_TYPES,
  mailtoLink,
  sendEnquiry,
  whatsAppLink,
} from '../lib/contact.js';
import { Navigation } from '../lib/navigation.js';
import { galleryImages } from '../shots.js';
import Logo from './Logo.jsx';
import { Button, Reveal, SmartLink } from './ui.jsx';

const FIELD =
  'w-full rounded-md border border-line-2 bg-ink px-3.5 py-3 text-paper placeholder:text-dim transition focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-accent)_25%,transparent)] focus:outline-none';
const LABEL = 'label-mono font-medium uppercase text-muted';
const SOCIAL_ROW =
  'group flex items-center justify-between gap-4 border-b border-line py-4 text-xl font-medium transition-colors duration-200 hover:text-accent';

const hasGallery = galleryImages(gallery).length > 0;

const IDLE_HINT = { text: 'Goes straight to my inbox', error: false };

/** Finds the first field the browser considers invalid and explains it in plain words. */
function findInvalidField(form) {
  const field = [...form.elements].find((el) => el.willValidate && !el.checkValidity());
  if (!field) return null;

  if (field.type === 'email' && field.value) {
    return { field, message: 'Enter a valid email, like name@company.com' };
  }
  const label = form.querySelector(`label[for="${field.id}"]`)?.textContent.toLowerCase();
  return { field, message: `Fill in ${label}` };
}

export default function Contact() {
  const toast = useToast();
  const openResume = useOpenResume();
  const [form, setForm] = useState(EMPTY_ENQUIRY);
  const [hint, setHint] = useState(IDLE_HINT);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const updateField = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      toast('Email copied to clipboard');
    } catch {
      toast(`Copy blocked. Email: ${profile.email}`);
    }
  };

  const openWhatsApp = () => {
    if (!profile.whatsapp) {
      toast('Add your number as profile.whatsapp in src/data.js');
      return;
    }
    Navigation.openInNewTab(whatsAppLink(profile.whatsapp, form));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;

    const invalid = findInvalidField(event.currentTarget);
    if (invalid) {
      setHint({ text: invalid.message, error: true });
      invalid.field.focus();
      return;
    }

    setSending(true);
    setHint({ text: 'Sending…', error: false });

    try {
      const routes = await sendEnquiry(form);
      setSent(true);
      setForm(EMPTY_ENQUIRY);
      setHint({
        text: routes.length ? `Delivered to my ${routes.join(' and ')}` : 'Message received',
        error: false,
      });
      toast('Message sent — I reply within a working day');
    } catch {
      // The API is down or not deployed yet, so hand the message to their email app.
      setHint({ text: 'Server unavailable — opening your email app instead', error: true });
      toast('Opening your email app');
      Navigation.goTo(mailtoLink(form, profile.email));
    } finally {
      setSending(false);
    }
  };

  let submitLabel = 'Send brief';
  if (sending) submitLabel = 'Sending…';
  else if (sent) submitLabel = 'Send another';

  return (
    <footer
      id="contact"
      aria-labelledby="contact-title"
      className="relative border-t border-line pt-20 md:pt-32"
    >
      <div className="wrap">
        <div className="grid gap-6">
          <p className="flex items-center gap-3 label-mono text-accent">
            <span className="tabular-nums">{hasGallery ? '07' : '06'}</span>
            <span className="h-px w-8 bg-accent/50" aria-hidden="true" />
            <span className="text-dim uppercase">Contact</span>
          </p>
          <h2
            id="contact-title"
            className="max-w-[16ch] text-[clamp(2.5rem,7vw,5.5rem)] leading-[.95] font-bold tracking-[-.05em] text-3d"
          >
            Got something that needs to <span className="text-aurora">ship?</span>
          </h2>
          <p className="max-w-[52ch] text-muted">
            I reply within one working day. The best first message says what you're building, the
            rough timeline, and what's currently in the way.
          </p>
          <div className="flex max-w-full flex-wrap items-center gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="text-[clamp(1.25rem,3.2vw,2.25rem)] font-medium tracking-tight [overflow-wrap:anywhere] text-paper no-underline decoration-accent decoration-2 underline-offset-8 transition-colors duration-200 hover:text-accent hover:underline"
            >
              {profile.email}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              aria-label="Copy email address"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line-2 bg-transparent px-3.5 py-2 label-mono text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <Copy size={12} />
              Copy
            </button>
          </div>
        </div>

        <div className="mt-18 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-18">
          <Reveal className="grid content-start border-t border-line">
            {socials.map((social) =>
              social.label === 'Résumé' && !social.href ? (
                <button
                  key={social.label}
                  type="button"
                  onClick={openResume}
                  className={`${SOCIAL_ROW} cursor-pointer bg-transparent text-left text-paper`}
                >
                  Résumé
                  <span className="flex items-center gap-2 label-mono text-dim">
                    build PDF
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </span>
                </button>
              ) : (
                <SmartLink
                  key={social.label}
                  href={social.href}
                  placeholder={social.placeholder}
                  className={`${SOCIAL_ROW} no-underline`}
                >
                  {social.label}
                  <span className="flex items-center gap-2 label-mono text-dim">
                    {social.meta}
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </SmartLink>
              ),
            )}
          </Reveal>

          <Reveal
            as="form"
            delay={0.1}
            onSubmit={handleSubmit}
            noValidate
            aria-label="Contact form"
            className="relative grid gap-4 card glass p-6 shadow-[0_50px_100px_-50px_rgb(0_0_0/0.9)] md:p-8"
          >
            <h3 className="text-2xl font-semibold">Send a quick brief</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor="f-name" className={LABEL}>
                  Your name
                </label>
                <input
                  id="f-name"
                  autoComplete="name"
                  required
                  placeholder="Priya Raman"
                  value={form.name}
                  onChange={updateField('name')}
                  className={FIELD}
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="f-email" className={LABEL}>
                  Your email
                </label>
                <input
                  id="f-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="priya@company.com"
                  value={form.email}
                  onChange={updateField('email')}
                  className={FIELD}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="f-type" className={LABEL}>
                What is it?
              </label>
              <select
                id="f-type"
                value={form.type}
                onChange={updateField('type')}
                className={FIELD}
              >
                {ENQUIRY_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="f-msg" className={LABEL}>
                Message
              </label>
              <textarea
                id="f-msg"
                required
                value={form.message}
                onChange={updateField('message')}
                className={`${FIELD} min-h-30 resize-y`}
                placeholder="We're building a React Native app and need someone to own the mobile UI for ~3 months…"
              />
            </div>

            {/* Honeypot: hidden from people, so only bots fill it in. */}
            <div aria-hidden="true" className="absolute left-[-9999px] size-px overflow-hidden">
              <label htmlFor="f-company">Company (leave blank)</label>
              <input
                id="f-company"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={form.company}
                onChange={updateField('company')}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <motion.span
                key={hint.text}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                aria-live="polite"
                data-testid="form-hint"
                className={`label-mono ${hint.error ? 'text-accent' : 'text-dim'}`}
              >
                {hint.text}
              </motion.span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-2 px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <MessageCircle size={15} /> WhatsApp
                </button>
                <Button type="submit" disabled={sending} className={sending ? 'opacity-70' : ''}>
                  {submitLabel}
                  {sending ? (
                    <Send size={16} className="animate-pulse" />
                  ) : (
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  )}
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        <p
          aria-hidden="true"
          className="wordmark mt-20 text-center text-[clamp(4.5rem,19vw,15rem)] leading-[.8] font-bold tracking-[-.06em] select-none"
        >
          {profile.firstName}
        </p>

        <div className="relative flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 pb-8 label-mono text-dim">
          <span className="flex items-center gap-3">
            <Logo size={26} title="" className="text-accent" />© {new Date().getFullYear()}{' '}
            {profile.firstName} {profile.lastName}
          </span>
          <a href="#top" className="text-muted no-underline hover:text-accent">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
