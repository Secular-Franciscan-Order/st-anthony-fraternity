import { PilgrimSite } from '@/components/PilgrimSite';

// Fail the build if this informational page cannot be exported.
export const dynamic = 'force-static';

export default function Home() {
  return <PilgrimSite />;
}
