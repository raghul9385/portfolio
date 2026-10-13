import nodemailer from 'nodemailer';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';

const env = {
  SMTP_USER: 'raghul@example.com',
  MAIL_TO: 'inbox@example.com',
  ALLOWED_ORIGIN: 'http://localhost:5173, https://raghul9385.github.io',
};

const enquiry = {
  name: 'Priya Raman',
  email: 'priya@company.com',
  type: 'Contract project',
  message: 'We need someone to own the mobile UI for ~3 months.',
  company: '',
};

const silentLogger = { info: vi.fn(), error: vi.fn() };

/**
 * A real nodemailer transport that builds the full message but writes it to
 * JSON instead of talking to an SMTP server. Every sent mail is kept in `sent`.
 */
function createTestMailer() {
  const transport = nodemailer.createTransport({ jsonTransport: true });
  const sent = [];
  const sendMail = async (mail) => {
    const info = await transport.sendMail(mail);
    sent.push(JSON.parse(info.message));
    return info;
  };
  return { sendMail, sent };
}

describe('contact API', () => {
  beforeEach(() => {
    silentLogger.info.mockClear();
    silentLogger.error.mockClear();
  });

  describe('GET /api/health', () => {
    it('reports which delivery routes are configured', async () => {
      const app = createApp({ env, mailer: createTestMailer(), logger: silentLogger });

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, email: true, whatsapp: false });
    });
  });

  describe('POST /api/contact', () => {
    it('sends the enquiry as an email', async () => {
      const mailer = createTestMailer();
      const app = createApp({ env, mailer, logger: silentLogger });

      const res = await request(app).post('/api/contact').send(enquiry);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, email: true, whatsapp: false });

      expect(mailer.sent).toHaveLength(1);
      const [mail] = mailer.sent;
      expect(mail.to).toEqual([{ address: 'inbox@example.com', name: '' }]);
      expect(mail.replyTo).toEqual([{ address: 'priya@company.com', name: 'Priya Raman' }]);
      expect(mail.subject).toBe('[Contract project] Priya Raman — portfolio enquiry');
      expect(mail.text).toContain(enquiry.message);
      expect(silentLogger.info).toHaveBeenCalledWith(
        'contact delivered',
        expect.objectContaining({ email: true, from: 'priya@company.com' }),
      );
    });

    it('sends to WhatsApp as well when it is configured', async () => {
      const mailer = createTestMailer();
      const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
      const app = createApp({
        env: { ...env, WHATSAPP_TOKEN: 't', WHATSAPP_PHONE_ID: '1', WHATSAPP_TO: '91999' },
        mailer,
        fetchImpl,
        logger: silentLogger,
      });

      const res = await request(app).post('/api/contact').send(enquiry);

      expect(res.body).toEqual({ ok: true, email: true, whatsapp: true });
      expect(mailer.sent).toHaveLength(1);
      expect(fetchImpl).toHaveBeenCalledOnce();
    });

    it('still succeeds through WhatsApp when SMTP is down', async () => {
      const mailer = { sendMail: vi.fn().mockRejectedValue(new Error('ECONNREFUSED')) };
      const app = createApp({
        env: { ...env, WHATSAPP_TOKEN: 't', WHATSAPP_PHONE_ID: '1', WHATSAPP_TO: '91999' },
        mailer,
        fetchImpl: vi.fn().mockResolvedValue({ ok: true }),
        logger: silentLogger,
      });

      const res = await request(app).post('/api/contact').send(enquiry);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, email: false, whatsapp: true });
    });

    it('returns 502 when no route could deliver the message', async () => {
      const mailer = { sendMail: vi.fn().mockRejectedValue(new Error('ECONNREFUSED')) };
      const app = createApp({ env, mailer, logger: silentLogger });

      const res = await request(app).post('/api/contact').send(enquiry);

      expect(res.status).toBe(502);
      expect(res.body).toEqual({
        ok: false,
        error: 'Could not deliver the message. Please email directly.',
      });
      expect(silentLogger.error).toHaveBeenCalledOnce();
    });

    it('returns 502 when nothing is configured', async () => {
      const app = createApp({ env: {}, mailer: null, logger: silentLogger });

      const res = await request(app).post('/api/contact').send(enquiry);

      expect(res.status).toBe(502);
    });

    it('rejects an invalid enquiry without sending anything', async () => {
      const mailer = createTestMailer();
      const app = createApp({ env, mailer, logger: silentLogger });

      const res = await request(app)
        .post('/api/contact')
        .send({ ...enquiry, email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: 'Enter a valid email address.' });
      expect(mailer.sent).toHaveLength(0);
    });

    it('drops honeypot submissions without sending anything', async () => {
      const mailer = createTestMailer();
      const app = createApp({ env, mailer, logger: silentLogger });

      const res = await request(app)
        .post('/api/contact')
        .send({ ...enquiry, company: 'Spam Inc' });

      expect(res.status).toBe(400);
      expect(mailer.sent).toHaveLength(0);
    });

    it('rejects bodies larger than 32kb', async () => {
      const app = createApp({ env, mailer: createTestMailer(), logger: silentLogger });

      const res = await request(app)
        .post('/api/contact')
        .send({ ...enquiry, message: 'x'.repeat(40_000) });

      expect(res.status).toBe(413);
    });
  });

  describe('security', () => {
    it('allows CORS only for the configured origins', async () => {
      const app = createApp({ env, mailer: createTestMailer(), logger: silentLogger });

      const allowed = await request(app)
        .get('/api/health')
        .set('Origin', 'https://raghul9385.github.io');
      const blocked = await request(app).get('/api/health').set('Origin', 'https://evil.example');

      expect(allowed.headers['access-control-allow-origin']).toBe('https://raghul9385.github.io');
      expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('rate-limits a visitor who sends too many requests', async () => {
      const app = createApp({
        env,
        mailer: createTestMailer(),
        logger: silentLogger,
        rateLimitMax: 2,
      });

      await request(app).get('/api/health').expect(200);
      await request(app).get('/api/health').expect(200);
      await request(app).get('/api/health').expect(429);
    });
  });
});
