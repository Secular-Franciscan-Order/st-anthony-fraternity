/* oxlint-disable next/no-html-link-for-pages -- Native anchors work around broken Vinext production navigation. */
import Image from 'next/image';
import styles from './page.module.css';

const reviewItems = [
  'Confirm the gathering schedule and Saint Clare Room',
  'Approve the public phone number and email address',
  'Confirm formation timing and permission to use supplied artwork',
];

export default function Home() {
  return (
    <main className={styles.hub}>
      <header className={styles.header}>
        <p className={styles.kicker}>
          Saint Anthony Fraternity · Design preview
        </p>
        <h1>Two ways to welcome people into Franciscan life</h1>
        <p className={styles.intro}>
          Both concepts use the same Tucson gathering details and the same core
          message. Compare the feeling, navigation, and way each one tells the
          story.
        </p>
      </header>

      <section className={styles.concepts} aria-label="Website concepts">
        <article className={`${styles.card} ${styles.quietCard}`}>
          <div className={styles.cardPreview} aria-hidden="true">
            <span className={styles.quietWordmark}>
              Saint Anthony Fraternity
            </span>
            <span className={styles.quietRule} />
            <span className={styles.quietTitle}>A simple welcome</span>
            <span className={styles.quietCopy} />
            <span className={styles.quietCopyShort} />
          </div>
          <div className={styles.cardBody}>
            <p className={styles.number}>Concept 01</p>
            <h2>Quiet Welcome</h2>
            <p>
              A calm, familiar multi-page site with generous space,
              straightforward navigation, and a low-pressure invitation to
              visit.
            </p>
            <a className={styles.primaryLink} href="/quiet">
              Open Quiet Welcome <span aria-hidden="true">→</span>
            </a>
          </div>
        </article>

        <article className={`${styles.card} ${styles.pilgrimCard}`}>
          <div className={styles.cardPreview} aria-hidden="true">
            <div className={styles.pilgrimCopy}>
              <span className={styles.pilgrimKicker}>Pax et bonum</span>
              <span className={styles.pilgrimTitle}>
                A path worth exploring
              </span>
              <span className={styles.pilgrimButton}>Come &amp; see</span>
            </div>
            <Image
              className={styles.pilgrimImage}
              src="/images/saint-francis.jpg"
              width={850}
              height={1100}
              alt=""
              priority
            />
          </div>
          <div className={styles.cardBody}>
            <p className={styles.number}>Concept 02</p>
            <h2>Pilgrim&apos;s Path</h2>
            <p>
              A guided single-page journey with sacred typography, warmer color,
              and the Saint Francis artwork as its visual center.
            </p>
            <a className={styles.primaryLink} href="/pilgrim">
              Open Pilgrim&apos;s Path <span aria-hidden="true">→</span>
            </a>
          </div>
        </article>
      </section>

      <section className={styles.reviewNote} aria-labelledby="review-heading">
        <div>
          <p className={styles.kicker}>Before publication</p>
          <h2 id="review-heading">
            A few facts still need the fraternity&apos;s approval
          </h2>
        </div>
        <ul>
          {reviewItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
