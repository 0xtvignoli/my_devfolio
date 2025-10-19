import dynamic from 'next/dynamic';

// Lazy load dei componenti pesanti con loading fallback
export const KubernetesClusterViz = dynamic(
  () => import('./kubernetes-cluster-viz').then(mod => ({ default: mod.KubernetesClusterViz })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    ),
    ssr: false
  }
);

export const VisualDeployPipeline = dynamic(
  () => import('./visual-deploy-pipeline').then(mod => ({ default: mod.VisualDeployPipeline })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-32">
        <div className="animate-pulse space-y-2 w-full">
          <div className="h-4 bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    ),
    ssr: false
  }
);

export const CpuUsageChart = dynamic(
  () => import('./cpu-chart').then(mod => ({ default: mod.CpuUsageChart })),
  {
    loading: () => <div className="h-20 bg-gray-800/50 animate-pulse rounded" />,
    ssr: false
  }
);

export const MemoryUsageChart = dynamic(
  () => import('./memory-chart').then(mod => ({ default: mod.MemoryUsageChart })),
  {
    loading: () => <div className="h-20 bg-gray-800/50 animate-pulse rounded" />,
    ssr: false
  }
);

export const ApiResponseTimeChart = dynamic(
  () => import('./api-response-chart').then(mod => ({ default: mod.ApiResponseTimeChart })),
  {
    loading: () => <div className="h-20 bg-gray-800/50 animate-pulse rounded" />,
    ssr: false
  }
);

export const DeploymentStatusChart = dynamic(
  () => import('./deployment-status-chart').then(mod => ({ default: mod.DeploymentStatusChart })),
  {
    loading: () => <div className="h-20 bg-gray-800/50 animate-pulse rounded" />,
    ssr: false
  }
);

export const CanaryAnalysis = dynamic(
  () => import('./canary-analysis').then(mod => ({ default: mod.CanaryAnalysis })),
  {
    loading: () => (
      <div className="p-4 bg-gray-800/50 rounded animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-700 rounded w-3/4" />
      </div>
    ),
    ssr: false
  }
);

export const IncidentHistory = dynamic(
  () => import('./incident-history').then(mod => ({ default: mod.IncidentHistory })),
  {
    loading: () => (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-800/50 rounded animate-pulse" />
        ))}
      </div>
    ),
    ssr: false
  }
);
