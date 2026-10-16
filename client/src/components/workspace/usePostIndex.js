import { useEffect, useState } from 'react'
import { fetchPosts } from '../../utils/posts'

// id → { title, slug } for labelling comments with their article.
// The API has no batch lookup, so load the archive once (fine at this
// publication's scale) and share it between panels.
let cached = null

export function usePostIndex() {
  const [index, setIndex] = useState(() => (cached instanceof Map ? cached : new Map()))
  useEffect(() => {
    let active = true
    if (!(cached instanceof Promise) && !(cached instanceof Map)) {
      cached = fetchPosts({ limit: 500 })
        .then(({ posts }) => new Map(posts.map(p => [p._id, { title: p.title, slug: p.slug }])))
        .catch(() => { cached = null; return new Map() })
    }
    Promise.resolve(cached).then(map => {
      if (cached instanceof Promise) cached = map
      if (active) setIndex(map)
    })
    return () => { active = false }
  }, [])
  return index
}

export const resetPostIndex = () => { cached = null }
