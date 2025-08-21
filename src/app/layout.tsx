
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { DevopsSimProvider } from '@/providers/devops-sim-provider';
import Template from './template';
import { person } from '@/lib/data';
import { ThemeProvider } from '@/providers/theme-provider';
import dynamic from 'next/dynamic';
import { SidebarSkeleton } from '@/components/layout/sidebar-skeleton';
import { HeaderSkeleton } from '@/components/layout/header-skeleton';

const Sidebar = dynamic(() => import('@/components/layout/sidebar').then(mod => mod.Sidebar), {
  loading: () => <SidebarSkeleton />,
});

const Header = dynamic(() => import('@/components/layout/header').then(mod => mod.Header), {
    loading: () => <HeaderSkeleton />
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DevopsSimProvider>
            <div className="relative flex min-h-screen">
              <Sidebar />
              <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 flex flex-col">
                  <Template>{children}</Template>
                </main>
              </div>
            </div>
            <Toaster />
          </DevopsSimProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
