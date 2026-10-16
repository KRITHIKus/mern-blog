import { Link } from 'react-router-dom'
import { cx } from '../ui'

// Brand wordmark — the one deliberate use of the display font in the shell.
export default function Brand({ className }) {
  return (
    <Link to="/" className={cx('shell-brand', className)} aria-label="A2D Blog — home">
      <span className="shell-brand__bracket shell-brand__bracket--open" aria-hidden="true">[</span>
      <span className="shell-brand__mark" aria-hidden="true">A2D</span>
      <span className="shell-brand__bracket shell-brand__bracket--close" aria-hidden="true">]</span>
    </Link>
  )
}
