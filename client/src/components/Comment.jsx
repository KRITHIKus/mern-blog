import { useEffect, useState } from 'react'
import moment from 'moment'
import { FaThumbsUp } from 'react-icons/fa'
import { useSelector } from 'react-redux'

export default function Comment({ comment, onLike, onEdit, onDelete }) {
  const [user,          setUser]         = useState({})
  const [isEditing,     setIsEditing]    = useState(false)
  const [editedContent, setEdited]       = useState(comment.content)
  const [likeAnim,      setLikeAnim]     = useState(false)
  const { currentUser }                  = useSelector(state => state.user)

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
    // trigger pop animation
    setLikeAnim(false)
    setTimeout(() => setLikeAnim(true), 10)
    onLike(comment._id)
  }

  const isLiked    = currentUser && comment.likes?.includes(currentUser._id)
  const canModify  = currentUser && (
    currentUser._id === comment.userId || currentUser.isAdmin
  )

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
          <div className="cmt-body">{comment.content}</div>
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
          </div>
        )}
      </div>
    </>
  )
}