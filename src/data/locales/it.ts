import type { Translations } from "@/lib/types";

export const it: Translations = {
  nav: {
    portfolio: "Portfolio",
    experience: "Esperienza",
    articles: "Articoli",
    lab: "Lab",
  },
  hero: {
    title: "Senior DevOps Engineer & Cloud Architect",
    subtitle: "Costruisco e scalo infrastrutture resilienti, sicure ed efficienti sul cloud. Appassionato di IaC, Kubernetes e Automazione.",
    ctaPortfolio: "Vedi Progetti",
    ctaContact: "Contattami",
  },
  skills: {
    title: "Tecnologie Principali",
    list: [
      "Terraform", "Kubernetes", "Helm", "Docker", "Go", "CI/CD (GitHub Actions, GitLab)", "AWS", "GCP", "Azure", "Prometheus", "Grafana", "Python"
    ],
  },
  portfolio: {
    title: "Progetti in Evidenza",
    viewAll: "Vedi tutti i progetti"
  },
  experience: {
    title: "Percorso Professionale",
  },
  articles: {
    title: "Ultimi Articoli",
    viewAll: "Leggi tutti gli articoli"
  },
  contact: {
    title: "Lavoriamo insieme",
    description: "Sono sempre disponibile a discutere di nuovi progetti, idee creative o opportunità per far parte di una visione ambiziosa. Scrivimi pure.",
    email: "thomas.vignoli@pm.me",
  },
  footer: {
    copy: "© 2025 Thomas Vignoli. Tutti i diritti riservati.",
  },
  theme: {
    light: "Chiaro",
    dark: "Scuro",
    system: "Sistema",
  },
  article: {
    back: "Torna agli articoli",
    author: "Di",
    published: "Pubblicato il",
  },
  project: {
    github: "Codice Sorgente",
    demo: "Demo Live"
  }
};
