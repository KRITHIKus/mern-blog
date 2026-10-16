import { useSelector } from 'react-redux'
import { Outlet, Navigate, useLocation } from 'react-router-dom'

// Admin-only routes: signed-out → sign in (then back); signed-in readers → their space.
export default function OnlyAdminPrivateRoute() {
  const { currentUser } = useSelector(state => state.user)
  const location = useLocation()
  if (!currentUser) return <Navigate to='/signin' replace state={{ from: location }} />
  return currentUser.isAdmin ? <Outlet /> : <Navigate to='/dashboard' replace />
}
