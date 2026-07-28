'use client';

import { useState } from 'react';
import Script from 'next/script';
import { Loader2, Send } from 'lucide-react';
import { CONTACT_LIMITS } from '@/lib/contact-validation';
import { cn } from '@/lib/utils';
import type { Translations } from '@/lib/types';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Status = 'idle' | 'sending' | 'sent' | 'error';

const fieldClass = cn(
  'w-full min-h-[44px] px-3 py-2 text-sm bg-transparent text-foreground',
  'border border-border rounded-[4px] placeholder:text-muted-foreground',
  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring'
);

/**
 * Contact form. Its reason to exist is that the address stays server-side: no
 * mailto, nothing to obfuscate, nothing to scrape.
 *
 * Rendered only when the server can actually deliver (see contact-config), so it
 * never collects a message it will drop.
 */
export function ContactForm({ translations }: { translations: Translations }) {
  const t = translations.contactForm;
  const [status, setStatus] = useState<Status>('idle');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;

    const form = event.currentTarget;
    const data = new FormData(form);

    // Turnstile writes cf-turnstile-response into the form once it has solved.
    // If it hasn't, submitting only earns a 403 — say so instead, since the cause
    // is on this page (script blocked, still solving) and not in the message.
    const turnstileToken = data.get('cf-turnstile-response');
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setFieldError(t.errorChallenge);
      setStatus('error');
      return;
    }

    setStatus('sending');
    setFieldError(null);

    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          company: data.get('company'), // honeypot
          turnstileToken,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      // A 200 is not success on its own: delivery failures answer 200 with
      // ok:false, because Cloudflare eats the body of any 5xx from the origin.
      if (response.ok && payload.ok) {
        setStatus('sent');
        form.reset();
        return;
      }

      setFieldError(
        response.status === 429
          ? t.errorRateLimited
          : response.status === 403
            ? t.errorChallenge
            : payload.field
              ? t.errorField
              : t.error
      );
      setStatus('error');
    } catch {
      setFieldError(t.error);
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="border border-border rounded-[4px] p-5 text-left" role="status">
        <p className="text-sm text-foreground m-0">{t.sent}</p>
      </div>
    );
  }

  return (
    <>
      {TURNSTILE_SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      )}
      <form onSubmit={submit} className="border border-border rounded-[4px] p-5 text-left flex flex-col gap-3">
        <h3 className="font-headline text-base font-bold text-foreground m-0">{t.title}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="contact-name" className="block text-xs text-muted-foreground mb-1">
              {t.name}
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              minLength={CONTACT_LIMITS.name.min}
              maxLength={CONTACT_LIMITS.name.max}
              autoComplete="name"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-xs text-muted-foreground mb-1">
              {t.email}
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              maxLength={CONTACT_LIMITS.email.max}
              autoComplete="email"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-xs text-muted-foreground mb-1">
            {t.message}
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            minLength={CONTACT_LIMITS.message.min}
            maxLength={CONTACT_LIMITS.message.max}
            className={cn(fieldClass, 'resize-y')}
          />
        </div>

        {/* Honeypot: off-screen rather than display:none, which some bots detect.
            aria-hidden + tabIndex keep it away from assistive tech and keyboards. */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="contact-company">Company</label>
          <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {TURNSTILE_SITE_KEY && <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} />}

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            disabled={status === 'sending'}
            className={cn(
              'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-[4px]',
              'bg-primary text-primary-foreground text-sm font-medium',
              'transition-colors hover:bg-foreground/85 disabled:opacity-50',
              'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-2'
            )}
          >
            {status === 'sending' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            {status === 'sending' ? t.sending : t.submit}
          </button>
          <p className="text-xs text-muted-foreground m-0">{t.privacy}</p>
        </div>

        <div aria-live="polite">
          {fieldError && <p className="text-sm text-destructive m-0">{fieldError}</p>}
        </div>
      </form>
    </>
  );
}
