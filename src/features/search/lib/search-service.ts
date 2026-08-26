import 'server-only';

import { api } from '@/lib/api';

import type { SearchResult } from '../constants/search-shapes';

interface ApiSearchResult {
  readonly id: string;
  readonly type: SearchResult['type'];
  readonly title: string;
  readonly subtitle: string;
  readonly meta: string | null;
  readonly ref: string | null;
  readonly badge: string | null;
  readonly page: string;
}

/**
 * Search the portal.
 *
 * Scoped server-side by the permission guarding each source's own screen, so
 * results can never be a side door onto records the caller cannot open.
 */
export async function search(query: string): Promise<SearchResult[]> {
  const term = query.trim();

  if (term.length < 2) return [];

  const results = await api
    .get<readonly ApiSearchResult[]>('/search', { query: { q: term } })
    .catch(() => [] as readonly ApiSearchResult[]);

  return results.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle,
    meta: row.meta ?? undefined,
    ref: row.ref ?? undefined,
    badge: row.badge ?? undefined,
    page: row.page,
    keywords: [],
  }));
}
