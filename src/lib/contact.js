// Must match ENQUIRY_TYPES in server/contact.js (a test checks they stay in sync).
export const ENQUIRY_TYPES = [
  'Full-time role',
  'Contract project',
  'Freelance build',
  'Just saying hi',
];

export const EMPTY_ENQUIRY = {
  name: '',
  email: '',
  type: ENQUIRY_TYPES[0],
  message: '',
  company: '',
};

// Point this at the deployed server with VITE_CONTACT_API in .env, e.g.
// VITE_CONTACT_API=https://api.your-domain.com/api/contact
export const CONTACT_API = import.meta.env.VITE_CONTACT_API || '/api/contact';

const TIMEOUT_MS = 12_000;

/**
 * Posts the enquiry to the contact API.
 * Resolves with the routes it was delivered to, e.g. `['email', 'WhatsApp']`,
 * and throws if the server is unreachable or couldn't deliver it.
 */
export async function sendEnquiry(enquiry, { fetchImpl = fetch, endpoint = CONTACT_API } = {}) {
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enquiry),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.ok) {
    throw new Error(result.error || 'Delivery failed');
  }

  const routes = [];
  if (result.email) routes.push('email');
  if (result.whatsapp) routes.push('WhatsApp');
  return routes;
}

export function mailtoLink({ name, email, type, message }, to) {
  const subject = encodeURIComponent(`[${type}] from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

export function whatsAppLink(number, { name, message }) {
  const text = message
    ? `Hi Raghul — ${message}\n\n— ${name || 'from your portfolio'}`
    : 'Hi Raghul, I saw your portfolio and would like to talk about a project.';
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
