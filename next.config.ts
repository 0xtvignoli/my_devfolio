import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
