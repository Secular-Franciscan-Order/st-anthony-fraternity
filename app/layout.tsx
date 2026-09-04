import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Saint Anthony Fraternity Website Concepts',
    template: '%s | Saint Anthony Fraternity',
  },
  description:
    'Two website concepts for Saint Anthony Fraternity of the Secular Franciscan Order in Tucson, Arizona.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  robots: {
    index: false,
    follow: false,
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
