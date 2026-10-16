import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import moment from 'moment'
import {
  HiArrowRight, HiOutlineBookmark, HiOutlineBookOpen, HiOutlineChatAlt2, HiOutlineCog,
  HiOutlineHome, HiOutlineThumbUp,
} from 'react-icons/hi'
import { Alert, Button, EmptyState, Skeleton } from '../ui'
import PostCard from '../content/PostCard'
import WorkspaceLayout, { PanelHeader } from './WorkspaceLayout'
import AccountSettings, { memberSince } from './AccountSettings'
import { getCategoryLabel } from '../../constants/categories'
import { requestJSON } from '../../utils/http'
import { imageUrl } from '../../utils/content'
import { clearReadingHistory, getReadingHistory } from '../../utils/readingHistory'

const READER_TABS = [
  { key: 'overview', label: 'Overview', icon: <HiOutlineHome /> },
  { key: 'activity', label: 'Activity', icon: <HiOutlineChatAlt2 /> },
  { key: 'account', label: 'Account', icon: <HiOutlineCog /> },
]

function useRemote(url) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setState(s => ({ ...s, status: 'loading' }))
    requestJSON(url, { signal: controller.signal })
      .then(data => setState({ status: 'ready', data, error: null }))
      .catch(error => { if (error.name !== 'AbortError') setState({ status: 'error', data: null, error: error.message }) })
    return () => controller.abort()
  }, [url, attempt])
  return { ...state, retry: () => setAttempt(a => a + 1) }
}

function ListSkeleton({ rows = 3 }) {
  return (
    <div className="stack-list" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="stack-list__item"><Skeleton variant="text" width="35%" /><Skeleton variant="text" width="80%" /></div>
      ))}
    </div>
  )
}

function HistoryList({ items, showProgress }) {
  return (
    <ul className="history-list">
      {items.map(item => (
        <li key={item.slug}>
          <Link to={`/dashboard/post/${item.slug}`} className="history-item">
            {item.image && <img src={imageUrl(item.image, 240)} alt="" className="history-item__image" loading="lazy" />}
            <span className="history-item__text">
              <span className="history-item__topic">{getCategoryLabel(item.category)}</span>
              <span className="history-item__title">{item.title}</span>
              <span className="history-item__meta">
                {showProgress ? `${Math.round(item.progress * 100)}% read` : `Read ${moment(item.readAt).fromNow()}`}
              </span>
              {showProgress && <span className="history-item__bar" aria-hidden="true"><span style={{ transform: `scaleX(${item.progress})` }} /></span>}
            </span>
            <HiArrowRight className="history-item__arrow" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Overview() {
  const saved = useRemote('/api/user/saved')
  const [history, setHistory] = useState(getReadingHistory)
  const unfinished = history.filter(item => item.progress > 0.05 && item.progress < 0.9).slice(0, 3)
  const recent = history.slice(0, 6)

  return (
    <div className="panel-stack">
      {unfinished.length > 0 && (
        <section aria-labelledby="continue-heading">
          <PanelHeader title={<span id="continue-heading">Continue reading</span>} description="Pick up where you left off — remembered on this device." />
          <HistoryList items={unfinished} showProgress />
        </section>
      )}

      <section aria-labelledby="saved-heading">
        <PanelHeader title={<span id="saved-heading">Saved for later</span>} description="Articles you’ve saved to your account." />
        {saved.status === 'loading' && <ListSkeleton />}
        {saved.status === 'error' && (
          <Alert variant="danger" action={<Button size="sm" variant="secondary" onClick={saved.retry}>Try again</Button>}>{saved.error}</Alert>
        )}
        {saved.status === 'ready' && saved.data.posts.length === 0 && (
          <EmptyState
            icon={<HiOutlineBookmark />}
            title="Nothing saved yet"
            description="Use “Save for later” on any article and come back to longer reads when you have time."
            action={<Button as={Link} to="/search" variant="secondary">Explore writing <HiArrowRight aria-hidden="true" /></Button>}
          />
        )}
        {saved.status === 'ready' && saved.data.posts.length > 0 && (
          <ul className="story-list story-list--compact">
            {saved.data.posts.map(post => <li key={post._id}><PostCard post={post} variant="row" as="h3" /></li>)}
          </ul>
        )}
      </section>

      <section aria-labelledby="recent-heading">
        <PanelHeader
          title={<span id="recent-heading">Recently read</span>}
          description="Kept only on this device."
          actions={recent.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => { clearReadingHistory(); setHistory([]) }}>Clear history</Button>
          )}
        />
        {recent.length === 0 ? (
          <EmptyState
            icon={<HiOutlineBookOpen />}
            title="Your reading trail starts here"
            description="Articles you open will appear here so you can return to unfinished reads."
            action={<Button as={Link} to="/search" variant="secondary">Browse articles <HiArrowRight aria-hidden="true" /></Button>}
          />
        ) : (
          <HistoryList items={recent} />
        )}
      </section>
    </div>
  )
}

function CommentList({ comments, emptyIcon, emptyTitle, emptyText }) {
  if (comments.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyText}
        action={<Button as={Link} to="/search" variant="secondary">Find something to read <HiArrowRight aria-hidden="true" /></Button>}
      />
    )
  }
  return (
    <ul className="stack-list">
      {comments.map(c => (
        <li key={c._id} className="stack-list__item">
          <p className="stack-list__meta">
            {c.post ? <Link to={`/dashboard/post/${c.post.slug}#discussion`} className="stack-list__link">{c.post.title}</Link> : 'Article no longer available'}
            <span aria-hidden="true"> · </span>
            <time dateTime={c.createdAt}>{moment(c.createdAt).fromNow()}</time>
          </p>
          <p className="stack-list__text">{c.content}</p>
          {c.numberOfLikes > 0 && <p className="stack-list__aside">{c.numberOfLikes} found this helpful</p>}
        </li>
      ))}
    </ul>
  )
}

function Activity() {
  const activity = useRemote('/api/comment/activity')
  if (activity.status === 'loading') return <ListSkeleton rows={4} />
  if (activity.status === 'error') {
    return <Alert variant="danger" action={<Button size="sm" variant="secondary" onClick={activity.retry}>Try again</Button>}>{activity.error}</Alert>
  }
  const { comments, appreciated } = activity.data
  return (
    <div className="panel-stack">
      <section>
        <PanelHeader title="Your comments" description="Your contributions to discussions, newest first." />
        <CommentList
          comments={comments}
          emptyIcon={<HiOutlineChatAlt2 />}
          emptyTitle="Join the discussion"
          emptyText="Add a question, correction or idea to an article you’ve read."
        />
      </section>
      <section>
        <PanelHeader title="Marked helpful" description="Comments you found useful." />
        <CommentList
          comments={appreciated}
          emptyIcon={<HiOutlineThumbUp />}
          emptyTitle="No helpful comments marked yet"
          emptyText="When a reader’s comment helps you, mark it “Helpful” — it shows up here."
        />
      </section>
    </div>
  )
}

export default function ReaderSpace({ tab }) {
  const { currentUser } = useSelector(state => state.user)
  const active = READER_TABS.some(t => t.key === tab) ? tab : 'overview'
  const since = memberSince(currentUser)

  return (
    <WorkspaceLayout
      kicker="My A2D"
      title={<>Hello, <em>{currentUser.username}</em></>}
      intro={since ? `Reader since ${since}.` : null}
      tabs={READER_TABS}
      active={active}
    >
      {active === 'overview' && <Overview />}
      {active === 'activity' && <Activity />}
      {active === 'account' && <AccountSettings />}
    </WorkspaceLayout>
  )
}
