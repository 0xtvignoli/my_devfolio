import type { Translations } from "@/lib/types";

export const en: Translations = {
  nav: {
    portfolio: "Portfolio",
    experience: "Experience",
    articles: "Articles",
    lab: "Lab",
    missionProgress: "Mission Progress",
  },
  mobileNav: {
    home: "Home",
    portfolio: "Work",
    contact: "Contact",
    ariaLabel: "Main navigation",
  },
  hero: {
    title: "Senior DevOps Engineer & Cloud Architect",
    subtitle: "I build and scale resilient, secure, and cost-effective infrastructures on the cloud. Passionate about IaC, Kubernetes, and Automation.",
    badge: "Senior DevOps Engineer",
    ctaPortfolio: "View Projects",
    ctaLab: "Explore Lab",
    ctaContact: "Get in Touch",
    labPreviewTitle: "INTERACTIVE LAB",
    labPreviewSubtitle: "Simulated Kubernetes cluster — deploy, monitor, and chaos-test from your browser.",
    tryLabTitle: "Try the Lab",
    tryLabDescription: "Interactive mission console: deploy, chaos-test, and operate a simulated Kubernetes cluster from the terminal.",
    tryLabCta: "Open Lab →",
  },
  skills: {
    title: "Core Technologies",
    list: [
      "Terraform", "Kubernetes", "Helm", "Docker", "CI/CD (GitHub Actions, Jenkins)", "AWS", "GCP", "Azure", "Prometheus", "Grafana", "Python", "TypeScript", "Javascript"
    ],
  },
  portfolio: {
    title: "Featured Projects",
    viewAll: "View all projects",
    pageSubtitle: "A collection of my work, from infrastructure automation to application deployment.",
  },
  experience: {
    title: "Career Journey",
    pageSubtitle: "My professional journey and evolution in the world of DevOps and Cloud.",
  },
  articles: {
    title: "Latest Articles",
    viewAll: "Read all articles",
    pageSubtitle: "Deep dives into cloud technologies, automation, and best practices.",
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
    copy: "© 2026 Thomas Vignoli. All rights reserved.",
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
    author: "By Thomas Vignoli",
    published: "Published on",
  },
  project: {
    github: "Source Code",
    demo: "Live Demo",
    metricsLabel: "Impact",
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
