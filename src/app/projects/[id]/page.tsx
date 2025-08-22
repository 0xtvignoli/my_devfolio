import { projects } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, ExternalLink, Github, Code } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Metadata } from 'next';
import { person } from '@/lib/data';
import { Button } from '@/components/ui/button';

const StackBlitzIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M9.43 2h5.14l-2.57 6.3l2.57-6.3h-5.14l-2.57 6.3zm-.9 6.3l-6.32 15.7h5.13l3.75-9.39l-2.56-6.31zm1.8 0l2.57 6.31l-2.57 6.32l2.57-6.32l-2.57-6.31zM11.33 8.3l2.57 6.31l3.75 9.39h5.13l-6.32-15.7z"
    />
  </svg>
);

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) {
    return { title: 'Project Not Found' };
  }
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: `${project.title} | ${person.name}`,
      description: project.summary,
      images: project.images ? [project.images[0].url] : [],
    },
  };
}

export function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectDetailsPage({ params }: Props) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" asChild className="pl-0">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </Button>

      <header className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{project.title}</h1>
        <p className="text-lg text-muted-foreground">{project.summary}</p>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {project.links?.repo && (
            <Button variant="outline" asChild>
              <Link href={project.links.repo} target="_blank" rel="noopener noreferrer">
                <Github /> Repository
              </Link>
            </Button>
          )}
          {project.links?.live && (
            <Button variant="outline" asChild>
              <Link href={project.links.live} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Live Demo
              </Link>
            </Button>
          )}
          {project.links?.codespaces && (
            <Button variant="outline" asChild>
              <Link href={project.links.codespaces} target="_blank" rel="noopener noreferrer">
                <Code /> Open in Codespaces
              </Link>
            </Button>
          )}
          {project.links?.stackblitz && (
            <Button variant="outline" asChild>
              <Link href={project.links.stackblitz} target="_blank" rel="noopener noreferrer">
                <StackBlitzIcon /> Open in StackBlitz
              </Link>
            </Button>
          )}
        </div>
      </header>

      {project.images && project.images.length > 0 && (
        <Carousel className="w-full">
          <CarouselContent>
            {project.images.map((image, index) => (
              <CarouselItem key={index}>
                <Card className="overflow-hidden">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      data-ai-hint={image.aiHint}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-14 hidden sm:flex" />
          <CarouselNext className="mr-14 hidden sm:flex" />
        </Carousel>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-headline text-2xl font-bold">About the Project</h2>
          <div
            className="prose dark:prose-invert max-w-none text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: project.longDescription }}
          ></div>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Tech Stack</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{project.role}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Key Outcomes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.outcomes.map((outcome, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-1 shrink-0 text-green-500" />
                  <p>{outcome}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
