import type { Project } from "@/lib/types";

/** Local cover art under /public/images/projects — no external placeholder hosts. */
export const PROJECT_IMAGES = {
  "project-3": "/images/projects/project-3-serverless.svg",
  "project-5": "/images/projects/project-5-gitops.svg",
  "project-6": "/images/projects/project-6-llm-gateway.svg",
  "project-7": "/images/projects/project-7-finops.svg",
  "project-8": "/images/projects/project-8-x402-gateway.svg",
  "project-9": "/images/projects/project-9-margin-observability.svg",
} as const;

export const projects: Project[] = [
  {
    id: "homelab-zimaboard",
    title: {
      en: "ZimaBoard: two nodes, one job each",
      it: "ZimaBoard: due nodi, un ruolo ciascuno",
    },
    description: {
      en: "Two ZimaBoards in the basement, with separate jobs. zima1 (N3450, 8 GB, Debian 13) never switches off: DNS, reverse proxy, Home Assistant, monitoring and backups. zima2 (N150, 16 GB, Ubuntu 24.04) does the heavy lifting: 8 TB of media, Nextcloud and an RX 9060 XT on OCuLink for local AI models. Every step is in a runbook, from first boot to the GPU, including what I ruled out and why (Proxmox, ZimaOS, ROCm, NFS between the nodes).",
      it: "Due ZimaBoard in cantina, con compiti separati. zima1 (N3450, 8 GB, Debian 13) non si spegne mai: DNS, reverse proxy, Home Assistant, monitoraggio e backup. zima2 (N150, 16 GB, Ubuntu 24.04) fa il lavoro pesante: 8 TB di media, Nextcloud e una GPU RX 9060 XT collegata via OCuLink per i modelli AI in locale. Ogni passo è scritto in un runbook, dal primo avvio alla GPU, compreso cosa ho scartato e perché (Proxmox, ZimaOS, ROCm, NFS tra i nodi).",
    },
    tags: ["ZimaBoard", "Debian", "Ubuntu", "OCuLink", "Vulkan", "llama.cpp"],
    metrics: [
      { label: { en: "Nodes", it: "Nodi" }, value: "2" },
      { label: { en: "Containers", it: "Container" }, value: "51" },
      { label: { en: "Runbooks", it: "Runbook" }, value: "10" },
    ],
  },
  {
    id: "homelab-security",
    title: {
      en: "Security posture: no open doors, no blind trust",
      it: "Postura di sicurezza: niente porte aperte, niente fiducia",
    },
    description: {
      en: "From the internet the only way in is a WireGuard tunnel. Inside, every service answers only the home network, and every node has a second IPv6 firewall for when the router gets it wrong. Every night Trivy checks the images that are actually running, not the ones written in the files, and the results become metrics with alerts. The images I build start from Chainguard bases. Backups are encrypted with age and the servers hold only the public key: whoever breaks into a node can't read them, or delete them, because it's the other node that comes and fetches them. Away from home, a VM on Oracle Cloud is a trap for bots, locked down so it can answer but never connect out.",
      it: "Da internet si entra solo via tunnel WireGuard. Dentro, ogni servizio risponde solo alla rete di casa, e ogni nodo ha un secondo firewall IPv6 per quando il router sbaglia. Ogni notte Trivy controlla le immagini che stanno davvero girando, non quelle scritte nei file, e i risultati diventano metriche con allarme. Le immagini costruite da me partono da basi Chainguard. I backup sono cifrati con age e sui server c'è solo la chiave pubblica: chi buca un nodo non può leggerli, e nemmeno cancellarli, perché è l'altro nodo a venirseli a prendere. Fuori casa, una VM su Oracle Cloud fa da trappola per i bot, chiusa in modo che possa rispondere ma mai collegarsi verso l'esterno.",
    },
    tags: ["WireGuard", "nftables", "Trivy", "Chainguard", "age", "restic", "goss", "Beelzebub"],
    metrics: [
      { label: { en: "CVEs on the backup server", it: "CVE sul server di backup" }, value: "0" },
      { label: { en: "Sites, home network only", it: "Siti solo dalla rete di casa" }, value: "13" },
      { label: { en: "goss tests", it: "Test goss" }, value: "24 h" },
    ],
  },
  {
    id: "homelab-media",
    title: {
      en: "Media automation",
      it: "Media automation",
    },
    description: {
      en: "Ask for a film or an album from a web page and the rest happens on its own: Seerr hands the request to the *arr family (Sonarr, Radarr or Lidarr, for series, films and music), Prowlarr searches, the download starts, Bazarr adds subtitles and Jellyfin plays it in the living room, transcoded by the CPU's integrated graphics (the big GPU stays with the AI). Downloads and library share a disk, so importing a file means creating a hardlink, not copying 40 GB. Two timers cover what the apps don't: one pauses everything if free space drops under 300 GB, the other, after an internet outage, wakes up the indexers that would otherwise stay paused for up to 12 hours.",
      it: "Richiedi un film o un album da un'interfaccia web e il resto succede da solo: Seerr passa la richiesta alla famiglia *arr: Sonarr, Radarr o Lidarr (serie, film, musica), Prowlarr cerca, il download parte, Bazarr aggiunge i sottotitoli e Jellyfin lo mostra in salotto, transcodificato dalla grafica integrata del processore (la GPU grande resta all'AI). Download e libreria stanno sullo stesso disco, così importare un file vuol dire creare un hardlink, non copiare 40 GB. Due timer coprono i casi che le app non gestiscono: uno mette in pausa tutto se lo spazio scende sotto i 300 GB, l'altro, dopo un blackout della connessione, sblocca gli indexer che altrimenti resterebbero in pausa fino a 12 ore.",
    },
    tags: ["Jellyfin", "Sonarr", "Radarr", "Lidarr", "Prowlarr", "Bazarr", "Navidrome", "Intel QSV"],
    metrics: [
      { label: { en: "Services", it: "Servizi" }, value: "11" },
      { label: { en: "Import", it: "Import" }, value: "hardlink" },
      { label: { en: "Back after an outage", it: "Ripresa dopo un blackout" }, value: "15 min" },
    ],
  },
  {
    id: "homelab-containers",
    title: {
      en: "Containers, and just enough serverless",
      it: "Container, e quel poco di serverless che serve",
    },
    description: {
      en: "One Compose file per stack, all in git, all with explicit versions. Renovate opens the PRs, waits 3 days for anyone to report trouble with the new release, then merges minors and patches on its own if CI passes; majors wait for me. CI checks more than syntax: every bash script must have pipefail and every scheduled job a timeout, two mistakes that once cost me a whole night. The serverless part is small on purpose: the decoy uploads its data to Object Storage with the VM's own identity, no stored keys, and this site reads it at build time.",
      it: "Un file Compose per stack, tutti in git, tutti con versioni esplicite. Renovate apre le PR, aspetta 3 giorni che nessuno segnali problemi con la nuova versione, poi unisce da solo minor e patch se la CI passa; per le major chiede a me. La CI non controlla solo la sintassi: verifica che ogni script bash abbia pipefail e che ogni job pianificato abbia un timeout, due errori che mi erano costati un'intera notte. La parte serverless è piccola e voluta: la trappola carica i suoi dati su Object Storage con l'identità della VM, senza chiavi salvate, e questo sito li legge alla build.",
    },
    tags: ["Docker Compose", "Renovate", "GitHub Actions", "OCI Object Storage", "Vercel"],
    metrics: [
      { label: { en: "Stacks", it: "Stack" }, value: "16" },
      { label: { en: "Wait before updating", it: "Attesa prima di aggiornare" }, value: "72 h" },
      { label: { en: "Cloud keys on the VM", it: "Chiavi cloud sulla VM" }, value: "0" },
    ],
  },
  {
    id: "homelab-automation",
    title: {
      en: "Automations: the night shift works, I sleep",
      it: "Automazioni: la notte lavora, io dormo",
    },
    description: {
      en: "Every night, in order: system updates, container updates (only to versions already approved in git, and an image tagged latest gets flagged instead of applied), backups, CVE scan, tests. 26 alert rules reach my phone through ntfy: disk full, a backup older than 30 hours, fixable CVEs, containers killed for memory, uncommitted changes on the server. For every alert a small service pulls the last logs from Loki, has a local AI model read them and sends a second message with the likely cause. And since an alerting system that dies quietly is worse than none, an outside service checks that the monitoring is alive.",
      it: "Ogni notte, in ordine: aggiornamenti di sistema, aggiornamento dei container (solo alle versioni già approvate in git, e se un'immagine è latest lo segnala invece di applicarla), backup, scansione CVE, test. 26 regole di allarme arrivano sul telefono via ntfy: disco pieno, backup più vecchio di 30 ore, CVE correggibili, container uccisi per memoria, modifiche non committate sul server. Per ogni allarme un piccolo servizio prende gli ultimi log da Loki, li fa leggere a un modello AI locale e manda un secondo messaggio con la causa probabile. E siccome un sistema di allarmi che muore in silenzio è peggio di nessun allarme, un servizio esterno controlla che il monitoraggio sia vivo.",
    },
    tags: ["systemd", "Prometheus", "Grafana", "Loki", "ntfy", "Home Assistant", "Gemma"],
    metrics: [
      { label: { en: "Alert rules", it: "Regole di allarme" }, value: "26" },
      { label: { en: "Scheduled jobs", it: "Job pianificati" }, value: "13" },
      { label: { en: "Failed job detected", it: "Job fallito rilevato" }, value: "~2 min" },
    ],
  },
  {
    id: "project-3",
    title: {
      en: "Serverless CI/CD Pipeline",
      it: "Pipeline CI/CD serverless",
    },
    description: {
      en: "I designed a fully serverless CI/CD pipeline on AWS with CodePipeline, CodeBuild and Lambda. Builds, tests and deploys run on their own, and when nothing is building, nothing is billed.",
      it: "Ho progettato una pipeline CI/CD tutta serverless su AWS, con CodePipeline, CodeBuild e Lambda. Build, test e deploy automatici, e quando non gira nessuna build non si paga niente.",
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
    id: "project-5",
    title: {
      en: "GitOps Delivery Platform",
      it: "Piattaforma di delivery GitOps",
    },
    description: {
      en: "An internal developer platform on Argo CD: teams onboard themselves through app-of-apps and ApplicationSets, and releases go out gradually (canary or blue-green) with Argo Rollouts, rolling back on their own when the metrics turn bad.",
      it: "Una piattaforma interna su Argo CD: i team si aggiungono da soli con app-of-apps e ApplicationSets, e i rilasci escono un po' alla volta (canary o blue-green) con Argo Rollouts, che torna indietro da solo se le metriche peggiorano.",
    },
    tags: ["GitOps", "Argo CD", "Kubernetes", "Helm", "Argo Rollouts"],
    imageUrl: PROJECT_IMAGES["project-5"],
    imageHint: "gitops reconciliation flow",
    githubUrl: "https://github.com/0xtvignoli",
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
      it: "Gateway di inferenza LLM",
    },
    description: {
      en: "A self-hosted inference gateway that speaks the OpenAI API and serves open models with vLLM. Continuous batching, a semantic cache so the same question isn't paid for twice, token budgets per tenant and cost tracked down to the token.",
      it: "Un gateway di inferenza self-hosted che parla l'API di OpenAI e serve modelli aperti con vLLM. Continuous batching, una cache semantica per non pagare due volte la stessa domanda, budget di token per tenant e costi tracciati fino al singolo token.",
    },
    tags: ["LLMOps", "vLLM", "Python", "FastAPI", "Redis", "GPU"],
    imageUrl: PROJECT_IMAGES["project-6"],
    imageHint: "llm inference gateway architecture",
    githubUrl: "https://github.com/0xtvignoli",
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
      it: "FinOps per Kubernetes",
    },
    description: {
      en: "Cost allocation and rightsizing on OpenCost and Karpenter: showback dashboards per team, rightsizing advice from VPA, and spot instances orchestrated so the bill went down without breaking the SLOs.",
      it: "Allocazione dei costi e rightsizing con OpenCost e Karpenter: dashboard di showback per team, consigli di rightsizing da VPA e istanze spot orchestrate in modo da abbassare la fattura senza sforare gli SLO.",
    },
    tags: ["FinOps", "OpenCost", "Karpenter", "Kubernetes", "Grafana"],
    imageUrl: PROJECT_IMAGES["project-7"],
    imageHint: "cloud cost optimization dashboard",
    githubUrl: "https://github.com/0xtvignoli",
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
      it: "Gateway di inferenza per agenti",
    },
    description: {
      en: "The inference gateway as a pay-per-use endpoint for agents, through Cloudflare's Monetization Gateway (x402). An agent calls it with no API key and no account: it gets an HTTP 402 with the price, pays in stablecoin and receives the answer. Payment lands straight in my wallet, and a semantic-cache hit costs less.",
      it: "Il gateway di inferenza come endpoint a consumo per gli agenti, tramite il Monetization Gateway di Cloudflare (x402). Un agente lo chiama senza API key e senza account: riceve un HTTP 402 con il prezzo, paga in stablecoin e ottiene la risposta. Il pagamento arriva direttamente sul mio wallet, e una risposta dalla cache semantica costa meno.",
    },
    tags: ["x402", "Cloudflare", "LLMOps", "vLLM", "Agents", "Monetization"],
    imageUrl: PROJECT_IMAGES["project-8"],
    imageHint: "agent micropayment x402 flow",
    githubUrl: "https://github.com/0xtvignoli",
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
      it: "Margine per ogni richiesta",
    },
    description: {
      en: "A FinOps dashboard that works out the profit on every API call: x402 revenue for the request minus what it cost to serve (OpenCost allocation plus tokens and GPU), split by endpoint, model and tenant. Monitoring always showed the cost side; this adds the other half of the ledger.",
      it: "Una dashboard FinOps che calcola il guadagno su ogni chiamata API: ricavo x402 della richiesta meno quanto è costato servirla (allocazione OpenCost più token e GPU), diviso per endpoint, modello e tenant. Il monitoraggio ha sempre mostrato i costi; questa aggiunge l'altra metà del conto.",
    },
    tags: ["FinOps", "x402", "Observability", "Grafana", "OpenCost", "LLMOps"],
    imageUrl: PROJECT_IMAGES["project-9"],
    imageHint: "per-request margin revenue minus cost dashboard",
    githubUrl: "https://github.com/0xtvignoli",
    metrics: [
      { label: { en: "Margin", it: "Margine" }, value: "per-req" },
      { label: { en: "Attribution", it: "Attribuzione" }, value: "endpoint" },
      { label: { en: "Signal", it: "Segnale" }, value: "rev − cost" },
    ],
  },
];
