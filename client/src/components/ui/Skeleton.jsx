import { cx } from './cx'

/**
 * Skeleton — loading placeholder. Hidden from assistive tech; pair a
 * loading region with a Spinner label or aria-busy on its container.
 * variant: block | text | circle
 */
export function Skeleton({ variant = 'block', width, height, className, style }) {
  return (
    <span
      aria-hidden="true"
      className={cx('ui-skeleton', variant !== 'block' && `ui-skeleton--${variant}`, className)}
      style={{ width, height, ...style }}
    />
  )
}
