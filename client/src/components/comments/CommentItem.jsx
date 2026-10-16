import { useState } from 'react'
import moment from 'moment'
import { HiOutlineThumbUp, HiThumbUp } from 'react-icons/hi'
import { Badge, Button, Skeleton, Textarea } from '../ui'
import { useAuthor } from './useAuthor'

export const COMMENT_LIMIT = 200

function InlineComposer({ initial = '', submitLabel, pendingLabel, onSubmit, onCancel, autoFocus = true, label }) {
  const [text, setText] = useState(initial)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const trimmed = text.trim()

  const submit = async event => {
    event.preventDefault()
    if (!trimmed || pending) return
    setPending(true)
    setError(null)
    try {
      await onSubmit(trimmed)
    } catch (err) {
      setError(err.message)
      setPending(false)
    }
  }

  return (
    <form className="comment-inline" onSubmit={submit}>
      <Textarea
        aria-label={label}
        rows={3}
        maxLength={COMMENT_LIMIT}
        value={text}
        autoFocus={autoFocus}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') onCancel() }}
      />
      {error && <p className="comment-inline__error" role="alert">{error}</p>}
      <div className="comment-inline__actions">
        <span className="comment-count" aria-live="polite">{text.length}/{COMMENT_LIMIT}</span>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" size="sm" loading={pending} disabled={!trimmed || trimmed === initial.trim()}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}

/**
 * One comment (or reply). Actions: Helpful (toggle), Reply (top level only),
 * Edit / Delete (author or admin). Deleted comments that still have replies
 * stay as a placeholder so the thread keeps its context.
 */
export default function CommentItem({ comment, currentUser, isReply = false, onHelpful, onReply, onEdit, onDelete, requireSignIn }) {
  const { author, loaded } = useAuthor(comment.userId)
  const [mode, setMode] = useState(null) // 'edit' | 'reply' | null
  const [helpfulPending, setHelpfulPending] = useState(false)
  const [helpfulError, setHelpfulError] = useState(null)

  const isOwner = currentUser && currentUser._id === comment.userId
  const canModify = currentUser && (isOwner || currentUser.isAdmin)
  const markedHelpful = Boolean(currentUser && comment.likes?.includes(currentUser._id))
  const helpfulCount = comment.numberOfLikes || 0
  const created = moment(comment.createdAt)

  const toggleHelpful = async () => {
    if (!currentUser) return requireSignIn()
    setHelpfulPending(true)
    setHelpfulError(null)
    try {
      await onHelpful(comment._id)
    } catch (err) {
      setHelpfulError(err.message)
    } finally {
      setHelpfulPending(false)
    }
  }

  const name = author?.username || (loaded ? 'Former reader' : null)

  return (
    <article className={isReply ? 'comment comment--reply' : 'comment'} aria-label={name ? `Comment by ${name}` : 'Comment'}>
      <div className="comment__avatar" aria-hidden="true">
        {author?.profilePicture ? <img src={author.profilePicture} alt="" /> : <span>{name ? name[0].toUpperCase() : ''}</span>}
      </div>

      <div className="comment__main">
        <header className="comment__head">
          {name ? <span className="comment__name">{name}</span> : <Skeleton variant="text" width="6rem" />}
          {author?.isAdmin && <Badge variant="accent">Publisher</Badge>}
          {isOwner && !author?.isAdmin && <Badge>You</Badge>}
          <time className="comment__time" dateTime={comment.createdAt} title={created.format('LLL')}>{created.fromNow()}</time>
        </header>

        {comment.isDeleted ? (
          <p className="comment__body comment__body--deleted">This comment was deleted.</p>
        ) : mode === 'edit' ? (
          <InlineComposer
            label="Edit your comment"
            initial={comment.content}
            submitLabel="Save"
            pendingLabel="Saving…"
            onCancel={() => setMode(null)}
            onSubmit={async text => { await onEdit(comment, text); setMode(null) }}
          />
        ) : (
          <p className="comment__body">{comment.content}</p>
        )}

        {!comment.isDeleted && mode !== 'edit' && (
          <div className="comment__actions">
            <button
              type="button"
              className={markedHelpful ? 'comment-action is-active' : 'comment-action'}
              aria-pressed={markedHelpful}
              aria-busy={helpfulPending || undefined}
              disabled={helpfulPending}
              onClick={toggleHelpful}
            >
              {markedHelpful ? <HiThumbUp aria-hidden="true" /> : <HiOutlineThumbUp aria-hidden="true" />}
              Helpful{helpfulCount > 0 && <span className="comment-action__count">{helpfulCount}</span>}
            </button>
            {!isReply && onReply && (
              <button type="button" className="comment-action" aria-expanded={mode === 'reply'}
                onClick={() => (currentUser ? setMode(mode === 'reply' ? null : 'reply') : requireSignIn())}>
                Reply
              </button>
            )}
            {canModify && (
              <>
                <button type="button" className="comment-action" onClick={() => setMode('edit')}>Edit</button>
                <button type="button" className="comment-action comment-action--danger" onClick={() => onDelete(comment)}>Delete</button>
              </>
            )}
          </div>
        )}
        {helpfulError && <p className="comment-inline__error" role="alert">{helpfulError}</p>}

        {mode === 'reply' && (
          <InlineComposer
            label={`Reply to ${name || 'comment'}`}
            submitLabel="Reply"
            pendingLabel="Replying…"
            onCancel={() => setMode(null)}
            onSubmit={async text => { await onReply(comment._id, text); setMode(null) }}
          />
        )}
      </div>
    </article>
  )
}
