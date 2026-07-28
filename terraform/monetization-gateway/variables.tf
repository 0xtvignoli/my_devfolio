variable "cloudflare_api_token" {
  description = "Cloudflare API token (Zone:Edit, and Monetization:Edit once GA). Pass via TF_VAR_cloudflare_api_token or a secrets manager — never commit it."
  type        = string
  sensitive   = true
}

variable "zone_id" {
  description = "Cloudflare Zone ID for the domain fronting the inference gateway."
  type        = string
}

variable "gateway_hostname" {
  description = "Hostname of the inference gateway (e.g. api.tvignoli.com)."
  type        = string
}

variable "gated_path" {
  description = "Path prefix to monetize — the OpenAI-compatible inference endpoint."
  type        = string
  default     = "/v1/chat/completions"
}

variable "settlement_wallet" {
  description = "Stablecoin wallet that receives x402 peer-to-peer settlement."
  type        = string

  validation {
    condition     = can(regex("^0x[0-9a-fA-F]{40}$", var.settlement_wallet))
    error_message = "settlement_wallet must be a 0x-prefixed, 40-hex-character address."
  }
}

variable "settlement_asset" {
  description = "Stablecoin asset accepted for settlement."
  type        = string
  default     = "USDC"
}

variable "price_tiers" {
  description = <<-EOT
    Fixed per-request price (in settlement_asset) by model tier.
    x402 settles BEFORE the response is produced, so the charge must be
    deterministic — price by (model, max_tokens) tier, not by actual tokens.
  EOT
  type        = map(number)
  default = {
    small  = 0.002
    medium = 0.004
    large  = 0.012
  }
}

variable "cache_hit_discount" {
  description = "Fraction (0..1) of the tier price charged when the semantic cache serves the response. 0.1 = 90% off on a cache hit."
  type        = number
  default     = 0.1

  validation {
    condition     = var.cache_hit_discount >= 0 && var.cache_hit_discount <= 1
    error_message = "cache_hit_discount must be between 0 and 1."
  }
}
