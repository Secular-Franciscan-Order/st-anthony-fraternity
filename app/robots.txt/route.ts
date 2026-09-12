import { isProductionOrigin, productionOrigin } from '@/lib/site-hosting';

export function GET(request: Request) {
  const body = isProductionOrigin(new URL(request.url))
    ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${productionOrigin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
