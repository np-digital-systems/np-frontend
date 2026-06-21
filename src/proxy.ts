import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest } from 'next/server';

// 1. Next.js 16 Rule: Must create the handler instance
const handleI18nRouting = createMiddleware(routing);

// 2. Next.js 16 Rule: The exported function MUST be named 'proxy'
export default function middleware(request: NextRequest) {
  return handleI18nRouting(request);
}

// 3. Keep your request routing paths clean
export const config = {
  matcher: [
    '/', 
    '/(en|ta)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};