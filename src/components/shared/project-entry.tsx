import type { Locale, Project, Translations } from '@/lib/types';

interface ProjectEntryProps {
  project: Project;
  index: number;
  locale: Locale;
  translations: Translations;
}

/**
 * One project on /portfolio: number and title on the left, the description,
 * figures and links on the right. The id is the anchor the home links to.
 */
export function ProjectEntry({ project, index, locale, translations }: ProjectEntryProps) {
  return (
    <article id={project.id} className="scroll-mt-8 border-b border-border py-12 first:pt-8">
      <div className="flex flex-wrap gap-x-16 gap-y-5">
        <div className="min-w-0 flex-[1_1_300px]">
          <p className="mb-3 font-mono text-[13px] text-link">{String(index + 1).padStart(2, '0')}</p>
          <h2 className="font-serif text-[28px] font-medium leading-[1.15] tracking-[-0.01em] sm:text-[32px]">
            {project.title[locale]}
          </h2>
        </div>
        <div className="min-w-0 flex-[2_1_480px]">
          <p className="text-[18px] leading-[1.6]">{project.description[locale]}</p>

          {project.metrics && project.metrics.length > 0 && (
            <dl aria-label={translations.project.metricsLabel} className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
              {project.metrics.map((metric) => (
                <div key={metric.label[locale]}>
                  <dt className="text-sm text-muted-foreground">{metric.label[locale]}</dt>
                  <dd className="font-serif text-[26px] leading-tight">{metric.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="mt-6 text-sm text-muted-foreground">{project.tags.join(' · ')}</p>

          {(project.githubUrl || project.demoUrl) && (
            <p className="mt-4 flex flex-wrap gap-x-7 text-[15px] font-medium">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="border-b border-foreground py-2">
                  {translations.project.github} →
                </a>
              )}
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="border-b border-foreground py-2">
                  {translations.project.demo} →
                </a>
              )}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
