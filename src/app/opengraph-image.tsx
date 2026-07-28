import { ImageResponse } from 'next/og';

export const alt = 'Thomas Vignoli - Senior DevOps Engineer Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Best-effort load of JetBrains Mono so the OG card is monospaced too.
// If the fetch fails (offline build), we fall back to the default face —
// the cream/ink palette + terminal layout still carry the brand.
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

export default async function OpenGraphImage() {
  const [regular, bold] = await Promise.all([loadMono(400), loadMono(700)]);
  const fonts = [
    regular && { name: 'JetBrains Mono', data: regular, style: 'normal' as const, weight: 400 as const },
    bold && { name: 'JetBrains Mono', data: bold, style: 'normal' as const, weight: 700 as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; style: 'normal'; weight: 400 | 700 }[];
  const mono = fonts.length ? 'JetBrains Mono' : 'monospace';

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
        {/* Wordmark */}
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
        </div>

        {/* Dark TUI mockup — the single "visual moment" */}
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
          <div style={{ display: 'flex', color: '#9a9898', fontSize: 24, marginBottom: 20 }}>
            [+] Senior DevOps Engineer
          </div>
          <div style={{ display: 'flex', fontSize: 60, fontWeight: 700, marginBottom: 16 }}>
            Thomas Vignoli
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#9a9898', marginBottom: 36 }}>
            Kubernetes · Cloud Infrastructure · CI/CD · SRE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24 }}>
            <span style={{ color: '#30d158' }}>$</span>
            <span style={{ color: '#fdfcfc' }}>kubectl get pods</span>
            <span style={{ color: '#4da3ff' }}>-n production</span>
          </div>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) }
  );
}
