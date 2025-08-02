import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { translations } from '@/data/translations';
import { projects } from '@/data/portfolio';
import { Language } from '@/hooks/useLanguage';
import { ExternalLink, Github, Code } from 'lucide-react';

interface ProjectsProps {
  language: Language;
}

export const Projects = ({ language }: ProjectsProps) => {
  const t = translations[language];
  const projectData = projects[language];

  return (
    <section id="projects" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.projectsTitle}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectData.map((project, index) => (
            <div 
              key={index}
              className="scale-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <Card className="card-professional card-hover h-full flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                      {project.title}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                    {project.description}
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">
                        {t.technologies}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge 
                            key={techIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      {project.github && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a 
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Github className="h-4 w-4" />
                            {t.viewCode}
                          </a>
                        </Button>
                      )}
                      
                      {project.demo && (
                        <Button
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a 
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {t.viewProject}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};