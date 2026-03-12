'use client';

import { Button } from '@/components/ui-mui';
import { ArrowRight } from 'lucide-react';

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
      endIcon={<ArrowRight style={{ width: 16, height: 16 }} />}
    >
      <span>{children}</span>
    </Button>
  );
}
