import { cx } from './cx'

/**
 * Container — centred page width with responsive side gutters.
 * size: content (1200) | reading (720) | wide (1400) | full
 */
export function Container({ as: Component = 'div', size = 'content', className, ...props }) {
  return (
    <Component
      className={cx('ui-container', size !== 'content' && `ui-container--${size}`, className)}
      {...props}
    />
  )
}
