'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** How long an abandoned draft is worth keeping. */
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
    // A private window, a full quota, or something else's key in our namespace.
    // A missing draft is the normal case anyway, so there is nothing to report.
    return null;
  }
}

/**
 * Keep what somebody typed, so closing a dialog by accident does not cost it.
 *
 * A voucher is a dozen fields and two or three lookups; losing it to a stray
 * click is the difference between a shrug and starting again. The draft is
 * written as it is edited and offered back the next time the same form opens.
 *
 * `sessionStorage`, deliberately: a half-finished receipt should survive a
 * misclick and a reload, not follow somebody to work tomorrow. It is scoped to
 * the tab, cleared when the tab closes, and expires after an hour regardless.
 * Nothing here is a substitute for saving — the API remains the only place a
 * voucher actually exists.
 *
 * `key` must identify the record being edited (`voucher:new:receipt`), so two
 * dialogs never read each other's work.
 */
export function useFormDraft<T>(
  key: string,
  current: T,
  options: { enabled?: boolean } = {},
): {
  /** A kept draft found when the form opened, or null. */
  restored: T | null;
  /** Forget it — call after a successful save, or when the user declines it. */
  discard: () => void;
} {
  const { enabled = true } = options;

  // Read once per opening. Reading on every render would hand back the draft
  // being written a moment ago and make the offer impossible to dismiss.
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

  // Written on every edit rather than on close: a dialog can go away without
  // warning — a misclick, a reload, a crashed tab — and an unsaved keystroke is
  // exactly the one worth having kept.
  useEffect(() => {
    if (!enabled || !opened.current) return;

    try {
      sessionStorage.setItem(
        KEY_PREFIX + key,
        JSON.stringify({ savedAt: Date.now(), value: current } satisfies Stored<T>),
      );
    } catch {
      // Out of quota or storage denied. The form still works; it just will not
      // survive a mishap, which is no worse than before this existed.
    }
  }, [enabled, key, current]);

  const discard = useCallback(() => {
    setRestored(null);

    try {
      sessionStorage.removeItem(KEY_PREFIX + key);
    } catch {
      // Nothing to do — the entry expires on its own.
    }
  }, [key]);

  return { restored, discard };
}
