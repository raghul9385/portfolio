import { describe, expect, it } from 'vitest';
import * as website from '../../src/lib/contact.js';
import { ENQUIRY_TYPES, validateEnquiry } from '../contact.js';

describe('website ↔ API contract', () => {
  it('offers the same enquiry types the API accepts', () => {
    expect(website.ENQUIRY_TYPES).toEqual(ENQUIRY_TYPES);
  });

  it('starts with an empty form the API rejects, not one it crashes on', () => {
    expect(validateEnquiry(website.EMPTY_ENQUIRY)).toEqual({ error: 'Enter your name.' });
  });
});
