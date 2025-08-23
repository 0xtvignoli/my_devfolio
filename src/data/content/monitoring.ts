import type { TimeSeriesData, DeploymentData, PipelineStage, KubernetesCluster, MonitoringData, Pod, DeployConfig } from "@/lib/types";

// --- INITIAL DATA GENERATORS ---

const generateIp = () => `10.1.2.${Math.floor(Math.random() * 254) + 1}`;

export const getInitialMonitoringData = (): MonitoringData => {
    const deploymentData: DeploymentData[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const successes = Math.floor(Math.random() * 3) + 1;
        deploymentData.push({ date: dateString, status: 'success', count: successes });

        const failures = Math.random() > 0.8 ? 1 : 0;
        if (failures > 0) {
            deploymentData.push({ date: dateString, status: 'failure', count: failures });
        }
    }

    return {
        cpuData: Array.from({ length: 30 }, (_, i) => ({
            time: `T-${29 - i}`,
            usage: Math.floor(Math.random() * (15 - 5 + 1) + 5),
        })),
        memoryData: Array.from({ length: 30 }, (_, i) => ({
            time: `T-${29 - i}`,
            usage: Math.floor(Math.random() * (45 - 35 + 1) + 35),
        })),
        apiResponseData: Array.from({ length: 30 }, (_, i) => ({
            time: `T-${29 - i}`,
            p95: Math.floor(Math.random() * (90 - 75 + 1) + 75),
        })),
        deploymentData,
    };
};

export const getInitialPipeline = (config?: DeployConfig): PipelineStage[] => {
    const deployConfig = config || { strategy: 'canary', weight: 10, version: 'v1.0.0' };
    return [
        {
            name: 'Source',
            status: 'Queued',
            duration: '-',
            details: 'git pull origin main',
            baseDuration: 1500,
        },
        {
            name: 'Build',
            status: 'Queued',
            duration: '-',
            details: `docker build -t devops-folio:${deployConfig.version} .`,
            baseDuration: 4000,
        },
        {
            name: 'Test',
            status: 'Queued',
            duration: '-',
            details: 'npm run test',
            baseDuration: 3000,
        },
        {
            name: 'Deploy Staging',
            status: 'Queued',
            duration: '-',
            details: 'helm upgrade --install devops-folio-staging ./charts/devops-folio --namespace staging',
            baseDuration: 3500,
        },
        {
            name: 'Deploy Canary',
            status: 'Queued',
            duration: '-',
            details: `helm upgrade --install devops-folio-canary ./charts/devops-folio --set image.tag=${deployConfig.version} --set trafficSplit=${deployConfig.weight}`,
            baseDuration: 4000,
        },
        {
            name: 'Deploy Prod',
            status: 'Queued',
            duration: '-',
            details: 'helm upgrade --install devops-folio-prod ./charts/devops-folio --namespace production --atomic',
            baseDuration: 4500,
        },
    ]
};


const initialPods: Omit<Pod, 'ip' | 'traffic'>[] = [
    { name: 'frontend-webapp-7b', service: 'Homepage', status: 'Running', cpu: '250m', memory: '512Mi', isCanary: false },
    { name: 'api-gateway-f9', service: 'API Gateway', status: 'Running', cpu: '150m', memory: '256Mi', isCanary: false },
    { name: 'monitoring-dash-c3', service: 'Monitoring', status: 'Running', cpu: '300m', memory: '1Gi', isCanary: false },
    { name: 'articles-service-a1', service: 'Articles API', status: 'Running', cpu: '200m', memory: '256Mi', isCanary: false },
    { name: 'chaos-controller-5d', service: 'Chaos Eng.', status: 'Running', cpu: '100m', memory: '128Mi', isCanary: false },
    { name: 'log-aggregator-8e', service: 'Log Viewer', status: 'Running', cpu: '150m', memory: '256Mi', isCanary: false },
];

const podsWithIps: Pod[] = initialPods.map(pod => ({ 
    ...pod, 
    ip: generateIp(),
    traffic: pod.service === 'Homepage' ? 100 : undefined
}));


export const getInitialClusterData = (): KubernetesCluster => ({
  nodes: [
    {
      name: 'gke-node-1',
      cpu: '4 vCPU',
      memory: '16 GB',
      pods: podsWithIps.slice(0, 3),
    },
    {
      name: 'gke-node-2',
      cpu: '4 vCPU',
      memory: '16 GB',
      pods: podsWithIps.slice(3, 6),
    },
  ],
});
