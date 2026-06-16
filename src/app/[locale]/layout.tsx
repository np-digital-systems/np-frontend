import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from "./providers";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mallakam Neeliyampathi Pillaiyar Kovil",
    template: "%s | Neeliyampathi Pillaiyar Kovil",
  },
  description:
    "Experience divine blessings at Mallakam Neeliyampathi Pillaiyar Kovil. A sacred sanctuary of spirituality, tradition, and timeless devotion in Jaffna, Sri Lanka.",
  keywords: [
    "Pillaiyar Kovil",
    "Mallakam Temple",
    "Hindu Temple",
    "Jaffna",
    "Sri Lanka",
    "Ganesh Temple",
    "Neeliyampathi",
  ],
  openGraph: {
    title: "Mallakam Neeliyampathi Pillaiyar Kovil",
    description:
      "A sacred sanctuary of spirituality, tradition, and timeless devotion.",
    url: "https://neeliyampathipillaiyarkovil.com",
    siteName: "Neeliyampathi Pillaiyar Kovil",
    type: "website",
    locale: "en_US",
  },
};


export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {

  const locale = params.locale;

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
