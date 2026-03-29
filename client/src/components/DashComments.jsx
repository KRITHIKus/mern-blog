import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle, HiOutlineTrash } from 'react-icons/hi';

function ConfirmModal({ show, message, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(7,7,9,0.8)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border2)',
        borderRadius: 8,
        padding: '32px 28px',
        maxWidth: 360, width: '90%',
        textAlign: 'center',
      }}>
        <HiOutlineExclamationCircle style={{ fontSize: 40, color: 'var(--text-muted)', margin: '0 auto 16px' }} />
        <p style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
          color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24,
        }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button onClick={onConfirm} style={{
            background: 'var(--red)', color: '#fff',
            fontFamily: 'Orbitron, monospace', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.1em', padding: '9px 20px',
            border: 'none', borderRadius: 4, cursor: 'pointer',
          }}>Delete</button>
          <button onClick={onCancel} style={{
            background: 'transparent', border: '1px solid var(--border2)',
            color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, padding: '8px 18px', borderRadius: 4, cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function DashComments() {
  const { currentUser } = useSelector(state => state.user);
  const [comments, setComments] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch('/api/comment/getcomments');
        const data = await res.json();
        if (res.ok) {
          setComments(data.comments);
          if (data.comments.length < 9) setShowMore(false);
        }
      } catch (e) { console.log(e.message); }
    };
    if (currentUser.isAdmin) fetchComments();
  }, [currentUser._id]);

  const handleShowMore = async () => {
    try {
      const res = await fetch(`/api/comment/getcomments?startIndex=${comments.length}`);
      const data = await res.json();
      if (res.ok) {
        setComments(prev => [...prev, ...data.comments]);
        if (data.comments.length < 9) setShowMore(false);
      }
    } catch (e) { console.log(e.message); }
  };

  const handleDeleteComment = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/comment/deleteComment/${commentIdToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setComments(prev => prev.filter(c => c._id !== commentIdToDelete));
      } else { console.log(data.message); }
    } catch (e) { console.log(e.message); }
  };

  const thStyle = {
    padding: '10px 16px',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 9, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    textAlign: 'left', fontWeight: 500,
    background: 'var(--surface2)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '12px 16px', fontSize: 12,
    color: 'var(--text)', verticalAlign: 'middle',
    borderBottom: '1px solid var(--border)',
  };

  if (!currentUser.isAdmin || comments.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>
          No comments found.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6, overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600,
            color: 'var(--text)', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>Comments</span>
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--accent)' }}>
            {comments.length}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Updated</th>
                <th style={{ ...thStyle, minWidth: 260 }}>Content</th>
                <th style={thStyle}>Likes</th>
                <th style={thStyle}>Post ID</th>
                <th style={thStyle}>User ID</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(comment => (
                <tr key={comment._id}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.12s' }}
                >
                  <td style={tdStyle}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(comment.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: 300 }}>
                    <p style={{
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      lineHeight: 1.5,
                    }}>{comment.content}</p>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      fontFamily: 'Orbitron, monospace', fontSize: 11, color: 'var(--accent)',
                    }}>{comment.numberOfLikes}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                      color: 'var(--text-muted)',
                      display: 'block', maxWidth: 120,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{comment.postId}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                      color: 'var(--text-muted)',
                      display: 'block', maxWidth: 120,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{comment.userId}</span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => { setShowModal(true); setCommentIdToDelete(comment._id); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--red)', fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11, opacity: 0.8, transition: 'opacity 0.15s', padding: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
                    >
                      <HiOutlineTrash size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showMore && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px', background: 'var(--surface2)' }}>
            <button onClick={handleShowMore} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11, letterSpacing: '0.06em', width: '100%', padding: 0,
            }}>
              Load more →
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        show={showModal}
        message="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={handleDeleteComment}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
}