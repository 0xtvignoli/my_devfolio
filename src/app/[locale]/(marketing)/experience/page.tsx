import { experiences } from '@/data/content/experiences';
import { ExperienceDescription } from '@/components/shared/experience-description';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { buildBreadcrumbSchema } from '@/lib/seo/structured-data';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type ExperiencePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ExperiencePageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  return createPageMetadata({
    title: t.experience.title,
    description: t.experience.pageSubtitle,
    path: '/experience',
    locale,
  });
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', path: localizedPath(locale) },
          { name: t.experience.title, path: localizedPath(locale, '/experience') },
        ])}
      />
      <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
        <h1 className="font-serif text-[clamp(40px,5vw,60px)] font-normal leading-[1.05] tracking-[-0.02em]">{t.experience.title}</h1>
        <p className="mb-8 mt-5 max-w-[600px] text-[19px] text-muted-foreground">{t.experience.pageSubtitle}</p>
        <ol className="border-t border-foreground">
          {experiences.map((job) => (
            <li key={`${job.company}-${job.date[locale]}`} className="flex flex-wrap gap-x-16 gap-y-3 border-b border-border py-12">
              <p className="flex-[0_0_180px] pt-2 font-mono text-[13px] text-muted-foreground">{job.date[locale]}</p>
              <div className="min-w-0 max-w-[720px] flex-[1_1_480px]">
                <h2 className="font-serif text-[28px] font-medium leading-[1.15] sm:text-[32px]">{job.title[locale]}</h2>
                <p className="mt-1 text-lg text-muted-foreground">{job.company.trim()}</p>
                <div className="mt-5 text-[17px]">
                  <ExperienceDescription text={job.description[locale]} />
                </div>
                <p className="mt-5 text-sm text-muted-foreground">{job.tags.join(' · ')}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
