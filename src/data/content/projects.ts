import type { Project } from "@/lib/types";

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
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "cloud infrastructure diagram",
    githubUrl: "https://github.com",
    demoUrl: "https://example.com",
    // codesandboxId: "your-eks-sandbox-id", // TODO: Add CodeSandbox ID after creating the sandbox
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
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "code terminal",
    githubUrl: "https://github.com",
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
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "serverless architecture",
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
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "dashboard monitoring",
    githubUrl: "https://github.com",
    demoUrl: "https://example.com",
  },
];
