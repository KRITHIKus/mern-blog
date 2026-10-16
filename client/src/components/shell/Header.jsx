import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  HiOutlineLogout, HiOutlineMenu, HiOutlinePencilAlt, HiOutlineSearch,
  HiOutlineUser, HiOutlineViewGrid, HiOutlineChatAlt2,
} from 'react-icons/hi'
import {
  Badge, Button, Drawer, Input, Menu, MenuHeader, MenuItem, MenuSeparator, cx,
} from '../ui'
import Brand from './Brand'
import ThemeToggle from './ThemeToggle'
import { PRIMARY_NAV, getAccountLinks } from './navigation'
import { useSignOut } from './useSignOut'

const ACCOUNT_ICONS = {
  dashboard: <HiOutlineViewGrid />,
  write: <HiOutlinePencilAlt />,
  profile: <HiOutlineUser />,
  activity: <HiOutlineChatAlt2 />,
}

// Search keeps the Search page's own filters when used from /search, and
// starts fresh everywhere else.
function useHeaderSearch() {
  const location = useLocation()
  const navigate = useNavigate()
  const [term, setTerm] = useState('')

  useEffect(() => {
    setTerm(new URLSearchParams(location.search).get('searchTerm') || '')
  }, [location.search])

  const submit = event => {
    event.preventDefault()
    const onSearch = location.pathname.toLowerCase() === '/search'
    const params = new URLSearchParams(onSearch ? location.search : '')
    if (term.trim()) params.set('searchTerm', term.trim())
    else params.delete('searchTerm')
    const query = params.toString()
    navigate(`/search${query ? `?${query}` : ''}`)
  }

  return { term, setTerm, submit }
}

function SearchForm({ id, className, search, autoFocus = false }) {
  return (
    <form role="search" className={cx('shell-search', className)} onSubmit={search.submit}>
      <label htmlFor={id} className="ui-visually-hidden">Search posts</label>
      <HiOutlineSearch className="shell-search__icon" aria-hidden="true" />
      <Input
        id={id}
        type="search"
        placeholder="Search posts…"
        value={search.term}
        onChange={e => search.setTerm(e.target.value)}
        autoFocus={autoFocus}
        className="shell-search__input"
      />
    </form>
  )
}

function PrimaryNavLinks({ className, linkClassName, onNavigate }) {
  const { pathname } = useLocation()
  const path = pathname.toLowerCase()
  return (
    <ul className={className}>
      {PRIMARY_NAV.map(item => {
        const active = item.isActive(path)
        return (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={cx(linkClassName, active && 'is-active')}
              aria-current={active ? 'page' : undefined}
              onClick={() => onNavigate?.(item.to)}
            >
              {item.label}
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}

function AccountMenu({ user, onSignOut }) {
  return (
    <Menu
      label="Account"
      trigger={
        <button type="button" className="shell-avatar-btn" aria-label={`Account menu for @${user.username}`}>
          <img src={user.profilePicture} alt="" className="shell-avatar" />
        </button>
      }
    >
      <MenuHeader>
        <div className="shell-identity">
          <img src={user.profilePicture} alt="" className="shell-avatar shell-avatar--lg" />
          <div className="shell-identity__text">
            <p className="shell-identity__name">
              <span className="shell-identity__username" title={`@${user.username}`}>@{user.username}</span>
              {user.isAdmin && <Badge variant="accent">Admin</Badge>}
            </p>
            <p className="shell-identity__email" title={user.email}>{user.email}</p>
          </div>
        </div>
      </MenuHeader>
      <MenuSeparator />
      {getAccountLinks(user).map(link => (
        <MenuItem key={link.to} to={link.to} icon={ACCOUNT_ICONS[link.icon]}>{link.label}</MenuItem>
      ))}
      <MenuSeparator />
      <MenuItem onSelect={onSignOut} icon={<HiOutlineLogout />} danger>Sign out</MenuItem>
    </Menu>
  )
}

export default function Header() {
  const { currentUser } = useSelector(state => state.user)
  const location = useLocation()
  const search = useHeaderSearch()
  const signOut = useSignOut()

  const [drawerOpen, setDrawerOpen] = useState(false)
  // When the drawer closes because of navigation, focus goes to the new
  // page's <main> (AppShell) instead of back to the menu button.
  const closedByNavigation = useRef(false)

  useEffect(() => {
    closedByNavigation.current = true
    setDrawerOpen(false)
  }, [location.pathname, location.search])

  // The drawer is mobile-only: close it if the viewport grows past md.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    const onChange = event => { if (event.matches) setDrawerOpen(false) }
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])

  const closeForLink = to => {
    closedByNavigation.current = to !== location.pathname + location.search
    setDrawerOpen(false)
  }

  const openDrawer = () => {
    closedByNavigation.current = false
    setDrawerOpen(true)
  }

  return (
    <header className="shell-header">
      <div className="ui-container shell-header__inner">
        <Brand />

        <nav aria-label="Primary" className="shell-nav">
          <PrimaryNavLinks className="shell-nav__list" linkClassName="shell-nav__link" />
        </nav>

        <div className="shell-header__actions">
          <SearchForm id="header-search" className="shell-search--header" search={search} />
          <Button as={Link} to="/search" variant="ghost" icon aria-label="Search posts" className="shell-search-link">
            <HiOutlineSearch />
          </Button>

          <ThemeToggle />

          <div className="shell-account">
            {currentUser ? (
              <AccountMenu user={currentUser} onSignOut={signOut} />
            ) : (
              <Button as={Link} to="/signin" variant="secondary" size="sm">Sign in</Button>
            )}
          </div>

          <Button
            variant="ghost"
            icon
            className="shell-menu-btn"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav"
            onClick={openDrawer}
          >
            <HiOutlineMenu />
          </Button>
        </div>
      </div>

      <Drawer
        id="mobile-nav"
        title="Menu"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        restoreFocus={() => !closedByNavigation.current}
      >
        <SearchForm id="drawer-search" search={search} />

        <nav aria-label="Primary" className="shell-drawer__section">
          <PrimaryNavLinks className="shell-drawer__list" linkClassName="shell-drawer__link" onNavigate={closeForLink} />
        </nav>

        <section className="shell-drawer__section" aria-labelledby="drawer-account-heading">
          <h3 id="drawer-account-heading" className="ui-text-eyebrow shell-drawer__heading">Account</h3>
          {currentUser ? (
            <>
              <div className="shell-identity shell-drawer__identity">
                <img src={currentUser.profilePicture} alt="" className="shell-avatar shell-avatar--lg" />
                <div className="shell-identity__text">
                  <p className="shell-identity__name">
                    <span className="shell-identity__username" title={`@${currentUser.username}`}>@{currentUser.username}</span>
                    {currentUser.isAdmin && <Badge variant="accent">Admin</Badge>}
                  </p>
                  <p className="shell-identity__email" title={currentUser.email}>{currentUser.email}</p>
                </div>
              </div>
              <ul className="shell-drawer__list">
                {getAccountLinks(currentUser).map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="shell-drawer__link" onClick={() => closeForLink(link.to)}>
                      <span className="shell-drawer__icon" aria-hidden="true">{ACCOUNT_ICONS[link.icon]}</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Button
                variant="secondary"
                block
                className="shell-drawer__signout"
                onClick={() => { signOut(); setDrawerOpen(false) }}
              >
                <HiOutlineLogout aria-hidden="true" /> Sign out
              </Button>
            </>
          ) : (
            <div className="shell-drawer__auth">
              <Button as={Link} to="/signin" block onClick={() => closeForLink('/signin')}>Sign in</Button>
              <Button as={Link} to="/signup" variant="secondary" block onClick={() => closeForLink('/signup')}>
                Create an account
              </Button>
            </div>
          )}
        </section>
      </Drawer>
    </header>
  )
}
