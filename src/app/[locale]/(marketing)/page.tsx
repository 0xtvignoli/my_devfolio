import Link from 'next/link';
import { projects } from '@/data/content/projects';
import { experiences } from '@/data/content/experiences';
import { getArticles } from '@/data/content/articles';
import { ContactSection } from '@/components/shared/contact-section';
import { isContactFormConfigured } from '@/lib/contact-config';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import { AUTHOR_NAME } from '@/lib/seo/constants';
import { formatDate } from '@/lib/format-date';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

/** Hand-picked, in this order: breadth first, then the current focus. */
const FEATURED_PROJECT_IDS = ['project-1', 'project-6', 'project-5', 'project-7'];

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  return createPageMetadata({
    title: `${AUTHOR_NAME} — ${t.home.kicker}`,
    description: t.home.intro,
    path: '/',
    locale,
  });
}

/** First sentence only: the list is a table of contents, the page has the rest. */
function firstSentence(text: string): string {
  const end = text.indexOf('. ');
  return end === -1 ? text : text.slice(0, end + 1);
}

function SectionHead({ id, title, link }: { id: string; title: string; link?: { href: string; label: string } }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-foreground pt-5">
      <h2 id={id} className="font-serif text-[30px] font-medium tracking-[-0.01em]">{title}</h2>
      {link && (
        <Link href={link.href} className="py-2 text-[15px] text-muted-foreground hover:text-foreground">
          {link.label}
        </Link>
      )}
    </div>
  );
}

export default async function Home({ params }: HomePageProps) {
  const { locale: localeParam } = await params;
  const locale: Locale = resolveLocaleParam(localeParam);
  const t = getTranslations(locale);
  const articles = getArticles(locale).slice(0, 5);
  const featured = FEATURED_PROJECT_IDS.map((id) => projects.find((p) => p.id === id)).filter((p) => p !== undefined);
  const section = 'mx-auto max-w-[1120px] px-4 pb-24 sm:px-8';

  return (
    <>
      <section className="mx-auto max-w-[1120px] px-4 pb-24 pt-14 sm:px-8 sm:pb-28 sm:pt-24">
        <p className="mb-7 text-sm font-medium uppercase tracking-[0.08em] text-link">{t.home.kicker}</p>
        <h1 className="max-w-[900px] font-serif text-[clamp(40px,6vw,76px)] font-normal leading-[1.05] tracking-[-0.025em]">
          {t.home.headline}
        </h1>
        <p className="mt-9 max-w-[600px] text-[19px] text-muted-foreground">{t.home.intro}</p>
        <div className="mt-11 flex flex-wrap gap-8 font-medium">
          <a href="#work" className="border-b border-foreground py-2.5">{t.home.ctaWork}</a>
          <a href="#contact" className="py-2.5 text-muted-foreground hover:text-foreground">{t.home.ctaContact}</a>
        </div>
      </section>

      <section aria-labelledby="writing-heading" className={section}>
        <SectionHead
          id="writing-heading"
          title={t.home.writing}
          link={{ href: localizedPath(locale, '/articles'), label: t.home.allArticles }}
        />
        <ol className="mt-2">
          {articles.map((article) => (
            <li key={article.slug} className="border-b border-border">
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
          ))}
        </ol>
      </section>

      <section id="work" aria-labelledby="work-heading" className={section}>
        <SectionHead
          id="work-heading"
          title={t.home.work}
          link={{ href: localizedPath(locale, '/portfolio'), label: t.home.allProjects }}
        />
        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] gap-x-16 gap-y-14">
          {featured.map((project, i) => (
            <article key={project.id}>
              <p className="mb-3 font-mono text-[13px] text-link">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="font-serif text-[26px] font-medium leading-[1.2]">
                <Link href={`${localizedPath(locale, '/portfolio')}#${project.id}`} className="hover:underline hover:underline-offset-4">
                  {project.title[locale]}
                </Link>
              </h3>
              <p className="mt-3 text-muted-foreground">{firstSentence(project.description[locale])}</p>
              <p className="mt-3.5 text-sm text-muted-foreground">{project.tags.slice(0, 4).join(' · ')}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="experience-heading" className={section}>
        <SectionHead
          id="experience-heading"
          title={t.home.experience}
          link={{ href: localizedPath(locale, '/experience'), label: `${t.nav.experience} →` }}
        />
        <dl className="mt-4">
          {experiences.map((job) => (
            <div key={job.company} className="flex flex-wrap gap-x-10 gap-y-1 border-b border-border py-5">
              <dt className="flex-[0_0_160px] pt-1 font-mono text-[13px] text-muted-foreground">{job.date[locale]}</dt>
              <dd className="min-w-0 flex-[1_1_400px]">
                <span className="font-semibold">{job.title[locale]}</span>{' '}
                <span className="text-muted-foreground">— {job.company.trim()}</span>
              </dd>
            </div>
          ))}
        </dl>
        <Link href={localizedPath(locale, '/cv')} className="mt-5 inline-block py-2.5 text-[15px] font-medium">
          {t.home.fullCv}
        </Link>
      </section>

      <section aria-labelledby="lab-heading" className={section}>
        <div className="flex flex-wrap items-center justify-between gap-8 bg-muted p-6 sm:p-10">
          <div className="min-w-0 flex-[1_1_420px]">
            <p className="mb-2.5 font-mono text-[13px] text-link">{t.home.labPrompt}</p>
            <h2 id="lab-heading" className="font-serif text-[28px] font-medium">{t.home.labTitle}</h2>
            <p className="mt-2.5 max-w-[560px] text-muted-foreground">{t.home.labBody}</p>
          </div>
          <Link
            href={localizedPath(locale, '/lab')}
            className="bg-foreground px-[22px] py-3.5 text-[15px] font-medium text-background hover:opacity-90"
          >
            {t.home.labCta}
          </Link>
        </div>
      </section>

      <ContactSection translations={t} formEnabled={isContactFormConfigured()} />
    </>
  );
}
