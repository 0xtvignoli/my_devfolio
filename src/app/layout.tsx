import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Template from './template';
import { person } from '@/lib/data';
import { ThemeProvider } from '@/providers/theme-provider';
import dynamic from 'next/dynamic';
import { SidebarSkeleton } from '@/components/layout/sidebar-skeleton';
import { HeaderSkeleton } from '@/components/layout/header-skeleton';
import { Inter } from 'next/font/google';

// Define fonts at module scope (recommended for Server Components)
const inter = Inter({ subsets: ['latin'], display: 'swap' });

const Sidebar = dynamic(() => import('@/components/layout/sidebar').then((mod) => mod.Sidebar), {
  loading: () => <SidebarSkeleton />,
});

const Header = dynamic(() => import('@/components/layout/header').then((mod) => mod.Header), {
  loading: () => <HeaderSkeleton />,
});

export const metadata: Metadata = {
  title: {
    default: `${person.name} | ${person.roleTitle}`,
    template: `%s | ${person.name}`,
  },
  description: person.bio,
  openGraph: {
    title: `${person.name} | ${person.roleTitle}`,
    description: person.bio,
    type: 'website',
    url: 'https://your-domain.com',
    images: [
      {
        url: 'https://placehold.co/1200x630.png',
        width: 1200,
        height: 630,
        alt: `Portfolio of ${person.name}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${person.name} | ${person.roleTitle}`,
    description: person.bio,
    // creator: '@your_twitter_handle',
    images: ['https://placehold.co/1200x630.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Prefer configured site URL, fallback to metadata/openGraph default
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: person.roleTitle,
    description: person.bio,
    url: siteUrl,
    email: person.email ? `mailto:${person.email}` : undefined,
    sameAs: [
      person.social.github,
      person.social.linkedin,
      person.social.twitter,
    ].filter(Boolean),
  } as const;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          // JSON-LD must be a string
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} font-body bg-background text-foreground antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <div className="relative flex min-h-screen">
              <Sidebar />
              <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 flex flex-col">
                  <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <Template>{children}</Template>
                  </div>
                </main>
              </div>
            </div>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
