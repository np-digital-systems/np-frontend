import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

export default createMiddleware({
  locales: locales,      // ['en', 'ta']
  defaultLocale: 'ta',  // Fallback language
  localeDetection: false
});

export const config = {
  matcher: ['/', '/(en|ta)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};