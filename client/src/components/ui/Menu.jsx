import {
  cloneElement, createContext, useCallback, useContext, useEffect, useId, useRef, useState,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cx } from './cx'

const MenuContext = createContext(null)

const getItems = menu => [...menu.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')]

/**
 * Menu — accessible dropdown menu (WAI-ARIA menu button pattern).
 *
 *   <Menu label="Account" trigger={<Button …>…</Button>}>
 *     <MenuItem to="/dashboard">Dashboard</MenuItem>
 *     <MenuSeparator />
 *     <MenuItem onSelect={signOut} danger>Sign out</MenuItem>
 *   </Menu>
 *
 * - trigger gets aria-haspopup/expanded/controls; Enter, Space or ArrowDown opens
 * - focus moves to the first item; Arrow keys, Home and End move between items
 * - Escape closes and returns focus to the trigger; Tab, an outside click,
 *   choosing an item or a route change closes it
 * align: start | end
 */
export function Menu({ trigger, label, align = 'end', className, children }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const wrapperRef = useRef(null)
  const menuId = useId()
  const location = useLocation()

  const close = useCallback(({ focusTrigger = false } = {}) => {
    setOpen(false)
    if (focusTrigger) triggerRef.current?.focus()
  }, [])

  // Close when the route changes (back/forward, links outside the menu).
  useEffect(() => { setOpen(false) }, [location.pathname, location.search])

  useEffect(() => {
    if (!open) return undefined
    getItems(menuRef.current)[0]?.focus()

    const onPointerDown = event => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const onMenuKeyDown = event => {
    const items = getItems(menuRef.current)
    const index = items.indexOf(document.activeElement)
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        items[(index + 1) % items.length]?.focus()
        break
      case 'ArrowUp':
        event.preventDefault()
        items[(index - 1 + items.length) % items.length]?.focus()
        break
      case 'Home':
        event.preventDefault()
        items[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        items[items.length - 1]?.focus()
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        close({ focusTrigger: true })
        break
      case 'Tab':
        setOpen(false)
        break
      default:
    }
  }

  const triggerElement = cloneElement(trigger, {
    ref: triggerRef,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: event => {
      trigger.props.onClick?.(event)
      setOpen(value => !value)
    },
    onKeyDown: event => {
      trigger.props.onKeyDown?.(event)
      if (event.key === 'ArrowDown' && !open) {
        event.preventDefault()
        setOpen(true)
      }
    },
  })

  return (
    <MenuContext.Provider value={close}>
      <div ref={wrapperRef} className={cx('ui-menu-wrap', className)}>
        {triggerElement}
        {open && (
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            className={cx('ui-menu', `ui-menu--${align}`)}
            onKeyDown={onMenuKeyDown}
          >
            {children}
          </div>
        )}
      </div>
    </MenuContext.Provider>
  )
}

/** A menu entry. Renders a router Link (`to`), an anchor (`href`) or a button. */
export function MenuItem({ to, href, onSelect, icon, danger = false, className, children, ...props }) {
  const close = useContext(MenuContext)
  const classes = cx('ui-menu__item', danger && 'ui-menu__item--danger', className)
  const handleClick = event => {
    onSelect?.(event)
    close?.()
  }
  const content = (
    <>
      {icon && <span className="ui-menu__icon" aria-hidden="true">{icon}</span>}
      <span className="ui-menu__label">{children}</span>
    </>
  )

  if (to) {
    return <Link to={to} role="menuitem" tabIndex={-1} className={classes} onClick={handleClick} {...props}>{content}</Link>
  }
  if (href) {
    return <a href={href} role="menuitem" tabIndex={-1} className={classes} onClick={handleClick} {...props}>{content}</a>
  }
  return <button type="button" role="menuitem" tabIndex={-1} className={classes} onClick={handleClick} {...props}>{content}</button>
}

export function MenuSeparator() {
  return <div role="separator" className="ui-menu__separator" />
}

/** Non-interactive heading block inside a menu (e.g. signed-in identity). */
export function MenuHeader({ className, children }) {
  return <div role="presentation" className={cx('ui-menu__header', className)}>{children}</div>
}
