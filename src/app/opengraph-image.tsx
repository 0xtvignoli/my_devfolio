import { ImageResponse } from 'next/og';

export const alt = 'Thomas Vignoli - Senior DevOps Engineer Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px 80px',
          background: 'linear-gradient(135deg, #121212 0%, #1E1E1E 50%, #121212 100%)',
          color: '#E3E3E3',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 32,
            fontSize: 22,
            color: '#8AB4F8',
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: 28 }}>{'</>'}</span>
          <span>DevOps Folio</span>
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, marginBottom: 24, maxWidth: 900 }}>
          Thomas Vignoli
        </div>
        <div style={{ fontSize: 32, color: '#9AA0A6', lineHeight: 1.4, maxWidth: 820 }}>
          Senior DevOps Engineer — Kubernetes, Cloud Infrastructure &amp; CI/CD
        </div>
        <div
          style={{
            marginTop: 48,
            display: 'flex',
            gap: 16,
          }}
        >
          {['Kubernetes', 'Terraform', 'AWS', 'Interactive Lab'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid #424242',
                color: '#8AB4F8',
                fontSize: 20,
                background: '#1E1E1E',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
