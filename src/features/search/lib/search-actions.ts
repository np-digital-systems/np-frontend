'use server';

import { requireSession } from '@/features/auth/lib/session';

import type { SearchResult } from '../constants/search-shapes';

import { search } from './search-service';

// Server action so the client palette's queries are scoped by session permissions.
export async function searchPortal(query: string): Promise<SearchResult[]> {
  await requireSession();

  return search(query);
}
