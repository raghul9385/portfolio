import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createMailer,
  isWhatsAppConfigured,
  sendEmail,
  sendWhatsApp,
  validateEnquiry,
} from './contact.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function outcome(settled) {
  return settled.status === 'fulfilled'
    ? settled.value
    : { ok: false, error: String(settled.reason) };
}

/**
 * Builds the contact API. Everything with side effects (SMTP, the WhatsApp
 * HTTP call, logging) can be passed in, which is what the tests do.
 */
export function createApp({
  env = process.env,
  mailer = createMailer(env),
  fetchImpl = fetch,
  logger = console,
  rateLimitMax = 20,
} = {}) {
  const app = express();

  const allowedOrigins = env.ALLOWED_ORIGIN
    ? env.ALLOWED_ORIGIN.split(',').map((origin) => origin.trim())
    : true;

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '32kb' }));
  app.use(cors({ origin: allowedOrigins, methods: ['POST', 'GET'] }));

  // A contact form doesn't need more than a handful of sends per visitor.
  app.use(
    '/api/',
    rateLimit({
      windowMs: FIFTEEN_MINUTES,
      max: rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, email: Boolean(mailer), whatsapp: isWhatsAppConfigured(env) });
  });

  app.post('/api/contact', async (req, res) => {
    const { error, data } = validateEnquiry(req.body);
    if (error) return res.status(400).json({ ok: false, error });

    const [emailSettled, whatsAppSettled] = await Promise.allSettled([
      sendEmail(data, { mailer, env }),
      sendWhatsApp(data, { fetchImpl, env }),
    ]);
    const email = outcome(emailSettled);
    const whatsapp = outcome(whatsAppSettled);

    if (!email.ok && !whatsapp.ok) {
      logger.error('contact failed', { email, whatsapp });
      return res
        .status(502)
        .json({ ok: false, error: 'Could not deliver the message. Please email directly.' });
    }

    logger.info('contact delivered', { email: email.ok, whatsapp: whatsapp.ok, from: data.email });
    return res.json({ ok: true, email: email.ok, whatsapp: whatsapp.ok });
  });

  return app;
}
