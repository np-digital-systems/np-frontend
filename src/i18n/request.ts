// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the parameter injected by the Next.js router
  let locale = await requestLocale;

  // Professional Guard: If Next.js runs this during build time, 
  // requestLocale is empty. We gracefully assign the official default.
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});