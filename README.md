# Thomas Vignoli - DevOps Engineer Portfolio

## About

Personal portfolio of Thomas Vignoli, DevOps Engineer specialized in Terraform, AWS, Azure, Kubernetes, and CI/CD.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui + Radix UI
- React 18

## Development

### Prerequisites

- Node.js 20.x
- npm ≥10 (or yarn/pnpm/bun)

### Getting Started

1. Clone the repository

   ```bash
   git clone <your-repo-url>
   cd my_devfolio
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the development server (Turbopack)
   ```bash
   npm run dev
   # The script will pick a free port starting from 9002 and print it in the console
   ```

### Available Scripts

- `npm run dev` - Start Next.js dev server (Turbopack)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type-check
- `npm run format` - Prettier format (requires prettier installed)

## Environment

Create a `.env.local` for local development. Client-exposed variables must be prefixed with `NEXT_PUBLIC_`.

Recommended variables:

- `NEXT_PUBLIC_SITE_URL` — Absolute site URL used in metadata/JSON-LD (e.g., `https://example.com`).

Notes:

- JSON-LD Person structured data is injected in `src/app/layout.tsx` and uses `NEXT_PUBLIC_SITE_URL` as the canonical `url`.
- Never commit secrets. Only expose values with the `NEXT_PUBLIC_` prefix if they are safe for clients.

## Deployment

This project can be deployed to Vercel or Firebase App Hosting. Choose one and configure:

- Vercel: connect the repo and set build command to `next build` and output `.next` (or `dist` if customized).
- Firebase App Hosting: see `apphosting.yaml` and follow Firebase docs.

## SEO/Analytics

OpenGraph/Twitter metadata are defined in `src/app/layout.tsx`. Replace placeholder domain and images with real ones.

## License

Private repository.
