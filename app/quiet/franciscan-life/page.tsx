/* oxlint-disable next/no-html-link-for-pages -- Native anchors work around broken Vinext production navigation. */
import type { Metadata } from 'next';
import { siteContent } from '@/lib/site-content';
import styles from '../quiet-pages.module.css';

export const metadata: Metadata = {
  title: 'Franciscan Life · Quiet Welcome',
};

export default function FranciscanLifePage() {
  const { formation, formationNote, quote } = siteContent;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Franciscan life</p>
        <h1>The Gospel takes root in ordinary days.</h1>
        <p className={styles.lede}>
          Franciscan spirituality is not one more thing to fit into a crowded
          life. It is a way of meeting the life already in front of us—with
          prayer, gratitude, humility, and peace.
        </p>
      </header>
      <div className={styles.rule} />

      <section className={styles.split}>
        <h2>From Gospel to life. From life to Gospel.</h2>
        <div>
          <p>
            We listen to Scripture and carry it into daily choices: how we
            speak, spend, forgive, welcome, and care for creation. Then we bring
            the truth of our lived experience back to prayer.
          </p>
          <ul className={styles.plainList}>
            <li>Prayer that makes us attentive</li>
            <li>Relationships marked by mercy and peace</li>
            <li>Simplicity that creates room for generosity</li>
            <li>Service rooted in the dignity of every person</li>
          </ul>
        </div>
      </section>

      <figure className={styles.quote}>
        <blockquote>“{quote.text}”</blockquote>
        <figcaption>
          <cite>{quote.attribution}</cite>
        </figcaption>
      </figure>

      <section className={styles.formation} aria-labelledby="formation-heading">
        <div className={styles.formationIntro}>
          <h2 id="formation-heading">A patient path of formation.</h2>
          <p>
            Nobody is rushed toward profession. Formation makes room to learn
            the Franciscan tradition, practice the way of life, and discern
            freely with the fraternity.
          </p>
        </div>
        <ol className={styles.timeline}>
          {formation.map((stage, index) => (
            <li key={stage.name}>
              <span className={styles.timelineNumber}>0{index + 1}</span>
              <strong>{stage.name}</strong>
              <em>{stage.timing}</em>
              <p>{stage.text}</p>
            </li>
          ))}
        </ol>
        <p className={styles.smallNote}>{formationNote}</p>
      </section>

      <section className={styles.invitation}>
        <div>
          <p className={styles.eyebrow}>The first step is small</p>
          <h2>Visit once. Bring your questions.</h2>
        </div>
        <a className={styles.primaryButton} href="/quiet/come-and-see">
          Come &amp; see <span aria-hidden="true">→</span>
        </a>
      </section>
    </div>
  );
}
