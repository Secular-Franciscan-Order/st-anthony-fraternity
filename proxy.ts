import { NextResponse } from 'next/server';
import { canonicalRedirect, isProductionOrigin } from './lib/site-hosting';

export function proxy(request: Request) {
  const url = new URL(request.url);
  const destination = canonicalRedirect(url);
  if (destination) return NextResponse.redirect(destination, 308);

  const response = NextResponse.next();
  if (!isProductionOrigin(url))
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
