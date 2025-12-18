import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public and API routes without checks
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Admin route guard
  if (pathname.startsWith('/admin')) {
    // In development, allow admin routes without JWT so mock login works
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }

    // Allow admin login page without token
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const auth = await verifyToken(req);
    if (!auth.success || !auth.user) {
      // Not authenticated: go to admin login
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    if (auth.user.role !== 'admin') {
      // Authenticated but not admin: redirect to user dashboard/home
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Admin authenticated and authorized
    return NextResponse.next();
  }

  // Default allow for non-admin pages
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api).*)'],
};