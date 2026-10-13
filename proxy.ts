import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = 'token';


const PROTECTED_ROUTES = ['/dashboard', '/products', '/transactions'];


const GUEST_ONLY_ROUTES = ['/login', '/signup'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isLoggedIn = Boolean(token);

  
  if (isLoggedIn && GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  
  if (!isLoggedIn && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname); 
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};