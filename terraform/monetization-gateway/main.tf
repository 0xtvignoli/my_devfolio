locals {
  # x402 monetization intent for the inference gateway.
  # Pricing is deterministic per request because x402 settles BEFORE the
  # response is produced (see README: "pre-payment vs metered billing").
  monetization = {
    hostname = var.gateway_hostname
    path     = var.gated_path
    asset    = var.settlement_asset
    pay_to   = var.settlement_wallet
    tiers    = var.price_tiers
    # Effective price when the semantic cache serves the answer (cold * discount).
    cache_prices = { for tier, price in var.price_tiers : tier => price * var.cache_hit_discount }
  }

  # Scope monetization to the inference endpoint only.
  gated_expression = format(
    "(http.host eq \"%s\" and starts_with(http.request.uri.path, \"%s\"))",
    var.gateway_hostname,
    var.gated_path,
  )
}

# ---------------------------------------------------------------------------
# DEPLOYABLE TODAY — observability marker.
# Stamps a response header on the monetized route so it is measurable and
# ready. This feeds the "revenue per request" / margin dashboards described in
# the article; it does NOT charge yet. Enforcement is added by the Monetization
# Gateway resource below once it leaves the waitlist.
# NOTE: validate against the pinned provider (cloudflare ~> 5) before apply.
# ---------------------------------------------------------------------------
resource "cloudflare_ruleset" "x402_gateway_markers" {
  zone_id     = var.zone_id
  name        = "x402-inference-gateway-markers"
  description = "Marks the monetized inference path for observability (pre-GA scaffold)."
  kind        = "zone"
  phase       = "http_response_headers_transform"

  rules = [{
    action     = "rewrite"
    expression = local.gated_expression
    enabled    = true
    action_parameters = {
      headers = {
        "x-monetized-route" = {
          operation = "set"
          value     = "x402"
        }
      }
    }
  }]
}

# ---------------------------------------------------------------------------
# STAGED FOR GA — the actual pay-per-request rule (x402 / Monetization Gateway).
# The resource name and schema are ILLUSTRATIVE: the product is on the waitlist,
# so replace this with the published resource when it ships. The shape maps 1:1
# to the x402 handshake:
#   402 -> price (asset, pay_to) -> client pays -> 200 (settled to wallet).
# ---------------------------------------------------------------------------
# resource "cloudflare_monetization_rule" "inference_x402" {
#   zone_id    = var.zone_id
#   hostname   = var.gateway_hostname
#   match_path = "${var.gated_path}*"
#   protocol   = "x402"
#   asset      = var.settlement_asset
#   pay_to     = var.settlement_wallet
#
#   # Deterministic pre-payment price. The gateway advertises its tier via a
#   # request header (e.g. x-model-tier); default to "medium" when absent.
#   dynamic "price" {
#     for_each = local.monetization.tiers
#     content {
#       when   = "http.request.headers[\"x-model-tier\"][0] eq \"${price.key}\""
#       amount = price.value
#     }
#   }
#
#   # Cache-aware pricing: charge a fraction when served from the semantic cache.
#   cache_hit_price_factor = var.cache_hit_discount
#
#   # Optional identity layer (Web Bot Auth) to enable per-account metering
#   # and post-paid credits instead of strict pre-payment.
#   require_verified_agent = false
# }
