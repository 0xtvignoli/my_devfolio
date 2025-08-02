import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations } from '@/data/translations';
import { Language } from '@/hooks/useLanguage';
import { 
  Cloud, 
  Server, 
  Container, 
  GitBranch, 
  Shield, 
  Zap,
  Database,
  Settings
} from 'lucide-react';

interface AboutProps {
  language: Language;
}

export const About = ({ language }: AboutProps) => {
  const t = translations[language];

  const skills = [
    { name: t.terraform, icon: <Settings className="h-5 w-5" />, color: 'bg-purple-100 text-purple-800' },
    { name: t.aws, icon: <Cloud className="h-5 w-5" />, color: 'bg-orange-100 text-orange-800' },
    { name: t.azure, icon: <Cloud className="h-5 w-5" />, color: 'bg-blue-100 text-blue-800' },
    { name: t.kubernetes, icon: <Container className="h-5 w-5" />, color: 'bg-blue-100 text-blue-800' },
    { name: t.openshift, icon: <Container className="h-5 w-5" />, color: 'bg-red-100 text-red-800' },
    { name: t.jenkins, icon: <GitBranch className="h-5 w-5" />, color: 'bg-green-100 text-green-800' },
    { name: t.docker, icon: <Container className="h-5 w-5" />, color: 'bg-blue-100 text-blue-800' },
    { name: t.ansible, icon: <Server className="h-5 w-5" />, color: 'bg-red-100 text-red-800' },
  ];

  return (
    <section id="about" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.aboutTitle}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="slide-up">
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {t.aboutDescription}
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-foreground font-medium">
                  {language === 'it' ? 'Sicurezza e Compliance' : 'Security & Compliance'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-accent" />
                <span className="text-foreground font-medium">
                  {language === 'it' ? 'Automazione Avanzata' : 'Advanced Automation'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-primary" />
                <span className="text-foreground font-medium">
                  {language === 'it' ? 'Architetture Scalabili' : 'Scalable Architectures'}
                </span>
              </div>
            </div>
          </div>

          <div className="slide-up">
            <Card className="card-professional">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  {t.skills}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {skills.map((skill, index) => (
                    <div 
                      key={skill.name}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors card-hover"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`p-2 rounded-md ${skill.color}`}>
                        {skill.icon}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};