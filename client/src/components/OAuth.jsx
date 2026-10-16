import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { app } from '../firebase'
import { siginInSuccess } from '../redux/user/userSlice'
import { Button } from './ui'
import { requestJSON } from '../utils/http'

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.69 0 3.22.6 4.41 1.57l3.3-3.3A12 12 0 0 0 0 12c0 2 .5 3.87 1.38 5.51l3.89-3.01z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.67-2.84A7.17 7.17 0 0 1 12 19.1a7.08 7.08 0 0 1-6.72-4.84l-3.89 3.01A12 12 0 0 0 12 24z"/>
    <path fill="#4A90D9" d="M23.74 12.27c0-.8-.07-1.56-.2-2.27H12v4.51h6.6a5.57 5.57 0 0 1-2.43 3.67l3.67 2.84C21.8 19.01 23.74 15.9 23.74 12.27z"/>
    <path fill="#FBBC05" d="M5.28 14.26A7.14 7.14 0 0 1 4.9 12c0-.79.14-1.56.38-2.27L1.38 6.49A11.86 11.86 0 0 0 0 12c0 1.92.46 3.74 1.38 5.32l3.9-3.06z"/>
  </svg>
)

// Popup dismissals are not errors worth showing.
const QUIET_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request'])

/**
 * Continue with Google. Contract unchanged: the Firebase ID token is sent to
 * POST /api/auth/google, which verifies it and returns the user.
 * getAuth() runs on click so the page still renders if Firebase isn't configured.
 */
export default function OAuth({ redirectTo = '/', onError }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleGoogleClick = async () => {
    onError?.(null)
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(getAuth(app), provider)
      const idToken = await result.user.getIdToken()
      const user = await requestJSON('/api/auth/google', { method: 'POST', body: { idToken } })
      dispatch(siginInSuccess(user))
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (!QUIET_CODES.has(error.code)) {
        onError?.(error.code ? 'Google sign-in is unavailable right now. Please try again.' : error.message)
      }
      setLoading(false)
    }
  }

  return (
    <Button type="button" variant="secondary" size="lg" block loading={loading} onClick={handleGoogleClick}>
      {!loading && <GoogleMark />}
      {loading ? 'Connecting to Google…' : 'Continue with Google'}
    </Button>
  )
}
