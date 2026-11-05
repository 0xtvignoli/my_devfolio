import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

const INK = '#111111';
const MUTED = '#5c5c5a';
const RULE = '#e6e6e3';
const ACCENT = '#1d4ed8';

/** Best-effort font load: offline builds fall back to Satori's default face. */
async function font(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`https://cdn.jsdelivr.net/fontsource/fonts/${family}@latest/latin-${weight}-normal.woff`);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

interface CardProps {
  kicker: string;
  title: string;
  footer: string;
}

/**
 * The social card in the site's editorial style: white ground, cobalt rule,
 * the ~/ wordmark, a serif headline. One renderer for the site card and the
 * article cards so they can't drift apart.
 */
export async function renderCard({ kicker, title, footer }: CardProps): Promise<ImageResponse> {
  const [serif, sans, mono] = await Promise.all([font('newsreader', 400), font('inter', 500), font('jetbrains-mono', 500)]);
  const fonts = [
    serif && { name: 'Newsreader', data: serif, weight: 400 as const, style: 'normal' as const },
    sans && { name: 'Inter', data: sans, weight: 500 as const, style: 'normal' as const },
    mono && { name: 'JetBrains Mono', data: mono, weight: 500 as const, style: 'normal' as const },
  ].filter((f) => !!f);
  const titleSize = title.length > 90 ? 50 : title.length > 60 ? 58 : 66;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 72px 52px',
          background: '#ffffff',
          color: INK,
          borderTop: `10px solid ${ACCENT}`,
          fontFamily: 'Inter',
        }}
      >
        <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 28 }}>
          <span style={{ color: ACCENT }}>~/</span>
          <span>thomas-vignoli</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 2, textTransform: 'uppercase', color: ACCENT, marginBottom: 20 }}>
            {kicker}
          </div>
          <div style={{ display: 'flex', fontFamily: 'Newsreader', fontSize: titleSize, lineHeight: 1.08, letterSpacing: -1, maxWidth: 1040 }}>
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${RULE}`, paddingTop: 20, fontSize: 22, color: MUTED }}>
          <span>{footer}</span>
          <span>tvignoli.com</span>
        </div>
      </div>
    ),
    { ...OG_SIZE, ...(fonts.length ? { fonts } : {}) },
  );
}
