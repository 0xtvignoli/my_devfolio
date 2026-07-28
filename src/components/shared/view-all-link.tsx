'use client';

import { Button } from '@/components/ui-mui';

interface ViewAllLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ViewAllLink({ href, children }: ViewAllLinkProps) {
  return (
    <Button
      variant="ghost"
      asChild
      href={href}
      endIcon={<span aria-hidden style={{ fontWeight: 700 }}>→</span>}
    >
      <span>{children}</span>
    </Button>
  );
}
