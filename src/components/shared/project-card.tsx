import Image from 'next/image';
import Link from 'next/link';
import type { Locale, Project, Translations } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  translations: Translations;
}

export function ProjectCard({ project, locale, translations }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="aspect-video relative mb-4">
          <Image
            src={project.imageUrl}
            alt={project.title[locale]}
            fill
            className="object-cover rounded-md"
            data-ai-hint={project.imageHint}
          />
        </div>
        <CardTitle className="font-headline">{project.title[locale]}</CardTitle>
        <CardDescription>{project.description[locale]}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {project.githubUrl && (
          <Button variant="outline" asChild size="sm">
            <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              {translations.project.github}
            </Link>
          </Button>
        )}
        {project.demoUrl && (
          <Button asChild size="sm">
            <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {translations.project.demo}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
