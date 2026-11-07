export type Locale = 'en' | 'it';

export interface Translations {
  nav: {
    portfolio: string;
    experience: string;
    articles: string;
    lab: string;
    cv: string;
    menu: string;
  };
  notFound: {
    title: string;
    tryPalette: string;
    counted: string;
    writing: string;
    observatory: string;
  };
  palette: {
    open: string;
    label: string;
    placeholder: string;
    empty: string;
    move: string;
    openHint: string;
    themeHint: string;
    langHint: string;
    mailHint: string;
    groups: { pages: string; articles: string; projects: string; commands: string };
  };
  home: {
    kicker: string;
    headline: string;
    intro: string;
    ctaWork: string;
    ctaContact: string;
    writing: string;
    allArticles: string;
    work: string;
    allProjects: string;
    experience: string;
    fullCv: string;
    labPrompt: string;
    labTitle: string;
    labBody: string;
    labCta: string;
    contactTitle: string;
    contactCta: string;
    signalLabel: string;
    signalHostile: string;
    signalStopped: string;
    signalTop: string;
    signalCta: string;
    caseStudy: string;
  };
  mobileNav: {
    home: string;
    portfolio: string;
    contact: string;
    ariaLabel: string;
  };
  hero: {
    title: string;
    subtitle: string;
    badge: string;
    ctaPortfolio: string;
    ctaLab: string;
    ctaContact: string;
    labPreviewTitle: string;
    labPreviewSubtitle: string;
    tryLabTitle?: string;
    tryLabDescription?: string;
    tryLabCta?: string;
  };
  skills: {
    title: string;
    list: string[];
  };
  portfolio: {
    title: string;
    viewAll: string;
    pageSubtitle?: string;
    backToIndex: string;
  };
  /** Phone-only section links on long pages. */
  onThisPage: string;
  experience: {
    title: string;
    pageSubtitle?: string;
  };
  articles: {
    title: string;
    viewAll: string;
    pageSubtitle?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    filterLabel: string;
    filterAll: string;
    /** Contains `{count}`. */
    filterCount: string;
    related: string;
  };
  contact: {
    title: string;
    description: string;
    /** Accessible name for the mail link. Holds no address on purpose: it used to
        interpolate one, which both leaked it and made screen readers spell it out. */
    emailLabel: string;
    buttonText: string;
    /** Prefilled mail subject, so inbound is triageable. */
    subject: string;
    responseTime: string;
    cvLink: string;
  };
  contactForm: {
    title: string;
    name: string;
    email: string;
    message: string;
    submit: string;
    sending: string;
    sent: string;
    error: string;
    errorField: string;
    errorRateLimited: string;
    errorChallenge: string;
    privacy: string;
  };
  cv: {
    title: string;
    subtitle: string;
    print: string;
  };
  footer: {
    copy: string;
    cv: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  a11y: {
    skipToContent: string;
  };
  errorBoundary: {
    title: string;
    description: string;
    reload: string;
    goHome: string;
  };
  article: {
    minRead: string;
    contents: string;
    onThisPage: string;
    anchor: string;
    timeline: string;
    back: string;
    author: string;
    published: string;
  }
  project: {
    github: string;
    demo: string;
    metricsLabel: string;
  };
  codesandbox: {
    title: string;
    description: string;
    tryIt: string;
    openInSandbox: string;
    copyLink: string;
    linkCopied: string;
    templates: {
      eks: string;
      vpc: string;
      rds: string;
      s3: string;
      cicd: string;
    };
  };
  lab: {
    kicker: string;
    showAll: string;
    filterLabel: string;
    filterAll: string;
    /** Contains {part} and {total}. */
    filterSummary: string;
    defensesAllNote: string;
    jump: { daily: string; trends: string; looking: string; where: string; cases: string; method: string };
    title: string;
    intro: string;
    updated: string;
    stats: { requests: string; hostile: string; stopped: string; maze: string };
    stoppedNote: string;
    mazeNote: string;
    dailyTitle: string;
    dailyCaption: string;
    lookingForTitle: string;
    lookingForIntro: string;
    categories: Record<'secrets' | 'cms' | 'admin' | 'traversal' | 'app-exploit' | 'other', string>;
    targetsTitle: string;
    countriesTitle: string;
    clientsTitle: string;
    defensesTitle: string;
    caseStudiesTitle: string;
    methodTitle: string;
    method: string[];
    requestsLabel: string;
    peak: string;
    dateLabel: string;
    trendsTitle: string;
    trendsIntro: string;
    trends: {
      inDays: string;
      note: string;
      sentence: string;
      peak: string;
      verbDoubled: string;
      verbTripled: string;
      verbTimes: string;
      verbRose: string;
      verbFell: string;
      subjects: Record<'secrets' | 'cms' | 'admin' | 'traversal' | 'app-exploit' | 'other', string>;
    };
    statusLink: string;
  };
  status: {
    kicker: string;
    title: string;
    intro: string;
    ok: string;
    warn: string;
    unknown: string;
    legend: string;
    deploy: string;
    deployDetail: string;
    localBuild: string;
    vsMain: string;
    upToDate: string;
    behind: string;
    unreachable: string;
    data: string;
    dataFresh: string;
    dataStale: string;
  };
}

export interface Project {
  id: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  tags: string[];
  /** Unused since the 11/2026 redesign (no covers); kept on older entries. */
  imageUrl?: string;
  imageHint?: string;
  githubUrl?: string;
  demoUrl?: string;
  codesandboxId?: string;
  metrics?: { label: Record<Locale, string>; value: string }[];
}

export interface Experience {
  date: Record<Locale, string>;
  title: Record<Locale, string>;
  company: string;
  description: Record<Locale, string>;
  tags: string[];
}

export type ArticleContent = {
    type: 'heading';
    level: 2 | 3 | 4;
    content: string;
} | {
    type: 'paragraph';
    content: string;
} | {
    /** Items support inline `code` and [text](href) — see lib/inline-markup.ts */
    type: 'list';
    ordered?: boolean;
    items: string[];
} | {
    type: 'code';
    language: string;
    /** Shown in the code block's title bar. */
    filename?: string;
    code: string;
};

/** Structured summary rendered above a case study's prose: facts strip and timeline. */
export interface CaseStudy {
  facts: { label: string; value: string; mono?: boolean }[];
  /** `event` = something that happened, `decision` = something chosen or still open. */
  timeline: { when: string; kind: 'event' | 'decision'; title: string; body: string }[];
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  content: ArticleContent[];
  /** Untranslated technical terms, like project tags — used for filtering and related posts. */
  tags: string[];
  imageUrl?: string;
  imageHint?: string;
  caseStudy?: CaseStudy;
}

