import type {Metadata} from 'next';
import './globals.css';
import {ThemeProvider} from '@/components/providers/theme-provider';
import {LocaleProvider} from '@/contexts/locale-context';
import {Header} from '@/components/layout/header';
import {Footer} from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster"
import { inter, spaceGrotesk, sourceCodePro } from './fonts';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'DevOps Folio',
  description: 'A DevOps Portfolio and Knowledge Hub by a Senior DevOps Engineer',
  openGraph: {
    title: 'DevOps Folio',
    description: 'A DevOps Portfolio and Knowledge Hub by a Senior DevOps Engineer',
    url: 'https://devops-folio.vercel.app',
    siteName: 'DevOps Folio',
    images: [
      {
        url: 'https://placehold.co/1200x630.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body 
        className={cn(
          "font-body antialiased",
          inter.variable, 
          spaceGrotesk.variable, 
          sourceCodePro.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
