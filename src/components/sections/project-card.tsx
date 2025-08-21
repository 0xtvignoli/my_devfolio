
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const linkHref = project.links?.caseStudy ?? `/projects/${project.id}`;
  const linkText = project.id === 'lab' ? 'Explore The Lab' : 'View Case Study';

  return (
    <Link href={linkHref} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-all group-hover:shadow-lg group-hover:-translate-y-1">
        {project.images?.[0] && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={project.images[0].url}
              alt={project.images[0].alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
              data-ai-hint={project.images[0].aiHint}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
          <CardDescription>{project.summary}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex flex-wrap gap-2">
            {project.stack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary">{tech}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center text-sm font-medium text-primary w-full">
            {linkText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
