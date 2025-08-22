'use client';

import { useDevopsSim } from '@/providers/devops-sim-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ServiceStatus } from '@/lib/types';
import { CheckCircle, AlertTriangle, XCircle, Server, Database } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

export function ClusterStatus() {
  const { services } = useDevopsSim();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Database className="h-5 w-5 mr-2" />
          Production Cluster
        </CardTitle>
        <CardDescription>Health of deployed applications</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {services.map((service, index) => (
            <AccordionItem value={`item-${index}`} key={service.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">{service.name}</span>
                  <Badge
                    variant="outline"
                    className={cn('text-xs gap-2', statusInfo[service.status].className)}
                  >
                    {statusInfo[service.status].icon}
                    <span>{service.status}</span>
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6 border-l-2 ml-2 border-dashed">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pods ({service.pods.length})
                  </h4>
                  {service.pods.map((pod) => (
                    <div key={pod} className="flex items-center gap-2 text-xs">
                      <Server className="h-3 w-3 text-green-500" />
                      <span>{pod}</span>
                      <span className="text-muted-foreground">(1/1 Running)</span>
                    </div>
                  ))}
                  {service.pods.length === 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Server className="h-3 w-3 text-yellow-500" />
                      <span>No pods available.</span>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
