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

// No token refresh here: server components can't write cookies during render, so the proxy
// refreshes before rendering. A 401 here means the session is gone.
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

  // Only reads are retried: a failed write may still have been applied, and retrying could duplicate it.
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

// The free-tier host sleeps when idle (kept awake by .github/workflows/keep-alive.yml). Retries
// cover ~10s of a cold start, not the full wake, since the hosting platform caps request time.
const WAKE_TIMEOUT_MS = 30_000;
const RETRY_DELAYS_MS = [1_000, 3_000, 6_000];

// Gateway errors mean the instance is still starting.
const WAKING_STATUSES = new Set([502, 503, 504]);

function isWaking(error: unknown): boolean {
  // fetch rejects with a TypeError when the connection is refused.
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

// Reads every page: the API caps `limit` at 100. MAX_PAGES guards against an endless hasNextPage.
export async function getAll<T>(
  path: string,
  query?: Query,
): Promise<readonly T[]> {
  const MAX_PAGES = 100;
  const rows: T[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await api.get<Page<T> | T[]>(path, {
      query: { limit: 100, ...query, page },
    });

    // Some endpoints return a bare array.
    if (Array.isArray(result)) return result;

    rows.push(...result.data);

    if (!result.meta.hasNextPage) break;
  }

  return rows;
}
