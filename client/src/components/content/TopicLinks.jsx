import { Link } from 'react-router-dom'
import { cx } from '../ui'
import { getCategoryLabel } from '../../constants/categories'

/**
 * Topic (category) chips as links, so topic browsing stays URL-driven.
 * hrefFor(value) builds each link; '' means "All".
 */
export default function TopicLinks({ topics, active, hrefFor, includeAll = false, label = 'Topics', className }) {
  const items = includeAll ? ['', ...topics] : topics
  return (
    <nav aria-label={label} className={cx('topics', className)}>
      <ul className="topics__list">
        {items.map(value => {
          const isActive = (active || '') === value
          return (
            <li key={value || 'all'}>
              <Link
                to={hrefFor(value)}
                className={cx('topic-chip', isActive && 'is-active')}
                aria-current={isActive ? 'page' : undefined}
              >
                {value ? getCategoryLabel(value) : 'All'}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
