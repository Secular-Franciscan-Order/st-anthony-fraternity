import { contactRecipients, contactSender } from './contact.ts';

// Workers Builds supplies WORKERS_CI, CI and WORKERS_CI_BRANCH:
// https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#default-variables
export function contactBuildConfig(
  environment: Record<string, string | undefined>,
) {
  const branch = environment.WORKERS_CI_BRANCH;
  const isCi =
    environment.WORKERS_CI === '1' ||
    Boolean(
      environment.CI && environment.CI !== 'false' && environment.CI !== '0',
    );

  if (isCi && !branch?.trim()) {
    throw new Error(
      'WORKERS_CI_BRANCH is required in CI to choose the contact email configuration.',
    );
  }

  // Ordinary local builds retain production config for deterministic checks.
  // Every explicitly non-main branch omits the email binding entirely.
  if (branch !== undefined && branch !== 'main') return {};
  return {
    send_email: [
      {
        name: 'CONTACT_EMAIL',
        allowed_destination_addresses: [...contactRecipients],
        allowed_sender_addresses: [contactSender],
      },
    ],
  };
}
