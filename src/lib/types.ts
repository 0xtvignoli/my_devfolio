export type Locale = 'en' | 'it';

export interface Translations {
  nav: {
    portfolio: string;
    experience: string;
    articles: string;
    lab: string;
    missionProgress: string;
  };
  mobileNav: {
    home: string;
    portfolio: string;
    contact: string;
    ariaLabel: string;
  };
  hero: {
    title: string;
    subtitle: string;
    badge: string;
    ctaPortfolio: string;
    ctaLab: string;
    ctaContact: string;
    labPreviewTitle: string;
    labPreviewSubtitle: string;
    tryLabTitle?: string;
    tryLabDescription?: string;
    tryLabCta?: string;
  };
  skills: {
    title: string;
    list: string[];
  };
  portfolio: {
    title: string;
    viewAll: string;
    pageSubtitle?: string;
  };
  experience: {
    title: string;
    pageSubtitle?: string;
  };
  articles: {
    title: string;
    viewAll: string;
    pageSubtitle?: string;
    emptyTitle?: string;
    emptyDescription?: string;
  };
  contact: {
    title: string;
    description: string;
    email: string;
    emailLabel: string;
    openingEmailClient: string;
    emailClientOpened: string;
    buttonText: string;
  };
  footer: {
    copy: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  a11y: {
    skipToContent: string;
  };
  errorBoundary: {
    title: string;
    description: string;
    reload: string;
    goHome: string;
  };
  article: {
    back: string;
    author: string;
    published: string;
  }
  project: {
    github: string;
    demo: string;
    metricsLabel: string;
  };
  codesandbox: {
    title: string;
    description: string;
    tryIt: string;
    openInSandbox: string;
    copyLink: string;
    linkCopied: string;
    templates: {
      eks: string;
      vpc: string;
      rds: string;
      s3: string;
      cicd: string;
    };
  };
  lab: {
    title: string;
    subtitle: string;
    live: string;
    terminal: {
      title: string;
      description: string;
      connected: string;
    };
    missionControl: {
      title: string;
      description: string;
      sandboxTitle: string;
      sandboxDescription: string;
      autoChaos: string;
      autoChaosDescription: string;
    };
    metrics: {
      title: string;
      cpu: string;
      memory: string;
      latency: string;
      deploys: string;
      cpuHint: string;
      memoryHint: string;
      latencyHint: string;
      deploysHint: string;
    };
    sections: {
      incidents: string;
      incidentsSubtitle: string;
      cluster: string;
      pipeline: string;
      pipelineSubtitle: string;
    };
    actions: {
      promote: string;
      rollback: string;
      deploy: string;
      deploying: string;
      rollingBack: string;
      run: string;
    };
    layout: {
      label: string;
      standard: string;
      immersive: string;
      standardHint: string;
      immersiveHint: string;
      ariaLabel: string;
    };
    macros: {
      clusterPulse: { label: string; description: string };
      canary: { label: string; description: string };
      blueGreen: { label: string; description: string };
      chaosPod: { label: string; description: string };
      chaosLatency: { label: string; description: string };
    };
    dialogs: {
      rollbackTitle: string;
      rollbackDescription: string;
      chaosTitle: string;
      chaosDescription: string;
      cancel: string;
    };
    toasts: {
      pipelinePausedTitle: string;
      pipelinePausedDescription: string;
      deploySuccessTitle: string;
      deploySuccessDescription: string;
      deployFailedTitle: string;
      rollbackStartedDescription: string;
      chaosInjectedDescription: string;
    };
    announcements: {
      pipelinePaused: string;
      pipelineCompleted: string;
      pipelineFailed: string;
      newIncident: string;
      cpuChanged: string;
      latencyChanged: string;
    };
    empty: {
      incidentsTitle: string;
      incidentsDescription: string;
      tryCommand: string;
    };
    incidentTable: {
      status: string;
      type: string;
      duration: string;
      timestamp: string;
      ariaLabel: string;
    };
    help: {
      buttonLabel: string;
      title: string;
      description: string;
      tipLabel: string;
      tip: string;
      categories: {
        key: 'system' | 'lab' | 'kubernetes' | 'helm' | 'git';
        title: string;
        commands: { cmd: string; desc: string }[];
      }[];
    };
    tour: {
      start: string;
      restart: string;
      previous: string;
      next: string;
      finish: string;
      close: string;
      stepOf: string;
      steps: {
        welcome: { title: string; description: string; action: string };
        terminal: { title: string; description: string };
        quickActions: { title: string; description: string };
        missionControl: { title: string; description: string };
        metrics: { title: string; description: string };
        cluster: { title: string; description: string };
        pipeline: { title: string; description: string };
        incidents: { title: string; description: string };
        complete: { title: string; description: string; action: string };
      };
    };
  };
}

export interface Project {
  id: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  tags: string[];
  imageUrl: string;
  imageHint: string;
  githubUrl?: string;
  demoUrl?: string;
  codesandboxId?: string;
  metrics?: { label: Record<Locale, string>; value: string }[];
}

export interface Experience {
  date: Record<Locale, string>;
  title: Record<Locale, string>;
  company: string;
  description: Record<Locale, string>;
  tags: string[];
}

export type ArticleContent = {
    type: 'heading';
    level: 2 | 3 | 4;
    content: string;
} | {
    type: 'paragraph';
    content: string;
} | {
    type: 'code';
    language: string;
    code: string;
};

export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  content: ArticleContent[];
}

// --- Lab Specific Types ---

export interface TimeSeriesData {
    time: string;
    [key: string]: number | string;
}

export interface DeploymentData {
    date: string;
    status: 'success' | 'failure';
    count: number;
}

export interface MonitoringData {
  cpuData: TimeSeriesData[];
  memoryData: TimeSeriesData[];
  apiResponseData: TimeSeriesData[];
  deploymentData: DeploymentData[];
}

export interface PipelineStage {
  name: string;
  icon?: React.ElementType;
  status: 'Success' | 'In Progress' | 'Failed' | 'Queued';
  duration: string;
  details: string;
  baseDuration: number;
}

export interface Pod {
    name: string;
    service: string;
    status: 'Running' | 'Pending' | 'Error';
    cpu: string;
    memory: string;
    ip: string;
    isCanary?: boolean;
    traffic?: number;
}

export interface Node {
    name: string;
    cpu: string;
    memory: string;
    pods: Pod[];
}

export interface KubernetesCluster {
    nodes: Node[];
}

export interface Incident {
  id: string;
  timestamp: Date;
  type: 'Pod Failure' | 'API Latency' | 'CPU Spike';
  duration: string;
  status: 'Resolved' | 'Investigating';
}

export interface CanaryMetrics {
    baseline: { latency: number; errorRate: number, cpu: number };
    canary: { latency: number; errorRate: number, cpu: number };
}

export interface DeployConfig {
    strategy: string;
    weight: number;
    version: string;
}
