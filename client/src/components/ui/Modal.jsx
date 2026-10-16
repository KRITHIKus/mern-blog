import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HiOutlineX } from 'react-icons/hi'
import { Button } from './Button'
import { cx } from './cx'
import { useDialog } from './useDialog'

/**
 * Modal — accessible dialog rendered in a portal.
 * - role="dialog", aria-modal, labelled by `title`, described by `description`
 * - focus moves inside on open (initialFocusRef or first focusable),
 *   is trapped while open, and returns to the trigger on close
 * - Escape and backdrop click close it unless `dismissible={false}`
 * - page scroll is locked while open
 * size: sm | md | lg
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
  hideCloseButton = false,
  initialFocusRef,
  className,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descId = useId()
  const onCloseRef = useDialog(dialogRef, { open, onClose, dismissible, initialFocusRef })

  if (!open) return null

  const onOverlayMouseDown = event => {
    if (dismissible && event.target === event.currentTarget) onCloseRef.current?.()
  }

  return createPortal(
    <div className="ui-modal-overlay" onMouseDown={onOverlayMouseDown}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cx('ui-modal', size !== 'md' && `ui-modal--${size}`, className)}
      >
        {(title || !hideCloseButton) && (
          <div className="ui-modal__header">
            <div className="ui-modal__titles">
              {title && <h2 id={titleId} className="ui-modal__title">{title}</h2>}
              {description && <p id={descId} className="ui-modal__desc">{description}</p>}
            </div>
            {!hideCloseButton && dismissible && (
              <Button
                variant="ghost"
                size="sm"
                icon
                aria-label="Close dialog"
                className="ui-modal__close"
                onClick={() => onCloseRef.current?.()}
              >
                <HiOutlineX />
              </Button>
            )}
          </div>
        )}
        {children && <div className="ui-modal__body">{children}</div>}
        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
