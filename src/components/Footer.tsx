import { translations } from '@/data/translations';
import { Language } from '@/hooks/useLanguage';
import { Mail, Linkedin, Github, Heart } from 'lucide-react';

interface FooterProps {
  language: Language;
}

export const Footer = ({ language }: FooterProps) => {
  const t = translations[language];

  const socialLinks = [
    {
      icon: <Mail className="h-5 w-5" />,
      href: 'mailto:marco.rossi@email.com',
      label: 'Email'
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      href: 'https://linkedin.com/in/marco-rossi-devops',
      label: 'LinkedIn'
    },
    {
      icon: <Github className="h-5 w-5" />,
      href: 'https://github.com/marcorossi',
      label: 'GitHub'
    }
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold text-primary mb-2">TV</div>
            <p className="text-muted-foreground text-sm">
              {t.footerText}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-secondary rounded-lg"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            {language === 'it' ? 'Realizzato con' : 'Made with'} 
            <Heart className="h-4 w-4 text-red-500" /> 
            {language === 'it' ? 'e tecnologie moderne' : 'and modern technologies'}
          </p>
        </div>
      </div>
    </footer>
  );
};