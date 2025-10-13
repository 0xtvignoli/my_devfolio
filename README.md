# Thomas Vignoli - DevOps Engineer Portfolio

## About

Questo sito è un portfolio personale costruito con Next.js (App Router), TypeScript, Tailwind CSS e componenti shadcn/ui.

## Technologies Used

This project is built with:

- **Next.js** (SSR/SSG, App Router)
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui / Radix UI** - Component library
- **React Query (TanStack Query)** - Data fetching and caching
- **Next Image Optimization** - Image optimization for faster loading
- **Vercel Analytics & Speed Insights** - Web analytics and performance monitoring

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
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```
   Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9004` to view the application.

### Available Scripts

- `npm run dev` - Avvia dev server (Turbopack)
- `npm run build` - Build per produzione
- `npm run compile` - Alias per build
- `npm run start` - Avvia server produzione (usa .next)
- `npm run typecheck` - Controllo dei tipi
- `npm run lint` - Esegui ESLint
- `npm test` - Esegui test con Jest

## Deployment

Questo sito è deployato su Vercel con un dominio personalizzato. Il deployment è automaticamente attivato con i push sul branch principale. Non impostare manualmente la Output Directory (usa `.next`). Rimuovere eventuali valori “dist” nelle impostazioni del progetto.

## Features

- **Responsive Design** - Ottimizzato per tutte le dimensioni dei dispositivi
- **Performance Optimized** - Caricamento veloce con Vite e risorse ottimizzate
- **SEO Friendly** - Meta tag e dati strutturati appropriati
- **Analytics** - Integrazione con Vercel Analytics e Speed Insights
- **Modern UI** - Design pulito e professionale con componenti shadcn/ui

## Contact

Per richieste professionali, si prega di contattare attraverso le informazioni fornite sul sito web.

## License

This project is private and proprietary.

## Notes

Il precedente setup Vite è stato sostituito da Next.js; file come `index.html` non sono più necessari per il deploy su Vercel.
