import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Contact from '../components/Contact.jsx';
import { profile } from '../data.js';
import { ToastContext } from '../hooks.js';
import { Navigation } from '../lib/navigation.js';

const toast = vi.fn();

function renderContact() {
  const user = userEvent.setup();
  render(
    <ToastContext.Provider value={toast}>
      <Contact />
    </ToastContext.Provider>,
  );
  return { user, hint: () => screen.getByTestId('form-hint') };
}

async function fillInForm(user, overrides = {}) {
  const values = {
    name: 'Priya Raman',
    email: 'priya@company.com',
    message: 'We need someone to own the mobile UI for three months.',
    ...overrides,
  };
  if (values.name) await user.type(screen.getByLabelText('Your name'), values.name);
  if (values.email) await user.type(screen.getByLabelText('Your email'), values.email);
  if (values.message) await user.type(screen.getByLabelText('Message'), values.message);
  return values;
}

function mockApiResponse(body, { ok = true } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, json: () => Promise.resolve(body) });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('Contact form', () => {
  beforeEach(() => {
    toast.mockClear();
  });

  describe('validation', () => {
    it('asks for a name when the form is sent empty', async () => {
      const fetchMock = mockApiResponse({ ok: true });
      const { user, hint } = renderContact();

      await user.click(screen.getByRole('button', { name: /send brief/i }));

      expect(hint()).toHaveTextContent('Fill in your name');
      expect(screen.getByLabelText('Your name')).toHaveFocus();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('explains what a valid email looks like', async () => {
      const fetchMock = mockApiResponse({ ok: true });
      const { user, hint } = renderContact();

      await fillInForm(user, { email: 'priya@' });
      await user.click(screen.getByRole('button', { name: /send brief/i }));

      expect(hint()).toHaveTextContent('Enter a valid email, like name@company.com');
      expect(screen.getByLabelText('Your email')).toHaveFocus();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('asks for a message last', async () => {
      mockApiResponse({ ok: true });
      const { user, hint } = renderContact();

      await fillInForm(user, { message: '' });
      await user.click(screen.getByRole('button', { name: /send brief/i }));

      expect(hint()).toHaveTextContent('Fill in message');
    });
  });

  describe('sending', () => {
    it('posts the enquiry to the contact API and confirms delivery', async () => {
      const fetchMock = mockApiResponse({ ok: true, email: true, whatsapp: false });
      const { user, hint } = renderContact();

      const values = await fillInForm(user);
      await user.selectOptions(screen.getByLabelText('What is it?'), 'Freelance build');
      await user.click(screen.getByRole('button', { name: /send brief/i }));

      await waitFor(() => expect(hint()).toHaveTextContent('Delivered to my email'));

      const [url, request] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/contact');
      expect(request.method).toBe('POST');
      expect(JSON.parse(request.body)).toEqual({
        name: values.name,
        email: values.email,
        message: values.message,
        type: 'Freelance build',
        company: '',
      });
      expect(toast).toHaveBeenCalledWith('Message sent — I reply within a working day');
    });

    it('clears the form and offers to send another', async () => {
      mockApiResponse({ ok: true, email: true, whatsapp: true });
      const { user, hint } = renderContact();

      await fillInForm(user);
      await user.click(screen.getByRole('button', { name: /send brief/i }));

      await waitFor(() => expect(hint()).toHaveTextContent('Delivered to my email and WhatsApp'));
      expect(screen.getByLabelText('Your name')).toHaveValue('');
      expect(screen.getByLabelText('Your email')).toHaveValue('');
      expect(screen.getByLabelText('Message')).toHaveValue('');
      expect(screen.getByRole('button', { name: /send another/i })).toBeEnabled();
    });

    it('disables the button while the message is on its way', async () => {
      let respond;
      vi.stubGlobal(
        'fetch',
        vi.fn(
          () =>
            new Promise((resolve) => {
              respond = resolve;
            }),
        ),
      );
      const { user } = renderContact();

      await fillInForm(user);
      await user.click(screen.getByRole('button', { name: /send brief/i }));

      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();

      respond({ ok: true, json: () => Promise.resolve({ ok: true, email: true }) });
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /send another/i })).toBeEnabled(),
      );
    });
  });

  describe('when the server is unavailable', () => {
    it('falls back to the visitor’s email app with the message filled in', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
      const goTo = vi.spyOn(Navigation, 'goTo').mockImplementation(() => {});
      const { user, hint } = renderContact();

      const values = await fillInForm(user);
      await user.click(screen.getByRole('button', { name: /send brief/i }));

      await waitFor(() => expect(goTo).toHaveBeenCalledOnce());
      const mailto = new URL(goTo.mock.calls[0][0]);
      expect(mailto.protocol).toBe('mailto:');
      expect(mailto.pathname).toBe(profile.email);
      expect(mailto.searchParams.get('subject')).toBe(`[Full-time role] from ${values.name}`);
      expect(mailto.searchParams.get('body')).toContain(values.message);

      expect(hint()).toHaveTextContent('Server unavailable — opening your email app instead');
      expect(toast).toHaveBeenCalledWith('Opening your email app');
    });

    it('falls back too when the server could not deliver it', async () => {
      mockApiResponse({ ok: false, error: 'Could not deliver' }, { ok: false });
      const goTo = vi.spyOn(Navigation, 'goTo').mockImplementation(() => {});
      const { user } = renderContact();

      await fillInForm(user);
      await user.click(screen.getByRole('button', { name: /send brief/i }));

      await waitFor(() => expect(goTo).toHaveBeenCalledOnce());
      // The form keeps its contents so nothing the visitor typed is lost.
      expect(screen.getByLabelText('Your name')).toHaveValue('Priya Raman');
    });
  });

  describe('other ways to get in touch', () => {
    it('opens WhatsApp with the typed message', async () => {
      const openInNewTab = vi.spyOn(Navigation, 'openInNewTab').mockImplementation(() => {});
      const { user } = renderContact();

      await fillInForm(user, { message: 'Are you free next month?' });
      await user.click(screen.getByRole('button', { name: /whatsapp/i }));

      const link = new URL(openInNewTab.mock.calls[0][0]);
      expect(link.origin).toBe('https://wa.me');
      expect(link.pathname).toBe(`/${profile.whatsapp}`);
      expect(link.searchParams.get('text')).toContain('Are you free next month?');
    });

    it('copies the email address', async () => {
      const { user } = renderContact();

      await user.click(screen.getByRole('button', { name: 'Copy email address' }));

      await expect(navigator.clipboard.readText()).resolves.toBe(profile.email);
      expect(toast).toHaveBeenCalledWith('Email copied to clipboard');
    });

    it('links straight to the email address', () => {
      renderContact();
      expect(screen.getByRole('link', { name: profile.email })).toHaveAttribute(
        'href',
        `mailto:${profile.email}`,
      );
    });
  });
});
