import { Link } from 'react-router-dom'

export default function PostCard({ post }) {
  return (
    <>
      <style>{`
        .post-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          transition: background 0.15s, border-color 0.2s;
          display: flex; flex-direction: column;
          width: 100%;
          
        }
        .post-card::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: var(--accent);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.25s ease;
        }
        .post-card:hover { background: var(--surface2); border-color: var(--border2); }
        .post-card:hover::after { transform: scaleX(1); }

        .post-card-img-wrap {
          position: relative; overflow: hidden;
          height: 200px;
        }
        .post-card-img {
          width: 100%; height: 100%; object-fit: cover;
          filter: saturate(0.6) brightness(0.8);
          transition: filter 0.35s ease, transform 0.35s ease;
          display: block;
        }
        .post-card:hover .post-card-img {
          filter: saturate(0.85) brightness(0.9);
          transform: scale(1.03);
        }
        .post-card-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, var(--surface) 0%, transparent 50%);
          opacity: 0.6;
        }

        .post-card-body {
          padding: 16px 18px 18px;
          display: flex; flex-direction: column; flex: 1;
          
        }
        .post-card-cat {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--accent); opacity: 0.8; margin-bottom: 8px;
          display: flex; align-items: center; gap: 5px;
        }
        .post-card-cat::before { content: '▸'; font-size: 8px; }

        .post-card-title {
          font-family: 'Orbitron', monospace;
          font-size: 13px; font-weight: 700;
          line-height: 1.45; color: var(--text);
          margin-bottom: 8px; letter-spacing: 0.01em;
          text-decoration: none; display: block;
          transition: color 0.15s;
        }
        .post-card-title:hover { color: var(--accent); }

        .post-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid var(--border); padding-top: 12px; margin-top: auto;
        }
        .post-card-date {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--text-faint); letter-spacing: 0.06em;
        }
        .post-card-read {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--accent); opacity: 0.7; text-decoration: none;
          display: flex; align-items: center; gap: 4px;
          transition: opacity 0.15s, gap 0.15s;
        }
        .post-card:hover .post-card-read { opacity: 1; gap: 7px; }
      `}</style>

      <div className="post-card" >
        {/* Image */}
        <div className="post-card-img-wrap">
          <Link to={`/dashboard/post/${post.slug}`}>
            <img
              src={post.image}
              alt={post.title}
              className="post-card-img"
            />
            <div className="post-card-img-overlay" />
          </Link>
        </div>

        {/* Body */}
        <div className="post-card-body " >
          <span className="post-card-cat">{post.category}</span>

          <Link
            to={`/dashboard/post/${post.slug}`}
            className="post-card-title"
          >
            {post.title}
          </Link>

          <div className="post-card-footer">
            <span className="post-card-date">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </span>
            <Link
              to={`/dashboard/post/${post.slug}`}
              className="post-card-read"
            >
              READ →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}