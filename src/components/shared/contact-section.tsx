'use client';

import { useToast } from '@/hooks/use-toast';
import { Check, Copy, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AskWidget } from '@/components/shared/ask-widget';
import type { Translations } from '@/lib/types';

interface ContactSectionProps {
  email: string;
  translations: Translations;
  /** False on a deploy without a model key — the widget stays hidden rather than
      telling visitors to go set an env var. */
  assistantEnabled?: boolean;
}

export function ContactSection({ email, translations, assistantEnabled = false }: ContactSectionProps) {
  const { toast } = useToast();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleEmailClick = () => {
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

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast({ title: translations.contact.emailCopied, duration: 3000 });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard denied (insecure context, permissions): show the address so
      // it can still be selected by hand.
      toast({ title: email, duration: 6000 });
    }
  };

  const emailLabel = translations.contact.emailLabel.replace('{email}', email);

  return (
    <section
      id="contact"
      className="py-16 px-6 text-center border border-border"
      aria-labelledby="contact-heading"
    >
      <h2 id="contact-heading" className="font-headline text-2xl font-bold mb-4 text-foreground">
        <span aria-hidden className="text-muted-foreground mr-2">$</span>
        {translations.contact.title}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
        {translations.contact.description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={`mailto:${email}`}
          onClick={handleEmailClick}
          aria-label={emailLabel}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2 font-medium leading-8 rounded-[4px]",
            "bg-primary text-primary-foreground",
            "transition-colors duration-150 hover:bg-foreground/85",
            "focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-2",
            !prefersReducedMotion && "active:opacity-90"
          )}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          <span>{translations.contact.buttonText}</span>
          <span aria-hidden className="font-bold">→</span>
        </a>
        {/* mailto: is a dead end on a phone with no mail client configured. */}
        <button
          type="button"
          onClick={handleCopyEmail}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2 font-medium leading-8 rounded-[4px]",
            "border border-border text-foreground",
            "transition-colors duration-150 hover:bg-muted/50",
            "focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-2"
          )}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          <span>{copied ? translations.contact.emailCopied : translations.contact.copyEmail}</span>
        </button>
      </div>

      {assistantEnabled && (
        <div className="mt-10 max-w-2xl mx-auto">
          <AskWidget translations={translations} />
        </div>
      )}

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

