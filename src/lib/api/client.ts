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

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      accept: 'application/json',
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(await authorisation(anonymous)),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(revalidate === undefined
      ? { cache: 'no-store' as const }
      : { next: { revalidate, ...(tags ? { tags: [...tags] } : {}) } }),
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const payload: unknown = text ? safeParse(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, (payload ?? {}) as Partial<ApiErrorBody>);
  }

  return payload as T;
}

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
