
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
}

export type Project = {
  id: string;
  title: string;
  summary: string;
  stack: string[];
  role: string;
  outcomes: string[];
  links?: {
    repo?: string;
    live?: string;
    caseStudy?: string;
    codespaces?: string;
    stackblitz?: string;
  };
  dates?: {
    start: string;
    end?: string;
  };
  images?: {
    alt: string;
    url: string;
    aiHint: string;
  }[];
  longDescription: string;
};

// --- DevOps Simulation Types ---
export type Metric = {
  time: string;
  [key: string]: number | string;
};

export type ServiceStatus = "OPERATIONAL" | "DEGRADED" | "OUTAGE";

export type Service = {
  id: string;
  name: string;
  status: ServiceStatus;
  pods: string[];
};

export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export type LogEntry = {
  timestamp: Date;
  level: LogLevel;
  message: string;
  command?: string;
};

export type PipelineStage = {
  name: string;
  status: "pending" | "running" | "success" | "failure";
  duration?: number;
  logOutput?: string;
};

export type IncidentType = "pod-delete" | "container-kill" | "network-latency";

export type ChaosExperiment = {
  type: IncidentType;
  name: string;
  description: string;
};
