"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from '@/components/ui-mui';
import type { Locale } from "@/lib/types";
import { switchLocaleInPath } from "@/lib/i18n/paths";

interface LocaleSwitcherProps {
  locale: Locale;
}

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const nextLocale: Locale = locale === "en" ? "it" : "en";
    const nextPath = switchLocaleInPath(pathname, nextLocale);
    startTransition(() => {
      router.push(nextPath);
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      aria-label="Switch language"
      disabled={isPending}
    >
      {isPending ? "..." : locale.toUpperCase()}
    </Button>
  );
}
