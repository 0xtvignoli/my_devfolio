import { AUTHOR_NAME, SITE_URL, SOCIAL_LINKS } from './constants';

export function buildPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: AUTHOR_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/thomas-vignoli.png`,
    jobTitle: 'Senior DevOps Engineer',
    description:
      'Senior DevOps Engineer specializing in Kubernetes, Cloud Infrastructure, CI/CD, and Site Reliability Engineering',
    knowsAbout: [
      'DevOps',
      'Kubernetes',
      'Cloud Infrastructure',
      'CI/CD',
      'Docker',
      'Terraform',
      'AWS',
      'GCP',
      'Azure',
      'Site Reliability Engineering',
      'Monitoring',
      'Observability',
    ],
    sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.github],
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Thomas Vignoli - DevOps Portfolio',
    description: 'Senior DevOps Engineer Portfolio and Interactive Lab',
    publisher: { '@id': `${SITE_URL}/#person` },
  };
}

export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

const bcp47 = (locale?: string) => (locale === 'it' ? 'it-IT' : 'en-US');

export function buildArticleSchema(options: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  locale?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: options.title,
    description: options.description,
    image: options.image ?? `${SITE_URL}/opengraph-image`,
    datePublished: options.datePublished,
    dateModified: options.dateModified ?? options.datePublished,
    inLanguage: bcp47(options.locale),
    author: { '@id': `${SITE_URL}/#person` },
    publisher: { '@id': `${SITE_URL}/#person` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${options.path}`,
    },
  };
}

export function buildLabSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Interactive DevOps Lab',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    description:
      'Interactive laboratory for DevOps practices including Kubernetes cluster management, CI/CD pipelines, and chaos engineering',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@id': `${SITE_URL}/#person` },
    featureList: [
      'Interactive Terminal',
      'Kubernetes Cluster Visualization',
      'CI/CD Pipeline Simulation',
      'Chaos Engineering',
      'Real-time Monitoring',
      'Gamification System',
    ],
  };
}

export function buildProfilePageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: { '@id': `${SITE_URL}/#person` },
  };
}

/** Blog listing with each post as a BlogPosting — surfaces all articles to crawlers. */
export function buildBlogSchema(options: {
  path: string;
  locale?: string;
  name: string;
  description?: string;
  posts: { title: string; description: string; path: string; datePublished: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}${options.path}#blog`,
    url: `${SITE_URL}${options.path}`,
    name: options.name,
    ...(options.description ? { description: options.description } : {}),
    inLanguage: bcp47(options.locale),
    author: { '@id': `${SITE_URL}/#person` },
    blogPost: options.posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      url: `${SITE_URL}${p.path}`,
      datePublished: p.datePublished,
      author: { '@id': `${SITE_URL}/#person` },
    })),
  };
}

/** Collection page with an ItemList of projects (SoftwareSourceCode) — surfaces the portfolio to crawlers. */
export function buildCollectionPageSchema(options: {
  path: string;
  locale?: string;
  name: string;
  description?: string;
  items: { name: string; description: string; codeRepository?: string; keywords?: string[] }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}${options.path}#collection`,
    url: `${SITE_URL}${options.path}`,
    name: options.name,
    ...(options.description ? { description: options.description } : {}),
    inLanguage: bcp47(options.locale),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: options.items.length,
      itemListElement: options.items.map((it, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareSourceCode',
          name: it.name,
          description: it.description,
          ...(it.codeRepository ? { codeRepository: it.codeRepository } : {}),
          ...(it.keywords && it.keywords.length ? { keywords: it.keywords.join(', ') } : {}),
          author: { '@id': `${SITE_URL}/#person` },
        },
      })),
    },
  };
}
