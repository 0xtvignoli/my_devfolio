import Link from 'next/link';
import { PasswordCheck } from '@/components/observatory/password-check';
import { BarList } from '@/components/observatory/bar-list';
import { readDecoys } from '@/lib/decoys-data';
import { PASSWORD_KINDS } from '@/lib/decoys';
import { formatDate } from '@/lib/format-date';
import { getTranslations, resolveLocaleParam } from '@/lib/i18n/server';
import { localizedPath } from '@/lib/i18n/paths';
import { createPageMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale);
  return createPageMetadata({ title: t.passwords.title, description: t.passwords.intro, path: '/lab/passwords', locale });
}

export default async function PasswordsPage({ params }: Props) {
  const locale: Locale = resolveLocaleParam((await params).locale);
  const t = getTranslations(locale);
  const decoys = readDecoys();
  const hashes = decoys?.ssh.passwordHashes ?? [];
  const kinds = decoys?.ssh.passwordKinds ?? {};
  const kindItems = PASSWORD_KINDS.map((k) => ({ label: t.passwords.kinds[k], count: kinds[k] ?? 0 }))
    .filter((k) => k.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <p className="mb-6 text-sm font-medium uppercase tracking-[0.08em] text-link">{t.passwords.kicker}</p>
      <h1 className="max-w-[820px] font-serif text-[clamp(36px,5.5vw,64px)] font-normal leading-[1.05] tracking-[-0.025em]">
        {t.passwords.title}
      </h1>
      <p className="mt-6 max-w-[640px] text-[19px] text-muted-foreground">{t.passwords.intro}</p>

      <div className="mt-12 grid gap-x-16 gap-y-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section aria-labelledby="check-heading">
          <h2 id="check-heading" className="border-t border-foreground pt-5 font-serif text-[30px] font-medium">
            {t.passwords.checkTitle}
          </h2>
          <p className="mb-5 mt-2 text-[15px] text-muted-foreground">{t.passwords.privacyLine}</p>
          {hashes.length > 0 ? (
            <>
              <PasswordCheck hashes={hashes} locale={locale} t={t.passwords} />
              {decoys && (
                <p className="mt-4 font-mono text-[13px] text-muted-foreground">
                  {formatDate(decoys.from, locale)} — {formatDate(decoys.to, locale)} ·{' '}
                  {t.passwords.listSize.replace('{n}', String(hashes.length))}
                </p>
              )}
            </>
          ) : (
            <p className="bg-muted px-5 py-4 text-muted-foreground">{t.passwords.noData}</p>
          )}
        </section>

        <div className="space-y-14">
          {kindItems.length > 0 && (
            <section aria-labelledby="kinds-heading">
              <h2 id="kinds-heading" className="mb-4 border-t border-foreground pt-5 font-serif text-2xl font-medium">
                {t.passwords.kindsTitle}
              </h2>
              <BarList items={kindItems} locale={locale} />
            </section>
          )}
          <section aria-labelledby="how-heading">
            <h2 id="how-heading" className="mb-4 border-t border-foreground pt-5 font-serif text-2xl font-medium">
              {t.passwords.howTitle}
            </h2>
            <ol className="list-decimal space-y-2.5 pl-5 text-muted-foreground">
              {t.passwords.how.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <p className="mt-16">
        <Link className="text-link underline-offset-4 hover:underline" href={localizedPath(locale, '/lab')}>
          {t.passwords.back}
        </Link>
      </p>
    </div>
  );
}
