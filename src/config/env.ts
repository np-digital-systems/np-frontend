export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;
