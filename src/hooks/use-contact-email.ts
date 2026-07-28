'use client';

import { useEffect, useState } from 'react';

// Module-level cache: the address never changes, and two islands on the same page
// (copy button, assistant fallback) shouldn't fetch it twice.
let cached: string | null = null;

/**
 * Reads the contact address from /api/contact instead of taking it as a prop, so
 * it stays out of the page's RSC payload. Returns null until it arrives —
 * callers render a disabled or hidden affordance in the meantime.
 */
export function useContactEmail(): string | null {
  const [email, setEmail] = useState<string | null>(cached);

  useEffect(() => {
    if (cached) return;
    let active = true;
    fetch('/api/contact')
      .then((response) => response.json())
      .then((data) => {
        if (typeof data.email !== 'string') return;
        cached = data.email;
        if (active) setEmail(data.email);
      })
      .catch(() => {
        // Offline or blocked: callers fall back to the mailto link, which is
        // server-rendered and does not depend on this.
      });
    return () => {
      active = false;
    };
  }, []);

  return email;
}
