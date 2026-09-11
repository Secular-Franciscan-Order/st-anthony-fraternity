import { permanentRedirect } from 'next/navigation';

export default function QuietWhoWeAreRedirect() {
  permanentRedirect('/#who-we-are');
}
