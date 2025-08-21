
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { person, projects } from "@/lib/data";
import { ArrowRight, Download, Mail } from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "@/components/sections/project-card";
import { SectionHeader } from "@/components/sections/section-header";
import { StatsCards } from "@/components/sections/stats-cards";

const skills = [
    "Kubernetes", "Docker", "Terraform", "Ansible", "Jenkins", 
    "GitHub Actions", "AWS", "Google Cloud", "Prometheus", "Grafana", 
    "ELK Stack", "Python", "Go", "Bash"
];

const labProject = {
    id: "lab",
    title: "Interactive DevOps Lab",
    summary: "A hands-on, simulated environment to demonstrate and explore core DevOps concepts, including CI/CD, container orchestration, and incident management.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Genkit"],
    role: "",
    outcomes: [],
    longDescription: "",
    links: {
        caseStudy: "/lab"
    }
}

export default function HomePage() {
  const featuredProjects = [labProject, ...projects.slice(0, 2)];
  const stats = [
    { label: "Production uptime", value: "99.99%" },
    { label: "Pipelines automated", value: "50+" },
    { label: "Clusters managed", value: "12" },
    { label: "Incidents resolved", value: "200+" },
  ]

  return (
    <div className="space-y-20 sm:space-y-32">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            DevOps Engineer & <br />
            Cloud Architect
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Bridging the gap between development and operations. I build
            resilient, scalable, and automated systems to accelerate software
            delivery and enhance reliability.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button size="lg" asChild>
                <Link href="/contact">
                    Get in Touch <Mail className="ml-2 h-4 w-4" />
                </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={person.resumeUrl} target="_blank">
                Download CV <Download className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <Avatar className="h-64 w-64 border-4 border-primary">
            <AvatarImage src="https://placehold.co/256x256.png" alt={person.name} data-ai-hint="professional portrait" />
            <AvatarFallback className="text-8xl">{person.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
        </div>
      </section>

      {/* Core Technologies & Skills Section */}
      <section className="space-y-8">
        <SectionHeader title="Core Technologies & Skills" align="center" subtitle="Tools and platforms I use to build resilient systems." />
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {skills.map(skill => (
            <Badge key={skill} variant="secondary" className="text-sm px-4 py-2 rounded-lg">
                {skill}
            </Badge>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section>
        <StatsCards items={stats} />
      </section>

      {/* Featured Projects Section */}
      <section className="space-y-8">
        <SectionHeader title="Featured Projects" align="center" subtitle="A snapshot of work spanning cloud, DevOps, and platform engineering." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
