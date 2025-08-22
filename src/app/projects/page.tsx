import { ProjectCard } from '@/components/sections/project-card';
import { SectionHeader } from '@/components/sections/section-header';
import { projects } from '@/lib/data';

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader align="left" title="Projects" subtitle="A selection of my recent work." />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
