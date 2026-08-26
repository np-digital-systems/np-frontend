'use server';

import { requireSession } from '@/features/auth/lib/session';

import type { SearchResult } from '../constants/search-shapes';

import { search } from './search-service';

/**
 * Search from the command palette.
 *
 * The palette is a client component, so the query goes through here — which
 * keeps the scoping on the server, where the session's permissions decide what
 * each source may return.
 */
export async function searchPortal(query: string): Promise<SearchResult[]> {
  await requireSession();

  return search(query);
}
