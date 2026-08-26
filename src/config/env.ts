/**
 * Server-side base URL for the API.
 *
 * Distinct from the public one because server components talk to the API
 * directly — inside a container network that is a service name, not the address
 * a browser could reach.
 */
const apiUrl = process.env.API_URL ?? 'http://localhost:4000/api/v1';

export const env = {
  apiUrl,
  publicApiUrl: process.env.NEXT_PUBLIC_API_URL ?? apiUrl,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;
