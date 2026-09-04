/* oxlint-disable next/no-html-link-for-pages -- Native anchors work around broken Vinext production navigation. */
import Image from 'next/image';
import { siteContent } from '@/lib/site-content';
import styles from './quiet-pages.module.css';

export default function QuietHomePage() {
  const { gathering, introduction, quote, waysOfLife, welcome } = siteContent;

  return (
    <>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              A Secular Franciscan fraternity in Tucson
            </p>
            <h1>A quieter way to live the Gospel—together.</h1>
            <p className={styles.lede}>{introduction}</p>
            <div className={styles.actions}>
              <a className={styles.primaryButton} href="/quiet/come-and-see">
                Plan a visit <span aria-hidden="true">→</span>
              </a>
              <a className={styles.textLink} href="/quiet/who-we-are">
                Meet the Secular Franciscans
              </a>
            </div>
          </div>
          <figure className={styles.portrait}>
            <div className={styles.portraitFrame}>
              <Image
                src="/images/saint-francis.jpg"
                alt="Painted portrait of Saint Francis of Assisi with crossed arms"
                width={850}
                height={1100}
                priority
              />
            </div>
            <figcaption>Saint Francis of Assisi</figcaption>
          </figure>
        </section>

        <section
          className={styles.gathering}
          aria-labelledby="quiet-next-gathering"
        >
          <h2 id="quiet-next-gathering">Come &amp; see</h2>
          <p>
            <strong>{gathering.frequency}</strong>
            <span>
              {gathering.time} · {gathering.room} · {gathering.venue}
            </span>
          </p>
          <a href="/quiet/come-and-see">Visit details →</a>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionIntro}>
            <h2>Franciscan life, close to home.</h2>
            <div>
              <p>
                Secular Franciscans do not step away from ordinary life. We
                discover that ordinary life is precisely where Christ calls us
                to love, repair, reconcile, and begin again.
              </p>
              <p>{welcome}</p>
            </div>
          </div>
          <div className={styles.ways}>
            {waysOfLife.map((way, index) => (
              <article className={styles.way} key={way.title}>
                <span className={styles.wayNumber}>0{index + 1}</span>
                <h3>{way.title}</h3>
                <p>{way.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <figure className={styles.quote}>
        <blockquote>“{quote.text}”</blockquote>
        <figcaption>
          <cite>{quote.attribution}</cite>
        </figcaption>
      </figure>

      <div className={styles.page}>
        <section className={styles.invitation}>
          <div>
            <p className={styles.eyebrow}>
              No pressure. No prior knowledge needed.
            </p>
            <h2>Come meet us before deciding anything.</h2>
            <p>
              A visit is simply a chance to pray, listen, meet the fraternity,
              and see whether this way of life speaks to you.
            </p>
          </div>
          <a className={styles.primaryButton} href="/quiet/come-and-see">
            Start here <span aria-hidden="true">→</span>
          </a>
        </section>
      </div>
    </>
  );
}
