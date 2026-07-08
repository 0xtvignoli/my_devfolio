import type { Project } from "@/lib/types";

/** Local cover art under /public/images/projects — no external placeholder hosts. */
export const PROJECT_IMAGES = {
  "project-1": "/images/projects/project-1-k8s.svg",
  "project-2": "/images/projects/project-2-terratest.svg",
  "project-3": "/images/projects/project-3-serverless.svg",
  "project-4": "/images/projects/project-4-observability.svg",
  "project-5": "/images/projects/project-5-gitops.svg",
  "project-6": "/images/projects/project-6-llm-gateway.svg",
  "project-7": "/images/projects/project-7-finops.svg",
  "project-8": "/images/projects/project-8-x402-gateway.svg",
  "project-9": "/images/projects/project-9-margin-observability.svg",
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
  {
    id: "project-5",
    title: {
      en: "GitOps Delivery Platform",
      it: "Piattaforma di Delivery GitOps",
    },
    description: {
      en: "An internal developer platform on Argo CD with app-of-apps and ApplicationSets for self-service onboarding, plus progressive delivery (canary/blue-green) via Argo Rollouts with automated metric-based rollback.",
      it: "Una piattaforma interna per sviluppatori su Argo CD con app-of-apps e ApplicationSets per onboarding self-service, più progressive delivery (canary/blue-green) tramite Argo Rollouts con rollback automatico basato su metriche.",
    },
    tags: ["GitOps", "Argo CD", "Kubernetes", "Helm", "Argo Rollouts"],
    imageUrl: PROJECT_IMAGES["project-5"],
    imageHint: "gitops reconciliation flow",
    githubUrl: "https://github.com/tvignoli",
    metrics: [
      { label: { en: "Onboarding", it: "Onboarding" }, value: "−70%" },
      { label: { en: "Services", it: "Servizi" }, value: "30+" },
      { label: { en: "Rollback", it: "Rollback" }, value: "< 60s" },
    ],
  },
  {
    id: "project-6",
    title: {
      en: "LLM Inference Gateway",
      it: "Gateway di Inferenza LLM",
    },
    description: {
      en: "A self-hosted, OpenAI-compatible inference gateway serving open models with vLLM. Features continuous batching, a semantic cache to deflect duplicate prompts, per-tenant token budgets, and token-level cost observability.",
      it: "Un gateway di inferenza self-hosted e OpenAI-compatible che serve modelli aperti con vLLM. Include continuous batching, una cache semantica per deviare prompt duplicati, budget di token per tenant e osservabilità dei costi a livello di token.",
    },
    tags: ["LLMOps", "vLLM", "Python", "FastAPI", "Redis", "GPU"],
    imageUrl: PROJECT_IMAGES["project-6"],
    imageHint: "llm inference gateway architecture",
    githubUrl: "https://github.com/tvignoli",
    metrics: [
      { label: { en: "Cache hit", it: "Cache hit" }, value: "42%" },
      { label: { en: "Cost/token", it: "Costo/token" }, value: "−55%" },
      { label: { en: "Latency p95", it: "Latenza p95" }, value: "< 900ms" },
    ],
  },
  {
    id: "project-7",
    title: {
      en: "Kubernetes FinOps Platform",
      it: "Piattaforma FinOps Kubernetes",
    },
    description: {
      en: "A cost-allocation and rightsizing platform built on OpenCost and Karpenter. Provides per-team showback dashboards, VPA-driven rightsizing recommendations, and spot orchestration that cut cloud spend without breaching SLOs.",
      it: "Una piattaforma di allocazione costi e rightsizing basata su OpenCost e Karpenter. Fornisce dashboard di showback per team, raccomandazioni di rightsizing guidate da VPA e orchestrazione spot che hanno tagliato la spesa cloud senza violare gli SLO.",
    },
    tags: ["FinOps", "OpenCost", "Karpenter", "Kubernetes", "Grafana"],
    imageUrl: PROJECT_IMAGES["project-7"],
    imageHint: "cloud cost optimization dashboard",
    githubUrl: "https://github.com/tvignoli",
    metrics: [
      { label: { en: "Cloud spend", it: "Spesa cloud" }, value: "−48%" },
      { label: { en: "Spot coverage", it: "Copertura spot" }, value: "80%" },
      { label: { en: "Idle waste", it: "Spreco idle" }, value: "−65%" },
    ],
  },
  {
    id: "project-8",
    title: {
      en: "Agent-Native Inference Gateway",
      it: "Gateway di Inferenza Agent-Native",
    },
    description: {
      en: "The LLM inference gateway exposed as a pay-per-use, agent-native endpoint via Cloudflare's Monetization Gateway (x402). Autonomous agents call it with no API key and no account: they get an HTTP 402 with the price, pay in stablecoin, and receive the completion — settled peer-to-peer to my wallet, with a reduced price on semantic-cache hits.",
      it: "Il gateway di inferenza LLM esposto come endpoint pay-per-use e agent-native tramite il Monetization Gateway di Cloudflare (x402). Gli agenti autonomi lo chiamano senza API key né account: ricevono un HTTP 402 con il prezzo, pagano in stablecoin e ottengono la risposta — con settlement peer-to-peer sul mio wallet e prezzo ridotto sulle cache-hit semantiche.",
    },
    tags: ["x402", "Cloudflare", "LLMOps", "vLLM", "Agents", "Monetization"],
    imageUrl: PROJECT_IMAGES["project-8"],
    imageHint: "agent micropayment x402 flow",
    githubUrl: "https://github.com/tvignoli",
    metrics: [
      { label: { en: "Payment", it: "Pagamento" }, value: "HTTP 402" },
      { label: { en: "Settlement", it: "Settlement" }, value: "sub-sec" },
      { label: { en: "Onboarding", it: "Onboarding" }, value: "keyless" },
    ],
  },
  {
    id: "project-9",
    title: {
      en: "Per-Request Margin Observability",
      it: "Osservabilità del Margine per-Richiesta",
    },
    description: {
      en: "A FinOps dashboard that computes profit on every API call: x402 revenue per request minus the infra cost of serving it (OpenCost allocation plus token/GPU cost), broken down by endpoint, model, and tenant. Turns settlement webhooks and cost data into live margin-per-request — the half of the ledger monitoring never had.",
      it: "Una dashboard FinOps che calcola il profitto su ogni chiamata API: ricavo x402 per richiesta meno il costo infrastrutturale di servirla (allocazione OpenCost più costo token/GPU), scomposto per endpoint, modello e tenant. Trasforma i webhook di settlement e i dati di costo in margine-per-richiesta in tempo reale—la metà del libro mastro che il monitoring non ha mai avuto.",
    },
    tags: ["FinOps", "x402", "Observability", "Grafana", "OpenCost", "LLMOps"],
    imageUrl: PROJECT_IMAGES["project-9"],
    imageHint: "per-request margin revenue minus cost dashboard",
    githubUrl: "https://github.com/tvignoli",
    metrics: [
      { label: { en: "Margin", it: "Margine" }, value: "per-req" },
      { label: { en: "Attribution", it: "Attribuzione" }, value: "endpoint" },
      { label: { en: "Signal", it: "Segnale" }, value: "rev − cost" },
    ],
  },
];
