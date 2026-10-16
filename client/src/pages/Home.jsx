import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiArrowRight, HiOutlineDocumentText } from 'react-icons/hi'
import { Alert, Button, Container, EmptyState } from '../components/ui'
import PostCard, { PostCardSkeleton } from '../components/content/PostCard'
import Reveal from '../components/motion/Reveal'
import { getCategoryLabel } from '../constants/categories'
import { PROJECTS } from '../constants/projects'
import { SITE } from '../constants/site'
import { formatDate, readingTime } from '../utils/content'
import { fetchPosts } from '../utils/posts'

// Three.js is code-split: the sculpture loads after the page is interactive.
const HeroSculpture = lazy(() => import('../components/motion/HeroSculpture'))

const HOME_LIMIT = 12
const LONG_READ_MINUTES = 5

function SectionRule({ label, aside, id }) {
  return (
    <div className="section-rule">
      <h2 id={id} className="section-rule__label">{label}</h2>
      {aside && <div className="section-rule__aside">{aside}</div>}
    </div>
  )
}

function Hero({ latestDate, totalPosts, topicCount }) {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const submit = event => {
    event.preventDefault()
    navigate(term.trim() ? `/search?searchTerm=${encodeURIComponent(term.trim())}` : '/search')
  }

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__rules" aria-hidden="true" />
      <div className="hero__stage">
        <Suspense fallback={<div className="hero__sculpture hero__sculpture--loading" />}>
          <HeroSculpture className="hero__sculpture" />
        </Suspense>
      </div>

      <Container className="hero__inner">
        <p className="hero__caption" aria-hidden="true">Fig. 01 — The A2D lattice</p>
        <p className="hero__dateline">
          <span>A technology publication</span>
          {latestDate && <span>Updated {latestDate}</span>}
        </p>

        <h1 id="hero-title" className="hero__title">
          <span className="hero__line">Engineering</span>
          <span className="hero__line">ideas,</span>
          <span className="hero__line hero__line--accent">
            <em>written clearly</em><span className="hero__stop">.</span>
          </span>
        </h1>

        <div className="hero__foot">
          <p className="hero__lead">{SITE.description}</p>
          <div className="hero__actions">
            <form role="search" className="line-search" onSubmit={submit}>
              <label htmlFor="hero-search" className="ui-visually-hidden">Search articles</label>
              <input
                id="hero-search"
                type="search"
                className="line-search__input"
                placeholder="Search the archive"
                value={term}
                onChange={e => setTerm(e.target.value)}
              />
              <button type="submit" className="line-search__submit" aria-label="Search">
                <HiArrowRight aria-hidden="true" />
              </button>
            </form>
            {totalPosts > 0 && (
              <p className="hero__facts">
                <span>{totalPosts} articles</span>
                <span>{topicCount} {topicCount === 1 ? 'topic' : 'topics'}</span>
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

export default function Home() {
  const [posts, setPosts] = useState([])
  const [totalPosts, setTotalPosts] = useState(0)
  const [status, setStatus] = useState('loading') // loading | ready | error

  const load = useCallback(async signal => {
    setStatus('loading')
    try {
      const data = await fetchPosts({ limit: HOME_LIMIT }, { signal })
      setPosts(data.posts)
      setTotalPosts(data.totalPosts)
      setStatus('ready')
    } catch (error) {
      if (error.name !== 'AbortError') setStatus('error')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const lead = posts[0]
  const others = useMemo(() => posts.slice(1), [posts])
  const alsoNew = others.slice(0, 3)
  const latestFeature = others[3]
  const latestSide = others.slice(4, 6)
  const indexRows = others.slice(6)

  // Topics that actually appear in recent writing, most used first.
  const topics = useMemo(() => {
    const counts = new Map()
    posts.forEach(p => p.category && counts.set(p.category, (counts.get(p.category) || 0) + 1))
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value)
  }, [posts])

  // Long reads: the longest recent articles outside the lead story.
  const longReads = useMemo(() =>
    others
      .map(post => ({ post, minutes: readingTime(post.content) }))
      .filter(item => item.minutes >= LONG_READ_MINUTES)
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 3)
      .map(item => item.post),
  [others])

  return (
    <div className="front">
      <Hero
        latestDate={lead ? formatDate(lead.createdAt, { month: 'long' }) : ''}
        totalPosts={totalPosts}
        topicCount={topics.length}
      />

      {/* ── Lead story ── */}
      <section className="front-section front-section--lead" aria-labelledby="lead-heading">
        <Container>
          <SectionRule id="lead-heading" label="The lead story" aside={lead && <span>{getCategoryLabel(lead.category)}</span>} />

          {status === 'loading' && <PostCardSkeleton variant="lead" />}

          {status === 'error' && (
            <Alert variant="danger" title="Couldn't load articles"
              action={<Button size="sm" variant="secondary" onClick={() => load()}>Try again</Button>}>
              Check your connection and try again.
            </Alert>
          )}

          {status === 'ready' && !lead && (
            <EmptyState
              icon={<HiOutlineDocumentText />}
              title="No articles published yet"
              description="New writing will appear here as soon as it's published."
            />
          )}

          {lead && <PostCard post={lead} variant="lead" as="h3" priority />}

          {alsoNew.length > 0 && (
            <div className="also-new">
              <p className="also-new__label">Also new</p>
              <ol className="also-new__list">
                {alsoNew.map((post, i) => (
                  <li key={post._id}><PostCard post={post} variant="compact" index={i + 1} /></li>
                ))}
              </ol>
            </div>
          )}
        </Container>
      </section>

      {/* ── Latest writing: asymmetric feature + stack, then a typographic index ── */}
      {latestFeature && (
        <Reveal as="section" className="front-section" aria-labelledby="latest-heading">
          <Container>
            <SectionRule
              id="latest-heading"
              label="Latest writing"
              aside={<Link to="/search" className="text-link">All articles <HiArrowRight aria-hidden="true" /></Link>}
            />
            <div className="latest-grid">
              <PostCard post={latestFeature} variant="feature" className="latest-grid__feature reveal-item" />
              {latestSide.length > 0 && (
                <div className="latest-grid__side">
                  {latestSide.map((post, i) => (
                    <PostCard key={post._id} post={post} className="reveal-item" style={{ '--i': i + 1 }} />
                  ))}
                </div>
              )}
            </div>

            {indexRows.length > 0 && (
              <ul className="index-list" aria-label="More recent articles">
                {indexRows.map((post, i) => (
                  <li key={post._id}>
                    <PostCard post={post} variant="index" className="reveal-item" style={{ '--i': i }} />
                  </li>
                ))}
              </ul>
            )}
          </Container>
        </Reveal>
      )}

      {/* ── Topics: inverse band ── */}
      {topics.length > 0 && (
        <Reveal as="section" className="topics-band" aria-labelledby="topics-heading">
          <Container>
            <div className="topics-band__head">
              <h2 id="topics-heading" className="topics-band__title">Browse by <em>topic</em></h2>
              <p className="topics-band__desc">Every subject opens its own reading list.</p>
            </div>
            <ul className="topic-index">
              {topics.map((value, i) => (
                <li key={value} className="reveal-item" style={{ '--i': i }}>
                  <Link to={`/search?category=${value}`} className="topic-index__link">
                    <span className="topic-index__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span className="topic-index__name">{getCategoryLabel(value)}</span>
                    <HiArrowRight className="topic-index__arrow" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/search" className="topics-band__all">Every topic in the archive <HiArrowRight aria-hidden="true" /></Link>
          </Container>
        </Reveal>
      )}

      {/* ── Long reads ── */}
      {longReads.length >= 2 && (
        <Reveal as="section" className="front-section" aria-labelledby="longreads-heading">
          <Container>
            <div className="longreads">
              <div className="longreads__intro">
                <h2 id="longreads-heading" className="display-heading">Long <em>reads</em></h2>
                <p>In-depth pieces worth setting time aside for.</p>
              </div>
              <ol className="longreads__list">
                {longReads.map((post, i) => (
                  <li key={post._id}><PostCard post={post} variant="compact" index={i + 1} /></li>
                ))}
              </ol>
            </div>
          </Container>
        </Reveal>
      )}

      {/* ── From the workshop ── */}
      <Reveal as="section" className="front-section" aria-labelledby="projects-heading">
        <Container>
          <SectionRule
            id="projects-heading"
            label="From the workshop"
            aside={<Link to="/projects" className="text-link">All projects <HiArrowRight aria-hidden="true" /></Link>}
          />
          <div className="workshop">
            {PROJECTS.slice(0, 3).map((project, i) => (
              <article key={project.id} className="workshop-card reveal-item" style={{ '--i': i }}>
                <span className="workshop-card__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <p className="workshop-card__area">{project.area}</p>
                <h3 className="workshop-card__name">
                  <Link to={`/projects#${project.id}`} className="pc__link">{project.name}</Link>
                </h3>
                <p className="workshop-card__summary">{project.summary}</p>
                <span className="workshop-card__go" aria-hidden="true">Case study <HiArrowRight /></span>
              </article>
            ))}
          </div>
        </Container>
      </Reveal>

      {/* ── Closing: the archive as one big typographic link ── */}
      {status === 'ready' && totalPosts > 0 && (
        <Reveal as="section" className="front-section front-section--last" aria-label="Explore the archive">
          <Container>
            <Link to="/search" className="archive-link">
              <span className="archive-link__kicker">The archive · {totalPosts} {totalPosts === 1 ? 'article' : 'articles'}</span>
              <span className="archive-link__text">Read <em>everything</em> <HiArrowRight aria-hidden="true" /></span>
            </Link>
          </Container>
        </Reveal>
      )}
    </div>
  )
}
