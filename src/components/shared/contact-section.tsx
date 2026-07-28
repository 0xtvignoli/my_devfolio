import Link from 'next/link';
import { Mail } from 'lucide-react';
import { AskWidget } from '@/components/shared/ask-widget';
import { CopyEmailButton } from '@/components/shared/copy-email-button';
import { localizedPath } from '@/lib/i18n/paths';
import { CONTACT_EMAIL, SOCIAL_LINKS } from '@/lib/seo/constants';
import type { Locale, Translations } from '@/lib/types';

interface ContactSectionProps {
  translations: Translations;
  locale: Locale;
  /** False on a deploy without a model key — the widget stays hidden rather than
      telling visitors to go set an env var. */
  assistantEnabled?: boolean;
}

/**
 * Server component on purpose. The mail link is rendered here so the address
 * exists in exactly one place — an href in the HTML — which is the one place
 * Cloudflare's email obfuscation rewrites. Everything interactive is a small
 * client island that never receives the address as a prop.
 *
 * Dropped along the way: a toast and an aria-live announcement fired on clicking
 * the mail link (the mail client opening is its own feedback), and a
 * prefers-reduced-motion effect duplicating a rule globals.css already has. That
 * was the whole reason this file needed to be a client component.
 */
export function ContactSection({ translations, locale, assistantEnabled = false }: ContactSectionProps) {
  const t = translations.contact;
  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.subject)}`;

  return (
    <section id="contact" className="py-16 px-6 text-center border border-border" aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="font-headline text-2xl font-bold mb-4 text-foreground">
        <span aria-hidden className="text-muted-foreground mr-2">$</span>
        {t.title}
      </h2>
      <p className="text-muted-foreground mb-3 max-w-2xl mx-auto leading-relaxed">{t.description}</p>
      <p className="text-sm text-muted-foreground mb-8">{t.responseTime}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={mailHref}
          aria-label={t.emailLabel}
          className="inline-flex items-center gap-2 px-5 py-2 font-medium leading-8 rounded-[4px] bg-primary text-primary-foreground transition-colors duration-150 hover:bg-foreground/85 focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          <span>{t.buttonText}</span>
          <span aria-hidden className="font-bold">→</span>
        </a>
        <CopyEmailButton label={t.copyEmail} copiedLabel={t.emailCopied} />
      </div>

      {/* Secondary channels: someone deciding whether to write wants the CV first,
          and plenty of technical recruiters would rather message on LinkedIn. */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
        <Link href={localizedPath(locale, '/cv')} className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
          {t.cvLink}
        </Link>
        <a
          href={SOCIAL_LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          LinkedIn
        </a>
      </div>

      {assistantEnabled && (
        <div className="mt-10 max-w-2xl mx-auto">
          <AskWidget translations={translations} />
        </div>
      )}
    </section>
  );
}
