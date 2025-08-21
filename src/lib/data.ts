
import type { Person, Project, Article } from "./types";

export const person: Person = {
  name: "Alex Doe",
  roleTitle: "Cloud & DevOps Engineer",
  bio: "A portfolio of resilient infrastructure, automated pipelines, and cloud-native solutions, demonstrating a deep expertise in modern DevOps practices and system architecture.",
  location: "San Francisco, CA (Remote)",
  email: "alex.doe@example.com",
  social: {
    github: "https://github.com/example",
    linkedin: "https://linkedin.com/in/example",
    twitter: "https://twitter.com/example",
  },
  resumeUrl: "/resume.pdf",
  about:
    "<p>This portfolio is not just a collection of projects; it's a living demonstration of infrastructure as code, CI/CD, and operational excellence. Each component, from the frontend to the simulated backend, is designed to showcase best practices in cloud engineering and DevOps.</p><p>My philosophy is that a resume can only tell you so much. To truly understand an engineer's capabilities, you need to see their work in action. This interactive lab is my answer to that. It's a testament to my passion for building automated, scalable, and resilient systems. Explore the lab, run chaos experiments, and see for yourself the principles I bring to every challenge.</p>",
  experience: [
    {
      role: "Lead DevOps Engineer",
      company: "Innovate Inc.",
      period: "2021 - Present",
      description:
        "Led the design and implementation of a multi-region Kubernetes platform on AWS, improving developer velocity and system reliability. Championed GitOps practices using ArgoCD and automated infrastructure with Terraform.",
    },
    {
      role: "Senior Site Reliability Engineer",
      company: "DataStream Corp.",
      period: "2018 - 2021",
      description:
        "Managed a large-scale data analytics platform on GCP. Developed a comprehensive observability stack with Prometheus, Grafana, and Loki, reducing MTTR for critical incidents by 50%.",
    },
    {
      role: "Cloud Engineer",
      company: "Tech Solutions LLC",
      period: "2015 - 2018",
      description:
        "Contributed to migrating monolithic applications to a microservices architecture running in Docker containers. Built and maintained CI/CD pipelines using Jenkins and later, GitHub Actions.",
    },
  ],
  education: [
    {
      degree: "AWS Certified DevOps Engineer",
      institution: "Amazon Web Services",
      period: "2022",
    },
    {
      degree: "Certified Kubernetes Administrator",
      institution: "Cloud Native Computing Foundation",
      period: "2020",
    },
  ],
};

export const articles: Article[] = [
    {
      id: "gitops-with-argocd",
      title: "Implementing GitOps with ArgoCD on Kubernetes",
      summary: "A deep dive into setting up a GitOps workflow for continuous deployment using ArgoCD, transforming Git into the single source of truth for your infrastructure.",
      date: "2023-10-15",
      tags: ["Kubernetes", "GitOps", "ArgoCD", "CI/CD"],
      content: `
        <h2>The GitOps Revolution: Why Your Repo is Your New Ops Team</h2>
        <p>In modern cloud-native development, the speed of iteration is relentless. Traditional deployment models, often involving manual steps or complex scripting, are brittle, opaque, and prone to configuration drift. GitOps flips this paradigm on its head. It's a methodology for continuous deployment that leverages Git as the single source of truth for declarative infrastructure and applications.</p>
        <p>Instead of pushing changes directly to a cluster, you push code to a Git repository. A GitOps operator, like ArgoCD, then automatically and continuously reconciles the cluster's state with the state defined in your repository. This article provides an expert-level walkthrough of how to implement a robust GitOps workflow using ArgoCD on a Kubernetes cluster.</p>

        <h3>Core Principles of GitOps</h3>
        <ul>
          <li><strong>Declarative State:</strong> All infrastructure and application configurations are defined declaratively in a Git repository (e.g., as Kubernetes YAML manifests or Helm charts).</li>
          <li><strong>Versioned and Immutable:</strong> Git's version control provides a complete, auditable history of all changes to your system's desired state.</li>
          <li><strong>Automated Reconciliation:</strong> An agent automatically pulls the desired state from Git and applies it to the cluster.</li>
          <li><strong>Continuous Assurance:</strong> The agent continuously monitors for configuration drift and corrects it, ensuring the live state always matches the Git repo.</li>
        </ul>

        <h3>Real-World Scenario: Managing Microservices</h3>
        <p>Imagine an e-commerce platform with dozens of microservices (cart, payments, inventory, etc.). A traditional CI/CD pipeline might build an image and then run a script to deploy it. If a deployment fails or needs a rollback, the process can be complex. With GitOps, a developer simply opens a pull request to update an image tag in a YAML file in the Git repo. Once merged, ArgoCD detects the change and automatically updates the corresponding Deployment in Kubernetes. Rolling back is as simple as reverting the Git commit.</p>

        <h2>Implementing the Workflow with ArgoCD</h2>
        <p>Let's get hands-on. We'll install ArgoCD and configure it to manage an application.</p>

        <h3>Prerequisites</h3>
        <ul>
          <li>A running Kubernetes cluster.</li>
          <li><code>kubectl</code> configured to communicate with your cluster.</li>
          <li>A GitHub repository to store your application manifests.</li>
        </ul>

        <h4>Step 1: Install ArgoCD</h4>
        <p>First, we create a dedicated namespace and apply the standard ArgoCD installation manifest.</p>
        <pre><code class="language-bash">kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml</code></pre>
        <p>This command sets up all the necessary components for ArgoCD, including its API server, repository server, and application controller.</p>
        
        <h4>Step 2: Access the ArgoCD UI</h4>
        <p>For ease of use, we can expose the ArgoCD server UI via port-forwarding.</p>
        <pre><code class="language-bash">kubectl port-forward svc/argocd-server -n argocd 8080:443</code></pre>
        <p>The initial password for the <code>admin</code> user is stored in a Kubernetes secret. You can retrieve it with:</p>
        <pre><code class="language-bash">kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d</code></pre>
        <p>You can now log in at <code>http://localhost:8080</code> with the username <code>admin</code> and the retrieved password.</p>

        <h4>Step 3: Define an Application in Git</h4>
        <p>In your Git repository, create a directory for your application's manifests. For this example, let's create a simple NGINX deployment.</p>
        <p><code>my-app/deployment.yaml</code>:</p>
        <pre><code class="language-yaml">apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25.3
        ports:
        - containerPort: 80</code></pre>

        <h4>Step 4: Create the ArgoCD Application Resource</h4>
        <p>Now, we tell ArgoCD about our application by creating an <code>Application</code> custom resource. This YAML should be applied to your cluster (or managed by another ArgoCD app, in an "App of Apps" pattern).</p>
        <p><code>argocd-app.yaml</code>:</p>
        <pre><code class="language-yaml">apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-nginx-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: 'https://github.com/YOUR_USERNAME/YOUR_REPO.git' # Change this
    targetRevision: HEAD
    path: my-app # Path to the directory in your repo
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true</code></pre>
        <p>Apply this manifest:</p>
        <pre><code class="language-bash">kubectl apply -f argocd-app.yaml</code></pre>
        <p>This tells ArgoCD to monitor the <code>my-app</code> directory in your specified Git repository and ensure its state is reflected in the <code>default</code> namespace of your cluster. The <code>syncPolicy</code> automates this process, even correcting manual changes (self-healing).</p>
        
        <h2>The Result: A Declarative, Auditable System</h2>
        <p>Once applied, you'll see your application appear in the ArgoCD UI. It will show the sync status, health of all related Kubernetes resources, and a clear visualization of the resource relationships. To update your application—say, to change the NGINX image version or increase the replica count—you simply update the YAML in your Git repository and push the change. ArgoCD handles the rest, providing a secure, auditable, and easily reproducible deployment process.</p>
        <p>This is the power of GitOps. It brings the rigor of software development practices to operations, dramatically improving reliability, velocity, and security for your cloud-native applications.</p>
        <blockquote>
          <strong>Further Reading:</strong> Check out the official documentation on the <a href="https://argo-cd.readthedocs.io/en/stable/core_concepts/" target="_blank" rel="noopener noreferrer">ArgoCD Core Concepts</a> and the <a href="https://www.weave.works/technologies/gitops/" target="_blank" rel="noopener noreferrer">GitOps principles</a> from Weaveworks.
        </blockquote>
      `,
    },
    {
      id: "terraform-modules",
      title: "Building Reusable Infrastructure with Terraform Modules",
      summary: "Learn how to create modular, reusable, and version-controlled infrastructure components with Terraform for efficient and consistent cloud deployments.",
      date: "2023-09-02",
      tags: ["Terraform", "IaC", "AWS", "Best Practices", "Modules"],
      content: `
        <h2>From Monoliths to Modules: The Evolution of Infrastructure as Code</h2>
        <p>As infrastructure grows in complexity, managing it with monolithic Terraform configurations becomes untenable. Just as software engineering evolved from single-file scripts to modular applications, Infrastructure as Code (IaC) must also embrace modularity. Terraform modules are the answer, providing a standard way to encapsulate and reuse infrastructure components, enforce best practices, and scale your operations.</p>
        <p>This guide explores the 'why' and 'how' of building effective Terraform modules, transforming your IaC from a collection of resources into a composable, version-controlled library of infrastructure patterns.</p>
        
        <h3>What is a Terraform Module?</h3>
        <p>In Terraform, a module is any set of configuration files in a directory. Even your root configuration is technically a module. However, when we talk about creating modules, we typically mean creating separate, self-contained directories of <code>.tf</code> files designed to be called from other configurations. This allows you to abstract away the complexity of a set of resources, exposing only the necessary inputs and outputs.</p>
        
        <h4>Key Benefits of Using Modules</h4>
        <ul>
            <li><strong>Reusability:</strong> Define a component once (e.g., a secure S3 bucket, a standard VPC network) and reuse it across multiple environments or projects.</li>
            <li><strong>Consistency:</strong> Enforce organizational standards and security best practices within modules, ensuring every deployment adheres to your policies.</li>
            <li><strong>Maintainability:</strong> Updating a core piece of infrastructure is as simple as updating a single module and version pin, rather than finding and replacing code in dozens of places.</li>
            <li><strong>Abstraction:</strong> Hide the complexity of underlying resources. Consumers of the module only need to know about the input variables you expose, not the intricate details of how the resources are configured.</li>
        </ul>
        
        <h2>Anatomy of a Well-Structured Module</h2>
        <p>Let's design a module for a common use case: creating a secure, private S3 bucket on AWS with standardized tagging and logging.</p>
        
        <p>Your directory structure should look like this:</p>
        <pre><code class="language-bash">
s3-private-bucket/
├── main.tf         # Core resources (the S3 bucket itself)
├── variables.tf    # Input variables for the module
├── outputs.tf      # Output values from the module
└── README.md       # Documentation on how to use the module
        </code></pre>

        <h4><code>variables.tf</code> - Defining the Interface</h4>
        <p>This file defines the inputs your module accepts.</p>
        <pre><code class="language-hcl">
variable "bucket_name" {
  description = "The name of the S3 bucket. Will be prefixed."
  type        = string
}

variable "tags" {
  description = "A map of tags to assign to the bucket."
  type        = map(string)
  default     = {}
}
        </code></pre>
        
        <h4><code>main.tf</code> - The Implementation</h4>
        <p>This is where you define the resources. The module enforces security best practices like blocking public access and enabling versioning.</p>
        <pre><code class="language-hcl">
resource "aws_s3_bucket" "this" {
  bucket = "co-secure-\${var.bucket_name}" # Enforce naming convention
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_tagging" "this" {
  bucket = aws_s3_bucket.this.id
  tags = merge(
    {
      "ManagedBy" = "Terraform"
      "TerraformModule" = "s3-private-bucket"
    },
    var.tags
  )
}
        </code></pre>
        
        <h4><code>outputs.tf</code> - Exposing Information</h4>
        <p>This file defines what data the module returns to the calling configuration.</p>
        <pre><code class="language-hcl">
output "bucket_id" {
  description = "The name of the S3 bucket."
  value       = aws_s3_bucket.this.id
}

output "bucket_arn" {
  description = "The ARN of the S3 bucket."
  value       = aws_s3_bucket.this.arn
}
        </code></pre>

        <h2>Using The Module</h2>
        <p>Now, in your root Terraform configuration, you can call this module as many times as you need.</p>
        <pre><code class="language-hcl">
module "logs_bucket" {
  source = "./modules/s3-private-bucket" # Or a Git URL for versioning

  bucket_name = "application-logs"
  tags = {
    "Environment" = "Production"
  }
}

module "assets_bucket" {
  source = "./modules/s3-private-bucket"

  bucket_name = "user-assets"
  tags = {
    "Environment" = "Production"
    "PII"         = "True"
  }
}

# You can then use the outputs from the module
resource "aws_iam_policy" "read_logs_policy" {
    name = "ReadLogsPolicy"
    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = ["s3:GetObject"]
                Effect = "Allow"
                Resource = "\${module.logs_bucket.bucket_arn}/*"
            }
        ]
    })
}
        </code></pre>

        <blockquote>
          <strong>Best Practice:</strong> For production use, modules should be versioned and stored in a separate Git repository or a private Terraform module registry. This allows you to control updates and maintain stability.
        </blockquote>

        <p>By investing in a well-designed module library, you establish a solid foundation for your cloud infrastructure. You empower teams to build faster and more safely, knowing that the core components they are using are secure, compliant, and maintained by experts.</p>
      `,
    },
    {
      id: "kubernetes-observability",
      title: "A Practical Guide to Kubernetes Observability",
      summary: "Explore the pillars of observability (logs, metrics, traces) and how to implement them in a Kubernetes environment using open-source tools.",
      date: "2023-07-21",
      tags: ["Kubernetes", "Observability", "Prometheus", "Grafana", "Loki"],
      content: `
        <h2>Beyond Monitoring: Achieving True Observability in Kubernetes</h2>
        <p>In the dynamic, ephemeral world of Kubernetes, traditional monitoring—checking if a system is up or down—is no longer enough. We need observability: the ability to ask arbitrary questions about our system's state without having to know in advance what we'll need to ask. It's about understanding the 'why' behind system behavior, not just the 'what'.</p>
        <p>Observability is built on three core pillars: **metrics**, **logs**, and **traces**. This guide provides a practical, hands-on approach to implementing a powerful, open-source observability stack for your Kubernetes clusters.</p>

        <h3>The Three Pillars of Observability</h3>
        <ul>
            <li><strong>Metrics:</strong> Aggregated, numerical data over intervals of time. They are great for understanding overall system health, performance trends, and alerting on known conditions (e.g., CPU utilization is over 90%).</li>
            <li><strong>Logs:</strong> Immutable, timestamped records of discrete events. Logs are essential for debugging specific errors and understanding the context of a particular event.</li>
            <li><strong>Traces:</strong> A representation of the journey of a single request as it flows through all the services in a distributed system. Traces are invaluable for pinpointing bottlenecks and understanding service dependencies.</li>
        </ul>

        <h2>The Open-Source Stack: Prometheus, Grafana, and Loki</h2>
        <p>We can build a production-grade observability platform using a powerful combination of open-source tools:</p>
        <ul>
            <li><strong>Prometheus:</strong> The de facto standard for metrics collection and alerting in the cloud-native world. It uses a pull-based model to scrape metrics from instrumented endpoints.</li>
            <li><strong>Grafana:</strong> The ultimate visualization tool. It can create beautiful, interactive dashboards from a wide variety of data sources, including Prometheus, Loki, and many others.</li>
            <li><strong>Loki:</strong> A log aggregation system inspired by Prometheus. It's designed to be cost-effective and easy to operate, indexing metadata about your logs rather than the full text.</li>
        </ul>

        <h3>Step 1: Setting up Prometheus for Metrics</h3>
        <p>The easiest way to get started is with the <code>kube-prometheus-stack</code> Helm chart, which bundles Prometheus, Grafana, and a host of essential exporters and alert configurations.</p>
        <pre><code class="language-bash">
# Add the Prometheus community repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install the stack
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
        </code></pre>
        <p>This single command deploys a Prometheus Operator, which automatically discovers and scrapes metrics from your pods if they are annotated correctly. For example, to tell Prometheus to scrape your app, you would add these annotations to your Service:</p>
        <pre><code class="language-yaml">
metadata:
  annotations:
    prometheus.io/scrape: 'true'
    prometheus.io/port:   '8080' # The port your /metrics endpoint is on
    prometheus.io/path:   '/metrics'
        </code></pre>

        <h3>Step 2: Setting up Loki for Log Aggregation</h3>
        <p>Loki is typically deployed with a log collection agent running on each node of the cluster. We'll use Promtail, Loki's official agent.</p>
        <pre><code class="language-bash">
# Add the Grafana repository
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Loki and Promtail
helm install loki grafana/loki-stack --namespace monitoring
        </code></pre>
        <p>The <code>loki-stack</code> chart deploys Loki as the central log store and Promtail as a DaemonSet. Promtail automatically discovers running pods, scrapes their logs from the node, attaches Kubernetes metadata (like pod name, namespace, and labels), and forwards them to Loki.</p>

        <h3>Step 3: Visualizing with Grafana</h3>
        <p>The <code>kube-prometheus-stack</code> chart already installed Grafana for us. We just need to expose it and configure Loki as a data source.</p>
        
        <h4>Expose Grafana</h4>
        <pre><code class="language-bash">
# Get the admin password
kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode

# Port-forward to the Grafana service
kubectl port-forward -n monitoring svc/prometheus-grafana 8080:80
        </code></pre>
        <p>Log in to <code>http://localhost:8080</code> with username <code>admin</code> and the retrieved password.</p>

        <h4>Add Loki Data Source</h4>
        <p>In the Grafana UI, go to "Configuration" > "Data Sources" > "Add data source" and select "Loki". The only URL you need to provide is the internal cluster address for the Loki service: <code>http://loki-stack.monitoring.svc.cluster.local:3100</code>. Click "Save & Test".</p>
        
        <h2>Putting It All Together</h2>
        <p>With this setup, you have a fully integrated observability stack:</p>
        <ul>
          <li><strong>Metrics:</strong> Navigate to the "Explore" tab in Grafana, select the Prometheus data source, and start querying metrics like <code>rate(container_cpu_usage_seconds_total[5m])</code>. The stack comes with pre-built dashboards for cluster health.</li>
          <li><strong>Logs:</strong> In the "Explore" tab, switch to the Loki data source. You can now query your logs using "LogQL," a label-based query language. For example, <code>{app="my-app", namespace="production"} |= "error"</code> will show all log lines containing the word "error" from your production app.</li>
        </ul>
        <p>The true power comes from correlating this data. You can create a dashboard that shows metrics for a service, and clicking on a spike in errors can take you directly to the logs from that exact time period for that specific pod. This tight integration dramatically reduces Mean Time To Resolution (MTTR) and gives developers the tools they need to truly own their services in production.</p>
      `,
    }
]

export const projects: Project[] = [
  {
    id: "e-commerce-platform",
    title: "Cloud-Native E-Commerce Platform",
    summary:
      "A showcase of a resilient and scalable e-commerce platform built on a microservices architecture and deployed to Kubernetes.",
    stack: ["Go", "Next.js", "Kubernetes", "PostgreSQL", "Redis", "AWS", "Docker", "Terraform"],
    role: "Lead DevOps/Cloud Engineer",
    outcomes: [
      "Achieved 99.99% uptime with a resilient, auto-scaling infrastructure on AWS EKS.",
      "Implemented a full GitOps workflow with ArgoCD for automated, reliable deployments.",
      "Established a comprehensive observability stack, providing deep insights into system health.",
    ],
    links: {
      repo: "https://github.com/example/e-commerce",
      codespaces: "https://github.com/codespaces/new?repo=example/e-commerce",
      stackblitz: "https://stackblitz.com/github/example/e-commerce",
    },
    dates: { start: "2021-01-01", end: "2023-06-01" },
    images: [
      {
        url: "https://placehold.co/800x600.png",
        alt: "System architecture diagram",
        aiHint: "architecture diagram",
      },
      {
        url: "https://placehold.co/800x600.png",
        alt: "Grafana dashboard showing performance metrics",
        aiHint: "grafana dashboard",
      },
    ],
    longDescription:
      "This project demonstrates a complete cloud-native solution. Key challenges included designing a resilient multi-AZ architecture, implementing a secure and automated CI/CD pipeline, and ensuring high availability. The infrastructure was defined as code using Terraform and deployed on AWS EKS for scalability and easy management. The focus was on operational excellence and demonstrating modern DevOps principles.",
  },
  {
    id: "data-processing-pipeline",
    title: "Real-Time Data Processing Pipeline",
    summary:
      "A distributed data pipeline in Go to ingest and process millions of events per day, built for scale and reliability on GCP.",
    stack: ["Go", "gRPC", "Kubernetes", "GCP", "Kafka", "Prometheus"],
    role: "Senior SRE",
    outcomes: [
      "Processed over 10 million events daily with an average latency of under 200ms.",
      "Reduced infrastructure costs by 35% by optimizing resource allocation and using GKE Autopilot.",
      "Enhanced system observability with a comprehensive monitoring stack using Prometheus and Grafana.",
    ],
    links: {
      repo: "https://github.com/example/data-pipeline",
      codespaces: "https://github.com/codespaces/new?repo=example/data-pipeline",
      stackblitz: "https://stackblitz.com/github/example/data-pipeline",
    },
    dates: { start: "2019-05-01", end: "2020-12-01" },
    images: [
      {
        url: "https://placehold.co/800x600.png",
        alt: "Data pipeline architecture diagram",
        aiHint: "architecture diagram",
      },
      {
        url: "https://placehold.co/800x600.png",
        alt: "Grafana dashboard showing pipeline metrics",
        aiHint: "grafana dashboard",
      },
    ],
    longDescription:
      "The core of this project was a set of microservices written in Go that communicated over gRPC. These services were responsible for consuming data from a Kafka stream, transforming it, and loading it into a data warehouse. The entire system was containerized with Docker and orchestrated with Kubernetes on Google Kubernetes Engine, ensuring high availability and fault tolerance.",
  },
  {
    id: "internal-dev-platform",
    title: "Internal Developer Platform (IDP)",
    summary:
      "Led the creation of an internal platform to streamline development workflows and abstract away infrastructure complexity.",
    stack: ["Backstage.io", "React", "TypeScript", "Node.js", "Terraform", "Kubernetes"],
    role: "Platform Engineer",
    outcomes: [
      "Decreased new service deployment time from 2 days to 15 minutes via self-service scaffolding.",
      "Centralized service cataloging, documentation, and observability for over 50 microservices.",
      "Standardized development environments and CI/CD pipelines, improving developer experience.",
    ],
    links: {
      repo: "https://github.com/example/idp",
      codespaces: "https://github.com/codespaces/new?repo=example/idp",
      stackblitz: "https://stackblitz.com/github/example/idp",
    },
    dates: { start: "2018-03-01", end: "2019-04-01" },
    images: [
      {
        url: "https://placehold.co/800x600.png",
        alt: "Internal Developer Platform UI based on Backstage",
        aiHint: "web application dashboard",
      },
    ],
    longDescription:
      "The goal was to improve developer experience and productivity by abstracting away the complexities of Kubernetes and cloud infrastructure. We built a platform on top of Spotify's Backstage.io, creating custom plugins and templates. The platform's backend interacted with the Kubernetes API and our Terraform scripts to automate the entire lifecycle of an application, from creation to deployment.",
  },
];
