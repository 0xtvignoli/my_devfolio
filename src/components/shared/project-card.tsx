'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Locale, Project, Translations } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Code2 } from 'lucide-react';
import { CodeSandboxEmbed } from '@/components/shared/codesandbox-embed';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  translations: Translations;
}

export function ProjectCard({ project, locale, translations }: ProjectCardProps) {
  const [isCodeSandboxOpen, setIsCodeSandboxOpen] = useState(false);

  return (
    <>
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
        <CardFooter className="flex justify-end gap-2 flex-wrap">
          {project.githubUrl && (
            <Button variant="outline" asChild size="sm">
              <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                {translations.project.github}
              </Link>
            </Button>
          )}
          {project.codesandboxId && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCodeSandboxOpen(true)}
              className="border-cyan-500/40 hover:bg-cyan-500/10 hover:border-cyan-500/60"
            >
              <Code2 className="mr-2 h-4 w-4" />
              {translations.codesandbox.tryIt}
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

      {project.codesandboxId && (
        <Dialog open={isCodeSandboxOpen} onOpenChange={setIsCodeSandboxOpen}>
          <DialogContent className="max-w-6xl h-[90vh] p-0 bg-slate-950 border-cyan-500/30">
            <DialogHeader className="p-6 border-b border-cyan-500/30">
              <DialogTitle className="text-cyan-300 flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                {project.title[locale]}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {project.description[locale]}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 p-6 overflow-hidden">
              <CodeSandboxEmbed
                sandboxId={project.codesandboxId}
                title={project.title[locale]}
                description={project.description[locale]}
                variant="full"
                className="h-full"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
