import { JetBrains_Mono, IBM_Plex_Mono } from 'next/font/google'

/**
 * OpenCode-style typography: the whole site is monospaced.
 * Berkeley Mono is commercial, so we use JetBrains Mono (closest metric match)
 * with IBM Plex Mono as the documented secondary fallback.
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
})

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
})
