"use client";

import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { Locale, Translations } from '@/lib/types';
import { translations } from '@/data/locales';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

export const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedLocale = localStorage.getItem('locale') as Locale;
    const browserLang = navigator.language.split('-')[0] as Locale;
    
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'it')) {
      setLocaleState(savedLocale);
    } else if (browserLang === 'it') {
      setLocaleState('it');
    } else {
      setLocaleState('en');
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = useMemo(() => translations[locale], [locale]);
  
  const value = useMemo(() => ({
    locale,
    setLocale,
    t
  }), [locale, t]);

  if (!isMounted) {
    return null; 
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}
