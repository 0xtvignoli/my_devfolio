import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Ensure Vercel picks up the output directory (default .next). We also alias it to 'dist'.
  distDir: 'dist',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Turbopack stable config (replaces deprecated experimental.turbo)
  turbopack: {
    resolveAlias: {
      // Map optional server-only deps to a local empty stub to avoid resolution errors in dev.
      '@opentelemetry/exporter-jaeger': './src/empty-module',
      '@genkit-ai/firebase': './src/empty-module',
    },
  },
  webpack: (config) => {
    // Ignore optional server-only modules that some deps reference but we don't use.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve?.alias || {}),
      '@opentelemetry/exporter-jaeger': false,
      '@genkit-ai/firebase': false,
    } as typeof config.resolve.alias;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
