import type { Translations } from "@/lib/types";

export const en: Translations = {
  nav: {
    portfolio: "Portfolio",
    experience: "Experience",
    articles: "Articles",
    lab: "Lab",
    missionProgress: "Mission Progress",
  },
  mobileNav: {
    home: "Home",
    portfolio: "Work",
    contact: "Contact",
    ariaLabel: "Main navigation",
  },
  hero: {
    title: "Senior DevOps Engineer & Cloud Architect",
    subtitle: "I build and scale resilient, secure, and cost-effective infrastructures on the cloud. Passionate about IaC, Kubernetes, and Automation.",
    badge: "Senior DevOps Engineer",
    ctaPortfolio: "View Projects",
    ctaLab: "Explore Lab",
    ctaContact: "Get in Touch",
    labPreviewTitle: "INTERACTIVE LAB",
    labPreviewSubtitle: "Simulated Kubernetes cluster — deploy, monitor, and chaos-test from your browser.",
    tryLabTitle: "Try the Lab",
    tryLabDescription: "Interactive mission console: deploy, chaos-test, and operate a simulated Kubernetes cluster from the terminal.",
    tryLabCta: "Open Lab →",
  },
  skills: {
    title: "Core Technologies",
    list: [
      "Terraform", "Kubernetes", "Helm", "Docker", "CI/CD (GitHub Actions, Jenkins)", "AWS", "GCP", "Azure", "Prometheus", "Grafana", "Python", "TypeScript", "Javascript"
    ],
  },
  portfolio: {
    title: "Featured Projects",
    viewAll: "View all projects",
    pageSubtitle: "A collection of my work, from infrastructure automation to application deployment.",
  },
  experience: {
    title: "Career Journey",
    pageSubtitle: "My professional journey and evolution in the world of DevOps and Cloud.",
  },
  articles: {
    title: "Latest Articles",
    viewAll: "Read all articles",
    pageSubtitle: "Deep dives into cloud technologies, automation, and best practices.",
    emptyTitle: "No articles yet",
    emptyDescription: "Articles will appear here when published.",
  },
  contact: {
    title: "Let's work together",
    description: "I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision. Feel free to reach out.",
    email: "thomas.vignoli@pm.me",
    emailLabel: "Send email to {email}",
    openingEmailClient: "Opening email client...",
    emailClientOpened: "Email client should open shortly",
    buttonText: "Get in touch",
  },
  footer: {
    copy: "© 2026 Thomas Vignoli. All rights reserved.",
  },
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  a11y: {
    skipToContent: "Skip to main content",
  },
  errorBoundary: {
    title: "Something went wrong",
    description: "The Lab encountered an unexpected error. Don't worry, your data is safe.",
    reload: "Reload Page",
    goHome: "Go to Lab Home",
  },
  article: {
    back: "Back to articles",
    author: "By Thomas Vignoli",
    published: "Published on",
  },
  project: {
    github: "Source Code",
    demo: "Live Demo",
    metricsLabel: "Impact",
  },
  codesandbox: {
    title: "Code Playground",
    description: "Explore production-ready Terraform modules and infrastructure code",
    tryIt: "Try it Live",
    openInSandbox: "Open in CodeSandbox",
    copyLink: "Copy link",
    linkCopied: "Link copied to clipboard",
    templates: {
      eks: "EKS Cluster",
      vpc: "VPC Network",
      rds: "RDS Database",
      s3: "S3 Bucket",
      cicd: "CI/CD Pipeline"
    }
  },
  lab: {
    title: "DevOps Mission Console",
    subtitle: "Deploy, observe, and chaos-test a simulated Kubernetes cluster — every action mirrors production-grade workflows.",
    live: "Live",
    terminal: {
      title: "Command Interface",
      description: "Run kubectl, deploy strategies, and chaos experiments from a single console.",
      connected: "Connected to dev-cluster",
    },
    missionControl: {
      title: "Mission Control",
      description: "Automation toggles and curated macros for common operations.",
      sandboxTitle: "Simulated environment",
      sandboxDescription: "All actions stay inside a sandbox. No production systems are touched.",
      autoChaos: "Auto-Chaos Monkey",
      autoChaosDescription: "Scheduled fault injection validates self-healing and rollback paths.",
    },
    metrics: {
      title: "Observability",
      cpu: "CPU usage",
      memory: "Memory",
      latency: "API latency",
      deploys: "Deployments",
      cpuHint: "Cluster CPU utilization. Normal range: 0–70%.",
      memoryHint: "Total memory usage across all nodes.",
      latencyHint: "95th percentile response time. Target under 200ms.",
      deploysHint: "Successful deployments in the last 7 days.",
    },
    sections: {
      incidents: "Incident history",
      incidentsSubtitle: "Resilience tests and system events",
      cluster: "Cluster topology",
      pipeline: "Deploy pipeline",
      pipelineSubtitle: "CI/CD stages and canary gates",
    },
    actions: {
      promote: "Promote canary",
      rollback: "Rollback",
      deploy: "Run deployment",
      deploying: "Deploying…",
      rollingBack: "Rolling back…",
      run: "Run",
    },
    layout: {
      label: "View",
      standard: "Dashboard",
      immersive: "Focus",
      standardHint: "Card-based mission console with metrics grid",
      immersiveHint: "Full-screen operator view with side panels",
      ariaLabel: "Lab layout selection",
    },
    macros: {
      clusterPulse: { label: "Cluster pulse", description: "List pods and rollout status" },
      canary: { label: "Canary 20%", description: "Route 20% traffic to the new build" },
      blueGreen: { label: "Blue / Green", description: "Spin up green before cutover" },
      chaosPod: { label: "Chaos · pods", description: "Drop a pod to test auto-healing" },
      chaosLatency: { label: "Chaos · latency", description: "Spike API latency for 60s" },
    },
    dialogs: {
      rollbackTitle: "Confirm rollback",
      rollbackDescription: "This rolls back to the previous version. This action cannot be undone.",
      chaosTitle: "Confirm chaos experiment",
      chaosDescription: "This injects a simulated fault. Monitor incident history for recovery.",
      cancel: "Cancel",
    },
  },
};
