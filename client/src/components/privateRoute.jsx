import { useSelector } from 'react-redux'
import { Outlet, Navigate, useLocation } from 'react-router-dom'

// Signed-out visitors go to sign-in and come back here afterwards.
export default function PrivateRoute() {
  const { currentUser } = useSelector(state => state.user)
  const location = useLocation()
  return currentUser ? <Outlet /> : <Navigate to='/signin' replace state={{ from: location }} />
}
