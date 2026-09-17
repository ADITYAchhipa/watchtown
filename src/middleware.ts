import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes (except login and register pages)
  if (pathname.startsWith('/admin') && 
      pathname !== '/admin/login' && 
      pathname !== '/admin/register') {
    const token = request.cookies.get('watchtown_auth_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Note: Full token verification happens in the page server component.
    // This middleware provides a fast first-pass check for the cookie existence.
  }
  
  // Protect admin API routes
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('watchtown_auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
