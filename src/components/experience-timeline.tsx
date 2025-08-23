'use client';

import { useLocale } from '@/hooks/use-locale';
import { experiences } from '@/data/content/experiences';
import { Badge } from './ui/badge';

export function ExperienceTimeline() {
  const { locale } = useLocale();

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="absolute left-9 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
      {experiences.map((exp, index) => (
        <div key={index} className="relative pl-20 pb-12">
          <div className="absolute left-9 top-2 h-4 w-4 rounded-full bg-primary border-4 border-background -translate-x-1/2"></div>
          <p className="text-sm font-medium text-primary mb-1">{exp.date[locale]}</p>
          <h3 className="font-headline text-xl font-bold">{exp.title[locale]}</h3>
          <p className="text-md text-muted-foreground mb-3">{exp.company}</p>
          <p className="text-foreground/80 mb-4">{exp.description[locale]}</p>
          <div className="flex flex-wrap gap-2">
            {exp.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
