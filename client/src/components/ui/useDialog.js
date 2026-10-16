import { useEffect, useRef } from 'react'

export const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'

/**
 * Shared behaviour for modal surfaces (Modal, Drawer):
 * - moves focus inside on open (initialFocusRef → first focusable → container)
 * - traps Tab / Shift+Tab inside the container
 * - Escape calls onClose (when dismissible)
 * - locks page scroll while open
 * - restores focus to the previously focused element on close, unless
 *   restoreFocus() returns false (e.g. when closing because of navigation)
 */
export function useDialog(containerRef, { open, onClose, dismissible = true, initialFocusRef, restoreFocus }) {
  const onCloseRef = useRef(onClose)
  const restoreFocusRef = useRef(restoreFocus)

  useEffect(() => {
    onCloseRef.current = onClose
    restoreFocusRef.current = restoreFocus
  })

  useEffect(() => {
    if (!open) return undefined

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const container = containerRef.current
    const target = initialFocusRef?.current || container.querySelector(FOCUSABLE) || container
    target.focus()

    const onKeyDown = event => {
      if (event.key === 'Escape' && dismissible) {
        event.stopPropagation()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = [...container.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null)
      if (focusable.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (restoreFocusRef.current?.() !== false) previouslyFocused?.focus?.()
    }
  }, [open, dismissible, initialFocusRef, containerRef])

  return onCloseRef
}
