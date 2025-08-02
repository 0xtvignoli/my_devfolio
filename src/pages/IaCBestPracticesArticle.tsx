import { ArticlePage } from '@/components/ArticlePage';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/data/translations';
import { Code, GitBranch, Shield, CheckCircle, AlertTriangle, GitCommit, Layers } from 'lucide-react';

const IaCBestPracticesArticle = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const content = (
    <div className="space-y-8">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
        <div className="flex items-start">
          <Code className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Infrastructure as Code</h3>
            <p className="text-blue-800">
              L'Infrastructure as Code (IaC) è la pratica di gestire e fornire infrastruttura IT attraverso 
              file di configurazione invece di processi manuali. Ecco le best practices essenziali per un IaC efficace.
            </p>
          </div>
        </div>
      </div>

      <section>
        <h2>1. Principi Fondamentali</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Idempotenza
            </h3>
            <p className="text-gray-700 mb-3">
              Il codice deve essere eseguibile più volte senza effetti collaterali indesiderati.
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-sm">
              <pre><code>{`# ✅ Idempotente
resource "aws_instance" "web" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
  tags = {
    Name = "web-server"
  }
}

# ❌ Non idempotente
resource "aws_instance" "web" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
  tags = {
    Name = "web-server-\${random_id.server.hex}"
  }
}`}</code></pre>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Immutabilità
            </h3>
            <p className="text-gray-700 mb-3">
              Le risorse non vengono modificate ma sostituite con nuove versioni.
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-sm">
              <pre><code>{`# ✅ Immutabile
resource "aws_launch_template" "web" {
  name_prefix = "web-template"
  image_id    = var.ami_id
  instance_type = "t3.micro"
  
  lifecycle {
    create_before_destroy = true
  }
}

# ❌ Mutabile
resource "aws_instance" "web" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
}`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>2. Organizzazione del Codice</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Struttura raccomandata per un progetto Terraform
terraform-project/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       ├── terraform.tfvars
│       └── backend.tf
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── database/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── scripts/
│   ├── deploy.sh
│   └── destroy.sh
└── README.md`}</code></pre>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Best Practice: Modularità</h3>
                <p className="text-yellow-800">
                  Organizza il codice in moduli riutilizzabili. Ogni modulo dovrebbe avere una responsabilità 
                  specifica e essere testabile indipendentemente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>3. Gestione dello Stato</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Backend remoto per lo stato (esempio AWS S3)
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# State locking con DynamoDB
resource "aws_dynamodb_table" "terraform_locks" {
  name           = "terraform-locks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
  
  attribute {
    name = "LockID"
    type = "S"
  }
}`}</code></pre>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">State Management</h3>
              <ul className="space-y-2 text-sm">
                <li>• Usa backend remoti (S3, GCS, Azure)</li>
                <li>• Implementa state locking</li>
                <li>• Separa stato per ambiente</li>
                <li>• Backup regolari dello stato</li>
                <li>• Usa workspace per isolamento</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Sicurezza</h3>
              <ul className="space-y-2 text-sm">
                <li>• Crittografia dello stato</li>
                <li>• Accesso controllato ai backend</li>
                <li>• Rotazione delle credenziali</li>
                <li>• Audit logging</li>
                <li>• Backup crittografati</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>4. Versioning e CI/CD</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Git branching strategy
main (production)
├── develop (staging)
├── feature/network-module
├── feature/security-updates
└── hotfix/critical-fix

# GitFlow per IaC
git checkout -b feature/new-vpc
# ... sviluppa il modulo VPC
git commit -m "feat: add VPC module with private subnets"
git push origin feature/new-vpc
# ... crea Pull Request

# CI/CD Pipeline (.github/workflows/terraform.yml)
name: Terraform CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v2
      
    - name: Terraform Init
      run: terraform init
      
    - name: Terraform Format Check
      run: terraform fmt -check
      
    - name: Terraform Plan
      run: terraform plan
      
    - name: Terraform Apply
      if: github.ref == 'refs/heads/main'
      run: terraform apply -auto-approve`}</code></pre>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <div className="flex items-start">
              <GitBranch className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Versioning Best Practices</h3>
                <ul className="text-yellow-800 space-y-1">
                  <li>• Usa semantic versioning per i moduli</li>
                  <li>• Tagga le release importanti</li>
                  <li>• Documenta i breaking changes</li>
                  <li>• Mantieni changelog aggiornato</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>5. Testing e Validazione</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Test con Terratest
package test

import (
    "testing"
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestVPCModule(t *testing.T) {
    terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
        TerraformDir: "../modules/vpc",
        Vars: map[string]interface{}{
            "vpc_cidr": "10.0.0.0/16",
            "environment": "test",
        },
    })
    
    defer terraform.Destroy(t, terraformOptions)
    terraform.InitAndApply(t, terraformOptions)
    
    vpcId := terraform.Output(t, terraformOptions, "vpc_id")
    assert.NotEmpty(t, vpcId)
}

# Pre-commit hooks
repos:
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.88.0
    hooks:
      - id: terraform_fmt
      - id: terraform_docs
      - id: terraform_tflint
      - id: terraform_validate`}</code></pre>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Testing Strategy</h3>
              <ul className="space-y-2 text-sm">
                <li>• Unit tests per moduli</li>
                <li>• Integration tests</li>
                <li>• Security scanning</li>
                <li>• Compliance checks</li>
                <li>• Performance testing</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Validation Tools</h3>
              <ul className="space-y-2 text-sm">
                <li>• terraform validate</li>
                <li>• tflint</li>
                <li>• checkov</li>
                <li>• tfsec</li>
                <li>• pre-commit hooks</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>6. Sicurezza e Compliance</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# Secrets management
# Usa AWS Secrets Manager o HashiCorp Vault
data "aws_secretsmanager_secret" "db_password" {
  name = "prod/database/password"
}

data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = data.aws_secretsmanager_secret.db_password.id
}

resource "aws_db_instance" "database" {
  identifier = "prod-database"
  password   = data.aws_secretsmanager_secret_version.db_password.secret_string
}

# Network security
resource "aws_security_group" "web" {
  name_prefix = "web-sg"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "web-security-group"
  }
}

# Compliance tagging
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project
    Owner       = var.owner
    CostCenter  = var.cost_center
    Compliance  = "SOC2"
  }
}`}</code></pre>
          </div>
        </div>
      </section>

      <section>
        <h2>7. Monitoring e Observability</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <pre><code>{`# CloudWatch monitoring
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "infrastructure-dashboard"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", "web-asg"],
            [".", "NetworkIn", ".", "."],
            [".", "NetworkOut", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = "us-west-2"
          title  = "EC2 Metrics"
        }
      }
    ]
  })
}

# Logging configuration
resource "aws_cloudwatch_log_group" "application" {
  name              = "/aws/application/\${var.environment}"
  retention_in_days = 30
  
  tags = local.common_tags
}`}</code></pre>
          </div>
        </div>
      </section>

      <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
        <div className="flex items-start">
          <CheckCircle className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">IaC Best Practices Summary</h3>
            <ul className="text-green-800 space-y-1">
              <li>• Mantieni il codice idempotente e immutabile</li>
              <li>• Organizza il codice in moduli riutilizzabili</li>
              <li>• Usa backend remoti con state locking</li>
              <li>• Implementa CI/CD con testing automatizzato</li>
              <li>• Gestisci i secrets in modo sicuro</li>
              <li>• Applica tagging e compliance</li>
              <li>• Monitora l'infrastruttura deployata</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ArticlePage
      title={t.iacBestPracticesTitle}
      description={t.iacBestPracticesDesc}
      content={content}
      publishDate="25 Gennaio 2025"
      readTime="10 min"
    />
  );
};

export default IaCBestPracticesArticle; 