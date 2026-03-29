import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '../redux/theme/themeSlice'
import { siginOutSuccess } from '../redux/user/userSlice'
import { useEffect, useState, useRef } from 'react'
import { label } from 'three/src/nodes/core/ContextNode.js'

export default function Header() {
  const path = useLocation().pathname
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useSelector(state => state.user)
  const { theme } = useSelector(state => state.theme)
  const dispatch = useDispatch()

  const [searchTerm, setSearchTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const searchTermFromUrl = urlParams.get('searchTerm')
    if (searchTermFromUrl) setSearchTerm(searchTermFromUrl)
  }, [location.search])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignout = async () => {
    try {
      const res = await fetch('api/user/sign-out', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { console.log(data.message) }
      else { dispatch(siginOutSuccess()) }
    } catch (error) { console.log(error.message) }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const urlParams = new URLSearchParams(location.search)
    urlParams.set('searchTerm', searchTerm)
    navigate(`/search?${urlParams.toString()}`)
    setSearchOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/projects', label: 'Projects' },
    {to:'/search',label:'Posts'}
  ]

  return (
    <>
      <style>{`
        /* ── NAV WRAPPER ── */
        .a2d-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 28px; height: 56px;
          background: rgba(7,7,9,0.92);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--border);
          gap: 16px;
        }
        [data-theme="light"] .a2d-nav {
          background: rgba(244,244,248,0.94);
        }
        .a2d-nav::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0.18;
        }

        /* ── LOGO ── */
        .nav-logo {
          font-family: 'Orbitron', monospace;
          font-size: 13px; font-weight: 900;
          letter-spacing: 0.2em; color: var(--accent);
          text-decoration: none; flex-shrink: 0;
        }
        .nav-logo:hover { animation: logoGlitch 0.4s steps(2) forwards; }
        .nav-logo-bracket { color: var(--text-muted); font-size: 11px; }

        /* ── NAV LINKS (center) ── */
        .nav-links {
          display: flex; gap: 32px; list-style: none;
          flex: 1; justify-content: center;
        }
        .nav-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--text-muted); text-decoration: none;
          position: relative; padding-bottom: 2px;
          transition: color 0.15s;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 1px; background: var(--accent);
          transition: width 0.2s ease;
        }
        .nav-link:hover, .nav-link.active { color: var(--accent); }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }

        /* ── RIGHT SIDE ── */
        .nav-right {
          display: flex; align-items: center;
          gap: 8px; flex-shrink: 0;
        }

        /* ── SEARCH BOX ── */
        .nav-search-form {
          display: flex; align-items: center; gap: 8px;
          height: 34px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0 12px;
          transition: border-color 0.2s, box-shadow 0.2s, width 0.25s;
          width: 200px;
        }
        .nav-search-form:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-dim), 0 0 10px var(--accent-dim);
          width: 240px;
        }
        .nav-search-form svg {
          flex-shrink: 0;
          color: var(--text-muted);
          transition: color 0.2s;
        }
        .nav-search-form:focus-within svg { color: var(--accent); }

        .nav-search-input {
          flex: 1;
          background: transparent; border: none; outline: none;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.04em;
          min-width: 0;
        }
        .nav-search-input::placeholder {
          color: var(--text-faint);
          font-size: 11px;
          letter-spacing: 0.06em;
        }
        /* submit button inside search */
        .nav-search-submit {
          background: none; border: none; cursor: pointer;
          color: var(--text-faint); padding: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: color 0.15s;
          flex-shrink: 0;
          display: none;
        }
        .nav-search-form:focus-within .nav-search-submit { display: block; }
        .nav-search-submit:hover { color: var(--accent); }

        /* ── THEME TOGGLE ── */
        .nav-theme-btn {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 4px; cursor: pointer; color: var(--text-muted);
          flex-shrink: 0;
          transition: border-color 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .nav-theme-btn:hover {
          border-color: var(--accent); color: var(--accent);
          box-shadow: 0 0 8px var(--accent-dim);
        }

        /* ── SIGN IN ── */
        .nav-signin-btn {
          height: 34px;
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent;
          border: 1px solid var(--accent);
          color: var(--accent);
          font-family: 'Orbitron', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 0 16px; border-radius: 3px;
          cursor: pointer; white-space: nowrap;
          text-decoration: none; flex-shrink: 0;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .nav-signin-btn:hover {
          background: var(--accent-hover);
          box-shadow: 0 0 12px var(--accent-glow);
        }

        /* ── AVATAR + DROPDOWN ── */
        .nav-avatar-wrap { position: relative; }
        .nav-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid var(--border2);
          cursor: pointer; object-fit: cover; display: block;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .nav-avatar:hover {
          border-color: var(--accent);
          box-shadow: 0 0 8px var(--accent-dim);
        }
        .nav-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: var(--surface); border: 1px solid var(--border2);
          border-radius: 4px; min-width: 188px; overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.35);
          animation: dropIn 0.15s ease;
          z-index: 200;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-dropdown-header {
          padding: 12px 14px; border-bottom: 1px solid var(--border);
        }
        .nav-dropdown-username {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          color: var(--accent); margin-bottom: 3px;
        }
        .nav-dropdown-email {
          font-size: 10px; color: var(--text-muted);
          white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; max-width: 164px;
        }
        .nav-dropdown-item {
          display: block; width: 100%; padding: 10px 14px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--text-muted); text-decoration: none;
          background: none; border: none; cursor: pointer; text-align: left;
          border-top: 1px solid var(--border);
          transition: background 0.15s, color 0.15s;
        }
        .nav-dropdown-item:hover { background: var(--surface2); color: var(--text); }
        .nav-dropdown-item.danger:hover { color: var(--red); }

        /* ── MOBILE HAMBURGER ── */
        .nav-hamburger {
          display: none; flex-direction: column;
          gap: 4px; cursor: pointer;
          background: none; border: none; padding: 6px;
        }
        .nav-hamburger span {
          display: block; width: 18px; height: 1.5px;
          background: var(--text-muted);
          transition: transform 0.2s, opacity 0.2s;
        }

        /* ── MOBILE SEARCH TOGGLE ── */
        .nav-search-mobile {
          display: none; align-items: center; justify-content: center;
          width: 34px; height: 34px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 4px; cursor: pointer; color: var(--text-muted);
          transition: border-color 0.15s, color 0.15s;
        }
        .nav-search-mobile:hover { border-color: var(--accent); color: var(--accent); }

        /* ── MOBILE DRAWER ── */
        .nav-mobile-drawer {
          display: none; flex-direction: column;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 12px 24px 16px;
        }
        .nav-mobile-link {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--text-muted); text-decoration: none;
          padding: 11px 0; border-bottom: 1px solid var(--border);
          transition: color 0.15s;
        }
        .nav-mobile-link:last-of-type { border-bottom: none; }
        .nav-mobile-link:hover,
        .nav-mobile-link.active { color: var(--accent); }

        /* ── MOBILE SEARCH BAR ── */
        .nav-mobile-search {
          display: flex; align-items: center; gap: 8px;
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 4px; padding: 9px 14px;
          transition: border-color 0.2s;
        }
        .nav-mobile-search:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-dim);
        }
        .nav-mobile-search input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; letter-spacing: 0.04em;
        }
        .nav-mobile-search input::placeholder { color: var(--text-faint); }
        .nav-mobile-search-submit {
          background: none; border: none; cursor: pointer;
          color: var(--accent);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.08em;
          padding: 0;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .nav-links        { display: none; }
          .nav-search-form  { display: none; }
          .nav-hamburger    { display: flex; }
          .nav-search-mobile{ display: flex; }
          .nav-mobile-drawer{ display: flex; }
        }
      `}</style>

      <header>
        <nav className="a2d-nav">

          {/* Logo */}
          <Link to="/" className="nav-logo">
            <span className="nav-logo-bracket">[</span>A2D<span className="nav-logo-bracket">]</span>
          </Link>

          {/* Desktop Nav Links — centered */}
          <ul className="nav-links">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`nav-link ${path === to ? 'active' : ''}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side */}
          <div className="nav-right">

            {/* Desktop Search */}
            <form className="nav-search-form" onSubmit={handleSubmit}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                className="nav-search-input"
                type="text"
                placeholder="search posts..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="nav-search-submit">
                GO →
              </button>
            </form>

            {/* Mobile Search Toggle */}
            <button
              className="nav-search-mobile"
              onClick={() => setSearchOpen(o => !o)}
              aria-label="Search"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Theme Toggle */}
            <button
              className="nav-theme-btn"
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* User / Sign In */}
            {currentUser ? (
              <div className="nav-avatar-wrap" ref={dropdownRef}>
                <img
                  src={currentUser.profilePicture}
                  alt={currentUser.username}
                  className="nav-avatar"
                  onClick={() => setDropdownOpen(o => !o)}
                />
                {dropdownOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      <div className="nav-dropdown-username">
                        @{currentUser.username}
                      </div>
                      <div className="nav-dropdown-email">
                        {currentUser.email}
                      </div>
                    </div>
                    <Link
                      to="/dashboard?tab=profile"
                      className="nav-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    {currentUser.isAdmin && (
                      <Link
                        to="/dashboard?tab=dash"
                        className="nav-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      className="nav-dropdown-item danger"
                      onClick={() => { handleSignout(); setDropdownOpen(false) }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/signin" className="nav-signin-btn">
                sign_in
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
            >
              <span style={{
                transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none'
              }}/>
              <span style={{ opacity: menuOpen ? 0 : 1 }}/>
              <span style={{
                transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none'
              }}/>
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        {menuOpen && (
          <div className="nav-mobile-drawer">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-mobile-link ${path === to ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {!currentUser && (
              <Link
                to="/signin"
                className="nav-signin-btn"
                style={{ marginTop: '12px', justifyContent: 'center' }}
                onClick={() => setMenuOpen(false)}
              >
                sign_in
              </Link>
            )}
          </div>
        )}

        {/* Mobile Search Bar */}
        {searchOpen && (
          <form className="nav-mobile-search" onSubmit={handleSubmit}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="var(--text-muted)" strokeWidth="1.5"/>
              <path d="M11 11l3.5 3.5" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              autoFocus
              type="text"
              placeholder="search posts..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="nav-mobile-search-submit">
              GO →
            </button>
          </form>
        )}
      </header>
    </>
  )
}