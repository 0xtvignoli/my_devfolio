export type Locale = 'en' | 'it';

export interface Translations {
  nav: {
    portfolio: string;
    experience: string;
    articles: string;
    lab: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaPortfolio: string;
    ctaContact: string;
  };
  skills: {
    title: string;
    list: string[];
  };
  portfolio: {
    title: string;
    viewAll: string;
  };
  experience: {
    title: string;
  };
  articles: {
    title: string;
    viewAll: string;
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
  article: {
    back: string;
    author: string;
    published: string;
  }
  project: {
    github: string;
    demo: string;
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
