import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import Header from './Header'
import Footer from './Footer'
import { isFocusRoute } from './navigation'

/**
 * Site frame: skip link → sticky Header → <main> → Footer.
 * Pages render their own containers (ui-container / <Container>) inside main;
 * the shell adds no page padding, so every page controls its own vertical rhythm.
 *
 * On pathname change: scroll to top and move focus to <main> so keyboard and
 * screen-reader users start at the new page's content (skipped on first load).
 */
export default function AppShell({ children }) {
  const { pathname } = useLocation()
  const mainRef = useRef(null)
  const firstRender = useRef(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="shell">
      <a href="#main-content" className="shell-skip-link">Skip to content</a>
      <Header />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="shell-main">
        {children}
      </main>
      {!isFocusRoute(pathname) && <Footer />}
    </div>
  )
}
