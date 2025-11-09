import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isSupportedLocale, matchLocaleFromAcceptLanguage } from '@/lib/i18n/config';

// Host-based routing combined with locale cookie bootstrap
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';
  const isDevSubdomain = host.split(':')[0] === 'dev.tvignoli.com';
  const allowed = ['/lab', '/dashboard', '/_next', '/api', '/favicon.ico', '/assets', '/images'];
  const path = url.pathname;

  let response: NextResponse;

  if (isDevSubdomain) {
    if (path === '/') {
      url.pathname = '/lab';
      response = NextResponse.rewrite(url);
    } else {
      const isAllowed = allowed.some((p) => path === p || path.startsWith(`${p}/`));
      if (!isAllowed) {
        url.pathname = '/lab';
        response = NextResponse.rewrite(url);
      } else {
        response = NextResponse.next();
      }
    }
  } else {
    response = NextResponse.next();
  }

  const localeCookie = req.cookies.get('locale');
  if (!localeCookie || !isSupportedLocale(localeCookie.value)) {
    const detected = matchLocaleFromAcceptLanguage(req.headers.get('accept-language'));
    response.cookies.set('locale', detected ?? DEFAULT_LOCALE, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Exclude static files that Next serves directly
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
