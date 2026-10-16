import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { HiBookmark, HiOutlineBookmark } from 'react-icons/hi'
import { Button } from '../ui'
import { setSavedPosts } from '../../redux/user/userSlice'
import { requestJSON } from '../../utils/http'

/**
 * Save for later — persisted on the account (PUT /api/user/saved/:postId).
 * Signed-out readers are sent to sign in and brought back.
 */
export default function SaveButton({ postId, size = 'sm', variant = 'secondary', className }) {
  const { currentUser } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)

  const saved = Boolean(currentUser?.savedPosts?.includes(postId))

  const toggle = async () => {
    if (!currentUser) {
      navigate('/signin', { state: { from: { pathname: location.pathname, search: location.search } } })
      return
    }
    setPending(true)
    setError(null)
    try {
      const data = await requestJSON(`/api/user/saved/${postId}`, { method: 'PUT' })
      dispatch(setSavedPosts(data.savedPosts))
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <span className={className ? `save-button ${className}` : 'save-button'}>
      <Button
        variant={variant}
        size={size}
        onClick={toggle}
        loading={pending}
        aria-pressed={currentUser ? saved : undefined}
        className={saved ? 'is-saved' : undefined}
      >
        {!pending && (saved ? <HiBookmark aria-hidden="true" /> : <HiOutlineBookmark aria-hidden="true" />)}
        {saved ? 'Saved' : 'Save for later'}
      </Button>
      {error && <span className="save-button__error" role="alert">{error}</span>}
    </span>
  )
}
