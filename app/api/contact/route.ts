import { env } from 'cloudflare:workers';
import { handleContactRequest } from '@/lib/contact';

export function POST(request: Request) {
  return handleContactRequest(request, {
    email: env.CONTACT_EMAIL,
    turnstileSecret:
      'TURNSTILE_SECRET_KEY' in env &&
      typeof env.TURNSTILE_SECRET_KEY === 'string'
        ? env.TURNSTILE_SECRET_KEY
        : undefined,
  });
}

export function GET() {
  return Response.json(
    { message: 'Method not allowed.' },
    {
      status: 405,
      headers: { Allow: 'POST', 'Cache-Control': 'no-store' },
    },
  );
}

export const HEAD = GET;
export const OPTIONS = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
