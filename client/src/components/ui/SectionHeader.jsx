import { cx } from './cx'

/**
 * SectionHeader — eyebrow + title + description, with an optional action
 * (e.g. "View all") that sits beside the title on wider screens.
 * as: heading element for the title (default h2).
 * id: put on the heading so a <section aria-labelledby> can reference it.
 * flush: no bottom margin (e.g. when it is the only content of a Card).
 */
export function SectionHeader({ eyebrow, title, description, action, as: Heading = 'h2', id, flush = false, className }) {
  return (
    <div className={cx('ui-section-header', flush && 'ui-section-header--flush', className)}>
      <div className="ui-section-header__text">
        {eyebrow && <p className="ui-text-eyebrow">{eyebrow}</p>}
        <Heading id={id} className="ui-text-section">{title}</Heading>
        {description && <p className="ui-section-header__desc">{description}</p>}
      </div>
      {action && <div className="ui-section-header__action">{action}</div>}
    </div>
  )
}
