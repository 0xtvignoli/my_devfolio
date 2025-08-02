import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { translations } from '@/data/translations';
import { Language } from '@/hooks/useLanguage';
import { Mail, Linkedin, Github, ExternalLink } from 'lucide-react';

interface ContactProps {
  language: Language;
}

export const Contact = ({ language }: ContactProps) => {
  const t = translations[language];

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      label: 'Email',
      href: 'mailto:thomas.vignoli@pm.me',
      color: 'bg-red-100 text-red-800'
    },
    {
      icon: <Linkedin className="h-6 w-6" />,
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/thomas-vignoli',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      icon: <Github className="h-6 w-6" />,
      label: 'GitHub',
      href: 'https://github.com/0xtvignoli',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  return (
    <section id="contact" className="section-padding bg-gradient-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.contactTitle}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.contactDescription}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <div 
                key={method.label}
                className="scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="card-professional card-hover text-center">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-full ${method.color} mb-4`}>
                      {method.icon}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {method.label}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 text-sm">
                      {method.value}
                    </p>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a 
                        href={method.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t.getInTouch}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 fade-in">
            <Button 
              className="btn-hero"
              asChild
            >
              <a href="mailto:thomas.vignoli@pm.me">
                <Mail className="h-5 w-5 mr-2" />
                {t.getInTouch}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};