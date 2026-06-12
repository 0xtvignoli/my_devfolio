import type {Metadata} from 'next';
import './globals.css';
import { inter, spaceGrotesk, sourceCodePro } from './fonts';
import { cn } from '@/lib/utils';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { Suspense } from 'react';
import { resolveLocaleFromHeaders, getTranslations } from '@/lib/i18n/server';
import { SiteProviders } from '@/components/providers/site-providers';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPersonSchema, buildWebsiteSchema, buildProfilePageSchema } from '@/lib/seo/structured-data';
import { AUTHOR_NAME, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${AUTHOR_NAME} - Senior DevOps Engineer Portfolio`,
    template: `%s | ${AUTHOR_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ['DevOps', 'Kubernetes', 'Cloud Infrastructure', 'CI/CD', 'Docker', 'Terraform', 'AWS', 'GCP', 'Azure', 'SRE', 'Site Reliability Engineering', 'Monitoring', 'Observability'],
  authors: [{ name: AUTHOR_NAME }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
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
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${AUTHOR_NAME} - Senior DevOps Engineer`,
    description: DEFAULT_DESCRIPTION,
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveLocaleFromHeaders();
  const t = getTranslations(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <JsonLd data={[buildPersonSchema(), buildWebsiteSchema(), buildProfilePageSchema()]} />
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
        suppressHydrationWarning
      >
        {/* Strip data-cursor-ref injected by Cursor IDE browser/extension to avoid hydration mismatch */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var strip=function(){var r=document.querySelectorAll("[data-cursor-ref]");for(var i=0;i<r.length;i++)r[i].removeAttribute("data-cursor-ref");};strip();var o=new MutationObserver(strip);o.observe(document.documentElement,{attributes:true,attributeFilter:["data-cursor-ref"],subtree:true});})();`,
          }}
        />
        <SiteProviders skipLabel={t.a11y.skipToContent}>
          {children}
        </SiteProviders>
      </body>
    </html>
  );
}
