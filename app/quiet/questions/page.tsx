import type { Metadata } from 'next';
import { siteContent } from '@/lib/site-content';
import styles from '../quiet-pages.module.css';

export const metadata: Metadata = {
  title: 'Questions · Quiet Welcome',
};

export default function QuestionsPage() {
  const { links, questions } = siteContent;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Questions are welcome</p>
        <h1>Curiosity belongs here.</h1>
        <p className={styles.lede}>
          A vocation is worth exploring carefully. These are a few of the
          questions people often bring to a first conversation.
        </p>
      </header>

      <ul className={styles.faqList}>
        {questions.map((item) => (
          <li key={item.question}>
            <details>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          </li>
        ))}
      </ul>

      <section className={styles.resourceBox}>
        <div>
          <p className={styles.eyebrow}>Continue exploring</p>
          <h2>Trusted Franciscan resources.</h2>
          <p>
            Learn more about the wider Secular Franciscan family from regional
            and national sources.
          </p>
        </div>
        <div className={styles.resourceLinks}>
          <a href={links.region}>
            Saint Thomas More Region <span aria-hidden="true">↗</span>
          </a>
          <a href={links.national}>
            Secular Franciscan Order—USA <span aria-hidden="true">↗</span>
          </a>
          <a href={links.formation}>
            Initial formation resources <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </div>
  );
}
