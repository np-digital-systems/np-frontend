import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

export default createMiddleware({
  locales: locales,      // ['en', 'es']
  defaultLocale: 'ta'  ,  // Fallback language
  localeDetection: false
});

export const config = {
  // This matcher tells Next.js to run this cop on every single URL path
  matcher: ['/', '/(ta|en)/:path*'] 
};