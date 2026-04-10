import { useEffect, useState } from 'react'
import moment from 'moment'
import { FaThumbsUp } from 'react-icons/fa'
import { useSelector } from 'react-redux'

// isReply flag prevents further nesting (replies cannot have replies)
export default function Comment({ comment, onLike, onEdit, onDelete, onReply, isReply = false }) {
  const [user,          setUser]         = useState({})
  const [isEditing,     setIsEditing]    = useState(false)
  const [editedContent, setEdited]       = useState(comment.content)
  const [likeAnim,      setLikeAnim]     = useState(false)
  const [replyOpen,     setReplyOpen]    = useState(false)
  const [replyContent,  setReplyContent] = useState('')
  const [replyError,    setReplyError]      = useState(null)
  const [repliesCollapsed, setRepliesCollapsed] = useState(false)
  const { currentUser }                    = useSelector(state => state.user)

  // fetch comment author
  useEffect(() => {
    const getUser = async () => {
      try {
        const res  = await fetch(`/api/user/${comment.userId}`)
        const data = await res.json()
        if (res.ok) setUser(data)
      } catch (e) { console.log(e.message) }
    }
    getUser()
  }, [comment])

  const handleEdit = () => {
    setIsEditing(true)
    setEdited(comment.content)
  }

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/comment/editComment/${comment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      })
      if (res.ok) {
        setIsEditing(false)
        onEdit(comment, editedContent)
      }
    } catch (e) { console.log(e.message) }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEdited(comment.content)
  }

  const handleLikeClick = () => {
    setLikeAnim(false)
    setTimeout(() => setLikeAnim(true), 10)
    onLike(comment._id)
  }

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return
    setReplyError(null)
    try {
      await onReply(comment._id, replyContent.trim())
      setReplyContent('')
      setReplyOpen(false)
    } catch (e) { setReplyError(e.message) }
  }

  const isLiked   = currentUser && comment.likes?.includes(currentUser._id)
  const canModify = currentUser && (
    currentUser._id === comment.userId || currentUser.isAdmin
  )
  // reply button: only on non-deleted top-level comments when onReply is provided
  const canReply  = !isReply && !comment.isDeleted && !!onReply

  return (
    <>
      <style>{`
        /* ── COMMENT ENTRY ── */
        .cmt-entry {
          border-bottom: 1px solid var(--border);
          padding: 16px 0;
          border-radius: 2px;
          transition: background 0.15s, padding 0.15s, margin 0.15s;
        }
        .cmt-entry:last-child { border-bottom: none; }
        .cmt-entry:hover {
          background: var(--surface2);
          padding: 16px 10px;
          margin: 0 -10px;
        }

        /* slide in for new comments */
        @keyframes cmtSlideIn {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:none; }
        }
        .cmt-entry.new { animation: cmtSlideIn 0.3s ease; }

        /* header */
        .cmt-header {
          display: flex; align-items: center; gap: 9px;
          margin-bottom: 8px;
        }
        .cmt-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          border: 1px solid var(--border2);
          object-fit: cover; flex-shrink: 0;
          background: var(--surface2);
        }
        .cmt-prompt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--accent); opacity: 0.45;
        }
        .cmt-user {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 600; color: var(--accent);
        }
        .cmt-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--text-muted); margin-left: 2px;
        }

        /* body */
        .cmt-body {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: var(--text);
          line-height: 1.75; padding-left: 35px;
          margin-bottom: 10px; letter-spacing: 0.02em;
        }
        .cmt-body.deleted {
          color: var(--text-faint);
          font-style: italic;
        }

        /* edit block */
        .cmt-edit-wrap {
          padding-left: 35px; margin-bottom: 10px;
          animation: cmtSlideIn 0.2s ease;
        }
        .cmt-edit-ta {
          width: 100%; background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 2px; outline: none;
          padding: 10px 12px; color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; line-height: 1.7;
          resize: none; min-height: 70px;
          letter-spacing: 0.02em; margin-bottom: 8px;
          caret-color: var(--accent);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cmt-edit-ta:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-dim);
        }
        .cmt-edit-actions { display: flex; gap: 8px; }
        .cmt-save-btn {
          background: var(--accent); color: var(--bg);
          font-family: 'Orbitron', monospace;
          font-size: 8px; font-weight: 700;
          letter-spacing: 0.12em;
          padding: 6px 14px; border: none; border-radius: 2px;
          cursor: pointer; transition: box-shadow 0.15s;
        }
        .cmt-save-btn:hover {
          box-shadow: 0 0 10px var(--accent-glow);
        }
        .cmt-cancel-btn {
          background: transparent;
          border: 1px solid var(--border2);
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; padding: 5px 12px;
          border-radius: 2px; cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .cmt-cancel-btn:hover {
          border-color: var(--red); color: var(--red);
        }

        /* actions row */
        .cmt-actions {
          display: flex; align-items: center; gap: 12px;
          padding-left: 35px;
        }
        .cmt-action-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--text-muted);
          letter-spacing: 0.06em;
          display: flex; align-items: center; gap: 4px;
          padding: 0; transition: color 0.15s;
        }
        .cmt-action-btn:hover { color: var(--accent); }
        .cmt-action-btn.liked { color: var(--accent); }
        .cmt-action-btn.delete:hover { color: var(--red); }

        /* like pop animation */
        @keyframes likePop {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.45); }
          65%  { transform: scale(0.88); }
          100% { transform: scale(1); }
        }
        .like-pop { animation: likePop 0.35s cubic-bezier(0.36,0.07,0.19,0.97); }

        .like-count {
          font-size: 9px;
          transition: color 0.15s;
        }

        /* ── REPLY FORM ── */
        .cmt-reply-wrap {
          padding-left: 35px; margin-top: 10px;
          animation: cmtSlideIn 0.2s ease;
        }
        .cmt-reply-ta {
          width: 100%; background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 2px; outline: none;
          padding: 8px 12px; color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; line-height: 1.65;
          resize: none; min-height: 56px;
          letter-spacing: 0.02em; margin-bottom: 8px;
          caret-color: var(--accent);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cmt-reply-ta::placeholder { color: var(--text-faint); }
        .cmt-reply-ta:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-dim);
        }
        .cmt-reply-actions { display: flex; gap: 8px; }
        .cmt-reply-error {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--red);
          margin-top: 4px;
        }

        /* ── REDDIT-STYLE THREAD ── */

        /* wrapper: line + replies side by side.
           padding-left: 13px = half of 26px avatar → line sits under avatar center */
        .cmt-thread-wrap {
          display: flex;
          padding-left: 13px;
          padding-bottom: 6px;
        }

        /* the vertical thread line — subtle by default, lights up on parent hover */
        .cmt-thread-line {
          flex-shrink: 0;
          width: 2px;
          border-radius: 99px;
          background: var(--border);
          border: none;
          cursor: pointer;
          padding: 0;
          margin-right: 20px;
          align-self: stretch;
          min-height: 24px;
          transition: background 0.18s, box-shadow 0.18s;
        }

        /* hovering anywhere in the thread block highlights the line */
        .cmt-thread-wrap:hover .cmt-thread-line {
          background: var(--accent);
          box-shadow: 0 0 6px var(--accent-glow);
        }

        /* replies column */
        .cmt-replies-content {
          flex: 1;
          min-width: 0;
        }

        /* reply entries: compact */
        .cmt-replies-content .cmt-entry {
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }
        .cmt-replies-content .cmt-entry:last-child {
          border-bottom: none;
          padding-bottom: 2px;
        }
        .cmt-replies-content .cmt-entry:hover {
          background: var(--surface2);
          padding: 10px 8px;
          margin: 0 -8px;
        }
        /* slightly smaller avatar for replies */
        .cmt-replies-content .cmt-avatar {
          width: 22px; height: 22px;
        }

        /* collapse: clicking the line hides replies, shows a count chip */
        .cmt-thread-wrap.is-collapsed .cmt-replies-content { display: none; }
        .cmt-thread-collapsed-pill {
          display: none; flex: 1; align-items: center; padding: 4px 0;
        }
        .cmt-thread-wrap.is-collapsed .cmt-thread-collapsed-pill { display: flex; }
        .cmt-collapsed-chip {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--text-muted);
          letter-spacing: 0.06em; cursor: pointer;
          background: none; border: none; padding: 0;
          transition: color 0.15s;
        }
        .cmt-collapsed-chip:hover { color: var(--accent); }
      `}</style>

      <div className="cmt-entry">
        {/* header */}
        <div className="cmt-header">
          <img
            className="cmt-avatar"
            src={user.profilePicture}
            alt={user.username || 'user'}
          />
          <span className="cmt-prompt">[▶]</span>
          <span className="cmt-user">
            @{user.username || 'anonymous'}
          </span>
          <span className="cmt-time">
            · {moment(comment.createdAt).fromNow()}
          </span>
        </div>

        {/* body or edit */}
        {isEditing ? (
          <div className="cmt-edit-wrap">
            <textarea
              className="cmt-edit-ta"
              value={editedContent}
              onChange={e => setEdited(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="cmt-edit-actions">
              <button className="cmt-save-btn" onClick={handleSave}>
                ▶ SAVE
              </button>
              <button className="cmt-cancel-btn" onClick={handleCancel}>
                ✕ Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className={`cmt-body${comment.isDeleted ? ' deleted' : ''}`}>
            {comment.content}
          </div>
        )}

        {/* actions */}
        {!isEditing && (
          <div className="cmt-actions">
            {/* like button */}
            <button
              className={`cmt-action-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeClick}
            >
              <span className={likeAnim ? 'like-pop' : ''}>
                <FaThumbsUp style={{ fontSize: '11px' }} />
              </span>
              {comment.numberOfLikes > 0 && (
                <span className="like-count">
                  {comment.numberOfLikes} {comment.numberOfLikes === 1 ? 'like' : 'likes'}
                </span>
              )}
            </button>

            {/* edit + delete — only owner or admin */}
            {canModify && (
              <>
                <button
                  className="cmt-action-btn"
                  onClick={handleEdit}
                >
                  Edit
                </button>
                <button
                  className="cmt-action-btn delete"
                  onClick={() => onDelete(comment._id)}
                >
                  Delete
                </button>
              </>
            )}

            {/* reply — top-level, non-deleted only */}
            {canReply && (
              <button
                className="cmt-action-btn"
                onClick={() => setReplyOpen(v => !v)}
              >
                {replyOpen ? '✕ Cancel Reply' : '↩ Reply'}
              </button>
            )}
          </div>
        )}

        {/* inline reply form */}
        {replyOpen && (
          <div className="cmt-reply-wrap">
            <textarea
              className="cmt-reply-ta"
              placeholder="// write your reply..."
              maxLength={200}
              rows={2}
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              autoFocus
            />
            {replyError && (
              <div className="cmt-reply-error">⚠ {replyError}</div>
            )}
            <div className="cmt-reply-actions">
              <button
                className="cmt-save-btn"
                onClick={handleReplySubmit}
                disabled={!replyContent.trim()}
              >
                ▶ REPLY
              </button>
              <button
                className="cmt-cancel-btn"
                onClick={() => { setReplyOpen(false); setReplyContent(''); setReplyError(null) }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reddit-style thread: clickable line + collapsible replies */}
      {!isReply && comment.replies?.length > 0 && (
        <div className={`cmt-thread-wrap${repliesCollapsed ? ' is-collapsed' : ''}`}>
          {/* the vertical thread line — click to collapse */}
          <button
            className="cmt-thread-line"
            onClick={() => setRepliesCollapsed(v => !v)}
            title={repliesCollapsed ? 'Expand replies' : 'Collapse thread'}
          />

          {/* collapsed pill */}
          <div className="cmt-thread-collapsed-pill">
            <button
              className="cmt-collapsed-chip"
              onClick={() => setRepliesCollapsed(false)}
            >
              ↕ {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'} hidden
            </button>
          </div>

          {/* replies */}
          <div className="cmt-replies-content">
            {comment.replies.map(reply => (
              <Comment
                key={reply._id}
                comment={reply}
                onLike={onLike}
                onEdit={onEdit}
                onDelete={onDelete}
                isReply
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}