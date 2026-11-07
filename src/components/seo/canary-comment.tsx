import { canaryPair } from '@/lib/canary-keys';

/**
 * Lab phase 3, channel "HTML comment": a decoy key left in the page source the
 * way a careless deploy would. Rendered only when the env pair is set and well
 * formed (see canaryPair); the hidden div is never shown or read aloud.
 */
export function CanaryComment() {
  const key = canaryPair('HTML');
  if (!key) return null;
  return (
    <div
      hidden
      aria-hidden
      dangerouslySetInnerHTML={{ __html: `<!-- deploy debug: AWS_ACCESS_KEY_ID=${key.access} AWS_SECRET_ACCESS_KEY=${key.secret} -->` }}
    />
  );
}
