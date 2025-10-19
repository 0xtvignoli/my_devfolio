'use client';

import { usePathname } from 'next/navigation';

interface StructuredDataProps {
  type?: 'home' | 'lab' | 'article' | 'portfolio';
  title?: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

export function StructuredData({
  type = 'home',
  title,
  description,
  image,
  datePublished,
  dateModified,
}: StructuredDataProps) {
  const pathname = usePathname();
  const baseUrl = 'https://tvignoli.com';
  const currentUrl = `${baseUrl}${pathname}`;

  // Person Schema - Always present
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${baseUrl}/#person`,
    name: 'Thomas Vignoli',
    url: baseUrl,
    image: `${baseUrl}/thomas-vignoli.jpg`,
    jobTitle: 'Senior DevOps Engineer',
    description: 'Senior DevOps Engineer specializing in Kubernetes, Cloud Infrastructure, CI/CD, and Site Reliability Engineering',
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
    sameAs: [
      'https://linkedin.com/in/thomas-vignoli',
      'https://github.com/tvignoli',
      'https://twitter.com/tvignoli',
    ],
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'University Name',
    },
  };

  // Website Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'Thomas Vignoli - DevOps Portfolio',
    description: 'Senior DevOps Engineer Portfolio and Interactive Lab',
    publisher: {
      '@id': `${baseUrl}/#person`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      ...(pathname !== '/'
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: type === 'lab' ? 'Lab' : type === 'portfolio' ? 'Portfolio' : 'Articles',
              item: currentUrl,
            },
          ]
        : []),
    ],
  };

  // Article Schema (for blog posts)
  const articleSchema = type === 'article' && {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image || `${baseUrl}/og-image.png`,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@id': `${baseUrl}/#person`,
    },
    publisher: {
      '@type': 'Person',
      name: 'Thomas Vignoli',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
  };

  // SoftwareApplication Schema (for Lab)
  const labSchema = type === 'lab' && {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Interactive DevOps Lab',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    description: 'Interactive laboratory for DevOps practices including Kubernetes cluster management, CI/CD pipelines, and chaos engineering',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@id': `${baseUrl}/#person`,
    },
    screenshot: `${baseUrl}/lab-screenshot.png`,
    featureList: [
      'Interactive Terminal',
      'Kubernetes Cluster Visualization',
      'CI/CD Pipeline Simulation',
      'Chaos Engineering',
      'Real-time Monitoring',
      'Gamification System',
    ],
  };

  // ProfilePage Schema
  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@id': `${baseUrl}/#person`,
    },
  };

  const schemas = [
    personSchema,
    websiteSchema,
    breadcrumbSchema,
    profileSchema,
    ...(articleSchema ? [articleSchema] : []),
    ...(labSchema ? [labSchema] : []),
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}
