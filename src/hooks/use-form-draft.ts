'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const TTL_MS = 60 * 60 * 1000;

const KEY_PREFIX = 'np:draft:';

interface Stored<T> {
  readonly savedAt: number;
  readonly value: T;
}

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + key);

    if (!raw) return null;

    const stored = JSON.parse(raw) as Stored<T>;

    if (Date.now() - stored.savedAt > TTL_MS) {
      sessionStorage.removeItem(KEY_PREFIX + key);

      return null;
    }

    return stored.value;
  } catch {
    // Storage unavailable or invalid data: treat as no draft.
    return null;
  }
}

// Keeps unsaved form input in sessionStorage (per tab, expires after an hour) so an accidental
// close doesn't lose it. `key` must identify the record, e.g. `voucher:new:receipt`.
export function useFormDraft<T>(
  key: string,
  current: T,
  options: { enabled?: boolean } = {},
): {
  restored: T | null;
  /** Call after saving or when the user declines the draft. */
  discard: () => void;
} {
  const { enabled = true } = options;

  // Read once per opening, or the offer would pick up the draft being written.
  const [restored, setRestored] = useState<T | null>(null);
  const opened = useRef(false);

  useEffect(() => {
    if (!enabled) {
      opened.current = false;

      return;
    }

    if (opened.current) return;

    opened.current = true;
    setRestored(read<T>(key));
  }, [enabled, key]);

  // Saved on every edit, but not while a draft is on offer: the reseeded blank form would overwrite it.
  useEffect(() => {
    if (!enabled || !opened.current || restored !== null) return;

    try {
      sessionStorage.setItem(
        KEY_PREFIX + key,
        JSON.stringify({ savedAt: Date.now(), value: current } satisfies Stored<T>),
      );
    } catch {
      // Storage unavailable; the form still works without drafts.
    }
  }, [enabled, key, current, restored]);

  const discard = useCallback(() => {
    setRestored(null);

    try {
      sessionStorage.removeItem(KEY_PREFIX + key);
    } catch {
      // Ignore; the entry expires on its own.
    }
  }, [key]);

  return { restored, discard };
}
