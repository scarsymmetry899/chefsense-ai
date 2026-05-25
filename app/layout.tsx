import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const manrope = Manrope({
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
      className={`${playfair.variable} ${manrope.variable} ${jetbrains.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
