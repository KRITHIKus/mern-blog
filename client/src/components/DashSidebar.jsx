import { useEffect, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { siginOutSuccess } from '../redux/user/userSlice'

export default function DashSidebar() {
  const { currentUser }           = useSelector(state => state.user)
  const location                  = useLocation()
  const dispatch                  = useDispatch()
  const navigate                  = useNavigate()
  const dropdownRef               = useRef(null)

  const [tab,       setTab]       = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen,setMobileOpen]= useState(false)
  const [ddOpen,    setDdOpen]    = useState(false)

  useEffect(() => {
    const urlParams  = new URLSearchParams(location.search)
    const tabFromUrl = urlParams.get('tab')
    if (tabFromUrl) setTab(tabFromUrl)
    setMobileOpen(false) // close mobile on nav
  }, [location.search])

  useEffect(() => {
    const handleOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDdOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // close mobile on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleSignout = async () => {
    try {
      const res  = await fetch('/api/user/signout', { method: 'POST' }) // ✅ fixed path
      const data = await res.json()
      if (!res.ok) { console.log(data.message) }
      else { dispatch(siginOutSuccess()) }
    } catch (error) { console.log(error.message) }
  }

  const adminNavItems = [
    {
      to: '/dashboard?tab=dash', label: 'Overview', key: 'dash',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
      ),
    },
    {
      to: '/dashboard?tab=posts', label: 'Posts', key: 'posts',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      ),
    },
    {
      to: '/dashboard?tab=users', label: 'Users', key: 'users',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      to: '/dashboard?tab=comments', label: 'Comments', key: 'comments',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
  ]

  const accountNavItems = [
    {
      to: '/dashboard?tab=profile', label: 'Profile', key: 'profile',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ]

  const SidebarContent = () => (
    <>
      <style>{`
        .dsb-wrap {
          display: flex; flex-direction: column;
          height: 100vh;
          background: var(--surface);
          border-right: 1px solid var(--border);
          transition: width 0.25s ease;
          overflow: hidden;
          position: relative;
          z-index: 101;
        }
        .dsb-wrap.expanded  { width: 220px; }
        .dsb-wrap.collapsed { width: 56px;  }

        /* mobile: always full width, positioned as overlay */
        @media (max-width: 768px) {
          .dsb-desktop { display: none !important; }
          .dsb-mobile-overlay {
            position: fixed; inset: 0; z-index: 200;
            display: flex;
          }
          .dsb-mobile-backdrop {
            flex: 1; background: rgba(7,7,9,0.65);
            backdrop-filter: blur(3px);
          }
          .dsb-wrap {
            width: 220px !important;
            position: relative; z-index: 201;
            flex-shrink: 0;
          }
        }

        /* header */
        .dsb-head {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          height: 56px; flex-shrink: 0;
          border-bottom: 1px solid var(--border);
        }
        .dsb-logo {
          font-family: 'Orbitron', monospace;
          font-size: 12px; font-weight: 900;
          letter-spacing: 0.18em; color: var(--accent);
          white-space: nowrap; overflow: hidden;
          display: flex; align-items: center; gap: 4px;
        }
        .dsb-logo-b { color: var(--text-muted); font-size: 10px; }
        .dsb-toggle-btn {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); padding: 4px;
          border-radius: 3px; flex-shrink: 0;
          transition: color 0.15s, background 0.15s;
          display: flex; align-items: center;
        }
        .dsb-toggle-btn:hover { color: var(--accent); background: var(--surface2); }

        /* user area */
        .dsb-user {
          padding: 12px 14px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px;
          cursor: pointer; flex-shrink: 0;
          transition: background 0.15s;
          position: relative;
        }
        .dsb-user:hover { background: var(--surface2); }
        .dsb-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid var(--border2); object-fit: cover;
          flex-shrink: 0; transition: border-color 0.15s;
        }
        .dsb-user:hover .dsb-avatar { border-color: var(--accent); }
        .dsb-user-info { overflow: hidden; min-width: 0; }
        .dsb-username {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 600;
          color: var(--text); white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .dsb-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 7px; letter-spacing: 0.1em; text-transform: uppercase;
          background: var(--accent-dim);
          border: 1px solid rgba(0,229,255,0.2);
          color: var(--accent);
          padding: 1px 6px; border-radius: 2px;
          display: inline-block; margin-top: 2px;
        }
        .dsb-badge.user-badge {
          background: rgba(82,82,110,0.15);
          border-color: var(--border);
          color: var(--text-muted);
        }

        /* user dropdown */
        .dsb-dropdown {
          position: absolute; left: 10px; right: 10px;
          top: calc(100% + 4px);
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: 3px; z-index: 50; overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          animation: ddIn 0.15s ease;
        }
        @keyframes ddIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: none; }
        }
        .dsb-dd-item {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.06em;
          color: var(--text-muted); cursor: pointer;
          border-top: 1px solid var(--border);
          transition: background 0.15s, color 0.15s;
        }
        .dsb-dd-item:first-child { border-top: none; }
        .dsb-dd-item:hover { background: var(--surface3); color: var(--text); }
        .dsb-dd-item.danger:hover { color: var(--red); }

        /* nav */
        .dsb-nav { flex: 1; overflow-y: auto; padding: 8px 0; }
        .dsb-nav::-webkit-scrollbar { width: 3px; }
        .dsb-nav::-webkit-scrollbar-thumb { background: var(--border); }

        .dsb-section {
          font-family: 'JetBrains Mono', monospace;
          font-size: 7px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--text-faint); padding: 8px 14px 4px;
          white-space: nowrap; overflow: hidden;
        }
        .dsb-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--text-muted); text-decoration: none;
          transition: background 0.15s, color 0.15s;
          position: relative; border-left: 2px solid transparent;
          white-space: nowrap; min-height: 40px;
        }
        .dsb-item:hover { background: var(--surface2); color: var(--text); }
        .dsb-item.active {
          background: var(--surface2); color: var(--accent);
          border-left-color: var(--accent);
        }
        .dsb-item.active .dsb-icon { color: var(--accent); }
        .dsb-icon { color: var(--text-faint); flex-shrink: 0; transition: color 0.15s; }
        .dsb-label { white-space: nowrap; }

        /* footer */
        .dsb-foot {
          padding: 12px 14px; border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .dsb-foot-inner {
          display: flex; align-items: center; gap: 6px;
        }
        .dsb-foot-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--green); box-shadow: 0 0 5px var(--green);
          animation: lp 2s ease-in-out infinite; flex-shrink: 0;
        }
        @keyframes lp { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .dsb-foot-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; color: var(--text-faint);
          white-space: nowrap; overflow: hidden;
        }

        /* mobile topbar toggle */
        .dsb-mobile-topbar {
          display: none;
          position: sticky; top: 0; z-index: 100;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 0 16px; height: 52px;
          align-items: center; justify-content: space-between;
        }
        @media(max-width: 768px) {
          .dsb-mobile-topbar { display: flex; }
          .dsb-desktop { display: none; }
        }
        .mob-logo {
          font-family: 'Orbitron', monospace;
          font-size: 12px; font-weight: 900;
          letter-spacing: 0.18em; color: var(--accent);
        }
        .mob-menu-btn {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); padding: 4px; border-radius: 3px;
          transition: color 0.15s; display: flex; align-items: center;
        }
        .mob-menu-btn:hover { color: var(--accent); }
      `}</style>

      {/* ── MOBILE TOPBAR ── */}
      <div className="dsb-mobile-topbar">
        <div className="mob-logo">
          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>[</span>
          A2D
          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>]</span>
        </div>
        <button className="mob-menu-btn" onClick={() => setMobileOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className={`dsb-wrap dsb-desktop ${collapsed ? 'collapsed' : 'expanded'}`}>
        <SidebarInner />
      </div>

      {/* ── MOBILE OVERLAY ── */}
      {mobileOpen && (
        <div className="dsb-mobile-overlay">
          <div className="dsb-wrap">
            <SidebarInner />
          </div>
          <div className="dsb-mobile-backdrop" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  )

  const SidebarInner = () => (
    <>
      {/* header */}
      <div className="dsb-head">
        {!collapsed && (
          <div className="dsb-logo">
            <span className="dsb-logo-b">[</span>A2D<span className="dsb-logo-b">]</span>
          </div>
        )}
        <button className="dsb-toggle-btn" onClick={() => setCollapsed(c => !c)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed
              ? <><line x1="3" y1="12" x2="21" y2="12"/><polyline points="15 6 21 12 15 18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>
      </div>

      {/* user */}
      <div className="dsb-user" ref={dropdownRef} onClick={() => setDdOpen(d => !d)}>
        <img
          className="dsb-avatar"
          src={currentUser.profilePicture}
          alt={currentUser.username}
        />
        {!collapsed && (
          <div className="dsb-user-info">
            <div className="dsb-username">@{currentUser.username}</div>
            <div className={`dsb-badge ${currentUser.isAdmin ? '' : 'user-badge'}`} style={{color:'#39ff8a' ,fontSize:'9px'}}>
              {currentUser.isAdmin ? '◈ Admin' : '◈ User'}
            </div>
          </div>
        )}
        {ddOpen && !collapsed && (
          <div className="dsb-dropdown">
            <Link
              to="/dashboard?tab=profile"
              className="dsb-dd-item"
              onClick={() => setDdOpen(false)}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profile Settings
            </Link>
            <div className="dsb-dd-item danger" onClick={handleSignout}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </div>
          </div>
        )}
      </div>

      {/* nav */}
      <div className="dsb-nav">
        {currentUser.isAdmin && (
          <>
            <div className="dsb-section">ADMIN</div>
            {adminNavItems.map(item => (
              <Link
                key={item.key}
                to={item.to}
                className={`dsb-item ${tab === item.key || (!tab && item.key === 'dash') ? 'active' : ''}`}
              >
                <span className="dsb-icon">{item.icon}</span>
                {!collapsed && <span className="dsb-label">{item.label}</span>}
              </Link>
            ))}
          </>
        )}

        <div className="dsb-section" style={{ marginTop: '8px' }}>ACCOUNT</div>
        {accountNavItems.map(item => (
          <Link
            key={item.key}
            to={item.to}
            className={`dsb-item ${tab === item.key ? 'active' : ''}`}
          >
            <span className="dsb-icon">{item.icon}</span>
            {!collapsed && <span className="dsb-label">{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* footer */}
      <div className="dsb-foot">
        <div className="dsb-foot-inner">
          <span className="dsb-foot-dot" />
          {!collapsed && <span className="dsb-foot-text">All systems nominal</span>}
        </div>
      </div>
    </>
  )

  return <SidebarContent />
}