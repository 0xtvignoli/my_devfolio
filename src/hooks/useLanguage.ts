import { useState, useEffect } from 'react';

export type Language = 'it' | 'en';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('it');

  useEffect(() => {
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    const detectedLang: Language = browserLang.startsWith('en') ? 'en' : 'it';
    setLanguage(detectedLang);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'it' ? 'en' : 'it');
  };

  return { language, setLanguage, toggleLanguage };
};