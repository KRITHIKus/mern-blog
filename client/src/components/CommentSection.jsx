import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Comment from './Comment'

export default function CommentSection({ postId }) {
  const { currentUser }                   = useSelector(state => state.user)
  const [comment,       setComment]       = useState('')
  const [commentError,  setCommentError]  = useState(null)
  const [comments,      setComments]      = useState([])
  const [showModal,     setShowModal]     = useState(false)
  const [toDelete,      setToDelete]      = useState(null)
  const navigate                          = useNavigate()

  // fetch comments
  useEffect(() => {
    const getComments = async () => {
      try {
        const res  = await fetch(`/api/comment/getPostComments/${postId}`)
        const data = await res.json()
        if (res.ok) setComments(data)
      } catch (e) { console.log(e) }
    }
    getComments()
  }, [postId])

  const handleSubmit = async e => {
    e.preventDefault()
    if (comment.length > 200) return
    try {
      const res  = await fetch('/api/comment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: comment, postId, userId: currentUser._id,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setComment('')
        setCommentError(null)
        setComments(prev => [data, ...prev])
      }
    } catch (e) { setCommentError(e.message) }
  }

  const handleLike = async commentId => {
    if (!currentUser) return navigate('/signin')
    try {
      const res  = await fetch(`/api/comment/likeComment/${commentId}`, { method: 'PUT' })
      const data = await res.json()
      if (res.ok) {
        setComments(prev => prev.map(c =>
          c._id === commentId
            ? { ...c, likes: data.likes, numberOfLikes: data.likes.length }
            : c
        ))
      }
    } catch (e) { console.log(e.message) }
  }

  const handleEdit = (comment, editedContent) => {
    setComments(prev =>
      prev.map(c => c._id === comment._id ? { ...c, content: editedContent } : c)
    )
  }

  const handleDelete = async commentId => {
    setShowModal(false)
    if (!currentUser) return navigate('/signin')
    try {
      const res = await fetch(`/api/comment/deleteComment/${commentId}`, { method: 'DELETE' })
      if (res.ok) setComments(prev => prev.filter(c => c._id !== commentId))
    } catch (e) { console.log(e.message) }
  }

  const remaining = 200 - comment.length

  return (
    <>
      <style>{`
        /* ── SIGNED AS ── */
        .cs-signed-as {
          display: flex; align-items: center; gap: 8px;
          padding: 16px 0 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: var(--text-muted);
          letter-spacing: 0.04em;
        }
        .cs-signed-as img {
          width: 22px; height: 22px; border-radius: 50%;
          border: 1px solid var(--border2); object-fit: cover;
        }
        .cs-signed-as a {
          color: var(--accent); text-decoration: none; opacity: 0.8;
        }
        .cs-signed-as a:hover { opacity: 1; }

        /* ── SIGN IN PROMPT ── */
        .cs-signin-prompt {
          margin: 16px 0 24px;
          padding: 20px; border: 1px solid var(--border);
          border-radius: 3px; background: var(--surface);
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--text-muted);
          letter-spacing: 0.04em;
        }
        .cs-signin-prompt a {
          color: var(--accent); text-decoration: none;
          margin-left: 4px;
        }

        /* ── COMMENT FORM ── */
        .cs-form {
          margin: 14px 0 24px;
          border: 1px solid var(--border);
          border-radius: 3px; background: var(--surface);
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cs-form:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-dim);
        }
        .cs-form-header {
          padding: 7px 14px; background: var(--surface2);
          border-bottom: 1px solid var(--border);
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--text-muted);
          letter-spacing: 0.12em;
          display: flex; align-items: center; gap: 5px;
        }
        .cs-form-header::before {
          content: '>'; color: var(--accent); opacity: 0.5;
        }
        .cs-textarea {
          width: 100%; background: transparent;
          border: none; outline: none;
          padding: 12px 14px; color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; line-height: 1.7;
          resize: none; min-height: 80px;
          letter-spacing: 0.03em;
          caret-color: var(--accent);
        }
        .cs-textarea::placeholder { color: var(--text-faint); }
        .cs-form-foot {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 9px 14px;
          border-top: 1px solid var(--border);
          background: var(--surface2);
        }
        .cs-char-ctr {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--text-muted);
          transition: color 0.2s;
        }
        .cs-char-ctr.warn { color: var(--red); }
        .cs-transmit-btn {
          background: var(--accent); color: var(--bg);
          font-family: 'Orbitron', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 7px 16px; border: none; border-radius: 2px;
          cursor: pointer;
          transition: box-shadow 0.15s, transform 0.1s;
        }
        .cs-transmit-btn:hover {
          box-shadow: 0 0 14px var(--accent-glow);
          transform: translateY(-1px);
        }
        .cs-transmit-btn:active { transform: translateY(0); }
        .cs-transmit-btn:disabled {
          opacity: 0.5; cursor: not-allowed; transform: none;
        }

        /* ── COMMENT ERROR ── */
        .cs-error {
          margin-top: 10px; padding: 9px 12px;
          border-radius: 2px; font-size: 10px;
          letter-spacing: 0.03em;
          background: var(--red-dim);
          border: 1px solid rgba(255,68,102,0.22);
          color: var(--red);
          display: flex; align-items: center; gap: 6px;
          font-family: 'JetBrains Mono', monospace;
        }
        .cs-error::before { content: '⚠'; }

        /* ── COUNT ROW ── */
        .cs-count-row {
          display: flex; align-items: center; gap: 10px;
          padding: 0 0 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: var(--text-muted);
        }
        .cs-count-badge {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--accent);
          font-family: 'Orbitron', monospace;
          font-size: 10px; font-weight: 700;
          padding: 2px 10px; border-radius: 2px;
        }

        /* ── EMPTY ── */
        .cs-empty {
          padding: 24px;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: var(--text-faint);
          letter-spacing: 0.08em;
          border: 1px solid var(--border);
          border-radius: 3px;
          background: var(--surface);
          margin-bottom: 24px;
        }
        .cs-empty::before {
          content: '// '; color: var(--accent); opacity: 0.4;
        }

        /* ── DELETE MODAL ── */
        .cs-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(7,7,9,0.78);
          backdrop-filter: blur(4px);
          z-index: 999;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none;
          transition: opacity 0.2s;
        }
        .cs-modal-overlay.show {
          opacity: 1; pointer-events: auto;
        }
        .cs-modal {
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: 4px; padding: 28px;
          max-width: 360px; width: 90%;
          text-align: center;
          animation: modalIn 0.2s ease;
        }
        @keyframes modalIn {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }
        .cs-modal-icon {
          font-family: 'Orbitron', monospace;
          font-size: 24px; color: var(--text-muted);
          margin-bottom: 14px;
        }
        .cs-modal-title {
          font-family: 'Orbitron', monospace;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.16em; color: var(--text);
          margin-bottom: 6px;
        }
        .cs-modal-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: var(--text-muted);
          margin-bottom: 22px; line-height: 1.6;
        }
        .cs-modal-btns {
          display: flex; justify-content: center; gap: 10px;
        }
        .cs-modal-del {
          background: var(--red); color: #fff;
          font-family: 'Orbitron', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.12em;
          padding: 9px 20px; border: none; border-radius: 2px;
          cursor: pointer; transition: box-shadow 0.15s;
        }
        .cs-modal-del:hover {
          box-shadow: 0 0 12px rgba(255,68,102,0.35);
        }
        .cs-modal-cancel {
          background: transparent;
          border: 1px solid var(--border2);
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; padding: 8px 18px;
          border-radius: 2px; cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .cs-modal-cancel:hover {
          border-color: var(--text); color: var(--text);
        }
      `}</style>

      {/* signed in as */}
      {currentUser ? (
        <div className="cs-signed-as">
          <img src={currentUser.profilePicture} alt={currentUser.username} />
          <span>Signed in as</span>
          <Link to="/dashboard?tab=profile">@{currentUser.username}</Link>
        </div>
      ) : (
        <div className="cs-signin-prompt">
          You must be signed in to comment.
          <Link to="/signin">Sign in →</Link>
        </div>
      )}

      {/* comment form */}
      {currentUser && (
        <form className="cs-form" onSubmit={handleSubmit}>
          <div className="cs-form-header">TRANSMIT A MESSAGE</div>
          <textarea
            className="cs-textarea"
            placeholder="// type your transmission here..."
            maxLength={200}
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <div className="cs-form-foot">
            <span className={`cs-char-ctr ${remaining < 30 ? 'warn' : ''}`}>
              {remaining} characters remaining
            </span>
            <button
              type="submit"
              className="cs-transmit-btn"
              disabled={comment.trim().length === 0}
            >
              ▶ TRANSMIT
            </button>
          </div>
          {commentError && (
            <div className="cs-error">{commentError}</div>
          )}
        </form>
      )}

      {/* comment count */}
      {comments.length > 0 && (
        <div className="cs-count-row">
          <span className="cs-count-badge">{comments.length}</span>
          <span>transmissions received</span>
        </div>
      )}

      {/* empty state */}
      {comments.length === 0 && (
        <div className="cs-empty">no transmissions yet — be the first</div>
      )}

      {/* comment list */}
      {comments.map((c, i) => (
        <Comment
          key={c._id || i}
          comment={c}
          onLike={handleLike}
          onEdit={handleEdit}
          onDelete={commentId => {
            setShowModal(true)
            setToDelete(commentId)
          }}
        />
      ))}

      {/* delete confirm modal */}
      <div className={`cs-modal-overlay ${showModal ? 'show' : ''}`}>
        <div className="cs-modal">
          <div className="cs-modal-icon">◈</div>
          <div className="cs-modal-title">CONFIRM DELETION</div>
          <div className="cs-modal-sub">
            This transmission will be permanently removed from the log.
          </div>
          <div className="cs-modal-btns">
            <button
              className="cs-modal-del"
              onClick={() => handleDelete(toDelete)}
            >
              DELETE
            </button>
            <button
              className="cs-modal-cancel"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}