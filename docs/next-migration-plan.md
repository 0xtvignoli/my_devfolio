# Next.js Migration & Experience Blueprint

## Objectives
- Reorganize the app into clear route groups so marketing pages stay server-rendered while the Lab lives inside an opt-in client boundary.
- Implement cookie-based locale resolution that works on the server (SSR/SSG) and still allows instant language switching on the client.
- Move long-form content to Contentlayer-powered MDX for better authoring and type safety.
- Adopt a Flow Nexus–inspired design language with mobile-first constraints and Bun as the enforced package manager for every workflow.

## Information Architecture
```
src/app
├─ layout.tsx                 # server, wraps Providers shell & sets html lang
├─ middleware.ts              # locale cookie bootstrap, cache headers
├─ (marketing)/
│  ├─ layout.tsx              # server component, pulls translations server-side
│  ├─ page.tsx                # Home (SSR/SSG)
│  ├─ articles/
│  │  ├─ page.tsx             # Article index (static)
│  │  └─ [slug]/
│  │     ├─ page.tsx          # `generateStaticParams` via Contentlayer
│  │     └─ metadata.ts
│  ├─ portfolio/page.tsx
│  └─ experience/page.tsx
├─ (lab)/
│  ├─ layout.tsx              # `'use client'`; mounts Theme + Gamification + Lab stores
│  └─ lab/page.tsx            # dynamic charts/terminal (lazy-loaded islands)
└─ api/
   └─ contact/route.ts        # server action target (email/webhook)
```
- Shared UI parts (`Header`, `Footer`, `LocaleSwitcher`, `ThemeToggle`) become server components that receive translation data from the marketing layout. Only small client islands (theme toggle, locale switcher) hydrate.
- The Lab keeps its own layout to avoid shipping heavy stores/charts to marketing routes.

## Locale & SSR Strategy
1. **Locale resolution**
   - `resolveLocale()` (in `src/lib/i18n/server.ts`) reads `cookies().get('locale')` and falls back to `headers().get('accept-language')`. Default: `en`.
   - `setLocaleAction(locale)` is a server action triggered by the client `LocaleSwitcher`. It mutates the `locale` cookie (1-year TTL) and revalidates the current path.
2. **Translations delivery**
   - `getTranslations(locale)` returns typed copy (`translations[locale]`). Marketing layout injects `{ locale, t }` into context via a lightweight server-only provider or simply passes props to sections.
   - Client components that truly need runtime locale (e.g., terminal logs) receive `locale` via props. The existing context shrinks to a minimal client hook for the Lab only.
3. **Middleware**
   - When no `locale` cookie exists, detect preferred language and `NextResponse.next()` with `Set-Cookie` so first render already matches the target locale.

## Content Pipeline Choice
- **Decision**: Adopt **Contentlayer** for articles/projects because it:
  - Compiles MDX to typed JSON at build time (ideal for SSG/ISR).
  - Supports localized frontmatter (`title.it`, `title.en`) and rich components (custom callouts, code blocks).
  - Plays well with Bun + Next 15 (uses the same ESM pipeline).
- JSON “stubs” continue for quick fixtures, but canonical content (articles, case studies, hero copy) lives inside `content/` MDX and is re-exported via Contentlayer.
- Add `bun contentlayer build` to the build pipeline and watch command for local authoring.

## Lab Segmentation & State
- `(lab)/layout.tsx` imports the theme + gamification providers (client). Marketing layout no longer hydrates those providers.
- Gamification and simulation logic move into two Zustand stores (`useGamificationStore`, `useLabStore`) colocated in `src/features/lab/state/`. Heavy charts (`CpuUsageChart`, etc.) load with `next/dynamic` and `suspense`.
- Lab page uses route-level `metadata` + `viewport` tuned for mobile (locked 60fps animations, reduced layout shifts).

## Flow Nexus–Inspired Design Tokens
Define tokens in `src/styles/tokens.css` and expose via Tailwind config (`theme.extend.colors`):

| Token                | Value            | Notes |
|----------------------|------------------|-------|
| `--bg-primary`       | `#010b10`        | Deep space backdrop |
| `--bg-secondary`     | `#021d1b`        | Card surfaces |
| `--accent`           | `#00f28a`        | Primary neon |
| `--accent-muted`     | `#04c267`        | Hover/focus states |
| `--accent-gradient`  | `linear-gradient(135deg,#00f28a,#00b4d8)` | Buttons, command panels |
| `--text-primary`     | `#e6fff2`        | Body text |
| `--text-muted`       | `#7ad9b6`        | Secondary copy |
| `--glow-soft`        | `0 0 40px rgba(0,242,138,0.25)` | Outer glows |
| `--radius-pill`      | `999px`          | CTA buttons |

Additional guidance:
- Apply subtle scan-line/background-noise SVGs to hero sections (mask-image) to echo Flow Nexus texture.
- CTA buttons become `CommandPanel` components with icon + copy button + optional code snippet (mirrors Flow Nexus terminal CTA).
- Mobile first: convert all multi-column grids (skills, project cards, lab stats) into horizontal carousels on ≤768px via `embla-carousel-react`.
- Accessibility: ensure minimum 4.5:1 contrast and add neon outline focus state (`outline: 2px solid var(--accent)`).

## Execution Checklist (Bun-first)
1. **Scaffold route groups**  
   - Move marketing pages into `(marketing)/`.  
   - Create `(lab)/layout.tsx` and migrate Lab providers there.  
   - Update `package.json` scripts to reference Bun (`"dev": "bun next dev ..."`, already in place—enforce via docs/CI).
2. **Implement locale utilities & middleware**  
   - Add `src/lib/i18n/server.ts`, `src/actions/locale.ts`.  
   - Replace `useLocale` usage in server components with props derived from `resolveLocale()`.
3. **Integrate Contentlayer**  
   - `contentlayer.config.ts`, `content/` directory, MDX migrations, `bun contentlayer build` hook.
4. **Lab refactor**  
   - Extract Zustand stores, convert charts to `next/dynamic`, ensure responsive layouts + motion guards.
5. **Design token rollout**  
   - Add CSS variables + Tailwind theme extensions.  
   - Update hero/CTA components to use neon gradients & command panels.  
   - Refresh README with Bun workflow + design reference.

Each checklist item becomes its own PR/work chunk to keep reviews focused. With this blueprint approved, we can start implementing immediately. 
