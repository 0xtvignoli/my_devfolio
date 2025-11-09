"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";
import { setLocaleAction } from "@/actions/locale";

interface LocaleSwitcherProps {
  locale: Locale;
}

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const nextLocale: Locale = locale === "en" ? "it" : "en";
    startTransition(async () => {
      await setLocaleAction(nextLocale, pathname);
      router.refresh();
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
