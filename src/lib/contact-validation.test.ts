import { describe, expect, test } from 'bun:test';
import { validateContactSubmission, CONTACT_LIMITS } from './contact-validation';

const valid = {
  name: 'Jane Recruiter',
  email: 'jane@example.com',
  message: 'We have a platform engineering role and your GitOps work looks relevant.',
};

describe('validateContactSubmission', () => {
  test('accepts a plausible message and trims it', () => {
    const result = validateContactSubmission({ ...valid, name: '  Jane Recruiter  ' });
    expect(result.ok).toEqual(true);
    if (result.ok) expect(result.value.name).toEqual('Jane Recruiter');
  });

  test('rejects a filled honeypot before anything else', () => {
    // Everything else is valid, so only the honeypot can be the reason.
    const result = validateContactSubmission({ ...valid, company: 'Acme' });
    expect(result.ok).toEqual(false);
    if (!result.ok) expect(result.field).toEqual('company');
  });

  test('rejects header injection via newlines', () => {
    for (const bad of [
      { ...valid, email: 'jane@example.com\nBcc: victim@example.com' },
      { ...valid, name: 'Jane\r\nSubject: spam' },
    ]) {
      const result = validateContactSubmission(bad);
      expect(result.ok).toEqual(false);
    }
  });

  test('rejects addresses that are not addresses', () => {
    for (const bad of ['', 'jane', 'jane@', '@example.com', 'jane@example', 'a b@c.com']) {
      const result = validateContactSubmission({ ...valid, email: bad });
      expect(result.ok, `${bad} should be rejected`).toEqual(false);
    }
  });

  test('enforces the length bounds at both ends', () => {
    expect(validateContactSubmission({ ...valid, name: 'J' }).ok).toEqual(false);
    expect(validateContactSubmission({ ...valid, name: 'J'.repeat(CONTACT_LIMITS.name.max + 1) }).ok).toEqual(false);
    expect(validateContactSubmission({ ...valid, message: 'too short' }).ok).toEqual(false);
    expect(
      validateContactSubmission({ ...valid, message: 'x'.repeat(CONTACT_LIMITS.message.max + 1) }).ok
    ).toEqual(false);
  });

  test('survives junk input instead of throwing', () => {
    for (const junk of [null, undefined, {}, { name: 42, email: [], message: {} }, 'a string']) {
      expect(validateContactSubmission(junk).ok).toEqual(false);
    }
  });
});
