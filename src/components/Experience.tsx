import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations } from '@/data/translations';
import { experiences } from '@/data/portfolio';
import { Language } from '@/hooks/useLanguage';
import { Briefcase, Calendar } from 'lucide-react';

interface ExperienceProps {
  language: Language;
}

export const Experience = ({ language }: ExperienceProps) => {
  const t = translations[language];
  const experienceData = experiences[language];

  return (
    <section id="experience" className="section-padding bg-gradient-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.experienceTitle}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto"></div>
        </div>

        <div className="space-y-8">
          {experienceData.map((exp, index) => (
            <div 
              key={index}
              className="slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <Card className="card-professional card-hover">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center gap-3 mb-2 md:mb-0">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {exp.role}
                        </h3>
                        <p className="text-primary font-medium">
                          {exp.company}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">{exp.period}</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {exp.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};