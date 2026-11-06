import { JumpChips } from '@/components/shared/jump-chips';
import { experiences } from '@/data/content/experiences';
import { projects } from '@/data/content/projects';
import { PrintButton } from '@/components/shared/print-button';
import { ExperienceDescription } from '@/components/shared/experience-description';
import { JsonLd } from '@/components/seo/json-ld';
import { buildBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { AUTHOR_NAME, CONTACT_EMAIL, SOCIAL_LINKS } from '@/lib/seo/constants';
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
      <JumpChips
        label={t.onThisPage}
        items={[
          { id: 'cv-skills', text: t.skills.title },
          { id: 'cv-experience', text: t.experience.title },
          { id: 'cv-projects', text: t.portfolio.title },
        ]}
      />
      <div className="mx-auto max-w-[760px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20" data-print-root>
        <header className="mb-12 border-b border-border pb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.05] tracking-[-0.02em]">{AUTHOR_NAME}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{t.home.kicker}</p>
            </div>
            <div data-print-hide>
              <PrintButton label={t.cv.print} />
            </div>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-[15px] text-muted-foreground">
            <li>
              {/* Server-rendered: the address is in the href and the link text, and
                  nowhere in any client payload. NOTE: Cloudflare's email
                  obfuscation rewrites both into a JS-decoded span, which prints as
                  "[email protected]" if the script has not run — on the one page
                  meant to become a static PDF. Exempt /cv from it with a
                  Configuration Rule. */}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">
                {CONTACT_EMAIL}
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

        <section className="mb-12" aria-labelledby="cv-skills">
          <h2 id="cv-skills" className="mb-5 border-t border-foreground pt-4 font-serif text-[26px] font-medium">
            {t.skills.title}
          </h2>
          <p className="leading-relaxed text-muted-foreground">{t.skills.list.join(' · ')}</p>
        </section>

        <section className="mb-12" aria-labelledby="cv-experience">
          <h2 id="cv-experience" className="mb-5 border-t border-foreground pt-4 font-serif text-[26px] font-medium">
            {t.experience.title}
          </h2>
          <div className="space-y-9">
            {experiences.map((experience) => (
              <div key={`${experience.company}-${experience.date[locale]}`} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-serif text-[22px] font-medium">
                    {experience.title[locale]} <span className="text-muted-foreground">— {experience.company.trim()}</span>
                  </h3>
                  <span className="font-mono text-[13px] text-muted-foreground">{experience.date[locale]}</span>
                </div>
                <ExperienceDescription text={experience.description[locale]} />
                <p className="mt-3 text-sm text-muted-foreground">{experience.tags.join(' · ')}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="cv-projects">
          <h2 id="cv-projects" className="mb-5 border-t border-foreground pt-4 font-serif text-[26px] font-medium">
            {t.portfolio.title}
          </h2>
          <ul className="space-y-6">
            {projects.map((project) => (
              <li key={project.id} className="break-inside-avoid">
                <h3 className="font-serif text-xl font-medium">{project.title[locale]}</h3>
                <p className="my-1.5 leading-relaxed">{project.description[locale]}</p>
                <p className="text-sm text-muted-foreground">
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
