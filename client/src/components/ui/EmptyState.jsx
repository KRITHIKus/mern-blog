import { cx } from './cx'

/**
 * EmptyState — "nothing here yet / no results" message with an optional
 * next step. Keep copy plain and helpful.
 * titleAs: heading level that fits the surrounding hierarchy.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  plain = false,
  titleAs: Title = 'h3',
  className,
}) {
  return (
    <div className={cx('ui-empty', plain && 'ui-empty--plain', className)}>
      {icon && <span className="ui-empty__icon" aria-hidden="true">{icon}</span>}
      {title && <Title className="ui-empty__title">{title}</Title>}
      {description && <p className="ui-empty__desc">{description}</p>}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  )
}
