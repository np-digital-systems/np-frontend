import 'server-only';

import { cookies } from 'next/headers';

import { env } from '@/config/env';

import { ApiError, type ApiErrorBody } from './errors';
import { ACCESS_TOKEN_COOKIE } from './tokens';

export interface PageMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly pageCount: number;
  readonly hasNextPage: boolean;
}

export interface Page<T> {
  readonly data: readonly T[];
  readonly meta: PageMeta;
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  readonly query?: Query;
  readonly body?: unknown;
  /** Seconds to cache the response for. Omit for always-fresh. */
  readonly revalidate?: number;
  readonly tags?: readonly string[];
  /** Send without a bearer token — only the public routes. */
  readonly anonymous?: boolean;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function authorisation(anonymous: boolean): Promise<Record<string, string>> {
  if (anonymous) return {};

  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  return token ? { authorization: `Bearer ${token}` } : {};
}

/**
 * One request to the API.
 *
 * Refreshing is deliberately not done here: a server component cannot write
 * cookies during a render, so a token rotated here could never be stored. The
 * proxy refreshes before the render begins, which is the only place a new
 * token can actually be kept. A 401 that reaches this far means the session is
 * genuinely gone, and callers turn it into a redirect.
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, body, revalidate, tags, anonymous = false } = options;

  const url = buildUrl(path, query);
  const headers = {
    accept: 'application/json',
    ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    ...(await authorisation(anonymous)),
  };

  /*
   * Only reads are retried.
   *
   * A write that fails without a response may still have been applied — the
   * request can reach the API and the reply be lost on the way back. Repeating
   * it would post a second voucher against the same money, so a write is
   * attempted once and its failure surfaces to the caller.
   */
  const attempts = method === 'GET' ? RETRY_DELAYS_MS.length + 1 : 1;

  let response: Response | undefined;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(WAKE_TIMEOUT_MS),
        ...(revalidate === undefined
          ? { cache: 'no-store' as const }
          : { next: { revalidate, ...(tags ? { tags: [...tags] } : {}) } }),
      });

      if (!WAKING_STATUSES.has(response.status)) break;
    } catch (error) {
      if (!isWaking(error) || attempt === attempts - 1) throw error;
    }

    const delay = RETRY_DELAYS_MS[attempt];

    if (delay === undefined) break;

    await sleep(delay);
  }

  if (!response) {
    throw new ApiError(503, { message: 'The API did not respond.' });
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const payload: unknown = text ? safeParse(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, (payload ?? {}) as Partial<ApiErrorBody>);
  }

  return payload as T;
}

/**
 * How long to wait, and how hard to try again.
 *
 * A free-tier host stops the API when nobody has called it for a while, and
 * waking it takes the better part of a minute. A scheduled ping keeps it up
 * (see .github/workflows/keep-alive.yml), but schedules drift, so the first
 * request after a quiet spell can still meet an instance on its way up.
 *
 * The budget here is deliberately about ten seconds rather than the fifty a
 * cold start can take. The render is already blocking a visitor, and the
 * platform running it caps how long a request may take, so waiting out a full
 * wake would hit that ceiling and fail anyway. This covers a brief gap or a
 * fast wake; keeping the instance up is the ping's job, not this one's.
 */
const WAKE_TIMEOUT_MS = 30_000;
const RETRY_DELAYS_MS = [1_000, 3_000, 6_000];

/** A gateway error is the host saying the instance is not up yet. */
const WAKING_STATUSES = new Set([502, 503, 504]);

function isWaking(error: unknown): boolean {
  // fetch rejects rather than resolving when the connection is refused.
  return error instanceof TypeError;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    apiRequest<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>('POST', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>('PATCH', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>('PUT', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>('DELETE', path, options),
};

/**
 * Read a collection where the caller wants the rows and nothing else.
 *
 * The API paginates the large ones; a screen that renders a whole list asks for
 * the maximum page rather than pretending pagination does not exist.
 */
export async function getAll<T>(
  path: string,
  query?: Query,
): Promise<readonly T[]> {
  const result = await api.get<Page<T> | T[]>(path, {
    query: { limit: 100, ...query },
  });

  return Array.isArray(result) ? result : result.data;
}
