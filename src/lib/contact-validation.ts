/**
 * Validation for the public contact form. Pure and server-side: a form that
 * relays mail to a real inbox is a spam target and a trust boundary, so the
 * browser's `required` attributes are a UX nicety, not a check.
 */

export const CONTACT_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 200 },
  message: { min: 20, max: 3000 },
} as const;

export type ContactSubmission = {
  name: string;
  email: string;
  message: string;
  /** Hidden field: real people leave it empty, naive bots fill everything. */
  company?: string;
};

export type ValidationResult =
  | { ok: true; value: { name: string; email: string; message: string } }
  | { ok: false; field: 'name' | 'email' | 'message' | 'company'; reason: string };

// Deliberately loose: the only authority on whether an address exists is
// delivery. This rejects the obviously-not-an-address, nothing more.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateContactSubmission(input: unknown): ValidationResult {
  const body = (input ?? {}) as Record<string, unknown>;

  // Honeypot first: cheapest possible rejection, and it must not leak that it is
  // the reason — the caller reports a generic success to a bot.
  if (asString(body.company) !== '') {
    return { ok: false, field: 'company', reason: 'honeypot filled' };
  }

  const name = asString(body.name);
  if (name.length < CONTACT_LIMITS.name.min) return { ok: false, field: 'name', reason: 'too short' };
  if (name.length > CONTACT_LIMITS.name.max) return { ok: false, field: 'name', reason: 'too long' };

  const email = asString(body.email);
  if (email.length > CONTACT_LIMITS.email.max) return { ok: false, field: 'email', reason: 'too long' };
  if (!EMAIL_SHAPE.test(email)) return { ok: false, field: 'email', reason: 'not an address' };
  // A newline in a header value is header injection — reject rather than strip.
  if (/[\r\n]/.test(email) || /[\r\n]/.test(name)) {
    return { ok: false, field: 'email', reason: 'control characters' };
  }

  const message = asString(body.message);
  if (message.length < CONTACT_LIMITS.message.min) return { ok: false, field: 'message', reason: 'too short' };
  if (message.length > CONTACT_LIMITS.message.max) return { ok: false, field: 'message', reason: 'too long' };

  return { ok: true, value: { name, email, message } };
}
