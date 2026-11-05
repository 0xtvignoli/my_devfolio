import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Playwright reaches the dev server via 127.0.0.1; allow it for dev assets.
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    // No dangerouslyAllowSVG: every SVG is rendered with `unoptimized`, so the
    // optimizer never serves one (GHSA-2464-fhr4-w9xw needed it enabled).
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Removed in the 11/2026 redesign; old links and indexed URLs land on the lab.
  async redirects() {
    return ['dashboard', 'live', 'shell'].map((p) => ({
      source: `/:locale(en|it)/${p}`,
      destination: '/:locale/lab',
      permanent: true,
    }));
  },
};

export default nextConfig;
