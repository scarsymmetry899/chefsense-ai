import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Fraunces — warm, food-friendly display serif with optical sizing.
// Used by Stripe, GitHub, multiple food/restaurant brands.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

// Inter — neutral, modern body sans. Crisper than Manrope at small sizes.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'ChefSense AI — Cook like a chef',
  description:
    'Real-time Indian cooking intelligence that adapts to you, your ingredients, and your taste.',
  applicationName: 'ChefSense AI',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-512.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFF8ED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
