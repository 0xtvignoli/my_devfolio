import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Playwright reaches the dev server via 127.0.0.1; allow it for dev assets.
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    dangerouslyAllowSVG: true,
    // inline so SVG/img render in the browser (attachment breaks display in <img>)
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
