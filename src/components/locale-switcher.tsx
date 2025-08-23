"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'it' : 'en');
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLocale} aria-label="Switch language">
      {locale.toUpperCase()}
    </Button>
  );
}
