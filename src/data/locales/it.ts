import type { Translations } from "@/lib/types";

export const it: Translations = {
  nav: {
    portfolio: "Portfolio",
    experience: "Esperienza",
    articles: "Articoli",
    lab: "Lab",
    missionProgress: "Progressi Missione",
  },
  mobileNav: {
    home: "Home",
    portfolio: "Lavori",
    contact: "Contatti",
    ariaLabel: "Navigazione principale",
  },
  hero: {
    title: "Senior DevOps Engineer & Cloud Architect",
    subtitle: "Costruisco e scalo infrastrutture resilienti, sicure ed efficienti sul cloud. Appassionato di IaC, Kubernetes e Automazione.",
    badge: "Senior DevOps Engineer",
    ctaPortfolio: "Vedi Progetti",
    ctaLab: "Esplora il Lab",
    ctaContact: "Contattami",
    labPreviewTitle: "LAB INTERATTIVO",
    labPreviewSubtitle: "Cluster Kubernetes simulato — deploy, monitoraggio e chaos-test dal browser.",
    tryLabTitle: "Prova il Lab",
    tryLabDescription: "Mission console interattiva: deploy, chaos-test e gestione di un cluster Kubernetes simulato dal terminale.",
    tryLabCta: "Apri Lab →",
  },
  skills: {
    title: "Tecnologie Principali",
    list: [
      "Terraform", "Kubernetes", "Helm", "Docker", "Go", "CI/CD (GitHub Actions, GitLab)", "AWS", "GCP", "Azure", "Prometheus", "Grafana", "Python"
    ],
  },
  portfolio: {
    title: "Progetti in Evidenza",
    viewAll: "Vedi tutti i progetti",
    pageSubtitle: "Una raccolta dei miei lavori, dall'automazione infrastrutturale al deployment di applicazioni.",
  },
  experience: {
    title: "Percorso Professionale",
    pageSubtitle: "Il mio percorso professionale nel mondo DevOps e Cloud.",
  },
  articles: {
    title: "Ultimi Articoli",
    viewAll: "Leggi tutti gli articoli",
    pageSubtitle: "Approfondimenti su cloud, automazione e best practice.",
    emptyTitle: "Nessun articolo",
    emptyDescription: "Gli articoli appariranno qui quando pubblicati.",
  },
  contact: {
    title: "Lavoriamo insieme",
    description: "Sono sempre disponibile a discutere di nuovi progetti, idee creative o opportunità per far parte di una visione ambiziosa. Scrivimi pure.",
    email: "thomas.vignoli@pm.me",
    emailLabel: "Invia email a {email}",
    openingEmailClient: "Apertura client email...",
    emailClientOpened: "Il client email dovrebbe aprirsi a breve",
    buttonText: "Contattami",
  },
  footer: {
    copy: "© 2026 Thomas Vignoli. Tutti i diritti riservati.",
  },
  theme: {
    light: "Chiaro",
    dark: "Scuro",
    system: "Sistema",
  },
  a11y: {
    skipToContent: "Vai al contenuto principale",
  },
  errorBoundary: {
    title: "Qualcosa è andato storto",
    description: "Il Lab ha riscontrato un errore imprevisto. I tuoi dati sono al sicuro.",
    reload: "Ricarica pagina",
    goHome: "Torna al Lab",
  },
  article: {
    back: "Torna agli articoli",
    author: "Di",
    published: "Pubblicato il",
  },
  project: {
    github: "Codice Sorgente",
    demo: "Demo Live",
    metricsLabel: "Impatto",
  },
  codesandbox: {
    title: "Code Playground",
    description: "Esplora moduli Terraform production-ready e codice infrastrutturale",
    tryIt: "Provalo Live",
    openInSandbox: "Apri in CodeSandbox",
    copyLink: "Copia link",
    linkCopied: "Link copiato negli appunti",
    templates: {
      eks: "Cluster EKS",
      vpc: "Rete VPC",
      rds: "Database RDS",
      s3: "Bucket S3",
      cicd: "Pipeline CI/CD"
    }
  },
  lab: {
    title: "Mission Console DevOps",
    subtitle: "Deploy, osservabilità e chaos-test su un cluster Kubernetes simulato — ogni azione replica workflow di produzione.",
    live: "Live",
    terminal: {
      title: "Interfaccia comandi",
      description: "Esegui kubectl, strategie di deploy ed esperimenti chaos da un'unica console.",
      connected: "Connesso a dev-cluster",
    },
    missionControl: {
      title: "Mission Control",
      description: "Automazione e macro per le operazioni più comuni.",
      sandboxTitle: "Ambiente simulato",
      sandboxDescription: "Tutte le azioni restano in sandbox. Nessun sistema di produzione è coinvolto.",
      autoChaos: "Auto-Chaos Monkey",
      autoChaosDescription: "Fault injection programmata per validare self-healing e rollback.",
    },
    metrics: {
      title: "Osservabilità",
      cpu: "Utilizzo CPU",
      memory: "Memoria",
      latency: "Latenza API",
      deploys: "Deploy",
      cpuHint: "Utilizzo CPU del cluster. Range normale: 0–70%.",
      memoryHint: "Memoria totale su tutti i nodi.",
      latencyHint: "Tempo di risposta al 95° percentile. Obiettivo sotto 200ms.",
      deploysHint: "Deploy riusciti negli ultimi 7 giorni.",
    },
    sections: {
      incidents: "Storico incidenti",
      incidentsSubtitle: "Test di resilienza ed eventi di sistema",
      cluster: "Topologia cluster",
      pipeline: "Pipeline di deploy",
      pipelineSubtitle: "Stage CI/CD e gate canary",
    },
    actions: {
      promote: "Promuovi canary",
      rollback: "Rollback",
      deploy: "Avvia deploy",
      deploying: "Deploy in corso…",
      rollingBack: "Rollback in corso…",
      run: "Esegui",
    },
    layout: {
      label: "Vista",
      standard: "Dashboard",
      immersive: "Focus",
      standardHint: "Console a schede con griglia metriche",
      immersiveHint: "Vista operatore full-screen con pannelli laterali",
      ariaLabel: "Selezione layout lab",
    },
    macros: {
      clusterPulse: { label: "Cluster pulse", description: "Elenca pod e stato rollout" },
      canary: { label: "Canary 20%", description: "Instrada il 20% del traffico al nuovo build" },
      blueGreen: { label: "Blue / Green", description: "Avvia green prima del cutover" },
      chaosPod: { label: "Chaos · pod", description: "Elimina un pod per testare auto-healing" },
      chaosLatency: { label: "Chaos · latenza", description: "Spike latenza API per 60s" },
    },
    dialogs: {
      rollbackTitle: "Conferma rollback",
      rollbackDescription: "Torna alla versione precedente. Azione irreversibile.",
      chaosTitle: "Conferma chaos experiment",
      chaosDescription: "Inietta un fault simulato. Monitora lo storico incidenti per il recovery.",
      cancel: "Annulla",
    },
  },
};
