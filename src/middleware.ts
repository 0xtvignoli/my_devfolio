import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Se il dominio è dev.tvignoli.com, reindirizza alla pagina lab
  if (hostname.startsWith('dev.')) {
    const url = request.nextUrl.clone();
    
    // Se siamo già su /lab, continua
    if (url.pathname === '/lab') {
      return NextResponse.next();
    }
    
    // Altrimenti, reindirizza a /lab
    url.pathname = '/lab';
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

