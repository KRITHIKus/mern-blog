// Primary navigation — only routes that exist in App.jsx.
// `isActive` receives the lower-cased pathname.
export const PRIMARY_NAV = [
  { to: '/', label: 'Home', isActive: path => path === '/' },
  // Post pages live at /dashboard/post/:slug, so they count as "Posts".
  { to: '/search', label: 'Posts', isActive: path => path === '/search' || path.startsWith('/dashboard/post/') },
  { to: '/projects', label: 'Projects', isActive: path => path === '/projects' },
  { to: '/about', label: 'About', isActive: path => path === '/about' },
]

export const EXTERNAL_LINKS = {
  github: 'https://github.com/KRITHIKus',
  linkedin: 'https://www.linkedin.com/in/krithik-u-s-a545a4326/',
  portfolio: 'https://krithik01.onrender.com',
}

// Account destinations shown in the header menu and the mobile drawer.
export const getAccountLinks = user =>
  user?.isAdmin
    ? [
        { to: '/dashboard?tab=overview', label: 'Publishing console', icon: 'dashboard' },
        { to: '/createPost', label: 'New article', icon: 'write' },
        { to: '/dashboard?tab=account', label: 'Account settings', icon: 'profile' },
      ]
    : [
        { to: '/dashboard?tab=overview', label: 'My A2D', icon: 'dashboard' },
        { to: '/dashboard?tab=activity', label: 'Activity', icon: 'activity' },
        { to: '/dashboard?tab=account', label: 'Account settings', icon: 'profile' },
      ]

// Pages that own the full viewport (or will get their own shell in a later
// phase) render without the site footer.
const FOCUS_ROUTES = ['/signin', '/signup', '/dashboard', '/createpost']
export const isFocusRoute = path => {
  const p = path.toLowerCase()
  return FOCUS_ROUTES.includes(p) || p.startsWith('/update-post/')
}
