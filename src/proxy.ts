import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { env } from './config/env';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

const ACCESS_TOKEN_COOKIE = 'np_access';
const REFRESH_TOKEN_COOKIE = 'np_refresh';
const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/** Everything under these segments needs a session. */
const PROTECTED_SEGMENTS = [
  'dashboard',
  'accounting',
  'finance',
  'event-management',
  'administration',
  'notifications',
  'contributions',
];

const SIGN_IN_PATH = 'login';

function localeOf(pathname: string): string {
  const first = pathname.split('/').filter(Boolean)[0];

  return (routing.locales as readonly string[]).includes(first ?? '')
    ? first!
    : routing.defaultLocale;
}

function segmentsAfterLocale(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean);

  return (routing.locales as readonly string[]).includes(parts[0] ?? '')
    ? parts.slice(1)
    : parts;
}

function isExpired(token: string, skewSeconds = 30): boolean {
  const payload = token.split('.')[1];

  if (!payload) return true;

  try {
    const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: number;
    };

    return typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now() + skewSeconds * 1000;
  } catch {
    return true;
  }
}

interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Rotate the token pair before the render begins.
 *
 * This is the only place it can happen: a server component cannot write
 * cookies during a render, so a token refreshed there could never be kept.
 */
async function refresh(refreshToken: string): Promise<RefreshedTokens | null> {
  try {
    const response = await fetch(`${env.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const tokens = (await response.json()) as Partial<RefreshedTokens>;

    return tokens.accessToken && tokens.refreshToken
      ? { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
      : null;
  } catch {
    return null;
  }
}

function cookieOptions(persistent: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(persistent ? { maxAge: REFRESH_MAX_AGE_SECONDS } : {}),
  };
}

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segments = segmentsAfterLocale(pathname);
  const locale = localeOf(pathname);

  const isProtected = PROTECTED_SEGMENTS.includes(segments[0] ?? '');
  const isSignIn = segments[0] === SIGN_IN_PATH;

  if (!isProtected && !isSignIn) return handleI18nRouting(request);

  const access = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  let token = access;
  let rotated: RefreshedTokens | null = null;

  if ((!token || isExpired(token)) && refreshToken) {
    rotated = await refresh(refreshToken);
    token = rotated?.accessToken;
  }

  const signedIn = Boolean(token) && !isExpired(token!);

  // Somebody already signed in has no business on the sign-in screen.
  if (isSignIn && signedIn) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  if (isProtected && !signedIn) {
    const target = new URL(`/${locale}/${SIGN_IN_PATH}`, request.url);

    // Where they were headed, so the sign-in can put them back.
    target.searchParams.set('next', `${pathname}${search}`);

    const response = NextResponse.redirect(target);

    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);

    return response;
  }

  const response = handleI18nRouting(request);

  if (rotated) {
    const persistent = Boolean(request.cookies.get(REFRESH_TOKEN_COOKIE));

    // The render that follows reads the request cookies, so the rotated token
    // has to be visible to it as well as sent back to the browser.
    request.cookies.set(ACCESS_TOKEN_COOKIE, rotated.accessToken);
    request.cookies.set(REFRESH_TOKEN_COOKIE, rotated.refreshToken);

    response.cookies.set(ACCESS_TOKEN_COOKIE, rotated.accessToken, cookieOptions(persistent));
    response.cookies.set(REFRESH_TOKEN_COOKIE, rotated.refreshToken, cookieOptions(persistent));
  }

  return response;
}

export const config = {
  matcher: ['/', '/(en|ta)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
