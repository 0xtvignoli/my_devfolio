import type { Locale } from '@/lib/types';
import { experiences } from '@/data/content/experiences';
import { ExperienceCard } from './shared/experience-card';

export function ExperienceTimeline({ locale }: { locale: Locale }) {
  return (
    <div className="relative max-w-4xl mx-auto px-4">
      {experiences.map((exp, index) => (
        <ExperienceCard
          key={index}
          dateRange={exp.date[locale]}
          title={exp.title[locale]}
          company={exp.company}
          description={exp.description[locale]}
          tags={exp.tags}
          isLast={index === experiences.length - 1}
        />
      ))}
    </div>
  );
}
