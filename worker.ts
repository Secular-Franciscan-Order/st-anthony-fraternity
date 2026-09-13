import { handleContactRequest } from './lib/contact.ts';
import { canonicalRedirect, isProductionOrigin } from './lib/site-hosting.ts';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const destination = canonicalRedirect(url);
    if (destination) return Response.redirect(destination, 308);

    const response =
      url.pathname === '/api/contact'
        ? await handleContactRequest(request, {
            email: env.CONTACT_EMAIL,
            turnstileSecret:
              'TURNSTILE_SECRET_KEY' in env &&
              typeof env.TURNSTILE_SECRET_KEY === 'string'
                ? env.TURNSTILE_SECRET_KEY
                : undefined,
          })
        : new Response('Not found', { status: 404 });
    if (!isProductionOrigin(url))
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  },
} satisfies ExportedHandler<Env>;
