import Link from 'next/link';
import { ArticleRow } from '@/components/shared/article-row';
import { getArticle, HOMELAB_SERIES } from '@/data/content/articles';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale).homelab;
  return createPageMetadata({ title: t.title, description: t.intro, path: '/lab/homelab', locale });
}

export default async function HomelabPage({ params }: Props) {
  const locale: Locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale).homelab;
  const d = t.diagram;
  const articles = HOMELAB_SERIES.map((slug) => getArticle(slug, locale)).filter((a) => a !== undefined);
  const box = 'border border-foreground p-3.5';

  return (
    <section className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <p className="mb-6 text-sm font-medium uppercase tracking-[0.08em] text-link">{t.kicker}</p>
      <h1 className="max-w-[840px] font-serif text-[clamp(40px,6vw,64px)] font-normal leading-[1.05] tracking-[-0.025em]">{t.title}</h1>
      <p className="mt-7 max-w-[680px] text-[19px] text-muted-foreground">{t.intro}</p>

      <figure className="mt-12 border border-border p-5 font-mono text-[13px] sm:p-8">
        <div className="grid items-center gap-3 md:grid-cols-[1fr_32px_1fr_32px_1.4fr]">
          <div className={box}>{d.internet}</div>
          <div aria-hidden="true" className="text-center text-muted-foreground">
            <span className="md:hidden">↓</span>
            <span className="hidden md:inline">→</span>
          </div>
          <div className="border border-link p-3.5 text-link">
            {d.router}
            <br />
            <span className="text-muted-foreground">{d.routerNote}</span>
          </div>
          <div aria-hidden="true" className="text-center text-muted-foreground">
            <span className="md:hidden">↓</span>
            <span className="hidden md:inline">→</span>
          </div>
          <div className="grid gap-2.5">
            <div className={box}>
              {d.edge}
              <br />
              <span className="text-muted-foreground">{d.edgeNote}</span>
            </div>
            <div className={box}>
              {d.data}
              <br />
              <span className="text-muted-foreground">{d.dataNote}</span>
            </div>
          </div>
        </div>
        <figcaption className="mt-5 text-muted-foreground">{d.footer}</figcaption>
      </figure>

      <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {t.practices.map((p) => (
          <div key={p.title} className="border-t border-foreground pt-4">
            <h2 className="font-serif text-2xl font-medium">{p.title}</h2>
            <p className="mt-2 text-[15px] text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-12 bg-muted px-5 py-4 text-sm text-muted-foreground">{t.note}</p>

      <h2 className="mt-16 border-t border-foreground pt-5 font-serif text-[30px] font-medium">{t.readTitle}</h2>
      <div className="mt-4">
        {articles.map((article) => (
          <ArticleRow key={article.slug} article={article} locale={locale} />
        ))}
      </div>
      <p className="mt-6">
        <Link className="text-link underline-offset-4 hover:underline" href={localizedPath(locale, '/portfolio')}>
          {t.projectLink}
        </Link>
      </p>
    </section>
  );
}
