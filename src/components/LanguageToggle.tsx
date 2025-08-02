import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/hooks/useLanguage';

interface LanguageToggleProps {
  language: Language;
  onToggle: () => void;
}

export const LanguageToggle = ({ language, onToggle }: LanguageToggleProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language.toUpperCase()}</span>
    </Button>
  );
};