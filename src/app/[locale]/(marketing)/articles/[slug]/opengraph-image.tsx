import { ImageResponse } from 'next/og';
import { getArticle } from '@/data/content/articles';
import { resolveLocaleParam } from '@/lib/i18n/server';

export const alt = 'Article — Thomas Vignoli';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Best-effort load of JetBrains Mono so the card is monospaced too.
// If the fetch fails (offline build), fall back to the default face.
async function loadMono(weight: 400 | 700): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      `https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-${weight}-normal.woff`
    );
    if (res.ok) return await res.arrayBuffer();
  } catch {
    /* offline — fall back to default font */
  }
  return null;
}

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocaleParam(localeParam);
  const article = getArticle(slug, locale);

  const [regular, bold] = await Promise.all([loadMono(400), loadMono(700)]);
  const fonts = [
    regular && { name: 'JetBrains Mono', data: regular, style: 'normal' as const, weight: 400 as const },
    bold && { name: 'JetBrains Mono', data: bold, style: 'normal' as const, weight: 700 as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; style: 'normal'; weight: 400 | 700 }[];
  const mono = fonts.length ? 'JetBrains Mono' : 'monospace';

  const title = article?.title ?? 'Article';
  const sectionLabel = locale === 'it' ? 'Articolo' : 'Article';
  const byLabel = locale === 'it' ? 'di' : 'by';
  const dateStr = article
    ? new Date(article.date).toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  const titleSize = title.length > 72 ? 40 : title.length > 46 ? 48 : 58;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#fdfcfc',
          color: '#201d1d',
          fontFamily: mono,
          padding: 56,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 700 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              border: '2px solid #201d1d',
              borderRadius: 6,
              fontSize: 26,
            }}
          >
            ~$
          </div>
          <span>devops-folio</span>
          <span style={{ marginLeft: 'auto', fontSize: 22, fontWeight: 400, color: '#9a9898' }}>
            {`// ${sectionLabel.toLowerCase()}`}
          </span>
        </div>

        <div
          style={{
            marginTop: 36,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#201d1d',
            color: '#fdfcfc',
            border: '1px solid #3a3636',
            borderRadius: 6,
            padding: 48,
          }}
        >
          <div style={{ display: 'flex', color: '#9a9898', fontSize: 24, marginBottom: 22 }}>
            [+] {sectionLabel}
          </div>
          <div style={{ display: 'flex', fontSize: titleSize, fontWeight: 700, lineHeight: 1.15, marginBottom: 28 }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 24 }}>
            <span style={{ color: '#30d158' }}>$</span>
            <span style={{ color: '#fdfcfc' }}>{byLabel} Thomas Vignoli</span>
            {dateStr ? <span style={{ color: '#9a9898' }}>· {dateStr}</span> : null}
          </div>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) }
  );
}
