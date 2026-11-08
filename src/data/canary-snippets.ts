import type { CanaryChannelId } from './canaries';

/**
 * Where each decoy key sits, as published, with the key masked. The real keys
 * stay in Vercel env, the decoy VPS and canarytokens; the robots.txt path is
 * masked too, so the page doesn't send visitors to the decoys.
 */
export const CANARY_SNIPPETS: Record<CanaryChannelId, { file: string; lines: string[]; mark: number[] }> = {
  'decoy-env': {
    file: '/.env',
    lines: [
      'APP_ENV=production',
      'APP_DEBUG=false',
      'DB_HOST=127.0.0.1',
      'DB_DATABASE=wordpress',
      'DB_USERNAME=wp',
      'DB_PASSWORD=Wp-2024-prod!',
      'AWS_ACCESS_KEY_ID=AKIA••••••••••••••••',
      'AWS_SECRET_ACCESS_KEY=••••••••••••••••••••',
      'AWS_DEFAULT_REGION=eu-south-1',
    ],
    mark: [6, 7],
  },
  'html-comment': {
    file: 'view-source',
    lines: [
      '<div hidden aria-hidden="true">',
      '  <!-- deploy debug: AWS_ACCESS_KEY_ID=AKIA•••••••••••••••• AWS_SECRET_ACCESS_KEY=•••••••• -->',
      '</div>',
    ],
    mark: [1],
  },
  robots: {
    file: 'robots.txt',
    lines: ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /_next/', 'Disallow: /api/••••••••/••••••/', '', 'Sitemap: https://tvignoli.com/sitemap.xml'],
    mark: [4],
  },
  docker: {
    file: 'Dockerfile',
    lines: [
      'FROM alpine:3.20',
      'RUN apk add --no-cache aws-cli',
      'COPY credentials /root/.aws/credentials',
      'RUN aws --version && rm /root/.aws/credentials',
      'ENTRYPOINT ["aws"]',
    ],
    mark: [2],
  },
  github: {
    file: 'deploy.env',
    lines: ['[default]', 'aws_access_key_id = AKIA••••••••••••••••', 'aws_secret_access_key = ••••••••••••••••••••', 'output = json', 'region = us-east-2'],
    mark: [1, 2],
  },
};
