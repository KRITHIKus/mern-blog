import {
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineInformationCircle,
  HiOutlineXCircle,
} from 'react-icons/hi'
import { cx } from './cx'

const ICONS = {
  info: HiOutlineInformationCircle,
  success: HiOutlineCheckCircle,
  warning: HiOutlineExclamation,
  danger: HiOutlineXCircle,
}

/**
 * Alert — inline feedback message.
 * variant: info | success | warning | danger
 * danger/warning are announced immediately (role="alert"); info/success
 * politely (role="status").
 */
export function Alert({ variant = 'info', title, action, className, children }) {
  const Icon = ICONS[variant] || ICONS.info
  const urgent = variant === 'danger' || variant === 'warning'

  return (
    <div
      role={urgent ? 'alert' : 'status'}
      className={cx('ui-alert', variant !== 'info' && `ui-alert--${variant}`, className)}
    >
      <span className="ui-alert__icon" aria-hidden="true"><Icon /></span>
      <div className="ui-alert__body">
        {title && <p className="ui-alert__title">{title}</p>}
        {children && <div>{children}</div>}
      </div>
      {action && <div className="ui-alert__action">{action}</div>}
    </div>
  )
}
