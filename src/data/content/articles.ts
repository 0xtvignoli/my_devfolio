import type { Article, Locale } from "@/lib/types";

const articlesContent: Omit<Article, 'title' | 'description' | 'content'>[] = [
  {
    slug: 'secure-terraform-backend',
    date: '2024-05-10',
    author: 'DevOps Folio',
  },
  {
    slug: 'kubernetes-hpa-deep-dive',
    date: '2024-04-22',
    author: 'DevOps Folio',
  },
];

const translations: Record<string, Record<Locale, Pick<Article, 'title' | 'description' | 'content'>>> = {
  'secure-terraform-backend': {
    en: {
      title: 'Secure Terraform Backend on AWS',
      description: 'A practical guide to setting up a secure remote backend for Terraform on AWS using S3 and DynamoDB for state locking.',
      content: [
        { type: 'paragraph', content: 'When working with Terraform in a team, a remote backend is essential for collaboration and state management. This article shows how to create a secure S3 bucket and a DynamoDB table for state locking, ensuring that only one person can apply changes at a time.' },
        { type: 'heading', level: 2, content: 'Terraform Configuration for S3 Backend' },
        { type: 'paragraph', content: 'First, you need to configure the backend in your Terraform code. Add the following block to your main configuration file:' },
        {
          type: 'code',
          language: 'hcl',
          code: `terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket-name"
    key            = "global/s3/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "your-terraform-state-lock-table"
    encrypt        = true
  }
}`,
        },
        { type: 'paragraph', content: 'This configuration tells Terraform to store the state file in an S3 bucket and use a DynamoDB table for locking. The `encrypt = true` flag ensures the state file is encrypted at rest.' },
      ],
    },
    it: {
      title: 'Backend Terraform Sicuro su AWS',
      description: 'Una guida pratica per configurare un backend remoto sicuro per Terraform su AWS usando S3 e DynamoDB per il locking dello stato.',
      content: [
        { type: 'paragraph', content: 'Quando si lavora con Terraform in team, un backend remoto è essenziale per la collaborazione e la gestione dello stato. Questo articolo mostra come creare un bucket S3 sicuro e una tabella DynamoDB per il locking dello stato, garantendo che solo una persona possa applicare modifiche alla volta.' },
        { type: 'heading', level: 2, content: 'Configurazione Terraform per Backend S3' },
        { type: 'paragraph', content: 'Per prima cosa, devi configurare il backend nel tuo codice Terraform. Aggiungi il seguente blocco al tuo file di configurazione principale:' },
        {
          type: 'code',
          language: 'hcl',
          code: `terraform {
  backend "s3" {
    bucket         = "il-tuo-bucket-di-stato-terraform"
    key            = "global/s3/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "la-tua-tabella-di-lock-terraform"
    encrypt        = true
  }
}`,
        },
        { type: 'paragraph', content: 'Questa configurazione dice a Terraform di memorizzare il file di stato in un bucket S3 e usare una tabella DynamoDB per il locking. Il flag `encrypt = true` assicura che il file di stato sia crittografato a riposo.' },
      ],
    },
  },
  'kubernetes-hpa-deep-dive': {
    en: {
      title: 'Kubernetes HPA Deep Dive',
      description: 'Explore the Horizontal Pod Autoscaler (HPA) in Kubernetes, with practical examples of scaling based on CPU, memory, and custom metrics.',
      content: [
        { type: 'paragraph', content: 'The Horizontal Pod Autoscaler automatically scales the number of pod replicas in a replication controller, deployment, replica set or stateful set based on observed CPU utilization or with custom metrics.' },
        { type: 'heading', level: 2, content: 'Scaling on CPU Utilization' },
        { type: 'paragraph', content: 'The most common use case is scaling based on CPU. Here is an example of an HPA YAML manifest:' },
        {
          type: 'code',
          language: 'yaml',
          code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80`,
        },
        { type: 'paragraph', content: 'This HPA will increase the number of pods for the `my-app` deployment when the average CPU utilization across all pods exceeds 80%, up to a maximum of 10 replicas.' },
      ],
    },
    it: {
      title: 'Approfondimento su Kubernetes HPA',
      description: 'Esplora l\'Horizontal Pod Autoscaler (HPA) in Kubernetes, con esempi pratici di scaling basato su CPU, memoria e metriche custom.',
      content: [
        { type: 'paragraph', content: 'L\'Horizontal Pod Autoscaler scala automaticamente il numero di repliche di pod in un replication controller, deployment, replica set o stateful set basandosi sull\'utilizzo della CPU osservato o su metriche personalizzate.' },
        { type: 'heading', level: 2, content: 'Scaling sull\'Utilizzo della CPU' },
        { type: 'paragraph', content: 'Il caso d\'uso più comune è lo scaling basato sulla CPU. Ecco un esempio di un manifest YAML per un HPA:' },
        {
          type: 'code',
          language: 'yaml',
          code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80`,
        },
        { type: 'paragraph', content: 'Questo HPA aumenterà il numero di pod per il deployment `my-app` quando l\'utilizzo medio della CPU su tutti i pod supera l\'80%, fino a un massimo di 10 repliche.' },
      ],
    }
  },
};

export function getArticles(locale: Locale): Article[] {
  return articlesContent.map(article => ({
    ...article,
    ...translations[article.slug][locale],
  }));
}

export function getArticle(slug: string, locale: Locale): Article | undefined {
  const articleMeta = articlesContent.find(a => a.slug === slug);
  if (!articleMeta) return undefined;
  
  return {
    ...articleMeta,
    ...translations[slug][locale],
  };
}
