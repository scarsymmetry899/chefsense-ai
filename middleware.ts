import { NextResponse, type NextRequest } from 'next/server';

const AUTH_COOKIE = 'chefsense_session';

/**
 * Gate /dish/* and /profile behind login. When a signed-out user clicks a
 * shared dish link, send them to /login?next=<path> first so they land on
 * the dish after authenticating.
 */
export function middleware(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE);
  if (cookie?.value === '1') return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/dish/:path*', '/profile', '/pantry'],
};
