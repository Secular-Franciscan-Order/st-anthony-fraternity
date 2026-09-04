/* oxlint-disable next/no-html-link-for-pages -- Native anchors work around broken Vinext production navigation. */
import styles from './ConceptPreviewBar.module.css';

type ConceptPreviewBarProps = {
  conceptName: string;
  conceptNumber: 1 | 2;
};

export function ConceptPreviewBar({
  conceptName,
  conceptNumber,
}: ConceptPreviewBarProps) {
  return (
    <aside className={styles.bar} aria-label="Website preview controls">
      <div className={styles.inner}>
        <div className={styles.context}>
          <span className={styles.badge}>Website preview</span>
          <span className={styles.selection}>
            <strong>{conceptName}</strong>
            <span aria-hidden="true">·</span>
            <span>Concept {conceptNumber} of 2</span>
          </span>
        </div>
        <a className={styles.backLink} href="/">
          <span aria-hidden="true">←</span>
          Back to concept selector
        </a>
      </div>
    </aside>
  );
}
