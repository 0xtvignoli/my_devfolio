'use client';

import { DeploymentPipeline } from '@/components/devops/deployment-pipeline';
import { LogViewer } from '@/components/devops/log-viewer';
import { MetricsCard } from '@/components/devops/metrics-card';
import { ScenarioInfo } from '@/components/devops/scenario-info';
import { ServicesStatus } from '@/components/devops/services-status';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDevopsSim } from '@/providers/devops-sim-provider';
import { Layers, ListChecks, BrainCircuit, Server } from 'lucide-react';
import { ChaosControl } from '@/components/devops/chaos-control';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClusterStatus } from '@/components/devops/cluster-status';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const renderSkeletons = () => (
  <div className="space-y-6 flex-1 flex flex-col">
    {/* Header Skeleton */}
    <div className="space-y-1">
      <Skeleton className="h-9 w-1/3" />
      <Skeleton className="h-5 w-1/2" />
    </div>

    {/* Tabs Skeleton */}
    <div className="w-full md:w-[400px]">
      <Skeleton className="h-10 w-full" />
    </div>

    {/* Main Content Skeleton */}
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 flex-1">
      <div className="xl:col-span-3 grid gap-6 content-start">
        <Skeleton className="h-80" />
      </div>
      <div className="xl:col-span-2 grid gap-6 content-start">
        <Skeleton className="h-60" />
        <Skeleton className="h-40" />
      </div>
    </div>

    {/* Log Viewer Skeleton */}
    <div className="flex-none pt-6">
      <Skeleton className="h-80" />
    </div>
  </div>
);

function LabPageContent() {
  const { metrics, isLoading, pipelineStatus } = useDevopsSim();
  const [activeTab, setActiveTab] = useState<'prod-workload' | 'ai-scenario'>('prod-workload');
  const scenarioInnerTabRef = useRef<'pipeline' | 'services'>('pipeline');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scenarioTabsRef = useRef<HTMLDivElement | null>(null);

  // Dynamically import Hammer only on client
  useEffect(() => {
    let hammerMain: any;
    let hammerScenario: any;
    (async () => {
      const Hammer = (await import('hammerjs')).default; // hammerjs has default export
      if (containerRef.current) {
        hammerMain = new Hammer(containerRef.current);
        hammerMain
          .get('swipe')
          .set({ direction: Hammer.DIRECTION_HORIZONTAL, velocity: 0.2, threshold: 5 });
        hammerMain.on('swipeleft', () =>
          setActiveTab((prev) => (prev === 'prod-workload' ? 'ai-scenario' : prev)),
        );
        hammerMain.on('swiperight', () =>
          setActiveTab((prev) => (prev === 'ai-scenario' ? 'prod-workload' : prev)),
        );
      }
      if (scenarioTabsRef.current) {
        hammerScenario = new Hammer(scenarioTabsRef.current);
        hammerScenario
          .get('swipe')
          .set({ direction: Hammer.DIRECTION_HORIZONTAL, velocity: 0.2, threshold: 5 });
        hammerScenario.on('swipeleft', () => {
          scenarioInnerTabRef.current = 'services';
          const btn = scenarioTabsRef.current?.querySelector(
            '[data-value="services"]',
          ) as HTMLElement | null;
          btn?.click();
        });
        hammerScenario.on('swiperight', () => {
          scenarioInnerTabRef.current = 'pipeline';
          const btn = scenarioTabsRef.current?.querySelector(
            '[data-value="pipeline"]',
          ) as HTMLElement | null;
          btn?.click();
        });
      }
    })();
    return () => {
      hammerMain?.destroy?.();
      hammerScenario?.destroy?.();
    };
  }, []);

  if (isLoading) {
    return renderSkeletons();
  }

  return (
    <div ref={containerRef} className="space-y-6 h-full flex flex-col touch-pan-y select-none">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-1">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">
            Infrastructure Lab
          </h1>
          <p className="text-muted-foreground">
            An interactive simulation of a live cloud environment.
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="prod-workload"
        className="w-full flex-1 flex flex-col"
        onValueChange={(value) => setActiveTab(value as 'prod-workload' | 'ai-scenario')}
      >
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="prod-workload">
            <Server className="mr-2 h-4 w-4" />
            Production Workload
          </TabsTrigger>
          <TabsTrigger value="ai-scenario">
            <BrainCircuit className="mr-2 h-4 w-4" />
            AI Case Scenario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prod-workload" className="mt-6 flex-1">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3 grid gap-6 content-start">
              <Card>
                <CardHeader>
                  <CardTitle>Live Production Metrics</CardTitle>
                  <CardDescription>
                    Real-time performance data from the stable production environment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  <MetricsCard
                    title="CPU Utilization"
                    data={metrics.cpu}
                    dataKey="utilization"
                    unit="%"
                  />
                  <MetricsCard title="Memory Usage" data={metrics.ram} dataKey="usage" unit="GB" />
                  <MetricsCard
                    title="Network Traffic"
                    data={metrics.network}
                    dataKey="traffic"
                    unit="MB/s"
                    className="md:col-span-2"
                  />
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-2 grid gap-6 content-start">
              <ClusterStatus />
              <Card>
                <CardHeader>
                  <CardTitle>Chaos Terminal</CardTitle>
                  <CardDescription>
                    Inject failures into the production workload to test its resilience.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChaosControl />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-scenario" className="mt-6 flex-1">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="xl:col-span-2 grid gap-6 content-start">
              <ScenarioInfo />
            </div>
            <div className="xl:col-span-3">
              <Tabs defaultValue="pipeline">
                <TabsList>
                  <TabsTrigger value="pipeline">
                    <ListChecks className="mr-2 h-4 w-4" />
                    Pipeline
                  </TabsTrigger>
                  <TabsTrigger value="services">
                    <Layers className="mr-2 h-4 w-4" />
                    Services
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pipeline" className="mt-4" ref={scenarioTabsRef as any}>
                  <DeploymentPipeline />
                </TabsContent>
                <TabsContent value="services" className="mt-4">
                  <ServicesStatus />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {pipelineStatus !== 'idle' || activeTab === 'prod-workload' ? (
        <div className="flex-none pt-6">
          <LogViewer activeTab={activeTab} />
        </div>
      ) : null}
    </div>
  );
}

const LabPageWithNoSSR = dynamic(() => Promise.resolve(LabPageContent), {
  ssr: false,
  loading: () => renderSkeletons(),
});

export default function LabPage() {
  return <LabPageWithNoSSR />;
}
