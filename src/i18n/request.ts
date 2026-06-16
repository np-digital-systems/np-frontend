import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// 1. Define your locales array
export const locales = [ 'ta','en'] as const;

// 2. Extract the 'Locale' type explicitly from the array (fixes the error)
export type Locale = (typeof locales)[number]; 

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // 3. Cast the check using the local type
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale: locale as Locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});