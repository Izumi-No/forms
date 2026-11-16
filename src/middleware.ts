import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

const ADMIN_PATHS = ['/admin/dashboard', '/admin/submissions'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path needs admin auth
  const needsAuth = ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (!needsAuth) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('admin_token');
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};