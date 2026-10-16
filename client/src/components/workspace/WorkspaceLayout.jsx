import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Container, Modal, cx } from '../ui'

/**
 * Frame for the signed-in workspace (Reader space / Publishing console).
 * One navigation system: a section rail on desktop that becomes a
 * horizontal tab row on smaller screens — no second hamburger.
 */
export default function WorkspaceLayout({ kicker, title, intro, tabs, active, actions, children }) {
  return (
    <div className="workspace">
      <Container size="wide" className="workspace__inner">
        <header className="workspace__head">
          <div>
            <p className="workspace__kicker">{kicker}</p>
            <h1 className="workspace__title">{title}</h1>
            {intro && <p className="workspace__intro">{intro}</p>}
          </div>
          {actions && <div className="workspace__actions">{actions}</div>}
        </header>

        <div className="workspace__grid">
          <nav className="workspace-nav" aria-label="Sections">
            <ul>
              {tabs.map(tab => (
                <li key={tab.key}>
                  <Link
                    to={`/dashboard?tab=${tab.key}`}
                    className={cx('workspace-nav__link', active === tab.key && 'is-active')}
                    aria-current={active === tab.key ? 'page' : undefined}
                  >
                    {tab.icon && <span className="workspace-nav__icon" aria-hidden="true">{tab.icon}</span>}
                    {tab.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="workspace__content">{children}</div>
        </div>
      </Container>
    </div>
  )
}

/** Panel heading inside a workspace section. */
export function PanelHeader({ title, description, actions }) {
  return (
    <div className="panel-header">
      <div>
        <h2 className="panel-header__title">{title}</h2>
        {description && <p className="panel-header__desc">{description}</p>}
      </div>
      {actions && <div className="panel-header__actions">{actions}</div>}
    </div>
  )
}

/** Confirmation dialog that runs an async action with loading + error states. */
export function ConfirmDialog({ open, title, description, confirmLabel = 'Delete', pendingLabel = 'Deleting…', onConfirm, onClose, children }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => { if (open) { setPending(false); setError(null) } }, [open])

  const run = async () => {
    setPending(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      setError(err.message)
      setPending(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !pending && onClose()}
      title={title}
      description={description}
      size="sm"
      dismissible={!pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button variant="danger" loading={pending} onClick={run}>{pending ? pendingLabel : confirmLabel}</Button>
        </>
      }
    >
      {children}
      {error && <Alert variant="danger">{error}</Alert>}
    </Modal>
  )
}

/** Short-lived status message after an action ("Post deleted."). */
export function useNotice(duration = 3500) {
  const [notice, setNotice] = useState(null)
  useEffect(() => {
    if (!notice) return undefined
    const id = setTimeout(() => setNotice(null), duration)
    return () => clearTimeout(id)
  }, [notice, duration])
  return [notice, setNotice]
}

export function Notice({ children }) {
  return children ? <p className="workspace-notice" role="status">{children}</p> : <span role="status" className="ui-visually-hidden" />
}
