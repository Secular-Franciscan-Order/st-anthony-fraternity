import Link from 'next/link';
import { TauMark } from '@/components/TauMark';
import { siteContent } from '@/lib/site-content';
import styles from './QuietShell.module.css';

const navLinks = [
  { href: '/quiet', label: 'Home' },
  { href: '/quiet/who-we-are', label: 'Who we are' },
  { href: '/quiet/franciscan-life', label: 'Franciscan life' },
  { href: '/quiet/come-and-see', label: 'Come & see' },
  { href: '/quiet/questions', label: 'Questions' },
];

export function QuietShell({ children }: { children: React.ReactNode }) {
  const { identity, gathering, contact } = siteContent;

  return (
    <div className={styles.site}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <div className={styles.previewBar}>
        <span>Concept 01 · Quiet Welcome</span>
        <Link href="/">Compare both designs</Link>
      </div>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <Link
            className={styles.brand}
            href="/quiet"
            aria-label={`${identity.name} home`}
          >
            <TauMark className={styles.tau} />
            <span>
              <strong>{identity.name}</strong>
              <small>
                {identity.order} · {identity.location}
              </small>
            </span>
          </Link>
        </div>
        <nav className={styles.nav} aria-label="Quiet Welcome navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main-content">{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <TauMark className={styles.footerTau} />
            <div>
              <strong>{identity.name}</strong>
              <p>
                Following Christ in the footsteps of Saint Francis and Saint
                Clare.
              </p>
            </div>
          </div>
          <div>
            <h2>Gather with us</h2>
            <p>{gathering.frequency}</p>
            <p>
              {gathering.time} · {gathering.room}
            </p>
            <p>{gathering.venue}</p>
          </div>
          <div>
            <h2>Talk with us</h2>
            <p>{contact.name}</p>
            <p>
              <a href={contact.phoneHref}>{contact.phone}</a>
              <br />
              <a href={contact.emailHref}>{contact.email}</a>
            </p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>Website concept for fraternity review</span>
          <Link href="/">Back to design comparison</Link>
        </div>
      </footer>
    </div>
  );
}
