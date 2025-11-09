# Thomas Vignoli - DevOps Engineer Portfolio

## About

Questo sito è un portfolio personale costruito con Next.js (App Router), TypeScript, Tailwind CSS e componenti shadcn/ui.
La codebase è ora suddivisa in due route group principali:

- `src/app/(marketing)` ospita le pagine statiche/SSR (home, portfolio, articoli, experience) e condivide layout, header e footer ottimizzati per server rendering.
- `src/app/(lab)` contiene il laboratorio interattivo con provider client-side dedicati (theme, gamification e simulazione).

## Technologies Used

This project is built with:

- **Next.js 15** con App Router, Server Actions e route groups `(marketing)/(lab)`
- **TypeScript** e **Bun** (installazioni con `bun install`, script con `bun run`)
- **Tailwind CSS** con design tokens neon ispirati a Flow Nexus
- **shadcn/ui / Radix UI** per i componenti interattivi
- **Next Image Optimization** e middleware per host-based routing
- **Vercel Analytics & Speed Insights** per osservabilità

## Development

### Prerequisites

- Node.js 20+ (coerente con ambiente Vercel)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my_devfolio
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```
   Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **Start the development server**
   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9004` to view the application.

### Available Scripts

- `bun run dev` - Avvia dev server (Turbopack)
- `bun run build` - Build per produzione
- `bun run start` - Avvia server produzione (usa .next)
- `bun run lint` - Esegue ESLint
- `bun run typecheck` - Controllo statico dei tipi
- `bun run test` - Test unitari e di integrazione

## Deployment

Questo sito è deployato su Vercel con un dominio personalizzato. Il deployment è automaticamente attivato con i push sul branch principale. Non impostare manualmente la Output Directory (usa `.next`). Rimuovere eventuali valori “dist” nelle impostazioni del progetto.

## Features

- **Server-first rendering** - Le pagine marketing sono SSR/SSG, il lab vive in un gruppo client isolato
- **Locale management** - Cookie `locale` bootstrap via middleware, switch con Server Action (`setLocaleAction`) e refresh
- **Design Flow Nexus** - Palette neon (`--bg-primary`, `--neon-accent`, glow) e CTA stile command panel
- **Responsive Design** - Ottimizzato per mobile con layout a colonne singole e componenti dinamici
- **Analytics & Lab Tools** - Integrazione con Vercel Analytics e simulatore osservabilità interattivo

## Contact

Per richieste professionali, si prega di contattare attraverso le informazioni fornite sul sito web.

## License

This project is private and proprietary.

## Notes

Il precedente setup Vite è stato sostituito da Next.js; file come `index.html` non sono più necessari per il deploy su Vercel. La pipeline utilizza Bun per tutte le installazioni/build.
