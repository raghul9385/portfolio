import { describe, expect, it, vi } from 'vitest';
import {
  buildEmail,
  buildWhatsAppPayload,
  createMailer,
  escapeHtml,
  sendEmail,
  sendWhatsApp,
  validateEnquiry,
} from '../contact.js';

const enquiry = {
  name: 'Priya Raman',
  email: 'priya@company.com',
  message: 'We need a React Native developer for three months.',
  type: 'Contract project',
};

const smtpEnv = {
  SMTP_HOST: 'smtp.example.com',
  SMTP_PORT: '587',
  SMTP_USER: 'raghul@example.com',
  SMTP_PASS: 'app-password',
  MAIL_TO: 'inbox@example.com',
};

const whatsAppEnv = {
  WHATSAPP_TOKEN: 'token-123',
  WHATSAPP_PHONE_ID: '555000',
  WHATSAPP_TO: '919999999999',
};

describe('validateEnquiry', () => {
  it('accepts a complete enquiry and trims the fields', () => {
    const result = validateEnquiry({
      name: '  Priya Raman ',
      email: ' priya@company.com ',
      message: '  Hello there  ',
      type: 'Freelance build',
    });

    expect(result).toEqual({
      data: {
        name: 'Priya Raman',
        email: 'priya@company.com',
        message: 'Hello there',
        type: 'Freelance build',
      },
    });
  });

  it('falls back to the first enquiry type when the type is unknown', () => {
    const { data } = validateEnquiry({ ...enquiry, type: 'Something made up' });
    expect(data.type).toBe('Full-time role');
  });

  it.each([
    ['a missing name', { name: '' }, 'Enter your name.'],
    ['a one-letter name', { name: 'P' }, 'Enter your name.'],
    ['an invalid email', { email: 'priya@' }, 'Enter a valid email address.'],
    ['a very long email', { email: `${'a'.repeat(200)}@x.com` }, 'Enter a valid email address.'],
    ['a too-short message', { message: 'hey' }, 'Write a short message (5–4000 characters).'],
    [
      'a too-long message',
      { message: 'x'.repeat(4001) },
      'Write a short message (5–4000 characters).',
    ],
  ])('rejects %s', (_label, override, error) => {
    expect(validateEnquiry({ ...enquiry, ...override })).toEqual({ error });
  });

  it('rejects bots that fill in the hidden honeypot field', () => {
    expect(validateEnquiry({ ...enquiry, company: 'Spam Inc' })).toEqual({ error: 'Rejected.' });
  });

  it('copes with no body at all', () => {
    expect(validateEnquiry(undefined)).toEqual({ error: 'Enter your name.' });
  });
});

describe('escapeHtml', () => {
  it('escapes characters that could break out of the email markup', () => {
    expect(escapeHtml('<script>"x" & y</script>')).toBe(
      '&lt;script&gt;&quot;x&quot; &amp; y&lt;/script&gt;',
    );
  });
});

describe('createMailer', () => {
  it('returns null until SMTP is configured', () => {
    expect(createMailer({})).toBeNull();
    expect(createMailer({ SMTP_HOST: 'smtp.example.com', SMTP_USER: 'me' })).toBeNull();
  });

  it('uses STARTTLS on 587 and implicit TLS on 465', () => {
    const starttls = createMailer(smtpEnv);
    const implicit = createMailer({ ...smtpEnv, SMTP_PORT: '465' });

    expect(starttls.options).toMatchObject({ host: 'smtp.example.com', port: 587, secure: false });
    expect(implicit.options).toMatchObject({ port: 465, secure: true });
  });
});

describe('buildEmail', () => {
  it('sends to MAIL_TO with the visitor as the reply-to address', () => {
    const mail = buildEmail(enquiry, smtpEnv);

    expect(mail).toMatchObject({
      from: '"Portfolio" <raghul@example.com>',
      to: 'inbox@example.com',
      replyTo: '"Priya Raman" <priya@company.com>',
      subject: '[Contract project] Priya Raman — portfolio enquiry',
    });
    expect(mail.text).toContain(enquiry.message);
  });

  it('falls back to the SMTP user when MAIL_TO is not set', () => {
    const env = { ...smtpEnv, MAIL_TO: undefined };
    expect(buildEmail(enquiry, env).to).toBe('raghul@example.com');
  });

  it('escapes visitor input in the HTML body', () => {
    const mail = buildEmail({ ...enquiry, message: '<img src=x onerror=alert(1)>' }, smtpEnv);
    expect(mail.html).not.toContain('<img');
    expect(mail.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});

describe('sendEmail', () => {
  it('skips quietly when there is no mailer', async () => {
    await expect(sendEmail(enquiry, { mailer: null, env: smtpEnv })).resolves.toEqual({
      ok: false,
      skipped: 'SMTP is not configured',
    });
  });

  it('hands the built message to the mailer', async () => {
    const mailer = { sendMail: vi.fn().mockResolvedValue({ messageId: '1' }) };

    await expect(sendEmail(enquiry, { mailer, env: smtpEnv })).resolves.toEqual({ ok: true });
    expect(mailer.sendMail).toHaveBeenCalledWith(buildEmail(enquiry, smtpEnv));
  });

  it('lets SMTP errors bubble up so the route can report them', async () => {
    const mailer = { sendMail: vi.fn().mockRejectedValue(new Error('535 Auth failed')) };
    await expect(sendEmail(enquiry, { mailer, env: smtpEnv })).rejects.toThrow('535 Auth failed');
  });
});

describe('buildWhatsAppPayload', () => {
  it('sends plain text when no template is configured', () => {
    const payload = buildWhatsAppPayload(enquiry, whatsAppEnv);

    expect(payload).toMatchObject({ to: '919999999999', type: 'text' });
    expect(payload.text.body).toContain('From: Priya Raman (priya@company.com)');
  });

  it('uses the approved template when one is configured', () => {
    const payload = buildWhatsAppPayload(enquiry, {
      ...whatsAppEnv,
      WHATSAPP_TEMPLATE: 'portfolio_enquiry',
    });

    expect(payload.type).toBe('template');
    expect(payload.template).toMatchObject({
      name: 'portfolio_enquiry',
      language: { code: 'en_US' },
    });
  });

  it('keeps the summary under the WhatsApp parameter limit', () => {
    const payload = buildWhatsAppPayload({ ...enquiry, message: 'x'.repeat(3000) }, whatsAppEnv);
    expect(payload.text.body.length).toBe(900);
  });
});

describe('sendWhatsApp', () => {
  it('skips when WhatsApp is not configured', async () => {
    const fetchImpl = vi.fn();

    await expect(sendWhatsApp(enquiry, { fetchImpl, env: {} })).resolves.toMatchObject({
      ok: false,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('posts to the Cloud API with the bearer token', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await expect(sendWhatsApp(enquiry, { fetchImpl, env: whatsAppEnv })).resolves.toEqual({
      ok: true,
    });

    const [url, request] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://graph.facebook.com/v21.0/555000/messages');
    expect(request.headers.Authorization).toBe('Bearer token-123');
    expect(JSON.parse(request.body).to).toBe('919999999999');
  });

  it('reports the API error instead of throwing', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Invalid OAuth access token'),
    });

    await expect(sendWhatsApp(enquiry, { fetchImpl, env: whatsAppEnv })).resolves.toEqual({
      ok: false,
      error: 'WhatsApp API 401: Invalid OAuth access token',
    });
  });
});
