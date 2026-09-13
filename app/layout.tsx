import type { Metadata } from 'next';
import { productionOrigin } from '@/lib/site-hosting';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(productionOrigin),
  alternates: { canonical: `${productionOrigin}/` },
  title: {
    default: 'Saint Anthony Fraternity',
    template: '%s | Saint Anthony Fraternity',
  },
  description:
    'Saint Anthony Fraternity of the Secular Franciscan Order in Tucson, Arizona.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
