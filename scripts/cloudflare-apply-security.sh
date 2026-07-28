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
#   export CLOUDFLARE_API_TOKEN="<your-cloudflare-api-token>"
#     Token scopes, all four needed:
#       Zone → Zone            → Read   (resolve the zone id)
#       Zone → DNS             → Read   (the proxied-records precondition check)
#       Zone → Bot Management  → Edit   (Bot Fight Mode / AI bots / AI Labyrinth)
#       Zone → WAF             → Edit   (the rate limiting rule)
#     Plus Account → Turnstile → Edit only if you want the widget auto-created.
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
  echo "Permissions: Zone → Zone → Read, Zone → DNS → Read,"
  echo "             Zone → Bot Management → Edit, Zone → WAF → Edit"
  exit 1
fi

# Steps that failed, reported honestly in the closing summary.
FAILURES=()

# NOTE on two deliberate choices here, both learned the hard way:
#
# 1. No `-f`. Cloudflare answers 4xx WITH a JSON envelope that names the problem
#    (`errors[].message`). `curl -f` discards that body, which turned a precise
#    "400 Bad Request: <reason>" into an empty string and a Python traceback.
# 2. Dry-run suppresses only MUTATING calls. GETs are read-only, so running them
#    is safe — and skipping them meant dry-run could never resolve the zone ID
#    and died on its own first step.
cf_api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"

  if [[ "$DRY_RUN" == true && "$method" != "GET" ]]; then
    # Notices go to stderr so callers capturing stdout still get valid JSON.
    echo "[dry-run] $method $path" >&2
    [[ -n "$data" ]] && echo "$data" >&2
    echo '{"success":true,"dry_run":true,"result":{}}'
    return 0
  fi

  local args=(-sS -X "$method" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")
  [[ -n "$data" ]] && args+=(-H "Content-Type: application/json" --data "$data")
  curl "${args[@]}" "$API_BASE$path" || echo '{"success":false,"errors":[{"code":0,"message":"curl transport failure"}]}'
}

# True when the envelope says success. Tolerates a non-JSON body.
cf_ok() {
  echo "$1" | python3 -c "
import sys, json
try: sys.exit(0 if json.load(sys.stdin).get('success') else 1)
except Exception: sys.exit(1)
" 2>/dev/null
}

# Print why Cloudflare refused, including the nested error_chain it uses for
# validation failures (that is where 'plan limitation' style messages appear).
cf_why() {
  echo "$1" | python3 -c "
import sys, json
try: d = json.load(sys.stdin)
except Exception:
    print('    (response was not JSON)'); raise SystemExit
errors = d.get('errors') or []
if not errors:
    print('    (no error detail returned)')
for e in errors:
    print(f\"    API error {e.get('code','?')}: {e.get('message','')}\")
    for sub in e.get('error_chain') or []:
        print(f\"      → {sub.get('code','?')}: {sub.get('message','')}\")
" 2>/dev/null || echo "    (could not parse response)"
}

echo "→ Resolving zone ID for $ZONE_NAME..."
ZONE_RESPONSE=$(cf_api GET "/zones?name=$ZONE_NAME")
ZONE_ID=$(echo "$ZONE_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result'][0]['id'] if d.get('result') else '')" 2>/dev/null || true)

if [[ -z "$ZONE_ID" ]]; then
  echo "ERROR: Could not resolve zone ID for $ZONE_NAME"
  cf_why "$ZONE_RESPONSE"
  echo "  Needs Zone → Zone → Read on the token, and the zone must be in this account."
  exit 1
fi
echo "  Zone ID: $ZONE_ID"

# PRECONDITION. Every rule below runs at Cloudflare's edge, which only sees the
# traffic if the DNS records are PROXIED (orange cloud). With DNS-only records
# the API accepts all of this and none of it ever executes — verified on
# tvignoli.com on 2026-07-28: apex → 216.198.79.1 (Vercel), `server: Vercel`,
# no cf-ray. So check, rather than print a checkmark and imply protection.
echo "→ Checking whether $ZONE_NAME is proxied through Cloudflare..."
DNS_RESPONSE=$(cf_api GET "/zones/$ZONE_ID/dns_records?type=A,AAAA,CNAME&per_page=100")
if ! cf_ok "$DNS_RESPONSE"; then
  # An unreadable record list is NOT evidence of an unproxied zone. Saying
  # "no proxied records" here once cried wolf on a zone that was correctly
  # proxied, which is worse than staying silent: it teaches you to ignore the
  # warning that matters.
  echo "  ?  Could not read the DNS records, so proxy status is UNKNOWN:"
  cf_why "$DNS_RESPONSE"
  echo "     Add Zone → DNS → Read to the token to enable this check."
  echo "     Verify by hand meanwhile:  curl -sI https://$ZONE_NAME | grep -i cf-ray"
else
  PROXY_REPORT=$(echo "$DNS_RESPONSE" | python3 -c "
import sys, json
d = json.load(sys.stdin)
records = [r for r in d.get('result') or [] if r.get('type') in ('A','AAAA','CNAME')]
proxied = [r['name'] for r in records if r.get('proxied')]
direct   = [r['name'] for r in records if not r.get('proxied')]
print('PROXIED=' + str(len(proxied)))
for n in sorted(set(proxied))[:6]: print('  proxied    :', n)
for n in sorted(set(direct))[:6]: print('  DNS-only   :', n)
" 2>/dev/null || echo 'PROXIED=0')
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
if ! cf_ok "$RESULT"; then
  echo "  ✗ bot management NOT applied:"
  cf_why "$RESULT"
  echo "    Needs Zone → Bot Management → Edit on the token."
  FAILURES+=("bot management")
elif [[ "$DRY_RUN" != true ]]; then
  echo "$RESULT" | python3 -c "
import sys, json
r = json.load(sys.stdin).get('result', {})
print('  fight_mode:', r.get('fight_mode'))
print('  ai_bots_protection:', r.get('ai_bots_protection'))
print('  crawler_protection:', r.get('crawler_protection'))
" 2>/dev/null || echo "  (applied, but the response could not be summarised)"
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
RL_RESULT=$(cf_api PUT "/zones/$ZONE_ID/rulesets/phases/http_ratelimit/entrypoint" "$RATELIMIT_PAYLOAD")
if ! cf_ok "$RL_RESULT"; then
  echo "  ✗ rate limiting rule NOT applied. Cloudflare says:"
  cf_why "$RL_RESULT"
  echo "    Checklist for a 400: on Free the period and mitigation_timeout must both"
  echo "    be 10, the expression may only reference path / verified-bot, and the plan"
  echo "    allows exactly ONE rule. A 403 instead means the token lacks Zone → WAF → Edit."
  echo "    Do NOT add cf.colo.id to characteristics — Cloudflare adds it implicitly."
  FAILURES+=("rate limiting rule on $RL_PATH")
elif [[ "$DRY_RUN" != true ]]; then
  echo "$RL_RESULT" | python3 -c "
import sys, json
for r in json.load(sys.stdin).get('result', {}).get('rules', []):
    rl = r.get('ratelimit', {})
    print('  rule:', r.get('description'))
    print('  limit:', rl.get('requests_per_period'), 'req /', rl.get('period'), 's → block', rl.get('mitigation_timeout'), 's')
" 2>/dev/null || echo "  (applied, but the response could not be summarised)"
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
  echo "  (The home page now has a public ask form — a widget here is worth having.)"
fi

echo ""
# A summary that claims success while a step failed is how you end up believing
# you have protection you don't. Report per-step, and exit non-zero.
if [[ ${#FAILURES[@]} -gt 0 ]]; then
  echo "✗ Applied with failures. NOT configured:"
  for f in "${FAILURES[@]}"; do echo "    - $f"; done
  echo "  Everything else above that printed values was applied."
else
  echo "✓ Cloudflare security configuration applied."
fi
echo "  Verify in dashboard: Security → Security Insights"
echo "  security.txt is served from /.well-known/security.txt (app repo)"
echo "  robots.txt blocks AI training crawlers; search bots remain allowed (origin-served,"
echo "  so that part works with or without the proxy)."
echo "  /api/ask rate limit: verify in Security → WAF → Rate limiting rules — and note it"
echo "  only fires on proxied records (see the check at the top of this run)."
[[ ${#FAILURES[@]} -eq 0 ]]
