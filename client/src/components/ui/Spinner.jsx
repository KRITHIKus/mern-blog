import { cx } from './cx'

/**
 * Loading indicator. Inherits `color` from its parent.
 * Announces `label` to screen readers unless `decorative` (e.g. inside a
 * button that already sets aria-busy).
 */
export function Spinner({ size = 'md', label = 'Loading', decorative = false, className }) {
  const classes = cx('ui-spinner', size !== 'md' && `ui-spinner--${size}`, className)

  if (decorative) return <span className={classes} aria-hidden="true" />

  return (
    <span role="status">
      <span className={classes} aria-hidden="true" />
      <span className="ui-visually-hidden">{label}</span>
    </span>
  )
}
