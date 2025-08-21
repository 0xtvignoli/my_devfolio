
"use client"

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Metric } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

type MetricsCardProps = {
  title: string;
  data: Metric[];
  dataKey: string;
  unit: string;
  className?: string;
}

const chartColors = {
  "CPU Utilization": "hsl(var(--chart-2))",
  "Memory Usage": "hsl(var(--chart-5))",
  "Network Traffic": "hsl(var(--chart-3))",
}

export function MetricsCard({ title, data, dataKey, unit, className }: MetricsCardProps) {
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: chartColors[title as keyof typeof chartColors] || "hsl(var(--chart-1))",
    },
  };
  
  const { yAxisDomain, lastValue } = useMemo(() => {
    if (!data || data.length === 0) {
      return { yAxisDomain: [0, 100], lastValue: 0 };
    }

    const values = data.map(item => item[dataKey] as number);
    const maxValue = Math.max(...values, 0);
    const roundedMax = Math.ceil(maxValue / 10) * 10; 
    const yMax = Math.max(roundedMax, 10); 

    return {
      yAxisDomain: [0, yMax],
      lastValue: values[values.length - 1]
    };
  }, [data, dataKey]);


  return (
    <Card className={cn("relative overflow-hidden", className)}>
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight">{lastValue?.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-32 w-full">
          <AreaChart
            data={data}
            margin={{
              left: -15,
              right: 10,
              top: 5,
              bottom: 0,
            }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              tickFormatter={(value, index) => {
                 if (index === 0 || index === data.length - 1) {
                    return value;
                 }
                 return "";
              }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} unit={unit} domain={yAxisDomain} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" hideLabel />}
            />
            <defs>
              <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig[dataKey].color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig[dataKey].color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey={dataKey}
              type="natural"
              fill={`url(#fill-${dataKey})`}
              stroke={chartConfig[dataKey].color}
              stackId="a"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
