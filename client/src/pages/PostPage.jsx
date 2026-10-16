import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HiArrowLeft, HiOutlineCheck, HiOutlineLink, HiOutlineDocumentText } from 'react-icons/hi'
import { Alert, Button, Container, EmptyState, SectionHeader, Skeleton } from '../components/ui'
import PostCard from '../components/content/PostCard'
import CommentSection from '../components/comments/CommentSection'
import ReadingMap from '../components/reader/ReadingMap'
import SaveButton from '../components/reader/SaveButton'
import { recordReading } from '../utils/readingHistory'
import Reveal from '../components/motion/Reveal'
import { getCategoryLabel } from '../constants/categories'
import { SITE } from '../constants/site'
import { formatDate, imageUrl, prepareArticle, readingTime } from '../utils/content'
import { fetchPosts } from '../utils/posts'

const DAY = 24 * 60 * 60 * 1000

// Progress through the article body (not the whole page), and whether the
// body is currently on screen (drives the compact Reading Map control).
function useArticleProgress(ref, enabled) {
  const [state, setState] = useState({ progress: 0, inArticle: false })
  useEffect(() => {
    if (!enabled) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = Math.min(1, Math.max(0, (vh * 0.35 - rect.top) / Math.max(rect.height - vh * 0.35, 1)))
      setState({ progress, inArticle: rect.top < vh * 0.6 && rect.bottom > vh * 0.4 })
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
  }, [ref, enabled])
  return state
}

// Same category first, topped up with the latest posts — no invented relevance.
function useRelatedPosts(post) {
  const [related, setRelated] = useState({ posts: [], sameTopic: false })
  useEffect(() => {
    if (!post) return undefined
    const controller = new AbortController()
    const notCurrent = p => p._id !== post._id
    ;(async () => {
      try {
        const { posts: sameCategory } = await fetchPosts({ category: post.category, limit: 4 }, { signal: controller.signal })
        let picks = sameCategory.filter(notCurrent).slice(0, 3)
        const sameTopic = picks.length === 3
        if (picks.length < 3) {
          const { posts: latest } = await fetchPosts({ limit: 6 }, { signal: controller.signal })
          const seen = new Set(picks.map(p => p._id))
          picks = [...picks, ...latest.filter(p => notCurrent(p) && !seen.has(p._id))].slice(0, 3)
        }
        setRelated({ posts: picks, sameTopic })
      } catch {
        // Related posts are optional; fail quietly.
      }
    })()
    return () => controller.abort()
  }, [post])
  return related
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return undefined
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={copy} data-copied={copied || undefined}>
      {copied ? <HiOutlineCheck aria-hidden="true" /> : <HiOutlineLink aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
    </Button>
  )
}

function ArticleSkeleton() {
  return (
    <Container size="reading" className="article-skeleton" aria-busy="true">
      <span className="ui-visually-hidden" role="status">Loading article</span>
      <Skeleton variant="text" width="20%" />
      <Skeleton height="2.75rem" width="95%" />
      <Skeleton height="2.75rem" width="70%" />
      <Skeleton variant="text" width="35%" />
      <Skeleton height="clamp(200px, 40vw, 420px)" className="article-skeleton__cover" />
      {[100, 96, 98, 90, 60].map((w, i) => <Skeleton key={i} variant="text" width={`${w}%`} />)}
    </Container>
  )
}

export default function PostPage() {
  const { postSlug } = useParams()
  const [post, setPost] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | notfound | error

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    fetchPosts({ slug: postSlug }, { signal: controller.signal })
      .then(({ posts }) => {
        if (!posts[0]) return setStatus('notfound')
        setPost(posts[0])
        setStatus('ready')
      })
      .catch(error => { if (error.name !== 'AbortError') setStatus('error') })
    return () => controller.abort()
  }, [postSlug])

  const article = useMemo(() => (post ? prepareArticle(post.content) : { html: '', headings: [] }), [post])
  const proseRef = useRef(null)
  const { progress, inArticle } = useArticleProgress(proseRef, status === 'ready')
  const related = useRelatedPosts(status === 'ready' ? post : null)

  useEffect(() => {
    if (post?.title) document.title = `${post.title} — ${SITE.name}`
    return () => { document.title = 'A2D blog' }
  }, [post?.title])

  // Device-local reading history: record at most every 3s, and on leave.
  const lastWrite = useRef(0)
  const latestProgress = useRef(0)
  useEffect(() => {
    if (status !== 'ready' || !post) return
    latestProgress.current = Math.max(latestProgress.current, progress)
    const now = Date.now()
    if (now - lastWrite.current > 3000 || progress >= 0.98) {
      lastWrite.current = now
      recordReading(post, latestProgress.current)
    }
  }, [progress, status, post])
  useEffect(() => {
    if (!post) return undefined
    latestProgress.current = 0
    lastWrite.current = 0
    return () => recordReading(post, latestProgress.current)
  }, [post])

  // Copy buttons inside code blocks (markup added by prepareArticle).
  const onProseClick = async event => {
    const button = event.target.closest('[data-copy-code]')
    if (!button) return
    const code = button.closest('.code-block')?.querySelector('pre')?.innerText ?? ''
    try {
      await navigator.clipboard.writeText(code)
      button.textContent = 'Copied'
      button.dataset.copied = 'true'
    } catch {
      button.textContent = 'Copy failed'
    }
    setTimeout(() => { button.textContent = 'Copy'; delete button.dataset.copied }, 1800)
  }

  if (status === 'loading') return <ArticleSkeleton />

  if (status === 'notfound' || status === 'error') {
    return (
      <Container size="reading" className="article-state">
        {status === 'error' ? (
          <Alert variant="danger" title="Couldn't load this article">
            Check your connection and refresh the page.
          </Alert>
        ) : (
          <EmptyState
            icon={<HiOutlineDocumentText />}
            title="Article not found"
            description="It may have been moved or unpublished."
            action={<Button as={Link} to="/search" variant="secondary">Browse all articles</Button>}
            titleAs="h1"
          />
        )}
      </Container>
    )
  }

  const minutes = readingTime(post.content)
  const updated = new Date(post.updatedAt) - new Date(post.createdAt) > DAY
  // Reading Map for articles with real structure (≥2 sections, ≥3 headings).
  const showMap = article.headings.filter(h => h.level === 2).length >= 2 && article.headings.length >= 3
  const categoryHref = `/search?category=${encodeURIComponent(post.category)}`

  return (
    <article className="article">
      <div className="reading-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <header className="article-header">
        <Container size="reading">
          <Link to="/search" className="text-link article-header__back">
            <HiArrowLeft aria-hidden="true" /> All articles
          </Link>
          <Link to={categoryHref} className="article-header__topic">{getCategoryLabel(post.category)}</Link>
          <h1 className="article-header__title">{post.title}</h1>
          <div className="article-byline">
            <span className="article-byline__avatar" aria-hidden="true">{SITE.author[0]}</span>
            <div className="article-byline__text">
              <p className="article-byline__name">{SITE.author}</p>
              <p className="article-byline__meta">
                <time dateTime={post.createdAt}>{formatDate(post.createdAt, { month: 'long' })}</time>
                <span aria-hidden="true"> · </span>
                {minutes} min read
                {updated && (
                  <>
                    <span aria-hidden="true"> · </span>
                    Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                  </>
                )}
              </p>
            </div>
            <SaveButton postId={post._id} className="article-byline__save" />
          </div>
        </Container>
      </header>

      {post.image && (
        <figure className="article-cover">
          <img
            src={imageUrl(post.image, 1600)}
            srcSet={`${imageUrl(post.image, 960)} 960w, ${imageUrl(post.image, 1600)} 1600w`}
            sizes="(min-width: 1024px) 960px, 100vw"
            alt=""
          />
        </figure>
      )}

      <div className={showMap ? 'article-layout article-layout--map' : 'article-layout'}>
        {showMap && (
          <aside className="article-layout__map">
            <ReadingMap headings={article.headings} progress={progress} inArticle={inArticle} />
          </aside>
        )}
        <div className="article-layout__main">
          <div ref={proseRef} className="prose" onClick={onProseClick} dangerouslySetInnerHTML={{ __html: article.html }} />

          <footer className="article-footer">
            <Link to={categoryHref} className="topic-chip">{getCategoryLabel(post.category)}</Link>
            <div className="article-footer__actions">
              <SaveButton postId={post._id} />
              <CopyLinkButton />
            </div>
          </footer>
        </div>
      </div>

      <section className="article-discussion" aria-labelledby="discussion-heading">
        <Container size="reading">
          <SectionHeader id="discussion-heading" title="Discussion" description="Questions, corrections and ideas are welcome." />
          <CommentSection postId={post._id} />
        </Container>
      </section>

      {related.posts.length > 0 && (
        <Reveal as="section" className="article-related" aria-labelledby="related-heading">
          <Container>
            <SectionHeader
              id="related-heading"
              title={related.sameTopic ? `More in ${getCategoryLabel(post.category)}` : 'Keep reading'}
            />
            <div className="card-grid">
              {related.posts.map((p, i) => <PostCard key={p._id} post={p} className="reveal-item" style={{ '--i': i }} />)}
            </div>
          </Container>
        </Reveal>
      )}
    </article>
  )
}
