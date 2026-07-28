# Redesign UI completo – Focus Esperienza Lab

Documento di design per il redesign dell’interfaccia (Frontend + UX Architect + UI Designer).  
**Ordine:** 1) Disegni e validazione → 2) Implementazione.

---

## 1. Principi di design (dai tre ruoli)

| Ruolo | Principi applicati |
|-------|---------------------|
| **Frontend Developer** | Core Web Vitals, WCAG 2.1 AA, mobile-first, target 44px, riduzione motion rispettata |
| **UX Architect** | Design system (variabili CSS, scale tipografia/spacing), theme light/dark/system, IA chiara |
| **UI Designer** | Design tokens, gerarchia visiva, contrasto 4.5:1, component library coerente |

---

## 2. Design system (token)

- **Colori**: primary cyan (#00b4d8 / #00d9ff dark), accent violet (#7b2cbf / #a855f7 dark), semantic success/warning/error.
- **Tipografia**: headline (Space Grotesk o var(--font-headline)), body (Inter/system), mono (Source Code Pro) per terminale e codice.
- **Spacing**: scala 4px (4, 8, 12, 16, 24, 32, 48, 64).
- **Radius**: --radius (card), --radius-pill (chip, toggle).
- **Theme**: light / dark / system, toggle sempre in header.

---

## 3. Pagine e wireframe

### 3.1 Home (marketing)

Obiettivo: dare risalto al Lab come “mission console” e mantenere coerenza con il resto del sito.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] DevOps Folio    Dashboard  Portfolio  Experience  Articles  Lab  [🌐][☀]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│              [ Senior DevOps Engineer ]                                     │
│                                                                             │
│                    { Titolo hero }                                          │
│              { Sottotitolo }                                                 │
│                                                                             │
│        [ Portfolio ]    [ Explore Lab ]    [ Contact ]                       │
│                         ^^^^^^^^^^^^^^                                      │
│                         CTA secondario ma ben visibile                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Skills:  [Terraform] [K8s] [Helm] [Docker] ...                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Portfolio          [View all →]                                            │
│  ┌──────────────────────┐ ┌──────────────────────┐                          │
│  │ Project 1            │ │ Project 2            │                          │
│  └──────────────────────┘ └──────────────────────┘                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Experience (timeline)                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Articles           [View all →]                                            │
│  ┌──────────────────────┐ ┌──────────────────────┐                          │
│  │ Article 1            │ │ Article 2            │                          │
│  └──────────────────────┘ └──────────────────────┘                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Contact                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Modifiche proposte:**  
- CTA “Explore Lab” con icona terminale e stile “primary” o “secondary” forte.  
- Eventuale breve blocco “Try the Lab” sotto l’hero (titolo + una riga + link “Open Lab →”) per dare ancora più focus all’esperienza Lab.

---

### 3.2 Entry Lab (`/lab`) – Layout selector

Obiettivo: scelta layout chiara e immediata, senza distrazione.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] ...    Dashboard  Portfolio  Experience  Articles  Lab  [🌐][☀]      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Breadcrumb:  Lab                                                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [ Standard ]    [ Immersive ]     ← toggle in alto a destra (fixed) │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  (contenuto secondo layout scelto)                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Modifiche proposte:**  
- Toggle Standard/Immersive resta in alto a destra; aggiungere label “Layout” e icone (LayoutGrid / Terminal).  
- Breadcrumb sempre visibile; sotto il breadcrumb nessun titolo ripetuto se non nel contenuto del layout.

---

### 3.3 Lab – Layout STANDARD (Mission Console)

Obiettivo: “command-first” chiaro, metriche in evidenza, flusso: Terminale → Mission Control → Metriche → Pipeline/Cluster/Incidenti.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] ...    Dashboard  Portfolio  Experience  Articles  Lab  [🌐][☀]      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Breadcrumb: Lab                                                             │
│                                                                             │
│        Live Control Room    [ ? ]  [ Tour ]                                 │
│        ────────────────                                                     │
│        Lab                                                                   │
│        This is your mission console. Every visualization and deployment     │
│        is driven from the terminal.                                         │
│        [ CPU 42% ]  [ P95 120ms ]  [ 3 deploys · 7d ]                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────┐  ┌────────────────────────────┐ │
│  │ Command-first Interface                │  │ Mission Control            │ │
│  │ Every interaction flows through the    │  │ Toggle automation, run      │ │
│  │ terminal.                              │  │ macros.                     │ │
│  │ [kubectl get pods] [describe pod] [...] │  │ [ Simulated env alert ]     │ │
│  │ ┌───────────────────────────────────┐  │  │ [ Auto-Chaos ] [Switch]     │ │
│  │ │ Connected · dev-cluster      live │  │  │ Cluster pulse    [ run ]   │ │
│  │ ├───────────────────────────────────┤  │  │ Canary 20%       [ run ]   │ │
│  │ │ $ _                                │  │  │ Blue/Green       [ run ]   │ │
│  │ │ (terminal output)                  │  │  │ Chaos · pods     [ run ]   │ │
│  │ │                                    │  │  │ Chaos · latency  [ run ]   │ │
│  │ └───────────────────────────────────┘  │  │                            │ │
│  └─────────────────────────────────────────┘  └────────────────────────────┘ │
│                                                                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │ CPU Usage  │ │ Memory     │ │ API P95    │ │ Deploys    │               │
│  │ 42%        │ │ 12/32 GB   │ │ 120ms      │ │ 3 Success  │               │
│  │ [chart]    │ │ [chart]    │ │ [chart]    │ │ [chart]    │               │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘               │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Incident History                                                      │  │
│  │ (tabella / lista eventi)                                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Container Orchestration (Kubernetes cluster viz)                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Visual Deploy Pipeline                                                │  │
│  │ [stages]  +  [Canary Analysis se paused]                              │  │
│  │ [ Promote Canary ]  [ Rollback ]  oppure  [ Run Deployment ]           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Modifiche proposte (Standard):**  
- **Hero Lab:** un solo blocco compatto (Live Control Room + titolo + descrizione + chip metriche).  
- **Grid 2fr + 1fr:** sinistra Terminale (quick actions + status + InteractiveTerminal), destra Mission Control (alert, Auto-Chaos, playbook).  
- **Metriche:** 4 card in una riga (stessa struttura), con numeri grandi e chart piccoli; su mobile stack verticale.  
- **Incident History:** una card full-width.  
- **Cluster:** una card full-width.  
- **Pipeline:** una card full-width con stage, Canary (se applicabile), CTA Promote/Rollback o Run Deployment.  
- **Accessibilità:** heading gerarchia (h1 Lab, h2 per sezioni), aria-live per notifiche, focus visible su tutti i controlli.

---

### 3.4 Lab – Layout IMMERSIVE

Obiettivo: feeling “control room” a tutto schermo: barra superiore con metriche live, sidebar sinistra per Cluster/Pipeline/Metrics, area centrale/terminale e pannello inferiore espandibile.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Terminal] dev.tvignoli.com  [LIVE]    CPU 42%  MEM 38%  P95 120ms  [ ? ][Tour]│
├────────────────────────────┬────────────────────────────────────────────────┤
│  [ Cluster ][ Pipeline ][ Metrics ]                                          │
│  ─────────────────────────────────                                          │
│  (tab attivo: Cluster)                                                       │
│  ┌────────────────────────────────┐                                         │
│  │  Kubernetes Cluster            │                                         │
│  │  (nodi + pods)                 │         (Area centrale:                 │
│  │                                │          eventuale dettaglio o            │
│  │  oppure Pipeline / Metrics     │          messaggio “Run a command”)       │
│  └────────────────────────────────┘                                         │
│                            │                                                 │
├────────────────────────────┴────────────────────────────────────────────────┤
│  [ get pods ] [ helm list ] [ deploy ] [ chaos:pod ] [ chaos:latency ] [ chaos:cpu ] │
├─────────────────────────────────────────────────────────────────────────────┤
│  [ Terminal ▼ ]  (pannello espandibile)                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Connected · dev-cluster      live                                     │  │
│  │ $ _                                                                    │  │
│  │ (output)                                                                │  │
│  └───────────────────────┬─────────────────────────────────────────────┤  │
│  │ Incident History (ultimi N) [ Expand ]                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Modifiche proposte (Immersive):**  
- **Top bar:** sempre: hostname, LIVE, CPU/MEM/P95, Help, Tour. Altezza fissa (~56px), font mono per numeri.  
- **Sidebar sinistra:** tab Cluster | Pipeline | Metrics; contenuto a scorrimento; in Pipeline mostrare anche Canary e pulsanti Promote/Rollback/Run quando applicabile.  
- **Area centrale:** può mostrare messaggio contestuale (“Select a resource” / “Run a command to see output”) o dettaglio selezionato; su desktop ampia.  
- **Quick bar:** una riga di pill con comandi rapidi (get pods, helm list, deploy, chaos:pod, chaos:latency, chaos:cpu).  
- **Bottom panel:** espandibile/collassabile; sopra Terminale, sotto anteprima Incident History con link “Expand” che apre lista completa (o slide-over).  
- **Colori:** glass panel coerenti con design system; metriche “warning” (es. CPU >70%) con colore semantic.

---

### 3.4b Lab – Layout IMMERSIVE (variante Geek)

Obiettivo: estetica “hacker/ops terminal”: schermo pieno a tiled split, font monospace ovunque, bordi ASCII/linee, status bar in basso, palette scura con accenti verde terminale o ambra. Sensazione di “mission control” o IDE/terminal multiplexer.

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║ > dev.tvignoli.com │ LIVE │ cpu:42% mem:38% p95:120ms │ 14:32:05 UTC │ [?][⌘K] ║
╠════════════════════════════════════════════╦══════════════════════════════════╣
║ cluster                                    ║  pipeline                         ║
║ ┌─── node-1 ───┐  ┌─── node-2 ───┐         ║  [build]──►[test]──►[canary]──►   ║
║ │ api-xyz  ●   │  │ api-abc  ●   │         ║   ●         ●         ○           ║
║ │ web-1    ●   │  │ web-2    ●   │         ║                                  ║
║ └──────────────┘  └──────────────┘         ║  [ Promote ] [ Rollback ]       ║
║────────────────────────────────────────────╫──────────────────────────────────║
║ $ kubectl get pods                          ║  incidents                       ║
║ NAME     READY   STATUS    RESTARTS         ║  pod_failure   resolved   2m ago  ║
║ api-xyz  1/1     Running   0                ║  latency       resolved   5m ago ║
║ api-abc  1/1     Running   0                ║  cpu_spike     active     --      ║
║ web-1    1/1     Running   0                ║                                  ║
║ web-2    1/1     Running   0                ║                                  ║
║ _                                         ║                                  ║
╠════════════════════════════════════════════╩══════════════════════════════════╣
║ get pods │ helm list │ deploy --weight=20 │ chaos:pod │ chaos:latency │ chaos:cpu ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ # dev-cluster │ 4 pods │ 2 nodes │ deploy: idle │ chaos: 1 active               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

**Scelte di design (Geek):**

- **Bordi:** caratteri box-drawing (╔═╗║╚╝) o linee sottili `border: 1px solid` per un look “terminale / TUI”.
- **Tipografia:** 100% monospace (es. JetBrains Mono, Fira Code, Source Code Pro) per header, metriche, terminale e label pannelli.
- **Palette:** sfondo molto scuro (#0d1117 / #161b22), testo principale #c9d1d9, accento primario verde terminale #3fb950 o ambra #d29922; LIVE e metriche ok in verde, warning in ambra, error in rosso tenue.
- **Top bar:** una sola riga compatta: hostname, LIVE, metriche separate da `|`, timestamp (opzionale), shortcut “⌘K” per command palette / help.
- **Layout a tile:** split verticale (es. 50/50 o 40/60): sinistra = cluster + terminale (stack verticale), destra = pipeline + incident history (stack verticale). Oppure 3 colonne: cluster | terminale | pipeline+incidents. Resize opzionale con divider.
- **Terminale:** occupa un riquadro fisso (non solo bottom drawer); prompt `$` o `>`, output a scroll; nessun bordo arrotondato, aspetto “puro” terminal.
- **Quick bar:** stessa riga di comandi ma stilizzata come “command bar” (sfondo leggermente diverso, separatori `|`).
- **Status line (footer):** una riga in basso con info di contesto: cluster name, numero pod/nodi, stato deploy, chaos attivi. Stile status line di vim/tmux.
- **Accessibilità:** mantenere contrasto WCAG AA; focus visible con bordo colorato (es. verde); ridurre motion per animazioni; screen reader con aria-label su ogni pannello.

**Riepilogo variante Geek:**

| Elemento        | Standard Immersive | Geek Immersive                          |
|-----------------|--------------------|------------------------------------------|
| Font            | Mixed              | Solo monospace                           |
| Bordi           | Arrotondati/glass  | Lineari / box-drawing                    |
| Palette         | Cyan/glass         | Verde/ambra su dark, stile terminale     |
| Layout          | Sidebar + centrale | Tiled split (2–3 colonne)                |
| Status          | In top bar         | Status line in footer                    |
| Terminale       | Pannello sotto     | Pannello a tile (sinistra o centro)      |

---

### 3.5 Dashboard (`/dashboard`)

Obiettivo: collegare il Lab alla gamification (XP, achievements, challenges) senza cambiare la struttura attuale; solo coerenza visiva.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] ...    Dashboard  Portfolio  Experience  Articles  Lab  [🌐][☀]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│        Developer Journey Dashboard                                          │
│        Track progress, unlock achievements, level up.                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  (GamificationDashboard: progress bar, achievements, challenges,     │   │
│  │   actions incluso "Explore Lab" → /lab)                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Modifiche proposte:**  
- Stesso header e stile card/glass del resto del sito.  
- CTA “Explore Lab” ben visibile nelle azioni.  
- Nessun cambio strutturale forte; solo token e tipografia allineati al redesign.

---

## 4. Riepilogo modifiche per pagina

| Pagina | Focus | Modifiche principali |
|--------|--------|-----------------------|
| **Home** | Lab come CTA | “Explore Lab” in evidenza; eventuale blocco “Try the Lab”. |
| **Lab entry** | Chiarezza | Toggle layout con label e icone; breadcrumb. |
| **Lab Standard** | Mission console | Hero compatto, grid Terminal + Mission Control, 4 metriche, poi Incidenti / Cluster / Pipeline. |
| **Lab Immersive** | Terminal/TUI (geek) | Tiled split: cluster+terminale | pipeline+incidents; 100% monospace; status line footer; full-screen. |
| **Dashboard** | Coerenza | Stesso design system; CTA Lab nelle azioni. |

---

## 5. Accessibilità e performance (checklist)

- **WCAG 2.1 AA:** contrasto testo/sfondo ≥ 4.5:1 (testo normale), ≥ 3:1 per testo grande; focus visible su tutti i controlli.  
- **Keyboard:** navigazione completa (tab, invio, spazio); skip link “Skip to main content” dove previsto.  
- **Screen reader:** heading hierarchy (un h1 per pagina), aria-live per messaggi dinamici (pipeline, incidenti, metriche), label su pulsanti e tab.  
- **Motion:** rispettare `prefers-reduced-motion: reduce` (transizioni minime o assenti).  
- **Touch:** target minimo 44×44 px per link e pulsanti.  
- **Performance:** lazy load per chart e componenti pesanti del Lab; code splitting per route Lab.

---

## 6. Mockup grafici (wireframe)

Sono stati generati due mockup wireframe per validazione visiva:

- **Lab Standard (Mission Console):**  
  `assets/redesign-lab-standard-wireframe.png`  
  Hero compatto, grid Terminale + Mission Control, riga di 4 metriche.

- **Lab Immersive (Control room):**  
  `assets/redesign-lab-immersive-wireframe.png`  
  Top bar con metriche live, sidebar Cluster/Pipeline/Metrics, quick bar, pannello terminale + incidenti.

- **Lab Immersive (layout attuale):** come sopra; implementazione = layout a tile (cluster+terminale | pipeline+incidents), font monospace, status line in footer.

---

## 7. Prossimi passi

1. **Validazione:** rivedere questo documento, i wireframe in sezione 3 e le immagini in `assets/` (Lab Standard e Immersive).
2. **Implementazione:** dopo il tuo OK, procedere con:  
   - eventuali aggiustamenti al design system in `globals.css`;  
   - refactor della Lab entry e del layout selector;  
   - refactor di Lab Standard (lab-client-page) e Lab Immersive (immersive-lab-layout);  
   - piccoli adattamenti su Home e Dashboard.

---

**Fine documento redesign. In attesa di validazione prima di implementare.**
