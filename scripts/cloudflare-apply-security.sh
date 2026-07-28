#!/usr/bin/env bash
# Apply Cloudflare Security Insights for tvignoli.com via API.
#
# Covers (dashboard → Security Insights):
#   - Bot Fight Mode
#   - Block AI bots (training scrapers)
#   - AI Labyrinth (crawler honeypot)
#   - Rate limiting on /api/ask (LLM cost protection)
#   - Turnstile widget bootstrap (account-level)
#
# Prerequisites:
#   export CLOUDFLARE_API_TOKEN="<your-cloudflare-api-token>"   # Zone:Edit + Account:Read (+ Turnstile:Edit for widget)
#   export CLOUDFLARE_ZONE_NAME="tvignoli.com"   # optional, default below
#   export CLOUDFLARE_ACCOUNT_ID="<your-cloudflare-account-id>"  # optional, required only for Turnstile widget creation
#
# Usage:
#   ./scripts/cloudflare-apply-security.sh
#   ./scripts/cloudflare-apply-security.sh --dry-run
#
# Docs:
#   https://developers.cloudflare.com/api/resources/bot_management/methods/update/
#   https://developers.cloudflare.com/waf/rate-limiting-rules/create-api/
#   https://developers.cloudflare.com/turnstile/get-started/

set -euo pipefail

API_BASE="https://api.cloudflare.com/client/v4"
ZONE_NAME="${CLOUDFLARE_ZONE_NAME:-tvignoli.com}"
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    -h|--help)
      sed -n '2,20p' "$0"
      exit 0
      ;;
  esac
done

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "ERROR: CLOUDFLARE_API_TOKEN is not set."
  echo "Create a token at https://dash.cloudflare.com/profile/api-tokens"
  echo "Permissions: Zone → Bot Management → Edit, Zone → Zone → Read, Zone → WAF → Edit"
  exit 1
fi

cf_api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  if [[ "$DRY_RUN" == true ]]; then
    echo "[dry-run] $method $path"
    [[ -n "$data" ]] && echo "$data"
    return 0
  fi
  if [[ -n "$data" ]]; then
    curl -fsS -X "$method" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "$data" \
      "$API_BASE$path"
  else
    curl -fsS -X "$method" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      "$API_BASE$path"
  fi
}

echo "→ Resolving zone ID for $ZONE_NAME..."
ZONE_RESPONSE=$(cf_api GET "/zones?name=$ZONE_NAME")
ZONE_ID=$(echo "$ZONE_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result'][0]['id'] if d.get('result') else '')" 2>/dev/null || true)

if [[ -z "$ZONE_ID" ]]; then
  echo "ERROR: Could not resolve zone ID for $ZONE_NAME"
  echo "$ZONE_RESPONSE"
  exit 1
fi
echo "  Zone ID: $ZONE_ID"

# PRECONDITION. Every rule below runs at Cloudflare's edge, which only sees the
# traffic if the DNS records are PROXIED (orange cloud). With DNS-only records
# the API accepts all of this and none of it ever executes — verified on
# tvignoli.com on 2026-07-28: apex → 216.198.79.1 (Vercel), `server: Vercel`,
# no cf-ray. So check, rather than print a checkmark and imply protection.
echo "→ Checking whether $ZONE_NAME is proxied through Cloudflare..."
DNS_RESPONSE=$(cf_api GET "/zones/$ZONE_ID/dns_records?type=A,AAAA,CNAME&per_page=100" || echo '{}')
if [[ "$DRY_RUN" != true ]]; then
  PROXY_REPORT=$(echo "$DNS_RESPONSE" | python3 -c "
import sys, json
d = json.load(sys.stdin)
records = [r for r in d.get('result') or [] if r.get('type') in ('A','AAAA','CNAME')]
proxied = [r['name'] for r in records if r.get('proxied')]
direct   = [r['name'] for r in records if not r.get('proxied')]
print('PROXIED=' + str(len(proxied)))
for n in sorted(set(proxied))[:6]: print('  proxied    :', n)
for n in sorted(set(direct))[:6]: print('  DNS-only   :', n)
" 2>/dev/null || echo 'PROXIED=?')
  echo "$PROXY_REPORT" | grep -v '^PROXIED=' || true
  if echo "$PROXY_REPORT" | grep -q '^PROXIED=0'; then
    echo ""
    echo "  ⚠  No proxied records. Bot Fight Mode, Block AI bots, AI Labyrinth and the"
    echo "     rate limiting rule below will be CONFIGURED BUT INERT — traffic bypasses"
    echo "     Cloudflare entirely and goes straight to the origin."
    echo "     Fix: enable the orange cloud on the apex/www records (with Vercel behind,"
    echo "     set SSL/TLS to Full (strict)). Until then, rate limit where the traffic"
    echo "     actually lands: Vercel Firewall, or a shared-store limiter in the app."
    echo ""
  fi
fi

echo "→ Reading current bot management config..."
CURRENT=$(cf_api GET "/zones/$ZONE_ID/bot_management" || echo '{}')
echo "  Current: $(echo "$CURRENT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('result',{}), indent=None))" 2>/dev/null || echo 'n/a')"

# Bot management + AI controls. Edge-side: effective only on proxied records —
# see the precondition check above.
BOT_PAYLOAD=$(cat <<EOF
{
  "fight_mode": true,
  "ai_bots_protection": "block",
  "crawler_protection": "enabled",
  "cf_robots_variant": "policy_only",
  "is_robots_txt_managed": false,
  "enable_js": true
}
EOF
)

echo "→ Applying bot management (Bot Fight Mode + Block AI bots + AI Labyrinth)..."
RESULT=$(cf_api PUT "/zones/$ZONE_ID/bot_management" "$BOT_PAYLOAD")
if [[ "$DRY_RUN" != true ]]; then
  echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if not d.get('success'):
    print('ERROR:', d.get('errors', d))
    sys.exit(1)
r = d.get('result', {})
print('  fight_mode:', r.get('fight_mode'))
print('  ai_bots_protection:', r.get('ai_bots_protection'))
print('  crawler_protection:', r.get('crawler_protection'))
"
fi

# Rate limiting on the AI endpoint. /api/ask calls a paid LLM, and the in-app
# limiter (src/app/api/ask/route.ts) counts per serverless instance — it can't
# see a burst spread across instances. This edge rule is the one that holds.
#
# Free-plan ceiling: 1 rule, period 10s, mitigation 10s, characteristic = IP,
# expression limited to path/verified-bot. On Pro+ raise RATELIMIT_PERIOD and
# RATELIMIT_TIMEOUT (60s+ / up to 1h).
#
# PUT on the phase entrypoint REPLACES every rule in the http_ratelimit phase —
# that's what makes this script idempotent, but any rule added by hand in the
# dashboard is overwritten. Add it here instead.
RL_PATH="${RATELIMIT_PATH:-/api/ask}"
RL_REQUESTS="${RATELIMIT_REQUESTS:-5}"
RL_PERIOD="${RATELIMIT_PERIOD:-10}"
RL_TIMEOUT="${RATELIMIT_TIMEOUT:-10}"

RATELIMIT_PAYLOAD=$(cat <<EOF
{
  "rules": [
    {
      "description": "Rate limit AI assistant endpoint (LLM cost protection)",
      "expression": "(http.request.uri.path eq \"$RL_PATH\")",
      "action": "block",
      "ratelimit": {
        "characteristics": ["ip.src"],
        "period": $RL_PERIOD,
        "requests_per_period": $RL_REQUESTS,
        "mitigation_timeout": $RL_TIMEOUT
      }
    }
  ]
}
EOF
)

echo "→ Applying rate limiting on $RL_PATH ($RL_REQUESTS req / ${RL_PERIOD}s per IP)..."
RL_RESULT=$(cf_api PUT "/zones/$ZONE_ID/rulesets/phases/http_ratelimit/entrypoint" "$RATELIMIT_PAYLOAD" || true)
if [[ "$DRY_RUN" != true ]]; then
  echo "$RL_RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if not d.get('success'):
    print('  WARNING: rate limiting rule not applied:', d.get('errors', d))
    print('  Needs Zone → WAF → Edit on the token; check plan limits on period/timeout.')
    sys.exit(0)
for r in d.get('result', {}).get('rules', []):
    rl = r.get('ratelimit', {})
    print('  rule:', r.get('description'))
    print('  limit:', rl.get('requests_per_period'), 'req /', rl.get('period'), 's → block', rl.get('mitigation_timeout'), 's')
" || true
fi

# Turnstile is account-scoped — create a widget if account ID is provided.
if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  TURNSTILE_PAYLOAD=$(cat <<EOF
{
  "name": "tvignoli.com portfolio",
  "domains": ["tvignoli.com", "www.tvignoli.com", "dev.tvignoli.com"],
  "mode": "managed",
  "clearance_level": "interactive"
}
EOF
)
  echo "→ Creating Turnstile widget (account-level)..."
  T_RESULT=$(cf_api POST "/accounts/$CLOUDFLARE_ACCOUNT_ID/challenges/widgets" "$TURNSTILE_PAYLOAD" || true)
  if [[ "$DRY_RUN" != true ]] && echo "$T_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('success') else 1)" 2>/dev/null; then
    echo "$T_RESULT" | python3 -c "
import sys, json
r = json.load(sys.stdin)['result']
print('  sitekey:', r.get('sitekey'))
print('  Add to .env.local:')
print('    NEXT_PUBLIC_TURNSTILE_SITE_KEY=' + r.get('sitekey',''))
print('    TURNSTILE_SECRET_KEY=<from Cloudflare dashboard>')
"
  else
    echo "  Turnstile widget may already exist or needs Turnstile:Edit permission."
    echo "  Create manually: https://dash.cloudflare.com/?to=/:account/turnstile"
  fi
else
  echo "→ Turnstile: set CLOUDFLARE_ACCOUNT_ID to auto-create a widget, or enable at:"
  echo "  https://dash.cloudflare.com/?to=/:account/turnstile"
  echo "  (Portfolio has no public forms yet — widget is ready for future contact/API endpoints.)"
fi

echo ""
echo "✓ Cloudflare security configuration applied."
echo "  Verify in dashboard: Security → Security Insights"
echo "  security.txt is served from /.well-known/security.txt (app repo)"
echo "  robots.txt blocks AI training crawlers; search bots remain allowed (origin-served,"
echo "  so that part works with or without the proxy)."
echo "  /api/ask rate limit: verify in Security → WAF → Rate limiting rules — and note it"
echo "  only fires on proxied records (see the check at the top of this run)."
