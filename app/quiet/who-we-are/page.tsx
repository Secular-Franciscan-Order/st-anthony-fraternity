import type { Metadata } from 'next';
import { siteContent } from '@/lib/site-content';
import styles from '../quiet-pages.module.css';

export const metadata: Metadata = {
  title: 'Who We Are · Quiet Welcome',
};

export default function WhoWeArePage() {
  const { introduction, waysOfLife } = siteContent;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Who we are</p>
        <h1>Franciscan at heart. Secular by vocation.</h1>
        <p className={styles.lede}>{introduction}</p>
      </header>
      <div className={styles.rule} />

      <section className={styles.split}>
        <h2>The world is our cloister.</h2>
        <div>
          <p>
            “Secular” means our vocation is lived in the world. We are not
            friars or sisters living in a religious community. We are people
            with households, schedules, responsibilities, joys, and worries much
            like anyone else.
          </p>
          <p>
            What changes is the intention we bring to those places: to recognize
            Christ, choose peace, live simply, and meet every person as brother
            or sister.
          </p>
        </div>
      </section>

      <aside className={styles.asideNote}>
        Secular Franciscan life is not an escape from ordinary life. It is a way
        of entering ordinary life more prayerfully and more generously.
      </aside>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <h2>A Rule for real life.</h2>
          <div>
            <p>
              Our Rule calls us to move from Gospel to life and from life to
              Gospel. That movement is personal, but it is never solitary.
            </p>
            <p>
              The fraternity offers a steady place for prayer, formation, mutual
              encouragement, and discernment.
            </p>
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
  );
}
