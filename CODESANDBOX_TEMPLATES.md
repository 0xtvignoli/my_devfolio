# CodeSandbox Templates - Setup Guide

Questo documento descrive come configurare i template Terraform su CodeSandbox per l'integrazione nel portfolio.

## Template Disponibili

I seguenti template sono configurati nel componente `CodePlayground`:

1. **EKS Cluster** (`eks-cluster`)
   - Production-ready EKS cluster con node groups, IAM roles, e networking
   - Tags: Kubernetes, AWS, EKS, Terraform

2. **VPC Network** (`vpc-network`)
   - Multi-AZ VPC con public/private subnets, NAT gateway, e security groups
   - Tags: AWS, VPC, Networking, Terraform

3. **RDS Database** (`rds-database`)
   - RDS PostgreSQL con automated backups, encryption, e monitoring
   - Tags: AWS, RDS, PostgreSQL, Terraform

4. **S3 Bucket** (`s3-bucket`)
   - Secure S3 bucket con versioning, encryption, e lifecycle policies
   - Tags: AWS, S3, Storage, Terraform

5. **CI/CD Pipeline** (`cicd-pipeline`)
   - GitHub Actions workflow per Terraform con policy checks e automated deployments
   - Tags: CI/CD, GitHub Actions, Terraform, Automation

## Setup Instructions

### 1. Crea i Sandbox su CodeSandbox

Per ogni template:

1. Vai su [CodeSandbox](https://codesandbox.io)
2. Crea un nuovo sandbox usando il template "Terraform" o "Blank"
3. Aggiungi i file Terraform necessari
4. Copia l'ID del sandbox dall'URL (es: `https://codesandbox.io/s/abc123xyz` → ID: `abc123xyz`)

### 2. Aggiorna i Sandbox IDs

Modifica `src/components/lab/code-playground.tsx` e sostituisci i placeholder:

```typescript
const TERRAFORM_TEMPLATES: TerraformTemplate[] = [
  {
    id: 'eks-cluster',
    name: 'EKS Cluster',
    description: 'Production-ready EKS cluster...',
    sandboxId: 'YOUR_EKS_SANDBOX_ID', // <-- Sostituisci qui
    // ...
  },
  // ... altri template
];
```

### 3. Aggiungi Sandbox IDs ai Progetti

Se vuoi mostrare un CodeSandbox embed nelle project cards, aggiungi `codesandboxId` al progetto in `src/data/content/projects.ts`:

```typescript
{
  id: "project-1",
  // ... altri campi
  codesandboxId: "YOUR_SANDBOX_ID", // <-- Aggiungi qui
}
```

## Best Practices per i Template

### Struttura File Consigliata

```
/
├── main.tf          # Risorse principali
├── variables.tf     # Variabili
├── outputs.tf      # Output
├── terraform.tfvars.example  # Esempio di configurazione
└── README.md       # Documentazione del template
```

### Configurazione CodeSandbox

- **Environment**: Seleziona "Terraform" o configura manualmente
- **Package.json**: Non necessario per Terraform puro
- **README.md**: Aggiungi istruzioni chiare per l'uso

### Sicurezza

- ⚠️ **NON includere** credenziali reali o API keys
- Usa variabili d'ambiente o `terraform.tfvars.example`
- Aggiungi `.gitignore` per file sensibili
- Documenta chiaramente i requisiti AWS/GCP/Azure

## Esempio: Template EKS Cluster

```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = var.cluster_name
  cluster_version = "1.28"
  
  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids
  
  # ... altre configurazioni
}
```

## Note

- I sandbox ID sono placeholder (`placeholder-eks`, etc.) fino a quando non vengono creati i sandbox reali
- Il componente `CodeSandboxEmbed` gestisce automaticamente il loading state e gli errori
- I template supportano la modalità dark theme automaticamente

## Supporto

Per problemi o domande:
- [CodeSandbox Documentation](https://codesandbox.io/docs)
- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)



