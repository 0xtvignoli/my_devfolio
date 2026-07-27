# mini-lab

A tiny backend that lets the site's lab terminal run a **curated set of commands
against a real (emulated) AWS** — [floci](https://github.com/floci-io/floci) —
isolated per visitor. The "Killercoda-style, but self-hosted and free" piece.

## How it stays safe

- **No arbitrary execution.** The client sends only an `action` key; the server
  maps it to a **fixed argv sequence** from [`actions.mjs`](./actions.mjs) and
  runs it via `spawn()` — never a shell, never user text in a command.
- **Per-session isolation.** Each session gets a random 12-digit account id;
  floci gives every account id its own isolated AWS state. One floci serves many
  visitors — no container-per-session.
- **floci only.** Every command targets floci with dummy creds. No real cloud,
  no credentials, no cloud spend.
- Input validation (accountId must be 12 digits), per-command timeout, per-IP
  rate limit, tiny body cap.

## Run locally

```bash
# 1. floci (the emulator)
docker run -d --name floci -p 4566:4566 \
  -v /var/run/docker.sock:/var/run/docker.sock -u root floci/floci:latest

# 2. the backend (needs aws-cli on PATH)
node server.mjs        # → http://localhost:8080
```

```bash
# try it
A=$(curl -s -XPOST localhost:8080/session | jq -r .accountId)
curl -s -XPOST localhost:8080/run -d "{\"accountId\":\"$A\",\"action\":\"create-vpc\"}"
curl -s -XPOST localhost:8080/run -d "{\"accountId\":\"$A\",\"action\":\"list-vpcs\"}"
```

## Deploy (a box you own — not Vercel)

```bash
ALLOWED_ORIGIN=https://tvignoli.com docker compose up -d --build
```

Then point the site at it: set `NEXT_PUBLIC_MINILAB_URL` to the backend's public
URL. If unset, the site falls back to the fully-simulated lab — it never breaks.

Put a reverse proxy (Caddy/Cloudflare) in front for TLS + extra rate limiting.

## Endpoints

| Method | Path       | Purpose                                  |
|--------|------------|------------------------------------------|
| POST   | `/session` | Allocate an isolated session account id  |
| POST   | `/run`     | Run an allowlisted action, stream output |
| GET    | `/actions` | List available actions                   |
| GET    | `/health`  | Health check                             |

## Known ceiling

floci state is in-memory, so session accounts accumulate over time. For low
traffic this is fine; restart floci on a schedule (or cap concurrent sessions)
if memory grows. Upgrade path: floci-per-N-sessions, or evict idle accounts.
