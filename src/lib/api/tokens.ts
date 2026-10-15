import 'server-only';

export const ACCESS_TOKEN_COOKIE = 'np_access';
export const REFRESH_TOKEN_COOKIE = 'np_refresh';

export const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export interface CookieOptions {
  readonly httpOnly: true;
  readonly sameSite: 'lax';
  readonly secure: boolean;
  readonly path: '/';
  readonly maxAge?: number;
}

export function cookieOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

interface AccessTokenClaims {
  readonly sub: string;
  readonly name: string;
  readonly role: string;
  readonly sid: string;
  readonly exp: number;
}

// Unverified decode, only to decide whether to refresh. The API verifies every token.
export function readClaims(token: string): AccessTokenClaims | null {
  const payload = token.split('.')[1];

  if (!payload) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as Partial<AccessTokenClaims>;

    if (typeof decoded.sub !== 'string' || typeof decoded.exp !== 'number') return null;

    return decoded as AccessTokenClaims;
  } catch {
    return null;
  }
}

/** Includes a 30-second margin so a token can't expire mid-request. */
export function isExpired(token: string, skewSeconds = 30): boolean {
  const claims = readClaims(token);

  if (!claims) return true;

  return claims.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
