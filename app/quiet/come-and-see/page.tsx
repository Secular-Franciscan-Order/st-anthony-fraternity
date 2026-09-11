import { permanentRedirect } from 'next/navigation';

export default function QuietComeAndSeeRedirect() {
  permanentRedirect('/#come-and-see');
}
