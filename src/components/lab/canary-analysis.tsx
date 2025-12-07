"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import type { CanaryMetrics } from "@/lib/types"

interface CanaryAnalysisProps {
    metrics: CanaryMetrics
}

const MetricRow = ({ name, baseline, canary }: { name: string, baseline: number, canary: number }) => {
    const diff = canary - baseline
    const isImproved = (name === "CPU Usage (%)") ? diff < 0 : diff <= 0
    const isWorse = (name === "CPU Usage (%)") ? diff > 0 : diff > 0
    const Icon = isImproved ? ArrowDown : isWorse ? ArrowUp : Minus
    const color = isImproved ? "text-green-500" : isWorse ? "text-red-500" : "text-muted-foreground dark:text-muted-foreground"
    const trend = isImproved ? "improved" : isWorse ? "worse" : "unchanged";
    const ariaLabel = `${name}, Baseline: ${baseline.toFixed(2)}, Canary: ${canary.toFixed(2)}, Difference: ${diff.toFixed(2)}, Trend: ${trend}`;

    return (
        <TableRow aria-label={ariaLabel}>
            <TableCell className="font-medium">{name}</TableCell>
            <TableCell>{baseline.toFixed(2)}</TableCell>
            <TableCell>{canary.toFixed(2)}</TableCell>
            <TableCell className={`flex items-center gap-1 font-mono ${color}`}>
                <Icon className="h-3 w-3" aria-hidden="true" />
                <span>{diff.toFixed(2)}</span>
            </TableCell>
        </TableRow>
    )
}

export function CanaryAnalysis({ metrics }: CanaryAnalysisProps) {
    return (
        <Card className="w-full max-w-2xl bg-background/50">
            <CardHeader>
                <CardTitle>Canary Analysis</CardTitle>
                <CardDescription>
                    Comparing performance metrics between the stable version (Baseline) and the new version (Canary).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table aria-label="Canary deployment metrics comparison">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Metric</TableHead>
                                <TableHead>Baseline</TableHead>
                                <TableHead>Canary</TableHead>
                                <TableHead>Difference</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <MetricRow name="Latency (ms)" baseline={metrics.baseline.latency} canary={metrics.canary.latency} />
                            <MetricRow name="Error Rate (%)" baseline={metrics.baseline.errorRate} canary={metrics.canary.errorRate} />
                            <MetricRow name="CPU Usage (%)" baseline={metrics.baseline.cpu} canary={metrics.canary.cpu} />
                        </TableBody>
                    </Table>
                </div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-3">
                    Lower is better for all metrics. Based on this data, decide whether to promote the canary or roll back.
                </p>
            </CardContent>
        </Card>
    )
}
