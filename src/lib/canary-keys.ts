/**
 * Decoy AWS keys (canarytokens.org) for the channels that live on this site.
 * They come from Vercel env at build time and are never in the repo. Anything
 * not shaped like an AWS key pair is ignored, so a bad env value can never
 * inject markup into the page.
 */
export type CanaryChannel = 'HTML' | 'ROBOTS';

const ACCESS = /^AKIA[A-Z0-9]{16}$/;
const SECRET = /^[A-Za-z0-9/+]{40}$/;

export function canaryPair(channel: CanaryChannel): { access: string; secret: string } | null {
  const access = process.env[`CANARY_${channel}_ACCESS_KEY`]?.trim() ?? '';
  const secret = process.env[`CANARY_${channel}_SECRET_KEY`]?.trim() ?? '';
  return ACCESS.test(access) && SECRET.test(secret) ? { access, secret } : null;
}
