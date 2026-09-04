import type { Metadata } from 'next';
import { QuietShell } from '@/components/QuietShell';

export const metadata: Metadata = {
  title: 'Quiet Welcome',
  description:
    'A calm, welcoming website concept for Saint Anthony Fraternity in Tucson.',
};

export default function QuietLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QuietShell>{children}</QuietShell>;
}
