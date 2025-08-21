import { ProjectCard } from "@/components/sections/project-card";
import { projects } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Projects
        </h1>
        <p className="text-muted-foreground">A selection of my recent work.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
