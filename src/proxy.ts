import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  matchLocaleFromAcceptLanguage,
} from '@/lib/i18n/config';
import { getLocaleFromPath, localizedPath, stripLocaleFromPath } from '@/lib/i18n/paths';

const STATIC_PATH_PREFIXES = [
  '/_next',
  '/api',
  '/favicon.ico',
  '/icon.svg',
  '/apple-icon',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/.well-known',
  '/opengraph-image',
  '/og-image.png',
  '/thomas-vignoli.svg',
  '/thomas-vignoli.png',
  '/images',
];

function isStaticOrAsset(path: string): boolean {
  return STATIC_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function getPreferredLocale(req: NextRequest) {
  const cookieLocale = req.cookies.get('locale')?.value;
  if (isSupportedLocale(cookieLocale)) return cookieLocale;
  return matchLocaleFromAcceptLanguage(req.headers.get('accept-language')) ?? DEFAULT_LOCALE;
}

function isDevelopmentEnvironment(req?: NextRequest): boolean {
  if (process.env.NODE_ENV === 'development') return true;

  const host = req?.headers.get('host')?.split(':')[0] ?? '';
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
}

function buildDevelopmentContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: data: http: https:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' ws: wss: http: https:",
    "worker-src 'self' blob:",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

// Origin of the optional mini-lab backend (live lab), so the /live page may
// fetch it. Only its origin is allowed, and only when configured.
function miniLabOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_MINILAB_URL;
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function buildContentSecurityPolicy(): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ].join(' ');

  const connectSrc = [
    "'self'",
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://*.google-analytics.com',
    miniLabOrigin(),
  ]
    .filter(Boolean)
    .join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob: https://www.google-analytics.com https://www.googletagmanager.com",
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

function applySecurityHeaders(response: NextResponse, req?: NextRequest) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Kept for pre-CSP browsers; `frame-ancestors 'none'` below is what modern
  // ones enforce. X-XSS-Protection is deliberately absent: it's a no-op in
  // every current browser and its legacy filter introduced its own bugs.
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // React/Turbopack dev tooling needs eval + HMR websockets. Production keeps strict CSP.
  if (isDevelopmentEnvironment(req)) {
    response.headers.set('Content-Security-Policy', buildDevelopmentContentSecurityPolicy());
  } else {
    response.headers.set('Content-Security-Policy', buildContentSecurityPolicy());
  }

  return response;
}

function withLocaleHeader(response: NextResponse, locale: string) {
  response.headers.set('x-locale', locale);
  return response;
}

// --- Experimental /shell route: real bash-on-WASIX rendered in xterm.js ------
// @wasmer/sdk needs SharedArrayBuffer (threads) → the page must be cross-origin
// isolated (COOP+COEP) AND its CSP must permit WebAssembly + workers. Both are
// scoped to /shell ONLY, so the rest of the site keeps its strict CSP and its
// cross-origin resources (analytics, Google Fonts, CodeSandbox) keep working.
function buildShellContentSecurityPolicy(): string {
  // esm.sh serves the unbundled @wasmer/sdk (see real-shell.tsx for why); the
  // SDK then pulls the bash package from the Wasmer registry.
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://esm.sh",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://esm.sh https://registry.wasmer.io https://*.wasmer.io blob: data:",
    "worker-src 'self' blob: https://esm.sh",
    "child-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
  ].join('; ');
}

function applyShellIsolationHeaders(response: NextResponse, req?: NextRequest) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    isDevelopmentEnvironment(req)
      ? buildDevelopmentContentSecurityPolicy()
      : buildShellContentSecurityPolicy()
  );
  // credentialless (not require-corp) keeps cross-origin isolation on while being
  // permissive on cross-origin subresources, so the page won't hard-break.
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  return response;
}

// Host-based routing, locale path redirects, and security headers
export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';
  const isDevSubdomain = host.split(':')[0] === 'dev.tvignoli.com';
  const path = url.pathname;

  if (isStaticOrAsset(path)) {
    return applySecurityHeaders(NextResponse.next(), req);
  }

  const pathLocale = getLocaleFromPath(path);
  const preferredLocale = getPreferredLocale(req);

  // Redirect legacy URLs without locale prefix → /{locale}/...
  if (!pathLocale) {
    const targetPath = path === '/' ? localizedPath(preferredLocale) : localizedPath(preferredLocale, path);
    const redirect = NextResponse.redirect(new URL(targetPath, req.url));
    redirect.cookies.set('locale', preferredLocale, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    return applySecurityHeaders(redirect, req);
  }

  let response: NextResponse;

  if (isDevSubdomain) {
    const stripped = stripLocaleFromPath(path);
    const labAllowed =
      stripped === '/' ||
      stripped.startsWith('/lab') ||
      stripped.startsWith('/shell') ||
      stripped.startsWith('/live') ||
      stripped.startsWith('/dashboard');

    if (!labAllowed) {
      url.pathname = localizedPath(pathLocale, '/lab');
      response = NextResponse.rewrite(url);
    } else if (stripped === '/') {
      url.pathname = localizedPath(pathLocale, '/lab');
      response = NextResponse.rewrite(url);
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  response.cookies.set('locale', pathLocale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  const withLocale = withLocaleHeader(response, pathLocale);
  return stripLocaleFromPath(path).startsWith('/shell')
    ? applyShellIsolationHeaders(withLocale, req)
    : applySecurityHeaders(withLocale, req);
}

export const config = {
  matcher: [
    '/',
    '/((?!_next/static|_next/image|favicon.ico|icon\\.svg|apple-icon|robots.txt|sitemap.xml|llms.txt|\\.well-known|opengraph-image|og-image.png|thomas-vignoli\\.svg|thomas-vignoli\\.png|images/).*)',
  ],
};
