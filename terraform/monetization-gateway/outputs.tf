output "monetized_endpoint" {
  description = "The endpoint that will require x402 payment."
  value       = "https://${var.gateway_hostname}${var.gated_path}"
}

output "price_book" {
  description = "Effective per-request prices (cold and cache-hit) by tier, in the settlement asset."
  value = {
    asset      = var.settlement_asset
    cold_price = var.price_tiers
    cache_hit  = local.monetization.cache_prices
  }
}

output "settlement" {
  description = "x402 settlement configuration."
  value = {
    protocol = "x402"
    asset    = var.settlement_asset
    pay_to   = var.settlement_wallet
  }
}
