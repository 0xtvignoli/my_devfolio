import { getTranslations } from '@/lib/i18n/server';
import { SOCIAL_LINKS } from '@/lib/seo/constants';
import type { Locale } from '@/lib/types';

// Phones: full-width 48 px rows instead of 20 px words. From sm: one quiet line.
const linkClass = 'flex min-h-12 items-center justify-between border-b border-border hover:text-foreground sm:inline-block sm:min-h-0 sm:border-0 sm:py-2';

export function Footer({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1120px] flex-col-reverse gap-y-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-7 px-4 py-8 text-sm text-muted-foreground sm:px-8">
        <span>{t.footer.copy}</span>
        <span className="flex flex-col border-t border-border sm:flex-row sm:flex-wrap sm:gap-x-6 sm:border-0">
          <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>LinkedIn<span aria-hidden className="sm:hidden">↗</span></a>
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className={linkClass}>GitHub<span aria-hidden className="sm:hidden">↗</span></a>
          <a href={`/${locale}/feed.xml`} className={linkClass}>RSS</a>
        </span>
      </div>
    </footer>
  );
}
