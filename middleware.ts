import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Host-based routing: serve the Lab/Dashboard under dev.tvignoli.com
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host') || '';
  const isDevSubdomain = host.split(':')[0] === 'dev.tvignoli.com';

  if (!isDevSubdomain) return NextResponse.next();

  const allowed = ['/lab', '/dashboard', '/_next', '/api', '/favicon.ico', '/assets', '/images'];
  const path = url.pathname;

  // Redirect root of dev subdomain to /lab
  if (path === '/') {
    url.pathname = '/lab';
    return NextResponse.rewrite(url);
  }

  // Allow only lab and dashboard (and internal assets) on dev subdomain
  const isAllowed = allowed.some((p) => path === p || path.startsWith(p + '/'));
  if (!isAllowed) {
    url.pathname = '/lab';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude static files that Next serves directly
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};