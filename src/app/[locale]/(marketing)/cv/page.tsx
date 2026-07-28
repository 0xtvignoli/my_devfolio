import { experiences } from '@/data/content/experiences';
import { projects } from '@/data/content/projects';
import { PrintButton } from '@/components/shared/print-button';
import { JsonLd } from '@/components/seo/json-ld';
import { buildBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { AUTHOR_NAME, SOCIAL_LINKS } from '@/lib/seo/constants';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

// Generated from the same data as /experience and /portfolio, so the CV can't
// drift from the site. Printing is the browser's job — see @media print in
// globals.css for what gets stripped.
export const dynamic = 'force-static';

type CvPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: CvPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  return createPageMetadata({
    title: t.cv.title,
    description: t.cv.subtitle,
    path: '/cv',
    locale,
  });
}

/** Experience copy is prose with "- " bullet lines; render those as a real list. */
function Description({ text }: { text: string }) {
  const blocks: Array<{ kind: 'p' | 'ul'; lines: string[] }> = [];
  for (const line of text.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const isBullet = line.startsWith('- ');
    const last = blocks.at(-1);
    const kind = isBullet ? 'ul' : 'p';
    if (last?.kind === kind) last.lines.push(isBullet ? line.slice(2) : line);
    else blocks.push({ kind, lines: [isBullet ? line.slice(2) : line] });
  }

  return (
    <>
      {blocks.map((block, index) =>
        block.kind === 'ul' ? (
          <ul key={index} className="my-2 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {block.lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          block.lines.map((line, i) => (
            <p key={`${index}-${i}`} className="my-2 text-sm text-muted-foreground leading-relaxed">
              {line}
            </p>
          ))
        )
      )}
    </>
  );
}

export default async function CvPage({ params }: CvPageProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', path: localizedPath(locale) },
          { name: t.cv.title, path: localizedPath(locale, '/cv') },
        ])}
      />
      <div className="container mx-auto px-4 py-12 max-w-3xl" data-print-root>
        <header className="border-b border-border pb-6 mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">{AUTHOR_NAME}</h1>
              <p className="text-base text-muted-foreground mt-1">{t.hero.badge}</p>
            </div>
            <div data-print-hide>
              <PrintButton label={t.cv.print} />
            </div>
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 list-none p-0 m-0 text-sm text-muted-foreground">
            <li>
              <a href={`mailto:${t.contact.email}`} className="underline underline-offset-4">
                {t.contact.email}
              </a>
            </li>
            <li>
              <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                {SOCIAL_LINKS.github.replace('https://', '')}
              </a>
            </li>
            <li>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                {SOCIAL_LINKS.linkedin.replace('https://www.', '')}
              </a>
            </li>
          </ul>
        </header>

        <section className="mb-8" aria-labelledby="cv-skills">
          <h2 id="cv-skills" className="font-headline text-lg font-bold mb-3 text-foreground">
            <span aria-hidden className="text-muted-foreground mr-2">##</span>
            {t.skills.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.skills.list.join(' · ')}</p>
        </section>

        <section className="mb-8" aria-labelledby="cv-experience">
          <h2 id="cv-experience" className="font-headline text-lg font-bold mb-3 text-foreground">
            <span aria-hidden className="text-muted-foreground mr-2">##</span>
            {t.experience.title}
          </h2>
          <div className="space-y-6">
            {experiences.map((experience) => (
              <div key={`${experience.company}-${experience.date[locale]}`} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-bold text-foreground">
                    {experience.title[locale]} — {experience.company}
                  </h3>
                  <span className="text-sm text-muted-foreground">{experience.date[locale]}</span>
                </div>
                <Description text={experience.description[locale]} />
                <p className="text-xs text-muted-foreground mt-2">{experience.tags.join(' · ')}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="cv-projects">
          <h2 id="cv-projects" className="font-headline text-lg font-bold mb-3 text-foreground">
            <span aria-hidden className="text-muted-foreground mr-2">##</span>
            {t.portfolio.title}
          </h2>
          <ul className="space-y-4 list-none p-0 m-0">
            {projects.map((project) => (
              <li key={project.id} className="break-inside-avoid">
                <h3 className="font-bold text-foreground text-sm">{project.title[locale]}</h3>
                <p className="text-sm text-muted-foreground my-1 leading-relaxed">{project.description[locale]}</p>
                <p className="text-xs text-muted-foreground">
                  {[
                    project.tags.join(' · '),
                    ...(project.metrics ?? []).map((metric) => `${metric.label[locale]}: ${metric.value}`),
                  ].join('  |  ')}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
