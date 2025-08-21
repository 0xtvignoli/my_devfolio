"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type Stat = { label: string; value: string; diff?: string }

export function StatsCards({ items, className }: { items: Stat[]; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((s) => (
        <Card key={s.label} className="bg-muted/30">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-2 text-2xl font-bold tracking-tight">{s.value}</div>
            {s.diff ? (
              <div className="mt-1 text-xs text-muted-foreground">{s.diff}</div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StatsCards
