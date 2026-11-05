# Thomas Vignoli — portfolio

[![terraform-ci](https://github.com/0xtvignoli/my_devfolio/actions/workflows/terraform-ci.yml/badge.svg)](https://github.com/0xtvignoli/my_devfolio/actions/workflows/terraform-ci.yml)

> Every Terraform module in this repo is `validate`d and `plan`ned against a real AWS API — [floci](https://github.com/floci-io/floci), a local AWS emulator — in CI, with the VPC module fully `apply`d. No cloud account, no cloud spend.

Next.js (App Router) on Vercel behind Cloudflare, TypeScript, Tailwind v4, Bun. Static pages in English and Italian.

## Pages

| Route | What |
|---|---|
| `/` | Home: latest writing, selected work, experience, contact |
| `/articles`, `/articles/[slug]` | Articles, filterable by tag. Content in `src/data/content/articles.ts` |
| `/portfolio` | Projects with figures. Content in `src/data/content/projects.ts` |
| `/experience`, `/cv` | Same data; `/cv` prints to PDF |
| `/lab` | **Observatory**: aggregated, daily-updated data on what the internet sends to this site, plus case studies (articles tagged `Case study`) |

`/dashboard`, `/live` and `/shell` redirect to `/lab` (removed in the 11/2026 redesign).

## Design

Editorial: Newsreader (serif) for headings and long-form text, Inter for interface, JetBrains Mono for dates and code. White/ink with one cobalt accent, 1px rules instead of cards, light/dark following the system. Tokens in `src/app/globals.css`.

## Observatory

`scripts/observatory.ts` runs before every `next build`: it queries Cloudflare's HTTP analytics (last 14 days) and writes `src/data/observatory.json`.

- **Token**: Vercel env `CLOUDFLARE_ANALYTICS_TOKEN` (Zone → Analytics → Read, this zone only) and `CLOUDFLARE_ZONE_ID`. Without them, or if Cloudflare fails, the committed file is kept.
- **Daily refresh**: `.github/workflows/observatory.yml` calls a Vercel deploy hook (`VERCEL_DEPLOY_HOOK` repo secret) at 05:17 UTC.
- **Privacy and injection**: no IPs are queried; paths and user agents are reduced to labels from `src/lib/observatory/classify.ts` before anything is written.

## Development

```bash
bun install
cp .env.example .env.local   # everything optional: without keys the contact form falls back to mailto
bun run dev                  # http://localhost:9004
bun run test                 # unit tests
bun run test:e2e             # Playwright
bun run observatory          # refresh the Observatory data (needs the two Cloudflare variables)
```

## Security

- `scripts/cloudflare-apply-security.sh` applies the edge configuration: Bot Fight, AI Labyrinth, rate limit and the only write route (`/api/contact/send`); every other POST/PUT/PATCH/DELETE gets a 403 at the edge.
- CSP and security headers in `src/proxy.ts`.
- Dependabot weekly on `develop`.

## Deploy

`develop` → merge `--no-ff` into `main` → Vercel production deploy.
