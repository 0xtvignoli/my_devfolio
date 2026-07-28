/**
 * Server-side feature gates for the contact form, in a module with no Next
 * request types so a server component can call them without pulling in the route.
 *
 * The form renders only when it can actually deliver — the same rule as the
 * assistant widget. A visible form that silently drops messages is worse than no
 * form, because the visitor believes they have reached you.
 */
export function isContactFormConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL);
}
