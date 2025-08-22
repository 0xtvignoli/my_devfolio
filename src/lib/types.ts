export type Person = {
  name: string;
  roleTitle: string;
  bio: string;
  location: string;
  email: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  about: string;
  resumeUrl: string;
  experience: {
    role: string;
    company: string;
    period: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
  }[];
};

export type Article = {
  id: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  content: string;
};

export type ProjectLink = {
  repo?: string;
  live?: string;
  caseStudy?: string;
  codespaces?: string;
  stackblitz?: string;
};

export type ProjectImage = {
  url: string;
  alt: string;
  aiHint?: string;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  longDescription: string;
  images: ProjectImage[];
  stack: string[];
  role: string;
  outcomes: string[];
  links?: ProjectLink;
  featured?: boolean;
  date?: string;
  tags?: string[];
  dates?: {
    start: string;
    end?: string;
  };
};

// --- DevOps Simulation Types ---
export type Metric = {
  time: string;
  [key: string]: number | string;
};

export type ServiceStatus = 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';

export type Service = {
  id: string;
  name: string;
  status: ServiceStatus;
  pods: string[];
};

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export type LogEntry = {
  timestamp: Date;
  level: LogLevel;
  message: string;
  command?: string;
};

export type PipelineStage = {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failure';
  duration?: number;
  logOutput?: string;
};

export type IncidentType = 'pod-delete' | 'container-kill' | 'network-latency';

export type ChaosExperiment = {
  type: IncidentType;
  name: string;
  description: string;
};
