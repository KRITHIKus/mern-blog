import { cx } from './cx'

/**
 * Badge — short status/category label.
 * variant: neutral | accent | success | warning | danger | info
 * mono:    technical metadata style (e.g. categories, versions)
 */
export function Badge({ variant = 'neutral', mono = false, className, children, ...props }) {
  return (
    <span
      className={cx('ui-badge', `ui-badge--${variant}`, mono && 'ui-badge--mono', className)}
      {...props}
    >
      {children}
    </span>
  )
}
