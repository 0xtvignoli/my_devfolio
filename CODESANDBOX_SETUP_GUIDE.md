# CodeSandbox Setup Guide - Step by Step

Questa guida ti aiuta a creare i sandbox su CodeSandbox per ogni template Terraform e integrarli nel portfolio.

## 📋 Prerequisiti

1. Account CodeSandbox (gratuito): [codesandbox.io](https://codesandbox.io)
2. I file Terraform sono già pronti in `codesandbox-templates/`

## 🚀 Procedura per ogni Template

### Step 1: Crea un nuovo Sandbox

1. Vai su [CodeSandbox](https://codesandbox.io)
2. Clicca su **"Create Sandbox"** (in alto a destra)
3. Seleziona **"Blank"** o **"Import from GitHub"** se preferisci

### Step 2: Carica i File Terraform

Per ogni template (EKS, VPC, RDS, S3, CI/CD):

1. **Crea la struttura cartelle**:
   - Clicca su **"New File"**
   - Crea i file: `main.tf`, `variables.tf`, `outputs.tf`, `README.md`
   - Oppure copia i file dalla cartella `codesandbox-templates/[template-name]/`

2. **Copia il contenuto**:
   - Apri ogni file dalla cartella template
   - Copia tutto il contenuto
   - Incolla nel file corrispondente su CodeSandbox

### Step 3: Configura il Sandbox

1. **Aggiungi `package.json`** (opzionale, per syntax highlighting):
```json
{
  "name": "terraform-template",
  "version": "1.0.0",
  "description": "Terraform infrastructure template"
}
```

2. **Configura l'ambiente**:
   - CodeSandbox dovrebbe riconoscere automaticamente i file `.tf`
   - Se necessario, seleziona "Terraform" come environment

### Step 4: Ottieni il Sandbox ID

1. Dopo aver salvato, l'URL sarà simile a:
   ```
   https://codesandbox.io/s/abc123xyz
   ```
2. Il **Sandbox ID** è la parte dopo `/s/`: `abc123xyz`

### Step 5: Aggiorna il Codice

Apri `src/components/lab/code-playground.tsx` e sostituisci i placeholder:

```typescript
const TERRAFORM_TEMPLATES: TerraformTemplate[] = [
  {
    id: 'eks-cluster',
    name: 'EKS Cluster',
    description: 'Production-ready EKS cluster...',
    sandboxId: 'abc123xyz', // <-- Sostituisci con il tuo Sandbox ID
    icon: FileCode,
    tags: ['Kubernetes', 'AWS', 'EKS', 'Terraform']
  },
  // ... ripeti per ogni template
];
```

## 📝 Template Disponibili

### 1. EKS Cluster
- **Cartella**: `codesandbox-templates/eks-cluster/`
- **File**: `main.tf`, `variables.tf`, `outputs.tf`, `README.md`
- **Descrizione**: Cluster Kubernetes production-ready

### 2. VPC Network
- **Cartella**: `codesandbox-templates/vpc-network/`
- **File**: `main.tf`, `variables.tf`, `outputs.tf`, `README.md`
- **Descrizione**: VPC multi-AZ con subnet pubbliche/private

### 3. RDS Database (da creare)
- Template da creare seguendo lo stesso pattern
- PostgreSQL con backup automatici e encryption

### 4. S3 Bucket (da creare)
- Template da creare seguendo lo stesso pattern
- Bucket S3 sicuro con versioning e lifecycle policies

### 5. CI/CD Pipeline (da creare)
- Template da creare seguendo lo stesso pattern
- GitHub Actions workflow per Terraform

## 🎯 Aggiungere CodeSandbox ai Progetti

Se vuoi mostrare un embed CodeSandbox nelle project cards:

1. Apri `src/data/content/projects.ts`
2. Aggiungi `codesandboxId` al progetto:

```typescript
{
  id: "project-1",
  title: { /* ... */ },
  description: { /* ... */ },
  tags: [/* ... */],
  // ... altri campi
  codesandboxId: "abc123xyz", // <-- Aggiungi qui il Sandbox ID
}
```

## ✅ Checklist

- [ ] Account CodeSandbox creato
- [ ] Sandbox EKS Cluster creato e ID copiato
- [ ] Sandbox VPC Network creato e ID copiato
- [ ] Sandbox RDS Database creato e ID copiato
- [ ] Sandbox S3 Bucket creato e ID copiato
- [ ] Sandbox CI/CD Pipeline creato e ID copiato
- [ ] Aggiornati tutti gli ID in `code-playground.tsx`
- [ ] (Opzionale) Aggiunti `codesandboxId` ai progetti in `projects.ts`

## 🔍 Verifica

Dopo aver aggiornato gli ID:

1. Avvia il dev server: `bun dev`
2. Vai alla pagina Lab: `/lab`
3. Clicca sulla tab **"Playground"**
4. Verifica che i template siano visibili e cliccabili
5. Clicca su un template e verifica che l'embed CodeSandbox si carichi

## 💡 Tips

- **Pubblica i sandbox**: Clicca su "Share" e rendi pubblici i sandbox per l'embed
- **Aggiungi screenshot**: Aggiungi un'immagine di preview nel README del sandbox
- **Tag appropriati**: Aggiungi tag come "terraform", "aws", "infrastructure" per facilitare la ricerca
- **Fork per modifiche**: Gli utenti possono fare fork dei tuoi sandbox per sperimentare

## 🐛 Troubleshooting

**Problema**: L'embed non si carica
- **Soluzione**: Verifica che il sandbox sia pubblico (Share → Public)

**Problema**: Sandbox ID non valido
- **Soluzione**: Controlla che l'ID sia corretto (solo la parte dopo `/s/`)

**Problema**: File Terraform non riconosciuti
- **Soluzione**: Assicurati che i file abbiano estensione `.tf`

## 📚 Risorse

- [CodeSandbox Documentation](https://codesandbox.io/docs)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [CodeSandbox Embed API](https://codesandbox.io/docs/embedding)



