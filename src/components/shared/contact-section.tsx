'use client';

import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Locale, Translations } from '@/lib/types';

interface ContactSectionProps {
  email: string;
  translations: Translations;
  locale: Locale;
}

export function ContactSection({ email, translations, locale }: ContactSectionProps) {
  const { toast } = useToast();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detect touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    toast({
      title: translations.contact.openingEmailClient,
      description: translations.contact.emailClientOpened,
      duration: 3000,
    });
    
    // Annuncio per screen reader
    const announcement = document.getElementById('contact-announcement');
    if (announcement) {
      announcement.textContent = translations.contact.openingEmailClient;
      setTimeout(() => {
        announcement.textContent = '';
      }, 3000);
    }
  };

  const emailLabel = translations.contact.emailLabel.replace('{email}', email);

  return (
    <section id="contact" className="py-20 text-center bg-card rounded-2xl" aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="font-headline text-3xl font-bold mb-4">
        {translations.contact.title}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
        {translations.contact.description}
      </p>
      <div className="relative group">
        <a
          href={`mailto:${email}`}
          onClick={handleEmailClick}
          aria-label={emailLabel}
          className={cn(
            "relative inline-block p-px font-semibold leading-6 text-foreground bg-card shadow-2xl cursor-pointer rounded-xl shadow-zinc-900/10",
            "transition-all duration-300 ease-in-out",
            "focus-visible:outline-2 focus-visible:outline-primary focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
            // Ottimizzazioni per mobile e reduced motion
            !isTouchDevice && !prefersReducedMotion && "hover:scale-105 active:scale-95",
            isTouchDevice && "active:scale-95",
            prefersReducedMotion && "transition-none"
          )}
        >
          <span
            className={cn(
              "absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-blue-500 to-purple-500 p-[2px]",
              "transition-opacity duration-500",
              !isTouchDevice && !prefersReducedMotion && "opacity-0 group-hover:opacity-100",
              prefersReducedMotion && "opacity-0"
            )}
            aria-hidden="true"
          />
      
          <span className="relative z-10 block px-6 py-3 rounded-xl bg-background/95 dark:bg-background/98">
            <div className="relative z-10 flex items-center space-x-2">
              <Mail className="h-5 w-5 text-primary drop-shadow-sm" aria-hidden="true" />
              <span 
                className={cn(
                  "transition-all duration-500 font-semibold text-foreground drop-shadow-sm",
                  !isTouchDevice && !prefersReducedMotion && "group-hover:translate-x-1",
                  prefersReducedMotion && "transition-none"
                )}
              >
                {translations.contact.buttonText}
              </span>
              <svg
                className={cn(
                  "w-6 h-6 transition-transform duration-500",
                  !isTouchDevice && !prefersReducedMotion && "group-hover:translate-x-1",
                  prefersReducedMotion && "transition-none"
                )}
                data-slot="icon"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  fillRule="evenodd"
                />
              </svg>
            </div>
          </span>
        </a>
      </div>
      
      {/* Aria-live region per screen readers */}
      <div 
        id="contact-announcement"
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      />
    </section>
  );
}

