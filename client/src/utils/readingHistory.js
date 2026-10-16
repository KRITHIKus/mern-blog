// Device-local reading history ("Continue reading" / "Recently read").
// Stored only in this browser — no server writes, private by default.

const KEY = 'a2d:reading-history'
const MAX_ITEMS = 12

export function getReadingHistory() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

/** Upsert an entry; progress only ever increases. */
export function recordReading(post, progress) {
  if (!post?.slug) return
  try {
    const items = getReadingHistory()
    const previous = items.find(item => item.slug === post.slug)
    const entry = {
      slug: post.slug,
      title: post.title,
      image: post.image,
      category: post.category,
      progress: Math.max(previous?.progress || 0, Math.round(progress * 100) / 100),
      readAt: Date.now(),
    }
    const next = [entry, ...items.filter(item => item.slug !== post.slug)].slice(0, MAX_ITEMS)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // storage unavailable (private mode / quota) — history is optional
  }
}

export function clearReadingHistory() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
