'use client';

import { ProjectCard } from "@/components/shared/project-card";
import { projects } from "@/data/content/projects";
import { useLocale } from "@/hooks/use-locale";

export default function PortfolioPage() {
    const { t } = useLocale();

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                    {t.nav.portfolio}
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    A collection of my work, from infrastructure automation to application deployment.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
}
