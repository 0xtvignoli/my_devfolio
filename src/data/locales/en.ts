import type { Translations } from "@/lib/types";

export const en: Translations = {
  nav: {
    dashboard: "Dashboard",
    portfolio: "Portfolio",
    experience: "Experience",
    articles: "Articles",
    lab: "Lab",
  },
  hero: {
    title: "Senior DevOps Engineer & Cloud Architect",
    subtitle: "I build and scale resilient, secure, and cost-effective infrastructures on the cloud. Passionate about IaC, Kubernetes, and Automation.",
    ctaPortfolio: "View Projects",
    ctaContact: "Get in Touch",
  },
  skills: {
    title: "Core Technologies",
    list: [
      "Terraform", "Kubernetes", "Helm", "Docker", "CI/CD (GitHub Actions, Jenkins)", "AWS", "GCP", "Azure", "Prometheus", "Grafana", "Python", "TypeScript", "Javascript"
    ],
  },
  portfolio: {
    title: "Featured Projects",
    viewAll: "View all projects"
  },
  experience: {
    title: "Career Journey",
  },
  articles: {
    title: "Latest Articles",
    viewAll: "Read all articles",
    emptyTitle: "No articles yet",
    emptyDescription: "Articles will appear here when published.",
  },
  contact: {
    title: "Let's work together",
    description: "I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision. Feel free to reach out.",
    email: "thomas.vignoli@pm.me",
    emailLabel: "Send email to {email}",
    openingEmailClient: "Opening email client...",
    emailClientOpened: "Email client should open shortly",
    buttonText: "Get in touch",
  },
  footer: {
    copy: "© 2025 Thomas Vignoli. All rights reserved.",
  },
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  a11y: {
    skipToContent: "Skip to main content",
  },
  errorBoundary: {
    title: "Something went wrong",
    description: "The Lab encountered an unexpected error. Don't worry, your data is safe.",
    reload: "Reload Page",
    goHome: "Go to Lab Home",
  },
  article: {
    back: "Back to articles",
    author: "By tvignoli",
    published: "Published on",
  },
  project: {
    github: "Source Code",
    demo: "Live Demo"
  },
  codesandbox: {
    title: "Code Playground",
    description: "Explore production-ready Terraform modules and infrastructure code",
    tryIt: "Try it Live",
    openInSandbox: "Open in CodeSandbox",
    copyLink: "Copy link",
    linkCopied: "Link copied to clipboard",
    templates: {
      eks: "EKS Cluster",
      vpc: "VPC Network",
      rds: "RDS Database",
      s3: "S3 Bucket",
      cicd: "CI/CD Pipeline"
    }
  }
};
