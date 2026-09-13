import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleContactRequest } from '../lib/contact.ts';
import { canonicalRedirect, isProductionOrigin } from '../lib/site-hosting.ts';

const origin = 'https://stanthonytucson.org';
type Mail = Parameters<SendEmail['send']>[0];
const goodFields = {
  name: 'Test Visitor',
  email: 'visitor@example.com',
  message: 'A synthetic test note.',
  'cf-turnstile-response': 'test-token',
};

function fixture(
  verification: unknown = {
    success: true,
    hostname: 'stanthonytucson.org',
    action: 'contact',
  },
) {
  const sent: Mail[] = [];
  let verifications = 0;
  const services = {
    turnstileSecret: 'TEST_SECRET_ONLY',
    email: {
      send: async (mail: Mail) => {
        sent.push(mail);
        return { messageId: 'test-id' };
      },
    } as SendEmail,
    verify: (async (_input: RequestInfo | URL, init?: RequestInit) => {
      verifications++;
      assert.ok(init?.body instanceof FormData);
      assert.equal(init.body.get('secret'), 'TEST_SECRET_ONLY');
      return Response.json(verification);
    }) as typeof fetch,
  };
  return { sent, services, verificationCount: () => verifications };
}

function request(
  fields: Record<string, string> = {},
  options: {
    url?: string;
    origin?: string | null;
    headers?: Record<string, string>;
  } = {},
) {
  const body = new FormData();
  for (const [name, value] of Object.entries({ ...goodFields, ...fields }))
    body.set(name, value);
  return new Request(options.url ?? `${origin}/api/contact`, {
    method: 'POST',
    body,
    headers: {
      ...(options.origin === null ? {} : { Origin: options.origin ?? origin }),
      ...options.headers,
    },
  });
}

async function expectFailure(req: Request, status: number, state = fixture()) {
  const response = await handleContactRequest(req, state.services);
  assert.equal(response.status, status);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(state.sent, []);
  assert.doesNotMatch(
    await response.text(),
    /TEST_SECRET_ONLY|test-token|visitor@example\.com/,
  );
}

void test('sends one message only to Benjamin with visitor Reply-To and optional phone', async () => {
  for (const phone of ['', '+1 (520) 555-0100']) {
    const state = fixture();
    const response = await handleContactRequest(
      request({
        phone,
        to: 'attacker@example.com',
        from: 'attacker@example.com',
      }),
      state.services,
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(state.sent.length, 1);
    assert.deepEqual(state.sent[0].to, ['benjamin.saenz@gmail.com']);
    assert.deepEqual(state.sent[0].from, {
      email: 'contact@stanthonytucson.org',
      name: 'St. Anthony Fraternity',
    });
    assert.equal(state.sent[0].replyTo, 'visitor@example.com');
    assert.ok(
      state.sent[0].text?.includes(`Phone: ${phone || 'Not provided'}`),
    );
    assert.match(await response.text(), /accepted for delivery/);
  }
});

void test('requires exact HTTPS origin and production destination, including against forged origins on previews', async () => {
  for (const deniedOrigin of [
    null,
    'null',
    'https://attacker.example',
    'http://stanthonytucson.org',
    `${origin}:444`,
    `${origin}/path`,
    'https://www.stanthonytucson.org',
  ]) {
    await expectFailure(request({}, { origin: deniedOrigin }), 403);
  }
  for (const hostname of [
    'stanthonyfraternity.endian.dev',
    'version-st-anthony.workers.dev',
    'localhost',
  ]) {
    await expectFailure(
      request({}, { url: `https://${hostname}/api/contact` }),
      403,
    );
  }
});

void test('rejects wrong method without attempting verification', async () => {
  const state = fixture();
  const response = await handleContactRequest(
    new Request(`${origin}/api/contact`),
    state.services,
  );
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'POST');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(state.verificationCount(), 0);
});

void test('rejects missing required fields, malformed email, missing token and overlong fields without truncation', async () => {
  const invalidFields: Record<string, string>[] = [
    { email: '' },
    { email: 'invalid' },
    { email: 'visitor@example.com\r\nBcc:other@example.com' },
    { message: ' ' },
    { 'cf-turnstile-response': '' },
    { name: 'x'.repeat(201) },
    { email: 'x'.repeat(251) },
    { phone: 'x'.repeat(51) },
    { message: 'x'.repeat(5_001) },
    { 'cf-turnstile-response': 'x'.repeat(2_049) },
  ];
  for (const fields of invalidFields) {
    await expectFailure(request(fields), 400);
  }
});

void test('rejects malformed and missing bodies, duplicate fields and file uploads', async () => {
  const contentTypes: Record<string, string>[] = [
    {},
    { 'Content-Type': 'application/json' },
    { 'Content-Type': 'multipart/form-data; boundary=missing' },
  ];
  for (const headers of contentTypes) {
    await expectFailure(
      new Request(`${origin}/api/contact`, {
        method: 'POST',
        headers: { Origin: origin, ...headers },
        body: '{invalid',
      }),
      400,
    );
  }
  await expectFailure(
    new Request(`${origin}/api/contact`, {
      method: 'POST',
      headers: { Origin: origin },
    }),
    400,
  );
  for (const value of ['duplicate', new Blob(['not a text field'])]) {
    const body = new FormData();
    for (const [name, field] of Object.entries(goodFields))
      body.set(name, field);
    body.append('message', value);
    await expectFailure(
      new Request(`${origin}/api/contact`, {
        method: 'POST',
        headers: { Origin: origin },
        body,
      }),
      400,
    );
  }
});

void test('enforces byte cap with large, missing or dishonest Content-Length and streamed bodies', async () => {
  await expectFailure(
    request({}, { headers: { 'Content-Length': '10001' } }),
    413,
  );
  for (const length of [undefined, '1']) {
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(6_000));
        controller.enqueue(new Uint8Array(4_001));
      },
      cancel() {
        cancelled = true;
      },
    });
    const init: RequestInit & { duplex: 'half' } = {
      method: 'POST',
      duplex: 'half',
      body: stream,
      headers: {
        Origin: origin,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(length ? { 'Content-Length': length } : {}),
      },
    };
    await expectFailure(new Request(`${origin}/api/contact`, init), 413);
    assert.equal(cancelled, true);
  }
});

void test('honeypot accepts without verification or mail', async () => {
  const state = fixture();
  const response = await handleContactRequest(
    request({ website: 'spam.example' }),
    state.services,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(state.verificationCount(), 0);
  assert.deepEqual(state.sent, []);
});

void test('rejects failed, expired, wrong-host and wrong-action verification', async () => {
  for (const result of [
    null,
    {},
    { success: false, 'error-codes': ['timeout-or-duplicate'] },
    { success: true, hostname: 'attacker.example', action: 'contact' },
    {
      success: true,
      hostname: 'stanthonyfraternity.endian.dev',
      action: 'contact',
    },
    { success: true, hostname: 'stanthonytucson.org', action: 'other' },
  ]) {
    await expectFailure(request(), 400, fixture(result));
  }
});

void test('fails safely for missing configuration or verification/provider outages without leaking errors', async () => {
  const missing = fixture();
  missing.services.turnstileSecret = '';
  await expectFailure(request(), 503, missing);
  const unavailable = fixture();
  unavailable.services.verify = async () => {
    throw new Error('TEST_SECRET_ONLY visitor@example.com');
  };
  await expectFailure(request(), 503, unavailable);
  const rejected = fixture();
  rejected.services.email.send = async () => {
    throw new Error('TEST_SECRET_ONLY visitor@example.com');
  };
  await expectFailure(request(), 502, rejected);
});

void test('escapes HTML while preserving the full plain text and line breaks', async () => {
  const state = fixture();
  const message = '<script>"hi" & \'bye\'</script>\nSecond line';
  await handleContactRequest(
    request({ name: '<b>Visitor</b>', phone: '<123>', message }),
    state.services,
  );
  assert.ok(state.sent[0].text?.includes(message));
  assert.doesNotMatch(state.sent[0].html!, /<script>|<b>|<123>/);
  assert.match(
    state.sent[0].html!,
    /&lt;script&gt;&quot;hi&quot; &amp; &#39;bye&#39;&lt;\/script&gt;<br>Second line/,
  );
});

void test('canonical redirects preserve paths and queries and only production is indexable', () => {
  assert.equal(
    canonicalRedirect(
      new URL('https://www.stanthonytucson.org/quiet?from=bookmark'),
    )?.href,
    `${origin}/quiet?from=bookmark`,
  );
  assert.equal(
    canonicalRedirect(new URL('http://stanthonytucson.org/?from=bookmark'))
      ?.href,
    `${origin}/?from=bookmark`,
  );
  assert.equal(canonicalRedirect(new URL(`${origin}/`)), null);
  assert.equal(
    canonicalRedirect(new URL('https://stanthonyfraternity.endian.dev/')),
    null,
  );
  assert.equal(isProductionOrigin(new URL(`${origin}/`)), true);
  assert.equal(
    isProductionOrigin(new URL('https://stanthonyfraternity.endian.dev/')),
    false,
  );
  assert.equal(
    isProductionOrigin(new URL('https://version.workers.dev/')),
    false,
  );
});
