import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RequestedPath, ShortcutLabel } from '@/components/requested-path';
import { getTranslations, resolveLocaleFromHeaders } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { paletteEntries } from '@/lib/palette-entries';

export const metadata = {
  title: '404',
  robots: { index: false },
};

/**
 * Root not-found: rendered outside the (marketing) layout, so it brings its
 * own header and footer. The locale comes from the x-locale header proxy.ts
 * sets, falling back to Accept-Language.
 */
export default async function NotFound() {
  const locale = await resolveLocaleFromHeaders();
  const t = getTranslations(locale);
  const n = t.notFound;

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} translations={t} paletteEntries={paletteEntries(locale)} />
      <main id="main-content" className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
        <p className="font-mono text-[15px] text-muted-foreground">
          <span className="text-link">~/</span> cd <RequestedPath />
        </p>
        <p className="mt-1.5 font-mono text-[15px] text-destructive">cd: no such file or directory</p>
        <h1 className="mt-10 font-serif text-[clamp(40px,6vw,64px)] font-normal leading-[1.05] tracking-[-0.02em]">{n.title}</h1>
        <p className="mt-5 max-w-[600px] text-[19px] text-muted-foreground">
          {n.tryPalette}{' '}
          <kbd className="border border-border px-1.5 py-0.5 font-mono text-[15px] text-foreground">
            <ShortcutLabel />
          </kbd>
          . {n.counted}
        </p>
        <p className="mt-9 flex flex-wrap gap-x-7 font-medium">
          <Link href={localizedPath(locale)} className="border-b border-foreground py-2">cd ~ →</Link>
          <Link href={localizedPath(locale, '/articles')} className="py-2 text-muted-foreground hover:text-foreground">{n.writing}</Link>
          <Link href={localizedPath(locale, '/lab')} className="py-2 text-muted-foreground hover:text-foreground">{n.observatory}</Link>
        </p>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
