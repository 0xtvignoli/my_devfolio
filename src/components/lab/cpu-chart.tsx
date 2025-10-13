'use client';

import { Line, LineChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { TimeSeriesData } from '@/lib/types';

const chartConfig = {
  usage: {
    label: "CPU Usage (%)",
    color: "hsl(var(--primary))",
  },
};

interface CpuUsageChartProps {
  data: TimeSeriesData[];
}

export function CpuUsageChart({ data }: CpuUsageChartProps) {
  return (
     <ChartContainer config={chartConfig} className="w-full h-full">
      <LineChart accessibilityLayer data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <ChartTooltip
          content={<ChartTooltipContent indicator="dot" hideLabel />}
          cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Line
          type="monotone"
          dataKey="usage"
          stroke="var(--color-usage)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
