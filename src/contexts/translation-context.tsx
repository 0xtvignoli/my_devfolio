"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Locale = 'en' | 'it';

export interface Translations {
  [key: string]: string | Translations;
}

interface TranslationContextType {
  locale: Locale;
  translations: Translations;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
  translations?: Record<Locale, Translations>;
}

export const TranslationProvider = ({ 
  children, 
  defaultLocale = 'en',
  translations: providedTranslations
}: TranslationProviderProps) => {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [translations] = useState<Record<Locale, Translations>>(
    providedTranslations || { en: {}, it: {} }
  );

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: string | Translations | undefined = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  }, [locale, translations]);

  const value: TranslationContextType = {
    locale,
    translations: translations[locale] || {},
    setLocale,
    t
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
};

