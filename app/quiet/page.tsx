import { permanentRedirect } from 'next/navigation';

export default function QuietRedirect() {
  permanentRedirect('/');
}
