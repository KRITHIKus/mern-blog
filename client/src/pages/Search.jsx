import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HiArrowRight, HiOutlineX, HiOutlineDocumentSearch, HiOutlinePhotograph, HiOutlineViewList } from 'react-icons/hi'
import { Alert, Button, Container, EmptyState } from '../components/ui'
import PostCard, { PostCardSkeleton } from '../components/content/PostCard'
import TopicLinks from '../components/content/TopicLinks'
import { CATEGORIES, getCategoryLabel } from '../constants/categories'
import { fetchPosts, PAGE_SIZE } from '../utils/posts'

// URL is the source of truth: ?searchTerm=&category=&order=asc
const readParams = search => {
  const params = new URLSearchParams(search)
  return {
    searchTerm: params.get('searchTerm') || '',
    category: params.get('category') || '',
    order: params.get('order') === 'asc' ? 'asc' : 'desc',
  }
}

const buildQuery = ({ searchTerm, category, order }) => {
  const params = new URLSearchParams()
  if (searchTerm) params.set('searchTerm', searchTerm)
  if (category) params.set('category', category)
  if (order === 'asc') params.set('order', 'asc')
  const query = params.toString()
  return `/search${query ? `?${query}` : ''}`
}

const VIEW_KEY = 'a2d:archive-view'
const readView = () => {
  try { return sessionStorage.getItem(VIEW_KEY) === 'compact' ? 'compact' : 'visual' } catch { return 'visual' }
}

function ViewSwitch({ view, onChange }) {
  const options = [['visual', 'Visual', HiOutlinePhotograph], ['compact', 'Compact', HiOutlineViewList]]
  return (
    <div className="view-switch" role="group" aria-label="Result layout">
      {options.map(([value, label, Icon]) => (
        <button
          key={value}
          type="button"
          className={view === value ? 'view-switch__item is-active' : 'view-switch__item'}
          aria-pressed={view === value}
          onClick={() => onChange(value)}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

export default function Search() {
  const location = useLocation()
  const navigate = useNavigate()
  const filters = readParams(location.search)

  const [term, setTerm] = useState(filters.searchTerm)
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [view, setView] = useState(readView)
  const changeView = value => {
    setView(value)
    try { sessionStorage.setItem(VIEW_KEY, value) } catch { /* optional */ }
  }

  useEffect(() => { setTerm(filters.searchTerm) }, [filters.searchTerm])

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setLoadMoreError(null)
    fetchPosts(readParams(location.search), { signal: controller.signal })
      .then(({ posts }) => {
        setPosts(posts)
        setHasMore(posts.length === PAGE_SIZE)
        setStatus('ready')
      })
      .catch(error => { if (error.name !== 'AbortError') setStatus('error') })
    return () => controller.abort()
  }, [location.search, reloadKey])

  const submit = event => {
    event.preventDefault()
    navigate(buildQuery({ ...filters, searchTerm: term.trim() }))
  }

  const loadMore = async () => {
    setLoadingMore(true)
    setLoadMoreError(null)
    try {
      const { posts: next } = await fetchPosts({ ...filters, startIndex: posts.length })
      setPosts(prev => [...prev, ...next])
      setHasMore(next.length === PAGE_SIZE)
    } catch (error) {
      setLoadMoreError(error.message)
    } finally {
      setLoadingMore(false)
    }
  }

  const hasFilters = Boolean(filters.searchTerm || filters.category)
  const [first, ...rest] = posts
  // Unfiltered newest-first view leads with the latest article.
  const showLead = !hasFilters && filters.order === 'desc' && Boolean(first)

  return (
    <div className="discover">
      <header className="page-header">
        <Container>
          <p className="page-kicker">The archive</p>
          <h1 className="page-title">
            {filters.category ? getCategoryLabel(filters.category) : 'All articles'}
          </h1>
          <p className="page-lead">
            {filters.category
              ? `Everything published under ${getCategoryLabel(filters.category)}.`
              : 'Search everything published on A2D, or browse by topic.'}
          </p>

          <form role="search" className="line-search line-search--page" onSubmit={submit}>
            <label htmlFor="archive-search" className="ui-visually-hidden">Search articles</label>
            <input
              id="archive-search"
              type="search"
              className="line-search__input"
              placeholder="Search by title or content"
              value={term}
              onChange={e => setTerm(e.target.value)}
            />
            <button type="submit" className="line-search__submit" aria-label="Search">
              <HiArrowRight aria-hidden="true" />
            </button>
          </form>
        </Container>
      </header>

      <div className="discover__toolbar">
        <Container className="discover__toolbar-inner">
          <TopicLinks
            includeAll
            topics={CATEGORIES.map(c => c.value)}
            active={filters.category}
            hrefFor={value => buildQuery({ ...filters, category: value })}
            label="Filter by topic"
            className="topics--tabs"
          />
          <div className="sort-toggle" role="group" aria-label="Sort order">
            {[['desc', 'Latest'], ['asc', 'Oldest']].map(([value, label]) => (
              <Link
                key={value}
                to={buildQuery({ ...filters, order: value })}
                className={filters.order === value ? 'sort-toggle__item is-active' : 'sort-toggle__item'}
                aria-current={filters.order === value ? 'true' : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
        </Container>
      </div>

      <Container className="discover__results">
        <div className="results-meta" aria-live="polite">
          {status === 'ready' && (
            <p>
              {posts.length === 0 ? 'No articles' : `Showing ${posts.length} ${posts.length === 1 ? 'article' : 'articles'}`}
              {filters.searchTerm && <> for <strong>“{filters.searchTerm}”</strong></>}
              {filters.category && <> in <strong>{getCategoryLabel(filters.category)}</strong></>}
            </p>
          )}
          <div className="results-meta__tools">
            {hasFilters && (
              <Link to={buildQuery({ order: filters.order })} className="text-link">
                <HiOutlineX aria-hidden="true" /> Clear filters
              </Link>
            )}
            <ViewSwitch view={view} onChange={changeView} />
          </div>
        </div>

        {status === 'loading' && (
          <div className={view === 'visual' ? 'story-list' : 'index-list'} aria-busy="true">
            {Array.from({ length: 5 }, (_, i) => <PostCardSkeleton key={i} variant={view === 'visual' ? 'row' : 'compact'} />)}
          </div>
        )}

        {status === 'error' && (
          <Alert
            variant="danger"
            title="Couldn't load articles"
            action={<Button size="sm" variant="secondary" onClick={() => setReloadKey(k => k + 1)}>Try again</Button>}
          >
            Something went wrong while searching. Please try again.
          </Alert>
        )}

        {status === 'ready' && posts.length === 0 && (
          <EmptyState
            icon={<HiOutlineDocumentSearch />}
            title={hasFilters ? 'No articles match' : 'No articles yet'}
            description={hasFilters ? 'Try a different keyword or another topic.' : 'Published articles will appear here.'}
            action={hasFilters && <Button as={Link} to="/search" variant="secondary">Show all articles</Button>}
            titleAs="h2"
          />
        )}

        {status === 'ready' && posts.length > 0 && (
          <>
            {view === 'visual' ? (
              <>
                {showLead && <PostCard post={first} variant="lead" as="h2" priority className="discover__lead" />}
                <ul className="story-list">
                  {(showLead ? rest : posts).map(post => <li key={post._id}><PostCard post={post} variant="row" as="h2" /></li>)}
                </ul>
              </>
            ) : (
              <ul className="index-list" aria-label="Articles">
                {posts.map(post => <li key={post._id}><PostCard post={post} variant="index" as="h2" /></li>)}
              </ul>
            )}

            {loadMoreError && <Alert variant="danger" className="discover__more-error">{loadMoreError}</Alert>}
            {hasMore && (
              <div className="discover__more">
                <Button variant="secondary" size="lg" loading={loadingMore} onClick={loadMore}>
                  {loadingMore ? 'Loading…' : 'Load more articles'}
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  )
}
