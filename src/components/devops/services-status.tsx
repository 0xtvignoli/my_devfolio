'use client';

import { useDevopsSim } from '@/providers/devops-sim-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ServiceStatus } from '@/lib/types';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const statusInfo: Record<
  ServiceStatus,
  {
    className: string;
    icon: React.ReactNode;
  }
> = {
  OPERATIONAL: {
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-700/40 dark:text-green-300',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  DEGRADED: {
    className:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/40 dark:text-yellow-300 animate-pulse',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  OUTAGE: {
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:border-red-700/40 dark:text-red-300 animate-pulse',
    icon: <XCircle className="h-3 w-3" />,
  },
};

export function ServicesStatus() {
  const { services, scenario } = useDevopsSim();

  if (!scenario) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Services</CardTitle>
        <CardDescription>Live health of services tied to this scenario</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {services
          .filter((s) => scenario.services.includes(s.name))
          .map((service) => (
            <div key={service.id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{service.name}</span>
              <Badge
                variant="outline"
                className={cn('text-xs gap-2', statusInfo[service.status].className)}
              >
                {statusInfo[service.status].icon}
                <span>{service.status}</span>
              </Badge>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
