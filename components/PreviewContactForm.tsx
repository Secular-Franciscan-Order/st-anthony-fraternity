'use client';

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type SubmitEvent,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { contactLimits } from '@/lib/contact-limits';
import { productionOrigin } from '@/lib/site-hosting';
import styles from './PreviewContactForm.module.css';

type Turnstile = {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      size: 'flexible';
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
      'timeout-callback': () => void;
    },
  ): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
const unavailable =
  'The form is temporarily unavailable. Please call or email the fraternity using the contact details above.';
const subscribeToHost = () => () => {};
const getAllowedHost = () =>
  window.location.origin === productionOrigin ||
  ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

export function PreviewContactForm({
  idPrefix,
  tone = 'quiet',
}: {
  idPrefix: string;
  tone?: 'quiet' | 'pilgrim';
}) {
  const widgetContainer = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const submitting = useRef(false);
  const allowedHost = useSyncExternalStore(
    subscribeToHost,
    getAllowedHost,
    () => false,
  );
  const [token, setToken] = useState('');
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [verification, setVerification] = useState(
    siteKey ? 'Loading verification…' : unavailable,
  );
  const [verificationFailed, setVerificationFailed] = useState(false);

  useEffect(() => {
    if (!allowedHost) return;
    if (!siteKey || !widgetContainer.current) return;

    let disposed = false;
    const fail = () => {
      if (disposed) return;
      setToken('');
      setVerification(
        'Verification could not load. Please retry or use the contact details above.',
      );
      setVerificationFailed(true);
    };
    const render = () => {
      if (
        disposed ||
        !widgetContainer.current ||
        !window.turnstile ||
        widgetId.current
      )
        return;
      try {
        widgetId.current = window.turnstile.render(widgetContainer.current, {
          sitekey: siteKey,
          action: 'contact',
          size: 'flexible',
          callback: (value) => {
            if (disposed) return;
            setToken(value);
            setVerification(
              'Verification complete. Your note is ready to send.',
            );
            setVerificationFailed(false);
          },
          'expired-callback': () => {
            if (disposed) return;
            setToken('');
            setVerification(
              'Verification expired. Please verify again before sending.',
            );
            setVerificationFailed(true);
          },
          'error-callback': fail,
          'timeout-callback': fail,
        });
      } catch {
        fail();
      }
    };

    let script = document.querySelector<HTMLScriptElement>(
      'script[data-contact-turnstile]',
    );
    if (!script) {
      script = document.createElement('script');
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.contactTurnstile = 'true';
      document.head.appendChild(script);
    }
    script.addEventListener('load', render);
    script.addEventListener('error', fail);
    if (window.turnstile) render();
    const timeout = window.setTimeout(() => {
      if (!widgetId.current) fail();
    }, 15_000);
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      script.removeEventListener('load', render);
      script.removeEventListener('error', fail);
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [allowedHost]);

  function resetVerification() {
    setToken('');
    if (widgetId.current && window.turnstile) {
      setVerification('Please complete the verification.');
      setVerificationFailed(false);
      window.turnstile.reset(widgetId.current);
    } else {
      // A blocked script cannot be reset through the widget API.
      setVerification(
        'Please reload this page to retry verification, or use the contact details above.',
      );
    }
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!siteKey || !allowedHost || !token) {
      setNotice(
        'Please complete the verification before sending your message.',
      );
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set('cf-turnstile-response', token);
    submitting.current = true;
    setPending(true);
    setNotice('Sending your note…');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: data,
      });
      const result = (await response.json()) as { message?: string };
      setNotice(
        typeof result.message === 'string'
          ? result.message
          : 'We could not send your message. Please try again or use the contact details above.',
      );
      if (response.ok) form.reset();
    } catch {
      setNotice(
        'We could not confirm whether your note was sent. Please try again or use the contact details above.',
      );
    } finally {
      submitting.current = false;
      setPending(false);
      resetVerification();
    }
  }

  return (
    <form
      className={styles.form}
      data-tone={tone}
      onSubmit={submit}
      action="/api/contact"
      method="post"
      aria-labelledby={`${idPrefix}-heading`}
      aria-busy={pending}
    >
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>A note for the fraternity</p>
          <h3 id={`${idPrefix}-heading`}>Introduce yourself</h3>
        </div>
      </div>
      <p className={styles.help}>
        Send a note to the fraternity. Email and message are required; name and
        phone are optional.
      </p>
      <fieldset className={styles.fields} disabled={pending}>
        <legend className={styles.srOnly}>
          Your contact details and message
        </legend>
        <div className={styles.field}>
          <label htmlFor={`${idPrefix}-name`}>Name (optional)</label>
          <Input
            className={styles.control}
            id={`${idPrefix}-name`}
            name="name"
            autoComplete="name"
            placeholder="Your name"
            maxLength={contactLimits.name}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${idPrefix}-email`}>Email (required)</label>
          <Input
            className={styles.control}
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            maxLength={contactLimits.email}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${idPrefix}-phone`}>Phone number (optional)</label>
          <Input
            className={styles.control}
            id={`${idPrefix}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Your phone number"
            maxLength={contactLimits.phone}
          />
        </div>
        <div className={`${styles.field} ${styles.fullField}`}>
          <label htmlFor={`${idPrefix}-message`}>
            What would you like to know? (required)
          </label>
          <Textarea
            className={styles.message}
            id={`${idPrefix}-message`}
            name="message"
            placeholder="I’d like to learn more about…"
            rows={5}
            maxLength={contactLimits.message}
            required
          />
        </div>
        <div className={styles.srOnly} aria-hidden="true">
          <label htmlFor={`${idPrefix}-website`}>Leave this field empty</label>
          <input
            id={`${idPrefix}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            maxLength={contactLimits.website}
          />
        </div>
      </fieldset>
      <div className={styles.verification}>
        <div ref={widgetContainer} />
        <p className={styles.notice} aria-live="polite">
          {!siteKey
            ? unavailable
            : allowedHost
              ? verification
              : 'This preview does not send messages. Please use the contact details above.'}
        </p>
        {verificationFailed && (
          <button
            className={styles.retry}
            type="button"
            onClick={resetVerification}
            disabled={pending}
          >
            Retry verification
          </button>
        )}
      </div>
      <div className={styles.actionRow}>
        <Button
          className={styles.button}
          type="submit"
          size="lg"
          disabled={pending || !siteKey || !allowedHost || !token}
          aria-describedby={`${idPrefix}-status`}
        >
          {pending ? 'Sending…' : 'Send a note'}{' '}
          <span aria-hidden="true">→</span>
        </Button>
        <output
          className={styles.notice}
          id={`${idPrefix}-status`}
          aria-live="polite"
        >
          {notice}
        </output>
      </div>
      <noscript>
        <p className={styles.notice}>
          Please enable JavaScript to use this form, or call or email the
          fraternity using the contact details above.
        </p>
      </noscript>
    </form>
  );
}
