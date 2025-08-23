import type { Experience } from "@/lib/types";

export const experiences: Experience[] = [
  {
    date: {
      en: "2021 - Present",
      it: "2021 - Oggi",
    },
    title: {
      en: "Senior DevOps Engineer",
      it: "Senior DevOps Engineer",
    },
    company: "Tech Giant Inc.",
    description: {
      en: "Led the design and implementation of a multi-cloud Kubernetes platform, improving deployment velocity by 40%. Managed IaC with Terraform and established GitOps workflows using ArgoCD.",
      it: "Ho guidato la progettazione e l'implementazione di una piattaforma Kubernetes multi-cloud, migliorando la velocità di deployment del 40%. Ho gestito l'IaC con Terraform e stabilito flussi di lavoro GitOps con ArgoCD.",
    },
    tags: ["Kubernetes", "Terraform", "AWS", "GCP", "ArgoCD", "CI/CD"],
  },
  {
    date: {
      en: "2018 - 2021",
      it: "2018 - 2021",
    },
    title: {
      en: "DevOps Engineer",
      it: "DevOps Engineer",
    },
    company: "Innovative Startup",
    description: {
      en: "Built the CI/CD pipelines from scratch using GitHub Actions, reducing build times by 60%. Automated infrastructure provisioning on AWS with Terraform and managed containerized applications.",
      it: "Ho costruito le pipeline CI/CD da zero usando GitHub Actions, riducendo i tempi di build del 60%. Ho automatizzato il provisioning dell'infrastruttura su AWS con Terraform e gestito applicazioni containerizzate.",
    },
    tags: ["GitHub Actions", "Terraform", "AWS", "Docker", "Python"],
  },
  {
    date: {
      en: "2016 - 2018",
      it: "2016 - 2018",
    },
    title: {
      en: "Junior System Administrator",
      it: "Amministratore di Sistema Junior",
    },
    company: "Local Web Agency",
    description: {
      en: "Managed Linux servers, automated recurring tasks with Bash scripting, and provided support for hosting environments. First exposure to virtualization and cloud concepts.",
      it: "Ho gestito server Linux, automatizzato attività ricorrenti con scripting Bash e fornito supporto per ambienti di hosting. Prima esposizione a concetti di virtualizzazione e cloud.",
    },
    tags: ["Linux", "Bash", "Apache", "MySQL", "Virtualization"],
  },
];
