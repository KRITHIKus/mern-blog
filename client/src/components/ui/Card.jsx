import { forwardRef } from 'react'
import { cx } from './cx'

/**
 * Card — bordered surface.
 * padding: none | sm | md | lg
 * interactive: hover/focus elevation + accent line (for clickable cards)
 */
export const Card = forwardRef(function Card(
  { as: Component = 'div', padding = 'md', interactive = false, className, ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      className={cx(
        'ui-card',
        padding !== 'none' && `ui-card--pad-${padding}`,
        interactive && 'ui-card--interactive',
        className
      )}
      {...props}
    />
  )
})
