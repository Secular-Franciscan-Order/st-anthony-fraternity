import { permanentRedirect } from 'next/navigation';

export default function QuietQuestionsRedirect() {
  permanentRedirect('/#questions');
}
