import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard'

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: 'uncategorized',
  })
  const [posts,    setPosts]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [showMore, setShowMore] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const urlParams          = new URLSearchParams(location.search)
    const searchTermFromUrl  = urlParams.get('searchTerm')
    const sortFromUrl        = urlParams.get('sort')
    const categoryFromUrl    = urlParams.get('category')

    setSidebarData(prev => ({
      ...prev,
      searchTerm: searchTermFromUrl || '',
      sort:       sortFromUrl       || 'desc',
      category:   categoryFromUrl   || 'uncategorized',
    }))

    const fetchPosts = async () => {
      try {
        setLoading(true)
        const res  = await fetch(`/api/post/getposts?${urlParams.toString()}`)
        if (!res.ok) { setLoading(false); return }
        const data = await res.json()
        setPosts(data.posts)
        setShowMore(data.posts.length === 9)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [location.search])

  const handleChange = e => {
    const { id, value } = e.target
    setSidebarData(prev => ({
      ...prev,
      [id]: value || (id === 'sort' ? 'desc' : ''),
    }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    const urlParams = new URLSearchParams(location.search)
    urlParams.set('searchTerm', sidebarData.searchTerm)
    urlParams.set('sort',       sidebarData.sort)
    urlParams.set('category',   sidebarData.category)
    navigate(`/search?${urlParams.toString()}`)
  }

  const handleShowMore = async () => {
    try {
      const urlParams = new URLSearchParams(location.search)
      urlParams.set('startIndex', posts.length)
      const res  = await fetch(`/api/post/getposts?${urlParams.toString()}`)
      if (!res.ok) return
      const data = await res.json()
      setPosts(prev => [...prev, ...data.posts])
      setShowMore(data.posts.length === 9)
    } catch (e) { console.log(e) }
  }

  return (
    <>
      <style>{`
        .search-page { min-height: 100vh; background: var(--bg); }

        /* ── FILTER BAR ── */
        .search-filter-bar {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 14px 28px;
          position: sticky; top: 0; z-index: 100;
        }
        .search-filter-inner {
          display: flex; align-items: flex-end;
          gap: 20px; flex-wrap: wrap;
          max-width: 1200px;
        }

        /* Option C — minimal underline input */
        .sf-input-wrap {
          flex: 1; min-width: 220px;
          position: relative;
          display: flex; align-items: center; gap: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border2);
          transition: border-color 0.2s;
        }
        .sf-input-wrap:focus-within {
          border-color: var(--accent);
        }
        .sf-input-label {
          position: absolute; top: -14px; left: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--accent);
          opacity: 0.5; pointer-events: none;
          transition: opacity 0.2s;
        }
        .sf-input-wrap:focus-within .sf-input-label { opacity: 1; }
        .sf-input-icon {
          color: var(--text-muted); flex-shrink: 0;
          transition: color 0.2s;
        }
        .sf-input-wrap:focus-within .sf-input-icon { color: var(--accent); }
        .sf-input {
          flex: 1; background: transparent;
          border: none; outline: none;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; letter-spacing: 0.04em;
          padding: 0 4px;
          caret-color: var(--accent);
        }
        .sf-input::placeholder { color: var(--text-faint); font-size: 11px; }
        /* neon glow line */
        .sf-input-glow {
          position: absolute; bottom: -1px; left: 0;
          width: 0%; height: 1px;
          background: linear-gradient(90deg, var(--accent), var(--green));
          box-shadow: 0 0 8px var(--accent-glow);
          transition: width 0.35s ease;
          pointer-events: none;
        }
        .sf-input-wrap:focus-within .sf-input-glow { width: 100%; }

        /* select controls */
        .sf-select-wrap {
          display: flex; flex-direction: column; gap: 4px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border2);
          transition: border-color 0.2s;
          flex-shrink: 0;
        }
        .sf-select-wrap:focus-within { border-color: var(--accent); }
        .sf-select-lbl {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--text-muted);
        }
        .sf-select {
          background: transparent; border: none; outline: none;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; letter-spacing: 0.04em;
          cursor: pointer; padding: 0;
        }
        .sf-select option { background: var(--surface2); }

        /* apply button */
        .sf-apply {
          background: var(--accent); color: var(--bg);
          font-family: 'Orbitron', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 10px 22px; border: none; border-radius: 2px;
          cursor: pointer; flex-shrink: 0; align-self: flex-end;
          transition: box-shadow 0.15s, transform 0.1s;
        }
        .sf-apply:hover {
          box-shadow: 0 0 18px var(--accent-glow);
          transform: translateY(-1px);
        }
        .sf-apply:active { transform: translateY(0); }

        /* ── RESULTS HEADER ── */
        .search-results-header {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 20px 28px 16px;
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap; gap: 8px;
          max-width: 1200px;
        }
        .srh-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--text-muted);
          display: flex; align-items: center; gap: 7px;
        }
        .srh-label::before { content: '//'; color: var(--accent); opacity: 0.5; }
        .srh-count {
          font-family: 'Orbitron', monospace;
          font-size: 10px; font-weight: 700;
          color: var(--accent);
          background: var(--accent-dim);
          border: 1px solid rgba(0,229,255,0.18);
          padding: 2px 10px; border-radius: 2px;
        }

        /* ── RESULTS GRID ── */
        .search-results-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: var(--border);
          border: 1px solid var(--border);
          border-radius: 4px; overflow: hidden;
          margin: 24px 28px;
          max-width: calc(1200px - 0px);
        }
        .search-results-grid .post-card { border-radius: 0; border: none; }
        @media(max-width:900px){
          .search-results-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media(max-width:560px){
          .search-results-grid { grid-template-columns: 1fr; margin: 16px; }
          .search-filter-bar { padding: 14px 16px; }
          .search-results-header { padding: 16px; }
        }

        /* ── SKELETON ── */
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skeleton {
          background: linear-gradient(
            90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%
          );
          background-size: 400px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 3px;
        }
        .sk-card {
          background: var(--surface); padding: 20px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .sk-img  { height: 180px; }
        .sk-line { height: 9px; }
        .sk-s    { width: 38%; }
        .sk-l    { width: 80%; }
        .sk-m    { width: 58%; }

        /* ── SHOW MORE ── */
        .search-show-more {
          display: flex; justify-content: center;
          margin: 0 28px 40px;
        }
        .search-show-more-btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--text-muted); background: var(--surface);
          border: 1px solid var(--border);
          padding: 11px 32px; border-radius: 2px; cursor: pointer;
          transition: border-color 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .search-show-more-btn:hover {
          border-color: var(--accent); color: var(--accent);
          box-shadow: 0 0 10px var(--accent-dim);
        }

        /* ── EMPTY STATE ── */
        .search-empty {
          margin: 48px 28px; text-align: center;
          border: 1px solid var(--border); border-radius: 4px;
          padding: 52px; font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--text-muted);
          letter-spacing: 0.08em;
        }
        .search-empty-code {
          font-family: 'Orbitron', monospace; font-size: 13px;
          color: var(--accent); opacity: 0.5; margin-bottom: 10px;
        }
      `}</style>

      <div className="search-page">

        {/* ── FILTER BAR ── */}
        <form className="search-filter-bar" onSubmit={handleSubmit}>
          <div className="search-filter-inner">

            {/* Search input — Option C minimal underline */}
            <div className="sf-input-wrap">
              <span className="sf-input-label">SEARCH_TERM</span>
              <svg className="sf-input-icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                className="sf-input"
                type="text"
                id="searchTerm"
                placeholder="search posts..."
                value={sidebarData.searchTerm}
                onChange={handleChange}
              />
              <div className="sf-input-glow" />
            </div>

            {/* Sort */}
            <div className="sf-select-wrap">
              <span className="sf-select-lbl">Sort</span>
              <select
                className="sf-select"
                id="sort"
                value={sidebarData.sort}
                onChange={handleChange}
              >
                <option value="desc">Latest</option>
                <option value="asc">Oldest</option>
              </select>
            </div>

            {/* Category */}
            <div className="sf-select-wrap">
              <span className="sf-select-lbl">Category</span>
              <select
                className="sf-select"
                id="category"
                value={sidebarData.category}
                onChange={handleChange}
              >
                <option value="uncategorized">All</option>
                <option value="reactjs">React.js</option>
                <option value="nextjs">Next.js</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <button type="submit" className="sf-apply">
              ▶ SEARCH
            </button>
          </div>
        </form>

        {/* ── RESULTS HEADER ── */}
        <div className="search-results-header">
          <span className="srh-label">RESULTS</span>
          {!loading && (
            <span className="srh-count">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
            </span>
          )}
        </div>

        {/* ── SKELETON ── */}
        {loading && (
          <div className="search-results-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="sk-card">
                <div className="skeleton sk-img" />
                <div className="skeleton sk-line sk-s" />
                <div className="skeleton sk-line sk-l" />
                <div className="skeleton sk-line sk-m" />
              </div>
            ))}
          </div>
        )}

        {/* ── RESULTS ── */}
        {!loading && posts.length > 0 && (
          <>
            <div className="search-results-grid">
              {posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            {showMore && (
              <div className="search-show-more">
                <button
                  className="search-show-more-btn"
                  onClick={handleShowMore}
                >
                  LOAD MORE POSTS →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── EMPTY ── */}
        {!loading && posts.length === 0 && (
          <div className="search-empty">
            <div className="search-empty-code">// 0 results</div>
            NO POSTS FOUND — TRY A DIFFERENT SEARCH TERM
          </div>
        )}

      </div>
    </>
  )
}