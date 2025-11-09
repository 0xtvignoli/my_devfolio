import type {Metadata} from 'next';
import './globals.css';
import { inter, spaceGrotesk, sourceCodePro } from './fonts';
import { cn } from '@/lib/utils';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { Suspense } from 'react';
import { resolveLocale } from '@/lib/i18n/server';
import { SiteProviders } from '@/components/providers/site-providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://tvignoli.com'),
  title: {
    default: 'Thomas Vignoli - Senior DevOps Engineer Portfolio',
    template: '%s | Thomas Vignoli'
  },
  description: 'Senior DevOps Engineer specializing in Kubernetes, Cloud Infrastructure, CI/CD, and Site Reliability Engineering. Explore my interactive lab, projects, and technical articles.',
  keywords: ['DevOps', 'Kubernetes', 'Cloud Infrastructure', 'CI/CD', 'Docker', 'Terraform', 'AWS', 'GCP', 'Azure', 'SRE', 'Site Reliability Engineering', 'Monitoring', 'Observability'],
  authors: [{ name: 'Thomas Vignoli' }],
  creator: 'Thomas Vignoli',
  publisher: 'Thomas Vignoli',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['it_IT'],
    url: 'https://tvignoli.com',
    siteName: 'Thomas Vignoli - DevOps Portfolio',
    title: 'Thomas Vignoli - Senior DevOps Engineer',
    description: 'Senior DevOps Engineer specializing in Kubernetes, Cloud Infrastructure, CI/CD, and Site Reliability Engineering',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Thomas Vignoli DevOps Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thomas Vignoli - Senior DevOps Engineer',
    description: 'Senior DevOps Engineer specializing in Kubernetes, Cloud Infrastructure, and CI/CD',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Suspense fallback={null}>
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        </Suspense>
      </head>
      <body 
        className={cn(
          "font-body antialiased",
          inter.variable, 
          spaceGrotesk.variable, 
          sourceCodePro.variable
        )}
      >
        <SiteProviders>
          {children}
        </SiteProviders>
      </body>
    </html>
  );
}
