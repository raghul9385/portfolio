import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 8787;

app.set('trust proxy', 1);
app.use(express.json({ limit: '32kb' }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',').map((s) => s.trim()) : true,
  methods: ['POST', 'GET'],
}));

// A contact form does not need more than a handful of sends per visitor.
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false }));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TYPES = ['Full-time role', 'Contract project', 'Freelance build', 'Just saying hi'];

function validate(body) {
  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const message = String(body?.message ?? '').trim();
  const type = TYPES.includes(body?.type) ? body.type : TYPES[0];

  if (body?.company) return { error: 'Rejected.' };            // honeypot: humans leave it empty
  if (name.length < 2 || name.length > 100) return { error: 'Enter your name.' };
  if (!EMAIL_RE.test(email) || email.length > 200) return { error: 'Enter a valid email address.' };
  if (message.length < 5 || message.length > 4000) return { error: 'Write a short message (5–4000 characters).' };

  return { data: { name, email, message, type } };
}

let mailer = null;
function getMailer() {
  if (mailer) return mailer;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  mailer = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return mailer;
}

async function sendEmail({ name, email, message, type }) {
  const transport = getMailer();
  if (!transport) return { ok: false, skipped: 'SMTP is not configured' };

  const to = process.env.MAIL_TO || process.env.SMTP_USER;
  await transport.sendMail({
    from: `"Portfolio" <${process.env.SMTP_USER}>`,
    to,
    replyTo: `"${name}" <${email}>`,
    subject: `[${type}] ${name} — portfolio enquiry`,
    text: `${message}\n\n— ${name}\n${email}\nType: ${type}`,
    html: `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>
           <hr><p><b>${escapeHtml(name)}</b><br>
           <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a><br>
           Type: ${escapeHtml(type)}</p>`,
  });
  return { ok: true };
}

/**
 * WhatsApp via Meta's Cloud API. Outside a 24-hour customer window Meta only
 * delivers approved templates, so this sends a template when WHATSAPP_TEMPLATE
 * is set and falls back to a plain text message otherwise.
 */
async function sendWhatsApp({ name, email, message, type }) {
  const { WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_TO, WHATSAPP_TEMPLATE, WHATSAPP_LANG } = process.env;
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID || !WHATSAPP_TO) return { ok: false, skipped: 'WhatsApp is not configured' };

  const summary = `New portfolio enquiry\nFrom: ${name} (${email})\nType: ${type}\n\n${message}`.slice(0, 900);
  const payload = WHATSAPP_TEMPLATE
    ? {
        messaging_product: 'whatsapp',
        to: WHATSAPP_TO,
        type: 'template',
        template: {
          name: WHATSAPP_TEMPLATE,
          language: { code: WHATSAPP_LANG || 'en_US' },
          components: [{ type: 'body', parameters: [{ type: 'text', text: summary }] }],
        },
      }
    : { messaging_product: 'whatsapp', to: WHATSAPP_TO, type: 'text', text: { body: summary } };

  const res = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text();
    return { ok: false, error: `WhatsApp API ${res.status}: ${detail.slice(0, 300)}` };
  }
  return { ok: true };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    email: Boolean(getMailer()),
    whatsapp: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_TO),
  });
});

app.post('/api/contact', async (req, res) => {
  const { error, data } = validate(req.body);
  if (error) return res.status(400).json({ ok: false, error });

  const [email, whatsapp] = await Promise.allSettled([sendEmail(data), sendWhatsApp(data)]);
  const emailResult = email.status === 'fulfilled' ? email.value : { ok: false, error: String(email.reason) };
  const waResult = whatsapp.status === 'fulfilled' ? whatsapp.value : { ok: false, error: String(whatsapp.reason) };

  if (!emailResult.ok && !waResult.ok) {
    console.error('contact failed', { emailResult, waResult });
    return res.status(502).json({ ok: false, error: 'Could not deliver the message. Please email directly.' });
  }

  console.log('contact delivered', { email: emailResult.ok, whatsapp: waResult.ok, from: data.email });
  res.json({ ok: true, email: emailResult.ok, whatsapp: waResult.ok });
});

app.listen(PORT, () => {
  console.log(`Contact API listening on http://localhost:${PORT}`);
  console.log(`  email:    ${getMailer() ? 'configured' : 'NOT configured (set SMTP_* in .env)'}`);
  console.log(`  whatsapp: ${process.env.WHATSAPP_TOKEN ? 'configured' : 'NOT configured (set WHATSAPP_* in .env)'}`);
});
