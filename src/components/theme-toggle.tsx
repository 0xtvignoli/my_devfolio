"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from '@/components/ui-mui'
import type { Translations } from "@/lib/types"

interface ThemeToggleProps {
  labels: Translations["theme"]
}

export function ThemeToggle({ labels }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  // aria-label announces the target theme (what a click switches to).
  const label = mounted ? (isDark ? labels.light : labels.dark) : "Toggle theme"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={mounted ? label : undefined}
    >
      {/* Sun on light, Moon on dark — driven by the active app theme (next-themes),
          not Tailwind's dark: variant (which here follows the OS, not the app). */}
      {isDark ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  )
}
