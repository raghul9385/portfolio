import nodemailer from 'nodemailer';

export const ENQUIRY_TYPES = [
  'Full-time role',
  'Contract project',
  'Freelance build',
  'Just saying hi',
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Cleans up a contact form submission.
 * Returns `{ data }` when it's good to send, or `{ error }` with a message
 * that can be shown to the visitor as-is.
 */
export function validateEnquiry(body = {}) {
  // Honeypot: the field is hidden from people, so only bots fill it in.
  if (body.company) return { error: 'Rejected.' };

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();
  const type = ENQUIRY_TYPES.includes(body.type) ? body.type : ENQUIRY_TYPES[0];

  if (name.length < 2 || name.length > 100) {
    return { error: 'Enter your name.' };
  }
  if (email.length > 200 || !EMAIL_PATTERN.test(email)) {
    return { error: 'Enter a valid email address.' };
  }
  if (message.length < 5 || message.length > 4000) {
    return { error: 'Write a short message (5–4000 characters).' };
  }

  return { data: { name, email, message, type } };
}

export function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  return String(value).replace(/[&<>"]/g, (char) => entities[char]);
}

/** Builds an SMTP transport from env, or returns null when SMTP isn't set up. */
export function createMailer(env = process.env) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const port = Number(SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export function buildEmail({ name, email, message, type }, env = process.env) {
  return {
    from: `"Portfolio" <${env.SMTP_USER}>`,
    to: env.MAIL_TO || env.SMTP_USER,
    replyTo: `"${name}" <${email}>`,
    subject: `[${type}] ${name} — portfolio enquiry`,
    text: `${message}\n\n— ${name}\n${email}\nType: ${type}`,
    html: `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>
<hr>
<p><b>${escapeHtml(name)}</b><br>
<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a><br>
Type: ${escapeHtml(type)}</p>`,
  };
}

export async function sendEmail(enquiry, { mailer, env = process.env }) {
  if (!mailer) return { ok: false, skipped: 'SMTP is not configured' };

  await mailer.sendMail(buildEmail(enquiry, env));
  return { ok: true };
}

export function isWhatsAppConfigured(env = process.env) {
  return Boolean(env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_ID && env.WHATSAPP_TO);
}

/**
 * Meta only delivers free-form text inside a 24-hour customer window, so an
 * approved template is used whenever WHATSAPP_TEMPLATE is set.
 */
export function buildWhatsAppPayload({ name, email, message, type }, env = process.env) {
  const summary =
    `New portfolio enquiry\nFrom: ${name} (${email})\nType: ${type}\n\n${message}`.slice(0, 900);

  if (!env.WHATSAPP_TEMPLATE) {
    return {
      messaging_product: 'whatsapp',
      to: env.WHATSAPP_TO,
      type: 'text',
      text: { body: summary },
    };
  }

  return {
    messaging_product: 'whatsapp',
    to: env.WHATSAPP_TO,
    type: 'template',
    template: {
      name: env.WHATSAPP_TEMPLATE,
      language: { code: env.WHATSAPP_LANG || 'en_US' },
      components: [{ type: 'body', parameters: [{ type: 'text', text: summary }] }],
    },
  };
}

export async function sendWhatsApp(enquiry, { fetchImpl = fetch, env = process.env } = {}) {
  if (!isWhatsAppConfigured(env)) return { ok: false, skipped: 'WhatsApp is not configured' };

  const url = `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_ID}/messages`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildWhatsAppPayload(enquiry, env)),
  });

  if (!response.ok) {
    const detail = await response.text();
    return { ok: false, error: `WhatsApp API ${response.status}: ${detail.slice(0, 300)}` };
  }
  return { ok: true };
}
