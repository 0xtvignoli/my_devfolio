import type { Project } from "@/lib/types";

/** Local cover art under /public/images/projects — no external placeholder hosts. */
export const PROJECT_IMAGES = {
  "project-1": "/images/projects/project-1-k8s.svg",
  "project-2": "/images/projects/project-2-terratest.svg",
  "project-3": "/images/projects/project-3-serverless.svg",
  "project-4": "/images/projects/project-4-observability.svg",
} as const;

export const projects: Project[] = [
  {
    id: "project-1",
    title: {
      en: "Multi-Cloud Kubernetes Platform",
      it: "Piattaforma Kubernetes Multi-Cloud",
    },
    description: {
      en: "A production-ready Kubernetes setup on AWS and GCP using Terraform for infrastructure and Helm for application deployment. Features include centralized logging, monitoring with Prometheus, and automated TLS.",
      it: "Un setup Kubernetes production-ready su AWS e GCP usando Terraform per l'infrastruttura e Helm per il deployment delle applicazioni. Include logging centralizzato, monitoraggio con Prometheus e TLS automatizzato.",
    },
    tags: ["Kubernetes", "Terraform", "Helm", "AWS", "GCP", "Prometheus"],
    imageUrl: PROJECT_IMAGES["project-1"],
    imageHint: "cloud infrastructure diagram",
    githubUrl: "https://github.com/tvignoli",
    metrics: [
      { label: { en: "Deploy time", it: "Tempo deploy" }, value: "−40%" },
      { label: { en: "Uptime", it: "Uptime" }, value: "99.95%" },
      { label: { en: "Clusters", it: "Cluster" }, value: "2 clouds" },
    ],
  },
  {
    id: "project-2",
    title: {
      en: "Go-based Terratest Framework",
      it: "Framework di Terratest in Go",
    },
    description: {
      en: "Developed a comprehensive testing suite for Terraform modules using Terratest in Go. This framework enables automated validation of infrastructure changes, integrated into a CI/CD pipeline.",
      it: "Sviluppato una suite di test completa per moduli Terraform utilizzando Terratest in Go. Questo framework abilita la validazione automatizzata delle modifiche all'infrastruttura, integrata in una pipeline CI/CD.",
    },
    tags: ["Go", "Terratest", "Terraform", "CI/CD", "Testing"],
    imageUrl: PROJECT_IMAGES["project-2"],
    imageHint: "code terminal",
    githubUrl: "https://github.com/tvignoli",
    metrics: [
      { label: { en: "Modules tested", it: "Moduli testati" }, value: "24+" },
      { label: { en: "CI coverage", it: "Copertura CI" }, value: "100%" },
      { label: { en: "Regressions", it: "Regressioni" }, value: "−60%" },
    ],
  },
  {
    id: "project-3",
    title: {
      en: "Serverless CI/CD Pipeline",
      it: "Pipeline CI/CD Serverless",
    },
    description: {
      en: "Architected a fully serverless CI/CD pipeline on AWS using CodePipeline, CodeBuild, and Lambda for cost-effective and scalable automated builds, tests, and deployments.",
      it: "Progettato una pipeline CI/CD completamente serverless su AWS utilizzando CodePipeline, CodeBuild e Lambda per build, test e deployment automatizzati, scalabili e a basso costo.",
    },
    tags: ["Serverless", "AWS", "CodePipeline", "CI/CD", "Lambda"],
    imageUrl: PROJECT_IMAGES["project-3"],
    imageHint: "serverless architecture",
    metrics: [
      { label: { en: "Build cost", it: "Costo build" }, value: "−55%" },
      { label: { en: "Release freq.", it: "Freq. release" }, value: "3×/day" },
      { label: { en: "Lead time", it: "Lead time" }, value: "< 20 min" },
    ],
  },
  {
    id: "project-4",
    title: {
      en: "Observability Stack Deployment",
      it: "Deployment Stack di Osservabilità",
    },
    description: {
      en: "Automated deployment of a full observability stack (Prometheus, Grafana, Loki, Tempo) on Kubernetes using Helm and Terraform, providing deep insights into application and cluster performance.",
      it: "Deployment automatizzato di uno stack di osservabilità completo (Prometheus, Grafana, Loki, Tempo) su Kubernetes usando Helm e Terraform, fornendo insight approfonditi sulle performance di cluster e applicazioni.",
    },
    tags: ["Observability", "Prometheus", "Grafana", "Kubernetes", "Helm"],
    imageUrl: PROJECT_IMAGES["project-4"],
    imageHint: "dashboard monitoring",
    githubUrl: "https://github.com/tvignoli",
    metrics: [
      { label: { en: "MTTR", it: "MTTR" }, value: "−35%" },
      { label: { en: "Dashboards", it: "Dashboard" }, value: "40+" },
      { label: { en: "Alerts", it: "Alert" }, value: "SLO-based" },
    ],
  },
];
