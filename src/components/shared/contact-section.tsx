import { ContactForm } from '@/components/shared/contact-form';
import { CONTACT_EMAIL } from '@/lib/seo/constants';
import type { Translations } from '@/lib/types';

interface ContactSectionProps {
  translations: Translations;
  /** False without a mail provider key: a form that drops messages is worse than
      no form, because the visitor believes they reached you. */
  formEnabled?: boolean;
}

/**
 * Server component on purpose: the address exists in exactly one place, an
 * href in the HTML, which is the one place Cloudflare's email obfuscation
 * rewrites. The form is a client island that never receives the address.
 */
export function ContactSection({ translations, formEnabled = false }: ContactSectionProps) {
  const t = translations.contact;
  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.subject)}`;

  return (
    <section id="contact" aria-labelledby="contact-heading" className="border-t border-border">
      <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-8 sm:py-[72px]">
        <div>
          <h2 id="contact-heading" className="font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
            {translations.home.contactTitle}
          </h2>
          <a href={mailHref} aria-label={t.emailLabel} className="mt-6 inline-block border-b border-foreground py-2.5 text-lg font-medium">
            {translations.home.contactCta}
          </a>
          <p className="mt-3 text-[15px] text-muted-foreground">{t.responseTime}</p>
          {formEnabled && (
            <div className="mt-10 max-w-[560px]">
              <ContactForm translations={translations} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
