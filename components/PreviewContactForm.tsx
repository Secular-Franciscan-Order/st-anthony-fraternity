'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import styles from './PreviewContactForm.module.css';

type PreviewContactFormProps = {
  idPrefix: string;
  tone?: 'quiet' | 'pilgrim';
};

export function PreviewContactForm({
  idPrefix,
  tone = 'quiet',
}: PreviewContactFormProps) {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <fieldset className={styles.form} data-tone={tone}>
      <legend className={styles.srOnly}>Contact preview</legend>
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>A note for the fraternity</p>
          <h3 id={`${idPrefix}-heading`}>Introduce yourself</h3>
        </div>
        <span className={styles.mockLabel}>Mockup form</span>
      </div>

      <p className={styles.help}>
        This shows how a future contact form could feel. Nothing entered here
        will be sent.
      </p>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${idPrefix}-name`}>Name</label>
          <Input
            className={styles.control}
            id={`${idPrefix}-name`}
            name="name"
            autoComplete="name"
            placeholder="Your name"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${idPrefix}-email`}>Email</label>
          <Input
            className={styles.control}
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className={`${styles.field} ${styles.fullField}`}>
          <label htmlFor={`${idPrefix}-message`}>
            What would you like to know?
          </label>
          <Textarea
            className={styles.message}
            id={`${idPrefix}-message`}
            name="message"
            placeholder="I’d like to learn more about…"
            rows={5}
          />
        </div>
      </div>

      <div className={styles.actionRow}>
        <Button
          className={styles.button}
          type="button"
          size="lg"
          onClick={() => setShowNotice(true)}
        >
          Send a note <span aria-hidden="true">→</span>
        </Button>
        <p className={styles.notice} aria-live="polite">
          {showNotice
            ? 'This form is part of the mockup and does not send messages yet. Please call or email the fraternity.'
            : 'No message will be transmitted from this preview.'}
        </p>
      </div>
    </fieldset>
  );
}
