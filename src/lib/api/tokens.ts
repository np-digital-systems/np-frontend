import 'server-only';

export const ACCESS_TOKEN_COOKIE = 'np_access';
export const REFRESH_TOKEN_COOKIE = 'np_refresh';

/** Long enough to outlive the refresh token, which is what actually expires. */
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

/**
 * Read the claims without verifying the signature.
 *
 * Only ever used to decide whether a token is worth sending or should be
 * refreshed first. The API verifies every token it is given; nothing here is
 * a security decision.
 */
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

/** True with 30 seconds to spare, so a token cannot expire mid-flight. */
export function isExpired(token: string, skewSeconds = 30): boolean {
  const claims = readClaims(token);

  if (!claims) return true;

  return claims.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
