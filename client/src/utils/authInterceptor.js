import axios from 'axios'
import { siginOutSuccess } from '../redux/user/userSlice'

// The signed-in user is persisted in localStorage, but the session lives in an
// httpOnly cookie that can expire or be cleared. When any protected API call
// answers 401, drop the stale user so the UI stops looking signed in.
// /api/auth/* is excluded: a 401 there means "wrong password", not "session gone".

const isSessionRejection = (url, status) => {
  if (status !== 401 || !url) return false
  try {
    const { origin, pathname } = new URL(url, window.location.origin)
    return origin === window.location.origin &&
      pathname.startsWith('/api/') &&
      !pathname.startsWith('/api/auth/')
  } catch {
    return false
  }
}

export function installAuthInterceptor(store) {
  const clearStaleUser = () => {
    if (store.getState().user.currentUser) store.dispatch(siginOutSuccess())
  }

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input, init) => {
    const res = await originalFetch(input, init)
    const url = typeof input === 'string' ? input : input?.url
    if (isSessionRejection(url, res.status)) clearStaleUser()
    return res
  }

  axios.interceptors.response.use(
    res => res,
    err => {
      if (isSessionRejection(err.config?.url, err.response?.status)) clearStaleUser()
      return Promise.reject(err)
    }
  )
}
