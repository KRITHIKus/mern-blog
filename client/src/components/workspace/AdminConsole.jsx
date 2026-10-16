import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import moment from 'moment'
import {
  HiArrowRight, HiOutlineChatAlt2, HiOutlineCog, HiOutlineDocumentText, HiOutlineExternalLink,
  HiOutlinePencilAlt, HiOutlinePlus, HiOutlineTemplate, HiOutlineTrash, HiOutlineUsers, HiOutlineSearch,
} from 'react-icons/hi'
import { Alert, Badge, Button, EmptyState, Input, Skeleton } from '../ui'
import WorkspaceLayout, { ConfirmDialog, Notice, PanelHeader, useNotice } from './WorkspaceLayout'
import AccountSettings from './AccountSettings'
import { usePostIndex, resetPostIndex } from './usePostIndex'
import { useAuthor } from '../comments/useAuthor'
import { getCategoryLabel } from '../../constants/categories'
import { formatDate, imageUrl } from '../../utils/content'
import { requestJSON } from '../../utils/http'
import { PAGE_SIZE, postPath } from '../../utils/posts'

const ADMIN_TABS = [
  { key: 'overview', label: 'Overview', icon: <HiOutlineTemplate /> },
  { key: 'posts', label: 'Posts', icon: <HiOutlineDocumentText /> },
  { key: 'comments', label: 'Discussion', icon: <HiOutlineChatAlt2 /> },
  { key: 'users', label: 'Readers', icon: <HiOutlineUsers /> },
  { key: 'account', label: 'Account', icon: <HiOutlineCog /> },
]

/** Paged list loader for the admin list endpoints (offset pagination). */
function usePagedList(buildUrl, key, deps) {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({})
  const [status, setStatus] = useState('loading')
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreError, setMoreError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setMoreError(null)
    requestJSON(buildUrl(0), { signal: controller.signal })
      .then(data => {
        setItems(data[key] || [])
        setMeta(data)
        setHasMore((data[key] || []).length === PAGE_SIZE)
        setStatus('ready')
      })
      .catch(error => { if (error.name !== 'AbortError') setStatus('error') })
    return () => controller.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const loadMore = async () => {
    setLoadingMore(true)
    setMoreError(null)
    try {
      const data = await requestJSON(buildUrl(items.length))
      setItems(prev => [...prev, ...(data[key] || [])])
      setHasMore((data[key] || []).length === PAGE_SIZE)
    } catch (error) {
      setMoreError(error.message)
    } finally {
      setLoadingMore(false)
    }
  }

  return { items, setItems, meta, status, hasMore, loadingMore, moreError, loadMore, retry: () => setAttempt(a => a + 1) }
}

function TableSkeleton() {
  return (
    <div className="records-skeleton" aria-busy="true">
      {[0, 1, 2, 3].map(i => <Skeleton key={i} height="3.25rem" />)}
    </div>
  )
}

function LoadMore({ list, label }) {
  return (
    <>
      {list.moreError && <Alert variant="danger">{list.moreError}</Alert>}
      {list.hasMore && (
        <div className="records-more">
          <Button variant="secondary" loading={list.loadingMore} onClick={list.loadMore}>
            {list.loadingMore ? 'Loading…' : label}
          </Button>
        </div>
      )}
    </>
  )
}

function ListError({ onRetry }) {
  return (
    <Alert variant="danger" title="Couldn't load this list" action={<Button size="sm" variant="secondary" onClick={onRetry}>Try again</Button>}>
      Check your connection and try again.
    </Alert>
  )
}

function AuthorName({ userId }) {
  const { author, loaded } = useAuthor(userId)
  if (!loaded) return <Skeleton variant="text" width="5rem" />
  return <span>{author ? author.username : 'Former reader'}</span>
}

/* ───────────────────────── Overview ───────────────────────── */

function Stat({ label, value, delta, to }) {
  return (
    <Link to={to} className="stat">
      <span className="stat__label">{label}</span>
      <span className="stat__value">{value ?? '—'}</span>
      <span className="stat__delta">{delta == null ? ' ' : `+${delta} in the last 30 days`}</span>
    </Link>
  )
}

function Overview() {
  const [state, setState] = useState({ status: 'loading' })
  const postIndex = usePostIndex()

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const [posts, comments, users] = await Promise.all([
        requestJSON('/api/post/getposts?limit=5'),
        requestJSON('/api/comment/getcomments?limit=5&sort=desc'),
        requestJSON('/api/user/getusers?limit=5'),
      ])
      setState({ status: 'ready', posts, comments, users })
    } catch (error) {
      setState({ status: 'error', error: error.message })
    }
  }, [])
  useEffect(() => { load() }, [load])

  if (state.status === 'error') return <ListError onRetry={load} />
  const ready = state.status === 'ready'

  return (
    <div className="panel-stack">
      <section aria-label="Publication totals" className="stats">
        {/* API keys are lastMonthsPosts / lastMonthusers (sic) */}
        <Stat label="Articles" to="/dashboard?tab=posts" value={ready ? state.posts.totalPosts : null} delta={ready ? state.posts.lastMonthsPosts : null} />
        <Stat label="Comments" to="/dashboard?tab=comments" value={ready ? state.comments.totalComments : null} delta={ready ? state.comments.lastMonthComments : null} />
        <Stat label="Readers" to="/dashboard?tab=users" value={ready ? state.users.totalUsers : null} delta={ready ? state.users.lastMonthusers : null} />
      </section>

      <section className="quick-actions" aria-label="Quick actions">
        <Button as={Link} to="/createPost"><HiOutlinePlus aria-hidden="true" /> New article</Button>
        <Button as={Link} to="/search" variant="secondary">View the publication <HiArrowRight aria-hidden="true" /></Button>
      </section>

      <div className="overview-grid">
        <section aria-labelledby="ov-posts">
          <PanelHeader title={<span id="ov-posts">Latest articles</span>} actions={<Link to="/dashboard?tab=posts" className="text-link">All posts <HiArrowRight aria-hidden="true" /></Link>} />
          {!ready ? <TableSkeleton /> : state.posts.posts.length === 0 ? (
            <EmptyState icon={<HiOutlineDocumentText />} title="No articles yet" description="Your first article will appear here." action={<Button as={Link} to="/createPost">Write the first article</Button>} />
          ) : (
            <ul className="stack-list">
              {state.posts.posts.map(post => (
                <li key={post._id} className="stack-list__item stack-list__item--row">
                  <div>
                    <Link to={`/update-post/${post._id}`} className="stack-list__link">{post.title}</Link>
                    <p className="stack-list__meta">{getCategoryLabel(post.category)} · updated {moment(post.updatedAt).fromNow()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="ov-comments">
          <PanelHeader title={<span id="ov-comments">Recent discussion</span>} actions={<Link to="/dashboard?tab=comments" className="text-link">Moderate <HiArrowRight aria-hidden="true" /></Link>} />
          {!ready ? <TableSkeleton /> : state.comments.comments.length === 0 ? (
            <EmptyState icon={<HiOutlineChatAlt2 />} title="No comments yet" description="Reader comments will appear here as they arrive." />
          ) : (
            <ul className="stack-list">
              {state.comments.comments.map(c => {
                const post = postIndex.get(c.postId)
                return (
                  <li key={c._id} className="stack-list__item">
                    <p className="stack-list__meta">
                      <AuthorName userId={c.userId} /> on{' '}
                      {post ? <Link to={`${postPath(post)}#discussion`} className="stack-list__link">{post.title}</Link> : 'an article'}
                      <span aria-hidden="true"> · </span>{moment(c.createdAt).fromNow()}
                    </p>
                    <p className={c.isDeleted ? 'stack-list__text is-deleted' : 'stack-list__text'}>{c.isDeleted ? 'Deleted comment' : c.content}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

/* ───────────────────────── Posts ───────────────────────── */

function PostsPanel() {
  const { currentUser } = useSelector(state => state.user)
  const [term, setTerm] = useState('')
  const [query, setQuery] = useState('')
  const list = usePagedList(
    start => `/api/post/getposts?userId=${currentUser._id}&startIndex=${start}${query ? `&searchTerm=${encodeURIComponent(query)}` : ''}`,
    'posts',
    [currentUser._id, query],
  )
  const [toDelete, setToDelete] = useState(null)
  const [notice, setNotice] = useNotice()

  const remove = async () => {
    await requestJSON(`/api/post/deletepost/${toDelete._id}/${currentUser._id}`, { method: 'DELETE' })
    list.setItems(items => items.filter(p => p._id !== toDelete._id))
    resetPostIndex()
    setToDelete(null)
    setNotice(`“${toDelete.title}” was deleted.`)
  }

  return (
    <section>
      <PanelHeader
        title="Posts"
        description="Everything you’ve published, most recently updated first."
        actions={<Button as={Link} to="/createPost" size="sm"><HiOutlinePlus aria-hidden="true" /> New article</Button>}
      />
      <form role="search" className="records-search" onSubmit={e => { e.preventDefault(); setQuery(term.trim()) }}>
        <label htmlFor="posts-search" className="ui-visually-hidden">Search posts</label>
        <HiOutlineSearch aria-hidden="true" className="records-search__icon" />
        <Input id="posts-search" type="search" placeholder="Search your posts" value={term} onChange={e => { setTerm(e.target.value); if (!e.target.value) setQuery('') }} />
      </form>
      <Notice>{notice}</Notice>

      {list.status === 'loading' && <TableSkeleton />}
      {list.status === 'error' && <ListError onRetry={list.retry} />}
      {list.status === 'ready' && list.items.length === 0 && (
        query
          ? <EmptyState plain title={`No posts match “${query}”`} description="Try another keyword." />
          : <EmptyState icon={<HiOutlineDocumentText />} title="No articles yet" description="Write and publish your first article." action={<Button as={Link} to="/createPost">New article</Button>} />
      )}
      {list.status === 'ready' && list.items.length > 0 && (
        <table className="records">
          <thead>
            <tr><th scope="col">Article</th><th scope="col">Topic</th><th scope="col">Updated</th><th scope="col"><span className="ui-visually-hidden">Actions</span></th></tr>
          </thead>
          <tbody>
            {list.items.map(post => (
              <tr key={post._id}>
                <td className="records__primary">
                  <div className="record-title">
                    {post.image && <img src={imageUrl(post.image, 160)} alt="" className="record-title__thumb" loading="lazy" />}
                    <Link to={`/update-post/${post._id}`} className="record-title__link">{post.title}</Link>
                  </div>
                </td>
                <td data-label="Topic">{getCategoryLabel(post.category)}</td>
                <td data-label="Updated"><time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time></td>
                <td className="records__actions">
                  <Button as={Link} to={postPath(post)} variant="ghost" size="sm" icon aria-label={`View “${post.title}”`}><HiOutlineExternalLink /></Button>
                  <Button as={Link} to={`/update-post/${post._id}`} variant="ghost" size="sm" icon aria-label={`Edit “${post.title}”`}><HiOutlinePencilAlt /></Button>
                  <Button variant="ghost" size="sm" icon className="records__danger" aria-label={`Delete “${post.title}”`} onClick={() => setToDelete(post)}><HiOutlineTrash /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <LoadMore list={list} label="Load more posts" />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this article?"
        description={toDelete ? `“${toDelete.title}” will be removed from the publication. This can’t be undone.` : ''}
        confirmLabel="Delete article"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </section>
  )
}

/* ───────────────────────── Comments ───────────────────────── */

function CommentsPanel() {
  const list = usePagedList(start => `/api/comment/getcomments?sort=desc&startIndex=${start}`, 'comments', [])
  const postIndex = usePostIndex()
  const [toDelete, setToDelete] = useState(null)
  const [notice, setNotice] = useNotice()

  const remove = async () => {
    const data = await requestJSON(`/api/comment/deleteComment/${toDelete._id}`, { method: 'DELETE' })
    list.setItems(items => (data.comment
      ? items.map(c => (c._id === toDelete._id ? { ...c, ...data.comment } : c))
      : items.filter(c => c._id !== toDelete._id)))
    setToDelete(null)
    setNotice(data.comment ? 'Comment removed; its replies were kept.' : 'Comment deleted.')
  }

  return (
    <section>
      <PanelHeader title="Discussion" description="All reader comments, newest first." />
      <Notice>{notice}</Notice>
      {list.status === 'loading' && <TableSkeleton />}
      {list.status === 'error' && <ListError onRetry={list.retry} />}
      {list.status === 'ready' && list.items.length === 0 && (
        <EmptyState icon={<HiOutlineChatAlt2 />} title="No comments yet" description="When readers join the discussion, their comments appear here." />
      )}
      {list.status === 'ready' && list.items.length > 0 && (
        <table className="records">
          <thead>
            <tr><th scope="col">Comment</th><th scope="col">Reader</th><th scope="col">Article</th><th scope="col">Helpful</th><th scope="col">Posted</th><th scope="col"><span className="ui-visually-hidden">Actions</span></th></tr>
          </thead>
          <tbody>
            {list.items.map(c => {
              const post = postIndex.get(c.postId)
              return (
                <tr key={c._id}>
                  <td className="records__primary">
                    <p className={c.isDeleted ? 'record-comment is-deleted' : 'record-comment'}>
                      {c.parentCommentId && <Badge>Reply</Badge>} {c.isDeleted ? 'Deleted comment' : c.content}
                    </p>
                  </td>
                  <td data-label="Reader"><AuthorName userId={c.userId} /></td>
                  <td data-label="Article">{post ? <Link to={`${postPath(post)}#discussion`} className="record-title__link record-title__link--plain">{post.title}</Link> : '—'}</td>
                  <td data-label="Helpful">{c.numberOfLikes || 0}</td>
                  <td data-label="Posted"><time dateTime={c.createdAt}>{formatDate(c.createdAt)}</time></td>
                  <td className="records__actions">
                    {!c.isDeleted && (
                      <Button variant="ghost" size="sm" icon className="records__danger" aria-label="Delete comment" onClick={() => setToDelete(c)}><HiOutlineTrash /></Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <LoadMore list={list} label="Load more comments" />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this comment?"
        description="If it has replies it is replaced with “This comment was deleted.” so the thread stays readable."
        confirmLabel="Delete comment"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      >
        {toDelete && <blockquote className="confirm-quote">{toDelete.content}</blockquote>}
      </ConfirmDialog>
    </section>
  )
}

/* ───────────────────────── Users ───────────────────────── */

function UsersPanel() {
  const { currentUser } = useSelector(state => state.user)
  const list = usePagedList(start => `/api/user/getusers?startIndex=${start}`, 'users', [])
  const [toDelete, setToDelete] = useState(null)
  const [notice, setNotice] = useNotice()

  const remove = async () => {
    await requestJSON(`/api/user/delete/${toDelete._id}`, { method: 'DELETE' })
    list.setItems(items => items.filter(u => u._id !== toDelete._id))
    setToDelete(null)
    setNotice(`${toDelete.username} was removed.`)
  }

  return (
    <section>
      <PanelHeader title="Readers" description="Everyone with an account, newest first." />
      <Notice>{notice}</Notice>
      {list.status === 'loading' && <TableSkeleton />}
      {list.status === 'error' && <ListError onRetry={list.retry} />}
      {list.status === 'ready' && list.items.length === 0 && (
        <EmptyState icon={<HiOutlineUsers />} title="No readers yet" description="New accounts appear here." />
      )}
      {list.status === 'ready' && list.items.length > 0 && (
        <table className="records">
          <thead>
            <tr><th scope="col">Reader</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Joined</th><th scope="col"><span className="ui-visually-hidden">Actions</span></th></tr>
          </thead>
          <tbody>
            {list.items.map(user => (
              <tr key={user._id}>
                <td className="records__primary">
                  <div className="record-title">
                    <img src={user.profilePicture} alt="" className="record-title__avatar" loading="lazy" />
                    <span className="record-title__text">{user.username}</span>
                  </div>
                </td>
                <td data-label="Email" className="records__wrap">{user.email}</td>
                <td data-label="Role">{user.isAdmin ? <Badge variant="accent">Publisher</Badge> : <Badge>Reader</Badge>}</td>
                <td data-label="Joined"><time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time></td>
                <td className="records__actions">
                  {user._id !== currentUser._id && (
                    <Button variant="ghost" size="sm" icon className="records__danger" aria-label={`Remove ${user.username}`} onClick={() => setToDelete(user)}><HiOutlineTrash /></Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <LoadMore list={list} label="Load more readers" />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Remove ${toDelete?.username}?`}
        description="Their account is deleted permanently. Their existing comments stay, without a name."
        confirmLabel="Remove account"
        pendingLabel="Removing…"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </section>
  )
}

export default function AdminConsole({ tab }) {
  const active = ADMIN_TABS.some(t => t.key === tab) ? tab : 'overview'
  return (
    <WorkspaceLayout
      kicker="Publishing console"
      title={<>The <em>desk</em></>}
      intro="Write, publish and look after the discussion."
      tabs={ADMIN_TABS}
      active={active}
      actions={<Button as={Link} to="/createPost"><HiOutlinePlus aria-hidden="true" /> New article</Button>}
    >
      {active === 'overview' && <Overview />}
      {active === 'posts' && <PostsPanel />}
      {active === 'comments' && <CommentsPanel />}
      {active === 'users' && <UsersPanel />}
      {active === 'account' && <AccountSettings />}
    </WorkspaceLayout>
  )
}
