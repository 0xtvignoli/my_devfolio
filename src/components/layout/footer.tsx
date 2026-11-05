import { getTranslations } from '@/lib/i18n/server';
import { SOCIAL_LINKS } from '@/lib/seo/constants';
import type { Locale } from '@/lib/types';

const linkClass = 'inline-block py-2 hover:text-foreground';

export function Footer({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-x-7 gap-y-2 px-4 py-8 text-sm text-muted-foreground sm:px-8">
        <span>{t.footer.copy}</span>
        <span className="flex flex-wrap gap-x-6">
          <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>LinkedIn</a>
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className={linkClass}>GitHub</a>
          <a href={`/${locale}/feed.xml`} className={linkClass}>RSS</a>
        </span>
      </div>
    </footer>
  );
}
