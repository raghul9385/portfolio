import { describe, expect, it, vi } from 'vitest';
import { mailtoLink, sendEnquiry, whatsAppLink } from '../lib/contact.js';

const enquiry = {
  name: 'Priya Raman',
  email: 'priya@company.com',
  type: 'Contract project',
  message: 'Hello & welcome?',
  company: '',
};

const respondWith = (body, { ok = true } = {}) =>
  vi.fn().mockResolvedValue({ ok, json: () => Promise.resolve(body) });

describe('sendEnquiry', () => {
  it('returns every route the message was delivered to', async () => {
    const fetchImpl = respondWith({ ok: true, email: true, whatsapp: true });
    await expect(sendEnquiry(enquiry, { fetchImpl })).resolves.toEqual(['email', 'WhatsApp']);
  });

  it('returns only the routes that worked', async () => {
    const fetchImpl = respondWith({ ok: true, email: false, whatsapp: true });
    await expect(sendEnquiry(enquiry, { fetchImpl })).resolves.toEqual(['WhatsApp']);
  });

  it('sends JSON to the configured endpoint', async () => {
    const fetchImpl = respondWith({ ok: true, email: true });

    await sendEnquiry(enquiry, { fetchImpl, endpoint: 'https://api.example.com/api/contact' });

    const [url, request] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.example.com/api/contact');
    expect(request.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(request.body)).toEqual(enquiry);
    expect(request.signal).toBeInstanceOf(AbortSignal);
  });

  it('throws the server’s error message', async () => {
    const fetchImpl = respondWith({ ok: false, error: 'Enter your name.' }, { ok: false });
    await expect(sendEnquiry(enquiry, { fetchImpl })).rejects.toThrow('Enter your name.');
  });

  it('throws when the response is not JSON (e.g. a 404 page)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    });
    await expect(sendEnquiry(enquiry, { fetchImpl })).rejects.toThrow('Delivery failed');
  });

  it('throws when the network is down', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(sendEnquiry(enquiry, { fetchImpl })).rejects.toThrow('Failed to fetch');
  });
});

describe('mailtoLink', () => {
  it('encodes the subject and body so special characters survive', () => {
    const link = new URL(mailtoLink(enquiry, 'me@example.com'));

    expect(link.pathname).toBe('me@example.com');
    expect(link.searchParams.get('subject')).toBe('[Contract project] from Priya Raman');
    expect(link.searchParams.get('body')).toBe(
      'Hello & welcome?\n\n— Priya Raman\npriya@company.com',
    );
  });
});

describe('whatsAppLink', () => {
  it('includes the typed message and name', () => {
    const text = new URL(whatsAppLink('919000000000', enquiry)).searchParams.get('text');
    expect(text).toBe('Hi Raghul — Hello & welcome?\n\n— Priya Raman');
  });

  it('uses a friendly default when nothing has been typed', () => {
    const text = new URL(whatsAppLink('919000000000', { name: '', message: '' })).searchParams.get(
      'text',
    );
    expect(text).toBe('Hi Raghul, I saw your portfolio and would like to talk about a project.');
  });
});
