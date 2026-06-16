import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ta'],
  defaultLocale: 'ta',
  localeDetection: false // Prevents automatic browser language overrides
});

// Professional utility exports for type-safe navigation later
export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);