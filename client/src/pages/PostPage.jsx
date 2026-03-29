import { useEffect, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import CallToAction from '../components/CallToAction'
import CommentSection from '../components/CommentSection'
import PostCard from '../components/PostCard'

// ── READING PROGRESS HOOK ─────────────────────────────────────
function useReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const update = () => {
      const el  = document.documentElement
      const top = el.scrollTop || document.body.scrollTop
      const h   = el.scrollHeight - el.clientHeight
      setProgress(h > 0 ? Math.min(100, (top / h) * 100) : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return progress
}

export default function PostPage() {
  const { postSlug }               = useParams()
  const [loading,      setLoading] = useState(true)
  const [post,         setPost]    = useState(null)
  const [error,        setError]   = useState(false)
  const [recentPosts,  setRecent]  = useState(null)
  const progress                   = useReadingProgress()

  // fetch post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const res  = await fetch(`/api/post/getposts?slug=${postSlug}`)
        const data = await res.json()
        if (!res.ok) { setError(true); setLoading(false); return }
        setPost(data.posts[0])
        setLoading(false)
        setError(false)
      } catch {
        setError(true)
        setLoading(false)
      }
    }
    fetchPost()
  }, [postSlug])

  // fetch recent posts
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res  = await fetch('/api/post/getposts?limit=3')
        const data = await res.json()
        if (res.ok) setRecent(data.posts)
      } catch {}
    }
    fetchRecent()
  }, [post])

  // loading spinner
  if (loading) return (
    <>
      <style>{`
        .post-loading {
          display:flex;align-items:center;justify-content:center;
          min-height:100vh;flex-direction:column;gap:16px;
          background:var(--bg);
        }
        .post-spinner {
          width:36px;height:36px;
          border:2px solid var(--border);
          border-top-color:var(--accent);
          border-radius:50%;
          animation:spin 0.7s linear infinite;
        }
        .post-loading-text {
          font-family:'JetBrains Mono',monospace;font-size:10px;
          letter-spacing:0.14em;text-transform:uppercase;color:var(--text-muted);
        }
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      <div className="post-loading">
        <div className="post-spinner"/>
        <span className="post-loading-text">Loading transmission...</span>
      </div>
    </>
  )

  if (error || !post) return (
    <div style={{
      minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      flexDirection:'column',gap:'12px',background:'var(--bg)',
      fontFamily:'JetBrains Mono,monospace',
    }}>
      <div style={{fontFamily:'Orbitron,monospace',fontSize:'13px',color:'var(--accent)',opacity:0.5}}>// 404</div>
      <div style={{fontSize:'11px',color:'var(--text-muted)',letterSpacing:'0.08em'}}>
        POST NOT FOUND
      </div>
      <Link to="/" style={{
        fontSize:'10px',color:'var(--accent)',textDecoration:'none',
        letterSpacing:'0.1em',marginTop:'8px',
      }}>← RETURN HOME</Link>
    </div>
  )

  const readTime = Math.max(1, Math.ceil(post.content.length / 1000))

  return (
    <>
      <style>{`
        /* ── READING PROGRESS BAR ── */
        .reading-progress {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--border);
          z-index: 9999;
        }
        .reading-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--green));
          box-shadow: 0 0 8px var(--accent-glow);
          transition: width 0.08s linear;
        }

        /* ── HERO ── */
        .post-hero {
          position: relative;
          width: 100%;
          height: 480px;
          overflow: hidden;
        }
        @media(max-width:600px){ .post-hero { height: 320px; } }

        .post-hero-img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          filter: saturate(0.55) brightness(0.55);
        }
        .post-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(7,7,9,0.12) 0%,
            rgba(7,7,9,0.38) 40%,
            rgba(7,7,9,0.90) 78%,
            var(--bg) 100%
          );
        }
        .post-hero-content {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 32px 32px 28px;
          max-width: 920px;
          margin: 0 auto;
        }
        @media(max-width:600px){
          .post-hero-content { padding: 24px 20px 20px; }
        }

        /* category tag */
        .post-cat-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--accent); margin-bottom: 12px;
          background: var(--accent-dim);
          border: 1px solid rgba(0,229,255,0.22);
          padding: 4px 10px; border-radius: 2px;
          text-decoration: none;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .post-cat-tag:hover {
          background: var(--accent-hover);
          box-shadow: 0 0 8px var(--accent-glow);
        }
        .post-cat-tag::before { content: '▸'; font-size: 8px; }

        /* hero title — always on dark bg so hardcoded */
        .post-hero-title {
          font-family: 'Orbitron', monospace;
          font-size: clamp(18px, 3vw, 34px);
          font-weight: 900; line-height: 1.12;
          color: #dddde8;
          letter-spacing: -0.01em;
          margin-bottom: 14px;
          text-shadow: 0 2px 16px rgba(0,0,0,0.6);
        }
        .post-meta {
          display: flex; align-items: center;
          gap: 10px; flex-wrap: wrap;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: rgba(221,221,232,0.55);
          letter-spacing: 0.06em;
        }
        .post-meta-sep {
          width: 3px; height: 3px; border-radius: 50%;
          background: rgba(255,255,255,0.25);
        }
        .post-meta-hl { color: #00e5ff; opacity: 0.9; }

        /* ── CONTENT ZONE ── */
        .post-content-zone {
          max-width: 720px;
          margin: 0 auto;
          padding: 44px 24px 0;
        }
        @media(max-width:600px){
          .post-content-zone { padding: 28px 16px 0; }
        }

        /* post-content styling handled by index.css .post-content class */

        /* post footer */
        .post-foot {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 18px 0; margin: 32px 0 0;
          border-top: 1px solid var(--border);
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--text-muted);
          flex-wrap: wrap; gap: 12px;
        }
        .post-share-btns { display: flex; gap: 8px; }
        .post-share-btn {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.08em;
          padding: 5px 12px; border-radius: 2px;
          cursor: pointer; text-transform: uppercase;
          transition: border-color 0.15s, color 0.15s;
        }
        .post-share-btn:hover {
          border-color: var(--accent); color: var(--accent);
        }

        /* ── CTA ZONE ── */
        .post-cta-zone {
          max-width: 920px;
          margin: 0 auto;
          padding: 32px 24px 0;
        }
        @media(max-width:600px){
          .post-cta-zone { padding: 24px 16px 0; }
        }

        /* ── COMMENT ZONE ── */
        .post-comment-zone {
          max-width: 920px;
          margin: 0 auto;
          padding: 0 24px 0;
        }
        @media(max-width:600px){
          .post-comment-zone { padding: 0 16px; }
        }

        /* section divider */
        .post-sec-div {
          display: flex; align-items: center;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          margin: 32px 0 0;
        }
        .post-sec-div-lbl {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--text-muted);
          padding: 10px 20px; border-right: 1px solid var(--border);
          display: flex; align-items: center; gap: 6px;
        }
        .post-sec-div-lbl::before {
          content: '//'; color: var(--accent); opacity: 0.5;
        }
        .post-sec-div-r {
          padding: 10px 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--text-faint);
          letter-spacing: 0.1em;
          display: flex; align-items: center; gap: 8px;
        }

        /* ── RECENT ZONE ── */
        .post-recent-zone {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px 52px;
        }
        .post-recent-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
        }
        .post-recent-grid .post-card {
          border-radius: 0; border: none;
        }
        @media(max-width:900px){
          .post-recent-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media(max-width:560px){
          .post-recent-grid { grid-template-columns: 1fr; }
          .post-recent-zone { padding: 28px 16px 40px; }
        }
      `}</style>

      {/* ── READING PROGRESS ── */}
      <div className="reading-progress">
        <div
          className="reading-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── HERO ── */}
      <div className="post-hero">
        <img
          src={post.image}
          alt={post.title}
          className="post-hero-img"
        />
        <div className="post-hero-overlay" />
        <div className="post-hero-content">
          <Link
            to={`/search?category=${post.category}`}
            className="post-cat-tag"
          >
            {post.category}
          </Link>
          <h1 className="post-hero-title">{post.title}</h1>
          <div className="post-meta">
            <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            })}</span>
            <span className="post-meta-sep" />
            <span className="post-meta-hl">{readTime} min read</span>
            <span className="post-meta-sep" />
            <span>by Krithik</span>
          </div>
        </div>
      </div>

      {/* ── POST CONTENT ── */}
      <div className="post-content-zone">
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="post-foot">
          <span style={{
            fontFamily:'JetBrains Mono,monospace',
            fontSize:'9px',letterSpacing:'0.1em',color:'var(--text-muted)'
          }}>
            // end_of_transmission
          </span>
          <div className="post-share-btns">
            <button
              className="post-share-btn"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* ── CALL TO ACTION ── */}
      <div className="post-cta-zone">
        <CallToAction />
      </div>

      {/* ── COMMENTS ── */}
      <div className="post-comment-zone">
        <div className="post-sec-div">
          <div className="post-sec-div-lbl">transmissions</div>
          <div className="post-sec-div-r">
            <span className="live-badge">LIVE</span>
            comments
          </div>
        </div>
        <CommentSection postId={post._id} />
      </div>

      {/* ── RECENT POSTS ── */}
      {recentPosts && recentPosts.length > 0 && (
        <>
          <div className="post-sec-div" style={{ maxWidth:'1100px', margin:'32px auto 0' }}>
            <div className="post-sec-div-lbl">recent_articles</div>
            <div className="post-sec-div-r">more from the blog</div>
          </div>
          <div className="post-recent-zone">
            <div className="post-recent-grid">
              {recentPosts.map(p => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}