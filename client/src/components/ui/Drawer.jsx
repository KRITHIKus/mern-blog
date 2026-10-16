import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HiOutlineX } from 'react-icons/hi'
import { Button } from './Button'
import { cx } from './cx'
import { useDialog } from './useDialog'

/**
 * Drawer — side sheet with modal behaviour (focus trap, Escape, scroll
 * lock, backdrop click), used for mobile navigation.
 * side: right | left
 * restoreFocus: () => boolean — return false to skip returning focus to
 *   the trigger (e.g. when the drawer closed because the route changed).
 */
export function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  restoreFocus,
  id,
  className,
  children,
}) {
  const panelRef = useRef(null)
  const titleId = useId()
  const onCloseRef = useDialog(panelRef, { open, onClose, restoreFocus })

  if (!open) return null

  return createPortal(
    <div
      className="ui-drawer-overlay"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onCloseRef.current?.()
      }}
    >
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx('ui-drawer', `ui-drawer--${side}`, className)}
      >
        <div className="ui-drawer__header">
          <h2 id={titleId} className="ui-drawer__title">{title}</h2>
          <Button variant="ghost" icon aria-label="Close" onClick={() => onCloseRef.current?.()}>
            <HiOutlineX />
          </Button>
        </div>
        <div className="ui-drawer__body">{children}</div>
      </div>
    </div>,
    document.body
  )
}
