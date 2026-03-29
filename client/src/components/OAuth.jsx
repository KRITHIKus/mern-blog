import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth'
import { app } from '../firebase'
import { useDispatch } from 'react-redux'
import { siginInSuccess } from '../redux/user/userSlice'
import { useNavigate } from 'react-router-dom'

export default function OAuth() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const auth = getAuth(app)

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider)
      const res = await fetch('api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoURL: resultsFromGoogle.user.photoURL,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        dispatch(siginInSuccess(data))
        navigate('/')
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <style>{`
        .oauth-google-btn {
          width: 100%;
          background: transparent;
          border: 1px solid var(--border2);
          border-radius: 2px;
          padding: 10px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .oauth-google-btn:hover {
          border-color: var(--border2);
          background: var(--surface2);
          box-shadow: 0 0 8px var(--accent-dim);
          border-color: var(--accent);
        }
        .oauth-google-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      <button
        type="button"
        className="oauth-google-btn"
        onClick={handleGoogleClick}
      >
        {/* Official Google SVG — no library dependency */}
        <svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.69 0 3.22.6 4.41 1.57l3.3-3.3A12 12 0 0 0 0 12c0 2 .5 3.87 1.38 5.51l3.89-3.01z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.67-2.84A7.17 7.17 0 0 1 12 19.1a7.08 7.08 0 0 1-6.72-4.84l-3.89 3.01A12 12 0 0 0 12 24z"/>
          <path fill="#4A90D9" d="M23.74 12.27c0-.8-.07-1.56-.2-2.27H12v4.51h6.6a5.57 5.57 0 0 1-2.43 3.67l3.67 2.84C21.8 19.01 23.74 15.9 23.74 12.27z"/>
          <path fill="#FBBC05" d="M5.28 14.26A7.14 7.14 0 0 1 4.9 12c0-.79.14-1.56.38-2.27L1.38 6.49A11.86 11.86 0 0 0 0 12c0 1.92.46 3.74 1.38 5.32l3.9-3.06z"/>
        </svg>
        Continue with Google
      </button>
    </>
  )
}