import { Inter, JetBrains_Mono, Newsreader } from 'next/font/google';

/**
 * Editorial system (11/2026 redesign): serif for headings and long-form text,
 * sans for interface, mono only for dates, code and the lab.
 */
export const serif = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-serif-face',
});

export const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans-face',
});

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
  variable: '--font-mono-face',
});
