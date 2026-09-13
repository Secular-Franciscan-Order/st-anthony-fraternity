// Adapted from St. Margaret of Cortona's src/worker.ts (main 87ab38e).
import { contactLimits } from './contact-limits.ts';
import { productionHostname, productionOrigin } from './site-hosting.ts';

export const contactRecipients = ['benjamin.saenz@gmail.com'];
export const contactSender = 'contact@stanthonytucson.org';
const maxRequestSize = 10_000;
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const acceptedMessage =
  'Thank you. Your note has been accepted for delivery to the fraternity.';

type ContactServices = {
  email?: SendEmail;
  turnstileSecret?: string;
  verify?: typeof fetch;
};

const json = (message: string, status = 200) =>
  Response.json(
    { message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        ...(status === 405 ? { Allow: 'POST' } : {}),
      },
    },
  );

async function readBoundedBody(
  request: Request,
): Promise<Uint8Array<ArrayBuffer> | null> {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array(new ArrayBuffer(0));
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value.byteLength > maxRequestSize - size) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
      size += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(new ArrayBuffer(size));
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  };
  return value.replace(/[&<>'"]/g, (character) => entities[character]);
}

export async function handleContactRequest(
  request: Request,
  services: ContactServices,
): Promise<Response> {
  if (request.method !== 'POST') return json('Method not allowed.', 405);

  // Production aliases and preview versions reuse this handler.
  // Require both the destination URL and exact Origin; neither alone is enough.
  if (
    new URL(request.url).origin !== productionOrigin ||
    request.headers.get('Origin') !== productionOrigin
  ) {
    return json(
      'This form is only available on stanthonytucson.org. Please use the contact details above.',
      403,
    );
  }

  const contentLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(contentLength) && contentLength > maxRequestSize) {
    return json(
      'Your message is too large. Please shorten it and try again.',
      413,
    );
  }

  let formData: FormData;
  try {
    const body = await readBoundedBody(request);
    if (!body)
      return json(
        'Your message is too large. Please shorten it and try again.',
        413,
      );
    const contentType = request.headers.get('Content-Type');
    if (!contentType)
      return json('We could not read your message. Please try again.', 400);
    formData = await new Response(body, {
      headers: { 'Content-Type': contentType },
    }).formData();
  } catch {
    return json('We could not read your message. Please try again.', 400);
  }

  const fields: Record<string, string> = {};
  for (const [name, limit] of Object.entries(contactLimits)) {
    const values = formData.getAll(name);
    if (
      values.length > 1 ||
      values.some((value) => typeof value !== 'string')
    ) {
      return json(
        'We could not read your message. Please check the form and try again.',
        400,
      );
    }
    const value =
      typeof values[0] === 'string'
        ? values[0].replace(/\r\n?/g, '\n').trim()
        : '';
    if (value.length > limit) {
      const label =
        name === 'cf-turnstile-response' ? 'verification response' : name;
      return json(
        `Please shorten your ${label} to ${limit.toLocaleString('en-US')} characters or fewer.`,
        400,
      );
    }
    fields[name] = value;
  }

  const { name, email, phone, message, website } = fields;
  const token = fields['cf-turnstile-response'];
  if (website) return json(acceptedMessage);
  if (!emailPattern.test(email))
    return json('Please enter a valid email address.', 400);
  if (!message) return json('Please enter a message.', 400);
  if (!token)
    return json(
      'Please complete the verification before sending your message.',
      400,
    );
  if (!services.turnstileSecret || !services.email) {
    return json(
      'The form is temporarily unavailable. Please call or email the fraternity using the contact details above.',
      503,
    );
  }

  try {
    const verificationBody = new FormData();
    verificationBody.set('secret', services.turnstileSecret);
    verificationBody.set('response', token);
    const response = await (services.verify ?? fetch)(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: verificationBody,
        signal: AbortSignal.timeout(10_000),
      },
    );
    const result = (await response.json()) as {
      success?: boolean;
      hostname?: string;
      action?: string;
    } | null;
    if (
      !response.ok ||
      result?.success !== true ||
      result.hostname !== productionHostname ||
      result.action !== 'contact'
    ) {
      return json(
        'Verification expired or failed. Please complete it again and try again.',
        400,
      );
    }
  } catch {
    return json(
      'Verification is temporarily unavailable. Please try again or use the contact details above.',
      503,
    );
  }

  const visitorName = name || 'Not provided';
  const visitorPhone = phone || 'Not provided';
  try {
    await services.email.send({
      to: [...contactRecipients],
      from: { email: contactSender, name: 'St. Anthony Fraternity' },
      subject: 'New contact form message',
      replyTo: email,
      text: `Name: ${visitorName}\nEmail: ${email}\nPhone: ${visitorPhone}\n\nMessage:\n${message}`,
      html: `<h1>New contact form message</h1><p><strong>Name:</strong> ${escapeHtml(visitorName)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(visitorPhone)}</p><p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    });
  } catch {
    // Do not log provider errors: they can include the submission or addresses.
    return json(
      'We could not send your message. Please try again or use the contact details above.',
      502,
    );
  }
  return json(acceptedMessage);
}
