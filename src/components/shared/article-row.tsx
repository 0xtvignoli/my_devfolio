import Link from 'next/link';
import { localizedPath } from '@/lib/i18n/paths';
import { formatDate } from '@/lib/format-date';
import type { Article, Locale } from '@/lib/types';

/** One line of the article index: date, title, tags. Used on the home and on /articles. */
export function ArticleRow({ article, locale }: { article: Article; locale: Locale }) {
  return (
    <li className="border-b border-border">
      <Link
        href={localizedPath(locale, `/articles/${article.slug}`)}
        className="group flex flex-wrap items-baseline gap-x-10 gap-y-2 py-6"
      >
        <time dateTime={article.date} className="min-w-[120px] font-mono text-[13px] text-muted-foreground">
          {formatDate(article.date, locale)}
        </time>
        <span className="block min-w-0 max-w-[760px] flex-[1_1_320px]">
          <span className="block font-serif text-[23px] leading-[1.25] tracking-[-0.01em] group-hover:underline group-hover:underline-offset-4 sm:text-[25px]">
            {article.title}
          </span>
          <span className="mt-2 block text-[15px] text-muted-foreground">{article.tags.join(' · ')}</span>
        </span>
      </Link>
    </li>
  );
}
