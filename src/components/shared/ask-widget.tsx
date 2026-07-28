'use client';

import { useState } from 'react';
import { CornerDownLeft, Loader2 } from 'lucide-react';
import { useContactEmail } from '@/hooks/use-contact-email';
import { cn } from '@/lib/utils';
import type { Translations } from '@/lib/types';

/** Mirrors MAX_QUESTION_LEN in src/app/api/ask/route.ts — reject before the round trip. */
const MAX_LEN = 500;

/**
 * Terminal-styled question box over the same /api/ask endpoint the lab terminal
 * uses. The assistant answers only from the real projects/experience data, so
 * this is the fastest honest answer to "has he done X?".
 */
export function AskWidget({ translations }: { translations: Translations }) {
  const t = translations.ask;
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [pending, setPending] = useState(false);
  const email = useContactEmail();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || pending) return;

    setPending(true);
    setAnswer(null);
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await response.json();
      // `degraded` means the model call failed: show localized copy and point at
      // email, rather than the route's English fallback line.
      if (data.degraded || typeof data.answer !== 'string') {
        setAnswer(t.error);
        setDegraded(true);
      } else {
        setAnswer(data.answer);
        setDegraded(false);
      }
    } catch {
      setAnswer(t.error);
      setDegraded(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="border border-border p-5 text-left">
      <h3 className="font-headline text-base font-bold text-foreground m-0">
        <span aria-hidden className="text-muted-foreground mr-2">{'>_'}</span>
        {t.title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{t.description}</p>

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="ask-input" className="sr-only">
          {t.title}
        </label>
        <input
          id="ask-input"
          type="text"
          value={question}
          maxLength={MAX_LEN}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={t.placeholder}
          disabled={pending}
          className={cn(
            'flex-1 min-h-[44px] px-3 py-2 text-sm bg-transparent text-foreground',
            'border border-border rounded-[4px] placeholder:text-muted-foreground',
            'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring'
          )}
        />
        <button
          type="submit"
          disabled={pending || question.trim() === ''}
          className={cn(
            'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-[4px]',
            'bg-primary text-primary-foreground text-sm font-medium',
            'transition-colors hover:bg-foreground/85 disabled:opacity-50',
            'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-2'
          )}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <CornerDownLeft className="h-4 w-4" aria-hidden />
          )}
          {pending ? t.thinking : t.submit}
        </button>
      </form>

      <div aria-live="polite" className="mt-4">
        {answer && (
          <pre className="whitespace-pre-wrap break-words text-sm text-foreground bg-muted/40 border border-border rounded-[4px] p-3 m-0">
            {answer}
          </pre>
        )}
        {/* The address is fetched, not received as a prop — see use-contact-email. */}
        {degraded && email && (
          <p className="text-sm text-muted-foreground mt-2 mb-0">
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(translations.contact.subject)}`}
              className="text-foreground underline underline-offset-4 hover:opacity-70"
            >
              {t.fallbackCta}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
