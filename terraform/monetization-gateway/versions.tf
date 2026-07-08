terraform {
  required_version = ">= 1.6"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {
  # Token is read from the environment: export TF_VAR_cloudflare_api_token=...
  # NEVER hardcode it here or in terraform.tfvars.
  api_token = var.cloudflare_api_token
}
