import observatoryData from '@/data/observatory.json';
import { ArticleRow } from '@/components/shared/article-row';
import { DailyChart } from '@/components/observatory/daily-chart';
import { BarList } from '@/components/observatory/bar-list';
import { JsonLd } from '@/components/seo/json-ld';
import { CASE_STUDY_TAG, getArticles } from '@/data/content/articles';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { buildBreadcrumbSchema, buildObservatorySchema } from '@/lib/seo/structured-data';
import { formatDate } from '@/lib/format-date';
import type { Observatory } from '@/lib/observatory/types';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

const data = observatoryData as Observatory;

type LabPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LabPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  return createPageMetadata({ title: t.lab.title, description: t.lab.intro, path: '/lab', locale });
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="border-t border-foreground pt-5 font-serif text-[30px] font-medium tracking-[-0.01em]">
      {children}
    </h2>
  );
}

export default async function LabPage({ params }: LabPageProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  const nf = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB');
  const countryName = new Intl.DisplayNames([locale], { type: 'region' });
  const caseStudies = getArticles(locale).filter((a) => a.tags.includes(CASE_STUDY_TAG));
  const { totals } = data;
  const pct = (n: number) => `${Math.round((n / totals.requests) * 100)}%`;
  const section = 'mx-auto max-w-[1120px] px-4 pb-24 sm:px-8';

  const stats = [
    { value: totals.requests, label: t.lab.stats.requests },
    { value: totals.hostile, label: t.lab.stats.hostile, share: pct(totals.hostile) },
    { value: totals.stopped, label: t.lab.stats.stopped, note: t.lab.stoppedNote },
    { value: totals.maze, label: t.lab.stats.maze, note: t.lab.mazeNote },
  ];

  return (
    <>
      <JsonLd
        data={[
          buildObservatorySchema({ name: t.lab.title, description: t.lab.intro, path: localizedPath(locale, '/lab'), from: data.from, to: data.to }),
          buildBreadcrumbSchema([
            { name: 'Home', path: localizedPath(locale) },
            { name: t.lab.title, path: localizedPath(locale, '/lab') },
          ]),
        ]}
      />

      <section className="mx-auto max-w-[1120px] px-4 pb-20 pt-12 sm:px-8 sm:pt-20">
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.08em] text-link">{t.lab.kicker}</p>
        <h1 className="font-serif text-[clamp(40px,6vw,72px)] font-normal leading-[1.05] tracking-[-0.025em]">{t.lab.title}</h1>
        <p className="mt-7 max-w-[640px] text-[19px] text-muted-foreground">{t.lab.intro}</p>
        <p className="mt-5 font-mono text-[13px] text-muted-foreground">
          {formatDate(data.from, locale)} — {formatDate(data.to, locale)} · {t.lab.updated}{' '}
          <time dateTime={data.generatedAt}>{formatDate(data.generatedAt.slice(0, 10), locale)}</time>
        </p>

        <dl className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-10 gap-y-10 border-t border-foreground pt-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col">
              <dt className="order-2 mt-3 font-medium">{s.label}</dt>
              <dd className="order-1 font-serif text-[44px] leading-none tracking-[-0.02em] sm:text-[52px]">
                {nf.format(s.value)}
                {s.share && <span className="ml-2 align-middle font-mono text-sm text-link">{s.share}</span>}
              </dd>
              {s.note && <dd className="order-3 mt-1.5 text-sm text-muted-foreground">{s.note}</dd>}
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="daily-heading" className={section}>
        <H2 id="daily-heading">{t.lab.dailyTitle}</H2>
        <p className="mb-8 mt-3 max-w-[640px] text-muted-foreground">{t.lab.dailyCaption}</p>
        <DailyChart daily={data.daily} locale={locale} labels={t.lab} />
      </section>

      <section aria-labelledby="looking-heading" className={section}>
        <H2 id="looking-heading">{t.lab.lookingForTitle}</H2>
        <p className="mb-10 mt-3 max-w-[640px] text-muted-foreground">{t.lab.lookingForIntro}</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] gap-x-16 gap-y-14">
          <BarList items={data.categories.map((c) => ({ label: t.lab.categories[c.category], count: c.count }))} locale={locale} />
          <div>
            <h3 className="mb-4 font-medium">{t.lab.targetsTitle}</h3>
            <BarList items={data.targets.map((x) => ({ label: x.target, count: x.count, mono: true }))} locale={locale} />
          </div>
        </div>
      </section>

      <section aria-label={`${t.lab.countriesTitle}, ${t.lab.clientsTitle}, ${t.lab.defensesTitle}`} className={section}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-14 gap-y-14 border-t border-foreground pt-6">
          <div>
            <h2 className="mb-4 font-serif text-2xl font-medium">{t.lab.countriesTitle}</h2>
            <BarList
              items={data.countries.map((c) => ({ label: c.code === 'T1' ? 'Tor' : (countryName.of(c.code) ?? c.code), count: c.count }))}
              locale={locale}
            />
          </div>
          <div>
            <h2 className="mb-4 font-serif text-2xl font-medium">{t.lab.clientsTitle}</h2>
            <BarList items={data.clients.map((c) => ({ label: c.label, count: c.count }))} locale={locale} />
          </div>
          <div>
            <h2 className="mb-4 font-serif text-2xl font-medium">{t.lab.defensesTitle}</h2>
            <BarList items={data.defenses.map((d) => ({ label: d.layer, count: d.count }))} locale={locale} />
          </div>
        </div>
      </section>

      {caseStudies.length > 0 && (
        <section aria-labelledby="cases-heading" className={section}>
          <H2 id="cases-heading">{t.lab.caseStudiesTitle}</H2>
          <ol className="mt-2">
            {caseStudies.map((article) => (
              <ArticleRow key={article.slug} article={article} locale={locale} />
            ))}
          </ol>
        </section>
      )}

      <section aria-labelledby="method-heading" className={section}>
        <div className="bg-muted p-6 sm:p-10">
          <h2 id="method-heading" className="font-serif text-[26px] font-medium">{t.lab.methodTitle}</h2>
          <ul className="mt-5 max-w-[760px] list-disc space-y-3 pl-5 text-muted-foreground">
            {t.lab.method.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
