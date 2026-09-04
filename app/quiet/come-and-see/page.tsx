import type { Metadata } from 'next';
import { PreviewContactForm } from '@/components/PreviewContactForm';
import { siteContent } from '@/lib/site-content';
import styles from '../quiet-pages.module.css';

export const metadata: Metadata = {
  title: 'Come & See · Quiet Welcome',
};

export default function ComeAndSeePage() {
  const { contact, gathering, welcome } = siteContent;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Come &amp; see</p>
        <h1>There is room for your questions.</h1>
        <p className={styles.lede}>{welcome}</p>
      </header>

      <section
        className={styles.meetingPanel}
        aria-labelledby="gathering-details"
      >
        <h2 id="gathering-details">Our monthly gathering.</h2>
        <dl className={styles.detailList}>
          <div>
            <dt>When</dt>
            <dd>{gathering.frequency}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{gathering.time}</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>
              {gathering.room}
              <br />
              {gathering.venue}
            </dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>
              {gathering.address}
              <br />
              <a href={gathering.directionsUrl}>Open directions ↗</a>
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.expect}>
        <h2>What a first visit may feel like.</h2>
        <ol>
          <li>
            <span>01</span>
            <p>
              <strong>A simple welcome.</strong> Tell us only what you are
              comfortable sharing. There is no application at the door.
            </p>
          </li>
          <li>
            <span>02</span>
            <p>
              <strong>Prayer and conversation.</strong> A typical gathering may
              include prayer, formation, fraternity time, and news of the
              community.
            </p>
          </li>
          <li>
            <span>03</span>
            <p>
              <strong>Space to discern.</strong> Visit, listen, and take your
              time. A conversation afterward can help you choose a next step.
            </p>
          </li>
        </ol>
      </section>

      <section
        className={styles.contactGrid}
        aria-labelledby="quiet-contact-heading"
      >
        <div className={styles.contactIntro}>
          <p className={styles.eyebrow}>Prefer a person?</p>
          <h2 id="quiet-contact-heading">Talk with Benjamin.</h2>
          <p>
            Call or email before visiting if you would like an introduction.
          </p>
          <address>
            <strong>{contact.name}</strong>
            <br />
            {contact.role}
            <br />
            <a href={contact.phoneHref}>{contact.phone}</a>
            <br />
            <a href={contact.emailHref}>{contact.email}</a>
          </address>
        </div>
        <PreviewContactForm idPrefix="quiet-contact" tone="quiet" />
      </section>
    </div>
  );
}
