'use client';

import { Bar, BarChart, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { DeploymentData } from '@/lib/types';

const chartConfig = {
  count: {
    label: "Count",
  },
  success: {
    label: "Success",
    color: "hsl(var(--primary))",
  },
  failure: {
    label: "Failure",
    color: "hsl(var(--destructive))",
  }
};

interface DeploymentStatusChartProps {
  data: DeploymentData[];
}

export function DeploymentStatusChart({ data }: DeploymentStatusChartProps) {
  return (
    <ChartContainer config={chartConfig} className="w-full h-auto min-h-[200px]">
      <div className="w-full h-[200px] sm:h-[250px] lg:h-[300px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart accessibilityLayer data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={false}
            />
            <Bar dataKey="count" radius={2}>
                {data.map((d, index) => (
                    <Cell key={`cell-${index}`} fill={d.status === 'success' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
