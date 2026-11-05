import Link from 'next/link';
import { localizedPath } from '@/lib/i18n/paths';
import { formatDate } from '@/lib/format-date';
import { getTranslations } from '@/lib/i18n/server';
import { CASE_STUDY_TAG } from '@/data/content/articles';
import type { Article, Locale } from '@/lib/types';

/** One line of the article index: date, title, tags. Used on the home and on /articles. */
export function ArticleRow({ article, locale }: { article: Article; locale: Locale }) {
  const isCaseStudy = article.tags.includes(CASE_STUDY_TAG);
  const tags = article.tags.filter((tag) => tag !== CASE_STUDY_TAG);
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
            {isCaseStudy && (
              <span className="ml-2.5 inline-block border border-link px-1.5 py-px align-[0.3em] font-mono text-[11px] uppercase leading-normal tracking-[0.06em] text-link">
                {getTranslations(locale).home.caseStudy}
              </span>
            )}
          </span>
          <span className="mt-2 block text-[15px] text-muted-foreground">{tags.join(' · ')}</span>
        </span>
      </Link>
    </li>
  );
}
