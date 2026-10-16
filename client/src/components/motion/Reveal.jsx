import { useEffect, useRef, useState } from 'react'
import { cx } from '../ui'

/**
 * Reveal — fades/slides its content in once, the first time it scrolls into
 * view. The hidden start state only exists under
 * `prefers-reduced-motion: no-preference` (see styles/motion.css), so with
 * reduced motion or without IntersectionObserver content is simply shown.
 */
export default function Reveal({ as: Component = 'div', className, children, ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Component ref={ref} className={cx('reveal', visible && 'is-visible', className)} {...props}>
      {children}
    </Component>
  )
}
