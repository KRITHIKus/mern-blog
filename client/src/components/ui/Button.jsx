import { forwardRef } from 'react'
import { cx } from './cx'
import { Spinner } from './Spinner'

/**
 * Button — the single button style for the app.
 *
 * variant: primary | secondary | ghost | danger
 * size:    sm | md | lg
 * icon:    square icon-only button (pass aria-label)
 * as:      render as another element/component, e.g. as={Link} to="/x"
 *          or as="a" href="…". Disabled links get aria-disabled and
 *          ignore clicks.
 */
export const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    variant = 'primary',
    size = 'md',
    icon = false,
    block = false,
    loading = false,
    disabled = false,
    type,
    className,
    children,
    onClick,
    ...rest
  },
  ref
) {
  const isNativeButton = Component === 'button'
  const isDisabled = disabled || loading

  const stateProps = isNativeButton
    ? { type: type || 'button', disabled: isDisabled }
    : {
        'aria-disabled': isDisabled || undefined,
        tabIndex: isDisabled ? -1 : rest.tabIndex,
      }

  const handleClick = event => {
    if (isDisabled) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <Component
      ref={ref}
      className={cx(
        'ui-btn',
        `ui-btn--${variant}`,
        size !== 'md' && `ui-btn--${size}`,
        icon && 'ui-btn--icon',
        block && 'ui-btn--block',
        className
      )}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...rest}
      {...stateProps}
    >
      {loading && <Spinner size="sm" decorative />}
      {icon ? children : <span className="ui-btn__label">{children}</span>}
    </Component>
  )
})
