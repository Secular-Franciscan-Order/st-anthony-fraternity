/* oxlint-disable next/no-html-link-for-pages -- Native anchors work around broken Vinext production navigation. */
import type { Metadata } from 'next';
import Image from 'next/image';
import { ConceptPreviewBar } from '@/components/ConceptPreviewBar';
import { PreviewContactForm } from '@/components/PreviewContactForm';
import { TauMark } from '@/components/TauMark';
import { siteContent } from '@/lib/site-content';
import styles from './pilgrim.module.css';

export const metadata: Metadata = {
  title: "Pilgrim's Path",
  description:
    'A warm, guided website concept for Saint Anthony Fraternity in Tucson.',
};

const navLinks = [
  { href: '#who-we-are', label: 'Who we are' },
  { href: '#the-way', label: 'The way' },
  { href: '#come-and-see', label: 'Come & see' },
  { href: '#questions', label: 'Questions' },
];

export default function PilgrimPage() {
  const {
    contact,
    formation,
    formationNote,
    gathering,
    identity,
    introduction,
    links,
    questions,
    quote,
    waysOfLife,
    welcome,
  } = siteContent;

  return (
    <div className={styles.site}>
      <a className={styles.skipLink} href="#pilgrim-main">
        Skip to content
      </a>

      <ConceptPreviewBar conceptName="Pilgrim's Path" conceptNumber={2} />

      <header className={styles.header}>
        <a
          className={styles.brand}
          href="#top"
          aria-label={`${identity.name} page top`}
        >
          <TauMark className={styles.tau} />
          <span>
            <strong>{identity.name}</strong>
            <small>
              {identity.order} · {identity.location}
            </small>
          </span>
        </a>
        <nav className={styles.nav} aria-label="Pilgrim's Path navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <main id="pilgrim-main" tabIndex={-1}>
        <section className={styles.hero} id="top">
          <div className={styles.heroCopy}>
            <p className={styles.latin}>Pax et bonum · Peace and all good</p>
            <h1>Peace begins close to home.</h1>
            <p className={styles.lede}>
              A Franciscan vocation for people whose holy ground is everyday
              life.
            </p>
            <p className={styles.heroText}>{introduction}</p>
            <div className={styles.heroActions}>
              <a className={styles.solidButton} href="#come-and-see">
                Come &amp; see <span aria-hidden="true">→</span>
              </a>
              <a className={styles.underlinedLink} href="#who-we-are">
                Begin the story
              </a>
            </div>
          </div>

          <figure className={styles.saintCard}>
            <div className={styles.saintFrame}>
              <Image
                src="/images/saint-francis.jpg"
                alt="Painted portrait of Saint Francis of Assisi with crossed arms"
                width={850}
                height={1100}
                priority
              />
              <span className={styles.cornerMark} aria-hidden="true">
                OFS
              </span>
            </div>
            <figcaption>
              <span>Our inspiration</span>
              Saint Francis of Assisi
            </figcaption>
          </figure>
        </section>

        <nav className={styles.wayfinder} aria-label="Page guide">
          <a href="#who-we-are">
            <span>01</span> A life in the world
          </a>
          <a href="#the-way">
            <span>02</span> The Franciscan way
          </a>
          <a href="#come-and-see">
            <span>03</span> A place at the table
          </a>
          <a href="#formation">
            <span>04</span> A path of discernment
          </a>
        </nav>

        <section className={styles.whoSection} id="who-we-are">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionNumber}>01 · A life in the world</p>
            <h2>
              Not apart from life.
              <br />
              Deeper within it.
            </h2>
          </div>
          <div className={styles.whoCopy}>
            <p className={styles.dropcap}>
              Secular Franciscans are Catholic laypeople and diocesan clergy who
              follow Christ in the footsteps of Saint Francis—without leaving
              the homes, work, parishes, and communities entrusted to them.
            </p>
            <p>
              We seek a life marked by prayer, fraternity, simplicity, service,
              and care for creation. The fraternity gives us companions for that
              journey: people who keep returning together from Gospel to life
              and from life to Gospel.
            </p>
            <aside>
              “Secular” names the place of the vocation: right here, in the
              world.
            </aside>
          </div>
        </section>

        <section className={styles.waySection} id="the-way">
          <header className={styles.centerHeading}>
            <p className={styles.sectionNumber}>02 · The Franciscan way</p>
            <h2>A small rule for a spacious life.</h2>
            <p>
              The pattern is ancient. The invitation is immediate. Begin with
              what is already in your hands.
            </p>
          </header>
          <div className={styles.wayGrid}>
            {waysOfLife.map((way, index) => (
              <article key={way.title}>
                <span className={styles.ornament} aria-hidden="true">
                  {['✦', '◌', '❦', '☼'][index]}
                </span>
                <p className={styles.cardNumber}>0{index + 1}</p>
                <h3>{way.title}</h3>
                <p>{way.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.gatheringSection} id="come-and-see">
          <div className={styles.gatheringIntro}>
            <p className={styles.sectionNumber}>03 · A place at the table</p>
            <h2>
              Come as you are.
              <br />
              Stay curious.
            </h2>
            <p>{welcome}</p>
          </div>
          <div className={styles.gatheringCard}>
            <p className={styles.meetingLabel}>Monthly gathering</p>
            <p className={styles.meetingDay}>Second Sunday</p>
            <p className={styles.meetingTime}>{gathering.time}</p>
            <div className={styles.meetingPlace}>
              <strong>{gathering.room}</strong>
              <span>{gathering.venue}</span>
              <span>{gathering.address}</span>
            </div>
            <a href={gathering.directionsUrl}>Open directions ↗</a>
          </div>
          <div className={styles.firstVisit}>
            <h3>Your first visit</h3>
            <p>
              Expect a welcome, prayer, conversation, and room to observe. A
              typical gathering may also include formation and fraternity news.
              Nothing about visiting obligates you to continue.
            </p>
          </div>
        </section>

        <section className={styles.formationSection} id="formation">
          <header className={styles.formationHeading}>
            <p className={styles.sectionNumber}>04 · A path of discernment</p>
            <h2>Walk slowly enough to listen.</h2>
            <p>
              Formation is a gradual process of prayer, learning, practice, and
              free discernment—not a fast track to a decision.
            </p>
          </header>
          <ol className={styles.formationPath}>
            {formation.map((stage, index) => (
              <li key={stage.name}>
                <div className={styles.stageMarker} aria-hidden="true">
                  <span>{index + 1}</span>
                </div>
                <div>
                  <p className={styles.stageTiming}>{stage.timing}</p>
                  <h3>{stage.name}</h3>
                  <p>{stage.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.formationNote}>{formationNote}</p>
        </section>

        <section className={styles.canticleSection}>
          <div className={styles.sunMark} aria-hidden="true">
            <span>☼</span>
          </div>
          <div>
            <p className={styles.latin}>Laudato si&apos;, mi&apos; Signore</p>
            <blockquote>“{quote.text}”</blockquote>
            <cite>{quote.attribution}</cite>
          </div>
        </section>

        <section className={styles.questionsSection} id="questions">
          <header className={styles.centerHeading}>
            <p className={styles.sectionNumber}>Questions for the road</p>
            <h2>Wondering is welcome.</h2>
          </header>
          <div className={styles.faqs}>
            {questions.map((item, index) => (
              <details key={item.question}>
                <summary>
                  <span>0{index + 1}</span>
                  {item.question}
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.contactSection} id="contact">
          <div className={styles.contactDetails}>
            <p className={styles.sectionNumber}>Take one simple step</p>
            <h2>Begin with hello.</h2>
            <p>
              Benjamin can answer practical questions and help you know what to
              expect at a first gathering.
            </p>
            <address>
              <strong>{contact.name}</strong>
              <span>{contact.role}</span>
              <a href={contact.phoneHref}>{contact.phone}</a>
              <a href={contact.emailHref}>{contact.email}</a>
            </address>
          </div>
          <PreviewContactForm idPrefix="pilgrim-contact" tone="pilgrim" />
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <TauMark className={styles.footerTau} />
          <div>
            <strong>{identity.name}</strong>
            <span>
              {identity.order} · {identity.location}
            </span>
          </div>
        </div>
        <div className={styles.footerLinks}>
          <a href={links.region}>Saint Thomas More Region ↗</a>
          <a href={links.national}>Secular Franciscan Order—USA ↗</a>
          <a href="/">Back to concept selector</a>
        </div>
        <p className={styles.reviewLabel}>
          Website concept for fraternity review
        </p>
      </footer>
    </div>
  );
}
