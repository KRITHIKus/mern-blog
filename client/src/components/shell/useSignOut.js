import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { siginOutSuccess } from '../../redux/user/userSlice'

// Same contract as before: POST /api/user/sign-out clears the cookie,
// then the persisted user is cleared.
export function useSignOut() {
  const dispatch = useDispatch()
  return useCallback(async () => {
    try {
      const res = await fetch('/api/user/sign-out', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) console.log(data.message)
      else dispatch(siginOutSuccess())
    } catch (error) {
      console.log(error.message)
    }
  }, [dispatch])
}
