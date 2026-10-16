import { useEffect, useMemo, useRef, useState } from 'react'
import { HiChevronDown, HiOutlineMap } from 'react-icons/hi'
import { Drawer, cx } from '../ui'

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Which heading is the reader in? The last one whose top has passed under the header.
function useActiveHeading(headings) {
  const [activeId, setActiveId] = useState(headings[0]?.id)
  useEffect(() => {
    if (!headings.length) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const offset = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 64) + 96
      let current = headings[0].id
      for (const h of headings) {
        const el = document.getElementById(h.id)
        if (el && el.getBoundingClientRect().top <= offset) current = h.id
        else break
      }
      setActiveId(current)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [headings])
  return activeId
}

const goTo = id => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
  window.history.replaceState(null, '', `#${id}`)
}

/** H2 sections with their H3 children. */
function useSections(headings) {
  return useMemo(() => {
    const sections = []
    headings.forEach(h => {
      if (h.level === 2 || !sections.length) sections.push({ ...h, children: [] })
      else sections[sections.length - 1].children.push(h)
    })
    return sections
  }, [headings])
}

function MapList({ sections, activeId, expandAll, onSelect }) {
  const activeSection = sections.find(s => s.id === activeId || s.children.some(c => c.id === activeId))
  return (
    <ol className="reading-map__list">
      {sections.map((section, i) => {
        const inSection = section === activeSection
        const showChildren = section.children.length > 0 && (expandAll || inSection)
        return (
          <li key={section.id} className={cx('reading-map__item', inSection && 'is-current')}>
            <a
              href={`#${section.id}`}
              className={cx('reading-map__link', section.id === activeId && 'is-active')}
              aria-current={section.id === activeId ? 'location' : undefined}
              onClick={event => { event.preventDefault(); onSelect(section.id) }}
            >
              <span className="reading-map__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span>{section.text}</span>
            </a>
            {showChildren && (
              <ol className="reading-map__sub">
                {section.children.map(child => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className={cx('reading-map__link reading-map__link--sub', child.id === activeId && 'is-active')}
                      aria-current={child.id === activeId ? 'location' : undefined}
                      onClick={event => { event.preventDefault(); onSelect(child.id) }}
                    >
                      {child.text}
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Reading Map — structure of a long article and the reader's place in it.
 * Desktop (≥1280px): compact sticky companion beside the text, collapsible.
 * Smaller screens: a small floating "Reading map" control that opens a
 * bottom sheet, shown only while the article body is on screen.
 */
export default function ReadingMap({ headings, progress, inArticle }) {
  const sections = useSections(headings)
  const activeId = useActiveHeading(headings)
  const [collapsed, setCollapsed] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const navigatedRef = useRef(false)

  const currentIndex = Math.max(0, sections.findIndex(s => s.id === activeId || s.children.some(c => c.id === activeId)))
  const position = `${currentIndex + 1} / ${sections.length}`
  const percent = Math.round(progress * 100)

  const selectFromSheet = id => {
    navigatedRef.current = true
    setSheetOpen(false)
    requestAnimationFrame(() => goTo(id))
  }

  return (
    <>
      {/* Desktop companion */}
      <nav className={cx('reading-map', collapsed && 'is-collapsed')} aria-label="Reading map">
        <div className="reading-map__head">
          <p className="reading-map__title">Reading map</p>
          <span className="reading-map__position">{position}</span>
          <button
            type="button"
            className="reading-map__toggle"
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand reading map' : 'Collapse reading map'}
            onClick={() => setCollapsed(c => !c)}
          >
            <HiChevronDown aria-hidden="true" />
          </button>
        </div>
        <div className="reading-map__progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
        {!collapsed && <MapList sections={sections} activeId={activeId} expandAll={headings.length <= 10} onSelect={goTo} />}
        {collapsed && sections[currentIndex] && <p className="reading-map__now">{sections[currentIndex].text}</p>}
      </nav>

      {/* Compact control for tablet / phone */}
      <button
        type="button"
        className={cx('reading-map-fab', inArticle && !sheetOpen && 'is-visible')}
        onClick={() => { navigatedRef.current = false; setSheetOpen(true) }}
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
        aria-controls="reading-map-sheet"
        tabIndex={inArticle ? 0 : -1}
      >
        <HiOutlineMap aria-hidden="true" />
        <span>Reading map</span>
        <span className="reading-map-fab__pos">{position}</span>
        <span className="reading-map-fab__bar" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></span>
      </button>

      <Drawer
        id="reading-map-sheet"
        side="bottom"
        title={`Reading map · ${percent}% read`}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        restoreFocus={() => !navigatedRef.current}
      >
        <MapList sections={sections} activeId={activeId} expandAll onSelect={selectFromSheet} />
      </Drawer>
    </>
  )
}
