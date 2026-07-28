export const SITE_URL = 'https://tvignoli.com';
export const SITE_NAME = 'Thomas Vignoli - DevOps Portfolio';
export const AUTHOR_NAME = 'Thomas Vignoli';
export const DEFAULT_DESCRIPTION =
  'Senior DevOps Engineer specializing in Kubernetes, Cloud Infrastructure, CI/CD, and Site Reliability Engineering. Explore my interactive lab, projects, and technical articles.';

/**
 * Deliberately NOT in the i18n bundle. It is the same string in both locales, so
 * it was never a translation — and `Translations` is handed whole to 23 client
 * components (Header and the mobile nav are on every page), which serialises
 * every string in it into each page's RSC payload. That is how the address ended
 * up in the HTML of /articles, where Cloudflare's email obfuscation cannot see
 * it. Import this only from server components, or fetch /api/contact.
 */
export const CONTACT_EMAIL = 'thomas.vignoli@pm.me';

export const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/in/tvignoli/',
  github: 'https://github.com/0xtvignoli',
} as const;
