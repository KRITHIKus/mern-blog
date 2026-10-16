import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HiOutlineChatAlt2 } from 'react-icons/hi'
import { Alert, Button, EmptyState, Modal, Skeleton, Textarea } from '../ui'
import CommentItem, { COMMENT_LIMIT } from './CommentItem'
import { requestJSON } from '../../utils/http'

const countAll = comments =>
  comments.reduce((sum, c) => sum + (c.isDeleted ? 0 : 1) + (c.replies || []).filter(r => !r.isDeleted).length, 0)

// Apply `fn` to the comment with `id`, whether it is top level or a reply.
const updateById = (comments, id, fn) =>
  comments.map(c => {
    if (c._id === id) return fn(c)
    if (c.replies?.some(r => r._id === id)) return { ...c, replies: c.replies.map(r => (r._id === id ? fn(r) : r)) }
    return c
  })

function CommentSkeleton() {
  return (
    <div className="comment" aria-hidden="true">
      <div className="comment__avatar"><Skeleton variant="circle" width="100%" height="100%" /></div>
      <div className="comment__main" style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <Skeleton variant="text" width="8rem" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  )
}

/**
 * Discussion for one post. Contracts unchanged:
 * GET getPostComments/:postId, POST create, PUT likeComment/:id (Helpful),
 * PUT editComment/:id, DELETE deleteComment/:id (soft-deletes when replied to).
 */
export default function CommentSection({ postId }) {
  const { currentUser } = useSelector(state => state.user)
  const navigate = useNavigate()
  const location = useLocation()

  const [comments, setComments] = useState([])
  const [status, setStatus] = useState('loading')
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [composerError, setComposerError] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [notice, setNotice] = useState(null)

  const load = useCallback(async signal => {
    setStatus('loading')
    try {
      setComments(await requestJSON(`/api/comment/getPostComments/${postId}`, { signal }))
      setStatus('ready')
    } catch (error) {
      if (error.name !== 'AbortError') setStatus('error')
    }
  }, [postId])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  useEffect(() => {
    if (!notice) return undefined
    const id = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const requireSignIn = () => navigate('/signin', { state: { from: { pathname: location.pathname, search: location.search } } })

  const create = async (content, parentCommentId) =>
    requestJSON('/api/comment/create', {
      method: 'POST',
      body: { content, postId, userId: currentUser._id, ...(parentCommentId && { parentCommentId }) },
    })

  const submit = async event => {
    event.preventDefault()
    const content = draft.trim()
    if (!content || posting) return
    setPosting(true)
    setComposerError(null)
    try {
      const comment = await create(content)
      setComments(prev => [{ ...comment, replies: [] }, ...prev])
      setDraft('')
      setNotice('Comment posted.')
    } catch (error) {
      setComposerError(error.message)
    } finally {
      setPosting(false)
    }
  }

  const reply = async (parentId, content) => {
    const comment = await create(content, parentId)
    setComments(prev => prev.map(c => (c._id === parentId ? { ...c, replies: [...(c.replies || []), comment] } : c)))
    setNotice('Reply posted.')
  }

  const edit = async (comment, content) => {
    const updated = await requestJSON(`/api/comment/editComment/${comment._id}`, { method: 'PUT', body: { content } })
    setComments(prev => updateById(prev, comment._id, c => ({ ...c, content: updated.content })))
    setNotice('Comment updated.')
  }

  const helpful = async id => {
    const updated = await requestJSON(`/api/comment/likeComment/${id}`, { method: 'PUT' })
    setComments(prev => updateById(prev, id, c => ({ ...c, likes: updated.likes, numberOfLikes: updated.numberOfLikes })))
  }

  const confirmDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      const data = await requestJSON(`/api/comment/deleteComment/${toDelete._id}`, { method: 'DELETE' })
      setComments(prev => {
        if (data.comment) return updateById(prev, toDelete._id, c => ({ ...c, ...data.comment, replies: c.replies }))
        if (prev.some(c => c._id === toDelete._id)) return prev.filter(c => c._id !== toDelete._id)
        return prev.map(c => ({ ...c, replies: (c.replies || []).filter(r => r._id !== toDelete._id) }))
      })
      setToDelete(null)
      setNotice('Comment deleted.')
    } catch (error) {
      setDeleteError(error.message)
    } finally {
      setDeleting(false)
    }
  }

  const total = countAll(comments)
  const handlers = { currentUser, onHelpful: helpful, onEdit: edit, onDelete: c => { setDeleteError(null); setToDelete(c) }, requireSignIn }

  return (
    <div className="discussion" id="discussion">
      <p className="discussion__count" aria-live="polite">
        {status === 'ready' && (total === 0 ? 'No comments yet' : `${total} ${total === 1 ? 'comment' : 'comments'}`)}
      </p>

      {currentUser ? (
        <form className="composer" onSubmit={submit}>
          <img className="composer__avatar" src={currentUser.profilePicture} alt="" />
          <div className="composer__main">
            <label htmlFor="comment-draft" className="ui-visually-hidden">Add a comment</label>
            <Textarea
              id="comment-draft"
              rows={3}
              maxLength={COMMENT_LIMIT}
              placeholder="Add something useful to the discussion…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e) }}
              aria-describedby="comment-draft-meta"
            />
            {composerError && <Alert variant="danger">{composerError}</Alert>}
            <div className="composer__actions">
              <span id="comment-draft-meta" className={draft.length > COMMENT_LIMIT - 20 ? 'comment-count is-near' : 'comment-count'}>
                {draft.length}/{COMMENT_LIMIT}
              </span>
              <Button type="submit" loading={posting} disabled={!draft.trim()}>
                {posting ? 'Posting…' : 'Post comment'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="composer composer--signed-out">
          <p><strong>Join the discussion.</strong> Sign in to comment and mark useful replies as helpful.</p>
          <div className="composer__actions">
            <Button as={Link} to="/signin" state={{ from: { pathname: location.pathname } }}>Sign in</Button>
            <Button as={Link} to="/signup" variant="ghost" state={{ from: { pathname: location.pathname } }}>Create account</Button>
          </div>
        </div>
      )}

      {notice && <p className="discussion__notice" role="status">{notice}</p>}

      {status === 'loading' && <div className="comments">{[0, 1, 2].map(i => <CommentSkeleton key={i} />)}</div>}

      {status === 'error' && (
        <Alert variant="danger" title="Couldn't load comments" action={<Button size="sm" variant="secondary" onClick={() => load()}>Try again</Button>}>
          The discussion is temporarily unavailable.
        </Alert>
      )}

      {status === 'ready' && comments.length === 0 && (
        <EmptyState
          plain
          icon={<HiOutlineChatAlt2 />}
          title="Start the discussion"
          description="Questions, corrections and ideas from readers make an article better."
        />
      )}

      {status === 'ready' && comments.length > 0 && (
        <ol className="comments">
          {comments.map(comment => (
            <li key={comment._id} className="comments__thread">
              <CommentItem comment={comment} onReply={reply} {...handlers} />
              {comment.replies?.length > 0 && (
                <ol className="comments__replies" aria-label="Replies">
                  {comment.replies.map(r => (
                    <li key={r._id}><CommentItem comment={r} isReply {...handlers} /></li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}

      <Modal
        open={Boolean(toDelete)}
        onClose={() => !deleting && setToDelete(null)}
        title="Delete this comment?"
        description={toDelete?.replies?.length ? 'It has replies, so it will be replaced with “This comment was deleted.”' : 'This can’t be undone.'}
        size="sm"
        dismissible={!deleting}
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>{deleting ? 'Deleting…' : 'Delete comment'}</Button>
          </>
        }
      >
        {deleteError && <Alert variant="danger">{deleteError}</Alert>}
      </Modal>
    </div>
  )
}
