# Monetization Gateway — x402 scaffold

Infrastructure-as-code scaffold that wires **agent-native, pay-per-request
monetization** onto the [Agent-Native Inference Gateway](../../src/data/content/projects.ts)
using Cloudflare's **Monetization Gateway** (the [x402](https://x402.org) protocol)
and, for crawlers, **Pay Per Crawl**.

It is the Phase 2 companion to the article
_"Getting Paid by Machines: Monetizing APIs with x402 and Pay Per Crawl"_.

## Status

Both Cloudflare products are early access:

- **Pay Per Crawl** — private beta (fiat, Cloudflare as Merchant of Record).
- **Monetization Gateway / x402** — waitlist (stablecoin, peer-to-peer settlement).

So this module is a **scaffold**: the observability marker deploys today; the
actual charging rule is staged (commented) until the Gateway resource ships.
The point is to be ready — variables, pricing model, and match logic are done.

## The x402 model in one paragraph

A client requests a gated resource with **no API key and no account**. The edge
answers `402 Payment Required` with the price, the accepted asset, and a payment
destination. The client pays in stablecoin and retries with proof; the edge
verifies and returns `200`, settling **peer-to-peer straight to your wallet**.
Enforcement happens at Cloudflare's edge, so your origin never sees unpaid
traffic or the payment machinery.

## Pre-payment vs metered billing (why pricing is tiered)

x402 is **pre-payment** — you pay, then you get the response. But LLM inference
is billed **after** the fact, per output token, which you can't know in advance.
This module reconciles that with **deterministic tiers**: price by `(model,
max_tokens)` tier via `price_tiers`, plus a `cache_hit_discount` so answers
served from the semantic cache cost a fraction of the cold price. For true
usage-based billing, enable the optional Web Bot Auth identity layer (see the
staged resource in `main.tf`) and settle post-paid against a verified agent.

## Files

| File | Purpose |
|------|---------|
| `versions.tf` | Terraform + Cloudflare provider (`~> 5`) constraints; token from env |
| `variables.tf` | Zone, hostname, gated path, wallet, price tiers, cache discount |
| `main.tf` | Locals (pricing/match), deployable observability marker, staged x402 rule |
| `outputs.tf` | Monetized endpoint, price book (cold + cache-hit), settlement config |
| `terraform.tfvars.example` | Copy to `terraform.tfvars` and fill in (git-ignored) |

## Usage

```bash
# 1. Provide the token via the environment — never in a file.
export TF_VAR_cloudflare_api_token="<your-cloudflare-api-token>"

# 2. Configure inputs.
cp terraform.tfvars.example terraform.tfvars
$EDITOR terraform.tfvars

# 3. Plan / apply.
terraform init
terraform plan
terraform apply
```

## Security

- The API token is `sensitive` and read from `TF_VAR_cloudflare_api_token`.
  Do not hardcode it in `.tf` files or in `terraform.tfvars`.
- `terraform.tfvars` and all state files are git-ignored (`.gitignore`).
- Rotate any token that has ever been committed or logged.
