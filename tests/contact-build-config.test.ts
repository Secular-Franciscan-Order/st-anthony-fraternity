import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contactBuildConfig } from '../lib/contact-build-config.ts';

const production = {
  send_email: [
    {
      name: 'CONTACT_EMAIL',
      allowed_destination_addresses: [
        'benjamin.saenz@gmail.com',
        'milly.rivera14@gmail.com',
      ],
      allowed_sender_addresses: ['contact@stanthonytucson.org'],
    },
  ],
};

void test('main CI and ordinary local builds retain exactly the approved email binding', () => {
  assert.deepEqual(
    contactBuildConfig({
      WORKERS_CI: '1',
      CI: 'true',
      WORKERS_CI_BRANCH: 'main',
    }),
    production,
  );
  assert.deepEqual(contactBuildConfig({}), production);
  assert.deepEqual(contactBuildConfig({ CI: 'false' }), production);
});

void test('preview branches omit the email binding without changing production values', () => {
  for (const branch of [
    'codex/issue-1-domain-contact-launch',
    'preview',
    'Main',
    ' main ',
  ]) {
    assert.deepEqual(
      contactBuildConfig({ WORKERS_CI: '1', WORKERS_CI_BRANCH: branch }),
      {},
    );
    assert.deepEqual(contactBuildConfig({ WORKERS_CI_BRANCH: branch }), {});
  }
});

void test('missing or empty CI branch fails before a deployable configuration is generated', () => {
  for (const branch of [undefined, '', ' ']) {
    for (const ci of [{ WORKERS_CI: '1' }, { CI: 'true' }, { CI: '1' }]) {
      assert.throws(
        () => contactBuildConfig({ ...ci, WORKERS_CI_BRANCH: branch }),
        /WORKERS_CI_BRANCH is required/,
      );
    }
  }
});
