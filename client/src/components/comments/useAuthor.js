import { useEffect, useState } from 'react'

// Comment authors are resolved by id (GET /api/user/:id — the API doesn't
// embed authors). Cache per user so a thread fetches each author once.
const cache = new Map()

const loadAuthor = userId => {
  if (!cache.has(userId)) {
    cache.set(userId, fetch(`/api/user/${userId}`)
      .then(res => (res.ok ? res.json() : null))
      .catch(() => null))
  }
  return cache.get(userId)
}

export function useAuthor(userId) {
  const [author, setAuthor] = useState(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let active = true
    if (!userId) return undefined
    loadAuthor(userId).then(user => {
      if (!active) return
      setAuthor(user)
      setLoaded(true)
    })
    return () => { active = false }
  }, [userId])
  return { author, loaded }
}
