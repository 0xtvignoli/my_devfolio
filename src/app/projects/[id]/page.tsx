import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import type { Metadata } from 'next';

import { projects } from '@/lib/data';
import { person } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectGallery } from '@/components/sections/ProjectGallery';
import { MobileCTA } from '@/components/sections/MobileCTA';
import { ProjectLinks } from '@/components/sections/ProjectLinks';
import type { Project } from '@/types/project';
import { isProject } from '@/types/project';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Await params to ensure it's resolved before destructuring
  const { id } = await Promise.resolve(params);
  const project = projects.find((p) => p.id === id) as Project | undefined;
  if (!project || !isProject(project)) {
    return { title: 'Project Not Found' };
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: `${siteUrl}/projects/${id}`,
    },
    openGraph: {
      title: `${project.title} | ${person.name}`,
      description: project.summary,
      images: project.images && project.images.length > 0 ? [project.images[0].url] : ['https://placehold.co/1200x630.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | ${person.name}`,
      description: project.summary,
      images: project.images && project.images.length > 0 ? [project.images[0].url] : ['https://placehold.co/1200x630.png'],
    },
  };
}

export function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  // Await params to ensure it's resolved before destructuring
  const { id } = await Promise.resolve(params);
  const project = projects.find((p) => p.id === id) as Project | undefined;

  if (!project || !isProject(project)) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/projects/${project.id}`,
    image: project.images?.[0]?.url,
    author: {
      '@type': 'Person',
      name: person.name,
    },
  } as const;

  return (
    <div className="space-y-8">
      <Button variant="ghost" asChild className="pl-0">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          aria-label="Back to Projects"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </Button>

      <header className="space-y-3">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{project.title}</h1>
        <p className="text-lg text-muted-foreground">{project.summary}</p>
        <ProjectLinks links={project.links} />
      </header>

      {project.images && project.images.length > 0 && <ProjectGallery images={project.images} />}

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6" aria-labelledby="about-heading">
          <h2 id="about-heading" className="font-headline text-2xl font-bold">About the Project</h2>
          <div className="prose dark:prose-invert max-w-none text-base leading-relaxed">
            <ReactMarkdown remarkPlugins={[gfm]}>
              {project.longDescription}
            </ReactMarkdown>
          </div>
        </section>
        <div className="space-y-6">
          <section aria-labelledby="stack-heading">
            <Card>
              <CardHeader>
                <CardTitle id="stack-heading" className="font-headline">Tech Stack</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </section>
          <section aria-labelledby="role-heading">
            <Card>
              <CardHeader>
                <CardTitle id="role-heading" className="font-headline">My Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{project.role}</p>
              </CardContent>
            </Card>
          </section>
          <section aria-labelledby="outcomes-heading">
            <Card>
              <CardHeader>
                <CardTitle id="outcomes-heading" className="font-headline">Key Outcomes</CardTitle>
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
          </section>
        </div>
      </div>

      {/* Mobile CTA - Only shows on mobile after scrolling */}
      <MobileCTA links={project.links} className="md:hidden" />

      {/* JSON-LD for this project */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
