import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'ChefSense AI - Cook like a chef',
  description:
    'Real-time Indian cooking intelligence that adapts to you, your ingredients, and your taste.',
  applicationName: 'ChefSense AI',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
