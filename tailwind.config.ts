/**
 * Tailwind v4 uses CSS-first config (@theme in globals.css).
 * This file is kept as a stub for tooling (e.g. components.json, shadcn).
 * Content detection is automatic in v4; theme is in src/app/globals.css.
 */
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
} satisfies Config;
