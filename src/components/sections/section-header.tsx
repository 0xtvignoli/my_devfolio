"use client"

import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  title: string
  subtitle?: string
  eyebrow?: string
  align?: "left" | "center"
  className?: string
}

export function SectionHeader({ title, subtitle, eyebrow, align = "center", className }: SectionHeaderProps) {
  const isCenter = align === "center"
  return (
    <div className={cn(isCenter ? "text-center" : "text-left", "space-y-3", className)}>
      {eyebrow ? (
        <div className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground",
          isCenter && "mx-auto"
        )}>
          {eyebrow}
        </div>
      ) : null}
      <h2 className={cn("font-headline text-3xl font-bold tracking-tight md:text-4xl")}>{title}</h2>
      {subtitle ? (
        <p className={cn("mx-auto max-w-2xl text-muted-foreground", isCenter ? "" : "")}>{subtitle}</p>
      ) : null}
    </div>
  )
}

export default SectionHeader
